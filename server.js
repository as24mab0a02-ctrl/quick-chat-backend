const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Initialize Socket.io with permissive CORS for local development
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

// Listen for connections
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. Handle joining a specific room
  socket.on('join_room', ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`${username} joined room: ${roomId}`);
    
    // Broadcast a system message to others in the room
    socket.to(roomId).emit('receive_message', {
      sender: 'System',
      text: `${username} joined the chat.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });
  });

  // 2. Handle sending messages
  socket.on('send_message', (data) => {
    // Send the message to everyone in the room EXCEPT the sender
    socket.to(data.roomId).emit('receive_message', data);
  });

  // 3. Handle disconnections
  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Chat backend running on http://localhost:${PORT}`);
});

