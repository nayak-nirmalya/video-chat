const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const SocketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected with ID: ${socket.id}`);

  socket.on("room:join", (data) => {
    const { email, room } = data;

    emailToSocketIdMap.set(email, socket.id);
    SocketIdToEmailMap.set(socket.id, email);

    io.to(socket.id).emit("room:join", data);
  });
});
