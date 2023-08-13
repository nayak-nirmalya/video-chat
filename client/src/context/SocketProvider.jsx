import { createContext, useMemo } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export const SocketProvider = (props) => {
  const socket = useMemo(() => io("localhost:8000"), []);

  return (
    <SocketContext.Provider value={socket}>
      {/* eslint-disable-next-line react/prop-types */}
      {props.children}
    </SocketContext.Provider>
  );
};
