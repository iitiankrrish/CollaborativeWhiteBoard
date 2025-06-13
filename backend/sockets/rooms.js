const { addUserToRoom, removeUserFromRoom, getUsersInRoom } = require('../services/room.js');

async function roomsSocket(io, socket) {
  socket.on('roomJoined', async ({ roomId, user }) => {
    if (!roomId || !user || !user._id) {
      return console.error("Room join failed: Missing data.", { roomId, user });
    }

    try {
      socket.join(roomId);
      addUserToRoom(socket.id, roomId, user);
      socket.to(roomId).emit('userJoined', user);
      const usersInRoom = getUsersInRoom(roomId);
      socket.emit('roomUsers', usersInRoom);

      console.log(`User ${user.username} joined room ${roomId}`);
    } catch (err) {
      console.error('roomsSocket: roomJoined error:', err);
    }
  });

  socket.on('leaveRoom', ({ roomId }) => {
    if (!roomId) return;
    socket.leave(roomId);
    const removedUserInfo = removeUserFromRoom(socket.id);
    if (removedUserInfo) {
      console.log(`User intentionally left room ${roomId}`);
      
      io.to(roomId).emit('userLeft', { userId: removedUserInfo.userId });
    }
  });

  socket.on('disconnect', () => {
    const removedUserInfo = removeUserFromRoom(socket.id);
    if (removedUserInfo) {
      const { roomId, userId } = removedUserInfo;
      console.log(`User ${userId} disconnected from ${roomId}`);
      io.to(roomId).emit('userLeft', { userId });
    }
  });
}

module.exports = roomsSocket;