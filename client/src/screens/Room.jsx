import { useEffect, useCallback, useState } from "react";

import { useSocket } from "../hooks/useSocket";

export function RoomScreen() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log({ email, id });
    setRemoteSocketId(id);
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);

    () => {
      socket.off("user:joined", handleUserJoined);
    };
  }, [socket, handleUserJoined]);

  return (
    <div>
      <h1>RoomScreen</h1>
      <h4>{remoteSocketId ? "Connected" : "No One in this Room."}</h4>

      {remoteSocketId && <button>CALL</button>}
    </div>
  );
}
