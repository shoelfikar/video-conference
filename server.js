// Install dependencies: express, socket.io
// Command: npm install express socket.io

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the frontend
app.use(express.static('frontend')); // Assuming your frontend files are in the 'public' directory

const connectedUsers = [];

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  connectedUsers.push({ userId: socket.id });
  console.log('Connected Users:', connectedUsers);

  // Notify all clients of the new user
  io.emit('user-joined', { userId: socket.id });

  // Handle joining a room
  socket.on('join-room', (roomId) => {
    console.log(`${socket.id} joined room: ${roomId}`);
    socket.join(roomId);

    // Notify others in the room
    socket.to(roomId).emit('user-connected', socket.id);
  });

  // Handle WebRTC signaling
  socket.on('send-signal', (data) => {
    const { roomId, signal, to } = data;
    console.log(`Signal sent from ${socket.id} to ${to} in room ${roomId}`);
    socket.to(to).emit('receive-signal', { signal, from: socket.id });
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove the user from the connected users array
    const index = connectedUsers.findIndex((user) => user.userId === socket.id);
    if (index !== -1) {
      connectedUsers.splice(index, 1);
    }

    console.log('Connected Users:', connectedUsers);

    // Notify all clients that a user has left
    io.emit('user-left', { userId: socket.id });
    io.emit('user-disconnected', socket.id);
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
