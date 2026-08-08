import React, { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import client from "../api/client";
import { useAuth } from "./AuthContext";

const StreamContext = createContext(null);

export const StreamProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [chatClient, setChatClient] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let instance = null;

    const connect = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await client.post("/api/admin/streamToken");
        instance = StreamChat.getInstance(data.apiKey);
        await instance.connectUser({ id: data.userId, name: "HomeHub Support" }, data.token);
        if (!cancelled) {
          setChatClient(instance);
          setReady(true);
        }
      } catch (error) {
        console.error("Error connecting admin to Stream Chat:", error);
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (instance) instance.disconnectUser();
      setReady(false);
      setChatClient(null);
    };
  }, [isAuthenticated]);

  return (
    <StreamContext.Provider value={{ chatClient, ready }}>{children}</StreamContext.Provider>
  );
};

export const useStream = () => useContext(StreamContext);
