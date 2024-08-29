"use client";
import { axiosFetchType } from "@/lib/axiosConfig";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Wrapper = ({ children }: any) => {
  const router = useRouter();
  const path = usePathname();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (token) {
      // check token is correct or not // and its redi
      axiosFetchType(token)
        .get("/get-token-type")
        .then((data) => {
          if (data.status === 200) {
            setLoading(false);
            setTimeout(() => {
              // redirection according to token type (doctor , patient)
              if (data.data === "patient") {
                router.push("/patient");
              } else {
                router.push("/doctor");
              }
            }, 100);
          }
        })
        .catch((e) => {
          localStorage.removeItem("token");
          console.log(e);
          setLoading(false);
        });
      return;
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    console.log(path)
    const token = localStorage.getItem("token") || "";
    if (
      (path.startsWith("/patient") || path.startsWith("/doctor")) &&
      token === ""
    )
      router.push("/");
  }, [path]);
  if (loading) return <>Loading...</>;
  return <div>{children}</div>;
};

export default Wrapper;