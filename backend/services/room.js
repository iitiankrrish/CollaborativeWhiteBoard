const rooms = {};
function addUserToRoom(socketId, roomId, user) {
  if (!user || !user._id || !user.username) {
    console.warn(`addUserToRoom: Invalid user object`, user);
    return;
  }

  if (!rooms[roomId]) {
    rooms[roomId] = {};
  }

  rooms[roomId][socketId] = user;
}

function removeUserFromRoom(socketId) {
  for (const roomId in rooms) {
    if (rooms[roomId][socketId]) {
      const userId = rooms[roomId][socketId]._id;
      delete rooms[roomId][socketId];
      if (Object.keys(rooms[roomId]).length === 0) {
        delete rooms[roomId];
      }

      return { roomId, userId };
    }
  }
  return null;
}

function getUsersInRoom(roomId) {
  const room = rooms[roomId];
  if (!room) return [];
  return Object.values(room).filter((user) => user && user.username);
}


function getUserInfo(socketId) {
  for (const roomId in rooms) {
    if (rooms[roomId][socketId]) {
      return {
        roomId,
        userId: rooms[roomId][socketId]._id
      };
    }
  }
  return null;
}

module.exports = {
  addUserToRoom,
  removeUserFromRoom,
  getUsersInRoom,
  getUserInfo,
};
