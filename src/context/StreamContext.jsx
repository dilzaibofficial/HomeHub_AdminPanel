import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { StreamChat } from "stream-chat";
import client from "../api/client";
import { useAuth } from "./AuthContext";

const StreamContext = createContext(null);

const ADMIN_AVATAR_URL = "https://admin-eta-three-41.vercel.app/logo.png";

export const StreamProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [chatClient, setChatClient] = useState(null);
  const [ready, setReady] = useState(false);
  // getInstance() returns one true singleton for the whole page (it ignores
  // repeat calls once created), so disconnecting it on every effect cleanup
  // (StrictMode remounts, fast refresh, etc.) breaks any Channel/ChannelList
  // still holding a reference elsewhere ("can't use a channel after
  // client.disconnect() was called"). Track our own connection state instead
  // and only ever disconnect on a real logout.
  const clientRef = useRef(null);
  const connectingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      if (clientRef.current) {
        clientRef.current.disconnectUser().catch(() => {});
        clientRef.current = null;
      }
      setChatClient(null);
      setReady(false);
      return;
    }

    if (clientRef.current || connectingRef.current) return;

    let cancelled = false;
    connectingRef.current = true;

    const connect = async () => {
      try {
        const { data } = await client.post("/api/admin/streamToken");
        const instance = StreamChat.getInstance(data.apiKey);
        if (!instance.userID) {
          await instance.connectUser(
            { id: data.userId, name: "HomeHub Support", image: ADMIN_AVATAR_URL },
            data.token
          );
        }
        if (!cancelled) {
          clientRef.current = instance;
          setChatClient(instance);
          setReady(true);
        }
      } catch (error) {
        console.error("Error connecting admin to Stream Chat:", error);
      } finally {
        connectingRef.current = false;
      }
    };

    connect();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return (
    <StreamContext.Provider value={{ chatClient, ready }}>{children}</StreamContext.Provider>
  );
};

export const useStream = () => useContext(StreamContext);
