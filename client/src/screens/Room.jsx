import { useEffect, useCallback } from "react";

import { useSocket } from "../hooks/useSocket";

export function RoomScreen() {
  const socket = useSocket();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log({ email, id });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);

    () => {
      socket.off("user:joined", handleUserJoined);
    };
  }, [socket, handleUserJoined]);

  return <div>RoomScreen</div>;
}
