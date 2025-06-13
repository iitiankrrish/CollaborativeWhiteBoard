const ChatMessage = require('../models/chat');
const Whiteboard = require('../models/whiteboard');
const User = require('../models/user'); 

async function chatSocket(io, socket) {
  socket.on('roomJoined', async ({ roomId }) => {
    try {
      console.log("CHAT : USER JOINED ROOM with ID: ", roomId);
      if (!roomId) {
        return socket.emit('error', { message: 'Room ID is required' });
      }
      const history = await ChatMessage.find({ whiteboard: roomId })
        .sort({ sentAt: 1 })
        .limit(50)
        .lean();

      if (!history.length) {
        return socket.emit('chatHistory', []);
      }

      const senderIds = [...new Set(history.map(msg => msg.sender.toString()))];

      const users = await User.find({ '_id': { $in: senderIds } })
        .select('_id username')
        .lean();

      const userMap = new Map(users.map(user => [user._id.toString(), user.username]));
      const formattedHistory = history.map(msg => {
        const senderIdStr = msg.sender.toString();
        return {
          _id: msg._id,
          content: msg.content,
          sender: senderIdStr,
          
          senderUsername: userMap.get(senderIdStr) || 'Deleted User',
          sentAt: msg.sentAt
        };
      });
      
      console.log("SENDING FORMATTED CHAT HISTORY TO CLIENT.");
      socket.emit('chatHistory', formattedHistory);

    } catch (err) {
      console.error('chatSocket: Error in roomJoined', err);
      socket.emit('error', { message: 'Failed to load chat history' });
    }
  });

  socket.on('sendMessage', async ({ roomId, message }) => {
    try {
      if (!roomId || !message?.trim()) {
        return socket.emit('error', { message: 'Room ID and message required' });
      }
      if (!socket.userId) {
        return socket.emit('error', { message: 'Unauthorized' });
      }

      const senderUser = await User.findById(socket.userId).select('username');
      if (!senderUser) {
        return socket.emit('error', { message: 'Sender not found' });
      }

      const newMsg = await ChatMessage.create({
        whiteboard: roomId,
        sender: socket.userId,
        content: message.trim(),
      });
      
      io.to(roomId).emit('messageSent', {
        _id: newMsg._id,
        message: newMsg.content,
        sender: socket.userId,
        senderUsername: senderUser.username,
        createdAt: newMsg.sentAt
      });

    } catch (err) {
      console.error('chatSocket: Error sending message', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
}

module.exports = chatSocket;