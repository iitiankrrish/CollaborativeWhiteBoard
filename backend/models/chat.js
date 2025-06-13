const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
  whiteboard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Whiteboard',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});
const Chat = mongoose.model('chat', chatSchema);
module.exports = Chat;
