import { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";

import { useSocket } from "../hooks/useSocket";
import peer from "../service/peer";

export function RoomScreen() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log({ email, id });
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });

    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      console.log({ from, offer });
      const ans = await peer.getAnswer(offer);

      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    ({ ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted.");

      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    },
    [myStream]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const handleNegoIncomming = useCallback(
    ({ from, offer }) => {
      const answer = peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, answer });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async ({ answer }) => {
    await peer.setLocalDescription(answer);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () =>
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoIncomming);
    socket.on("peer:nego:final", handleNegoFinal);

    () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncomming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoIncomming,
    handleNegoFinal,
  ]);

  return (
    <div>
      <h1>RoomScreen</h1>
      <h4>{remoteSocketId ? "Connected" : "No One in this Room."}</h4>
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myStream && (
        <>
          <h3>My Video</h3>
          <ReactPlayer height="200px" playing muted url={myStream} />
        </>
      )}
      {remoteStream && (
        <>
          <h3>Remote Video</h3>
          <ReactPlayer height="200px" playing muted url={remoteStream} />
        </>
      )}
    </div>
  );
}
