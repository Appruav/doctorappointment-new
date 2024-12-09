import type { Metadata } from "next";
import "./globals.css";
import Wrapper from "./AuthWrapper";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import ToastContainer styles

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Wrapper>{children}</Wrapper>
        {/* Add ToastContainer here */}
        <ToastContainer
          position="top-right" // Position of the toast
          autoClose={5000} // Auto close after 5 seconds
          hideProgressBar={false} // Show progress bar
          newestOnTop={false} // New toasts stack at the bottom
          closeOnClick // Close toast on click
          rtl={false} // Disable right-to-left
        />
      </body>
    </html>
  );
}
