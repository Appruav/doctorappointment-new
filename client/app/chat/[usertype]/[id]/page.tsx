"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { axiosFetch } from "@/lib/axiosConfig";
import { Send, PlugZap, Wifi, WifiOff } from "lucide-react";

interface ChatMessage {
  userType: string;
  msg: string;
  _id?: string;
}

function Page(props: any) {
  const appointmentId = props.params.id;
  const userType = props.params.usertype;

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch chat messages
  const fetchChat = useCallback(async () => {
    try {
      const { data } = await axiosFetch(`/get-appointment-chats/${appointmentId}`);
      
      // Only update if there are new messages
      if (JSON.stringify(data) !== JSON.stringify(chats)) {
        setChats(data);
      }
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    }
  }, [appointmentId, chats]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  // WebSocket and chat fetching setup
  useEffect(() => {
    let ws: WebSocket;
    let intervalId: NodeJS.Timeout;

    try {
      // Establish WebSocket connection
      ws = new WebSocket(`ws://localhost:8080/ws-chat/${appointmentId}`);

      ws.onopen = () => {
        setConnectionStatus('connected');
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus('disconnected');
      };

      setSocket(ws);

      // Start periodic chat fetching
      intervalId = setInterval(fetchChat, 1500);

      // Cleanup
      return () => {
        ws.close();
        clearInterval(intervalId);
      };
    } catch (error) {
      console.error("Failed to establish WebSocket connection:", error);
      setConnectionStatus('disconnected');
    }
  }, [appointmentId, fetchChat]);

  // Send message handler
  const handleSendMessage = () => {
    if (!message.trim() || !socket || socket.readyState !== WebSocket.OPEN) return;

    const newMessage = {
      userType: userType,
      msg: message
    };

    try {
      socket.send(JSON.stringify(newMessage));
      setChats(prevChats => [...prevChats, newMessage]);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle Enter key for sending messages
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-xl mx-auto bg-gray-100">
      {/* Connection Status Bar */}
      {/* <div className={`
        flex items-center justify-center p-2 text-sm font-medium
        ${connectionStatus === 'connected' ? 'bg-green-100 text-green-800' : 
          connectionStatus === 'disconnected' ? 'bg-red-100 text-red-800' : 
          'bg-yellow-100 text-yellow-800'}
      `}>
        {connectionStatus === 'connected' ? (
          <><Wifi className="mr-2 w-4 h-4" /> Connected</>
        ) : connectionStatus === 'disconnected' ? (
          <><WifiOff className="mr-2 w-4 h-4" /> Disconnected</>
        ) : (
          <><PlugZap className="mr-2 w-4 h-4" /> Connecting...</>
        )}
      </div> */}

      {/* Chat Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-3"
      >
        {chats.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet</div>
        ) : (
          chats.map((chat, index) => (
            <div 
              key={chat._id || index} 
              className={`
                max-w-[80%] p-3 rounded-lg 
                ${chat.userType === userType 
                  ? 'bg-blue-500 text-white self-end ml-auto' 
                  : 'bg-gray-200 text-black self-start mr-auto'}
              `}
            >
              <div className="font-semibold text-sm mb-1">{chat.userType}</div>
              <div>{chat.msg}</div>
            </div>
          ))
        )}
      </div>

      {/* Message Input Area */}
      <div className="bg-white p-4 border-t flex items-center space-x-2">
        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={connectionStatus !== 'connected'}
          className="
            flex-grow p-2 border rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />
        <button 
          onClick={handleSendMessage}
          disabled={!message.trim() || connectionStatus !== 'connected'}
          className="
            bg-blue-500 text-white p-2 rounded-full 
            hover:bg-blue-600 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default Page;