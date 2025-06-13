const Chat = require('../models/chat'); 
async function getMessages(req, res) {
  try {
    const { whiteboardId } = req.params;

    if (!whiteboardId) {
      return res.status(400).json({ error: 'Missing whiteboardId' });
    }
    const messages = await Chat.find({ whiteboard: whiteboardId }) 
      .populate('sender', 'username email') 
      .sort({ sentAt: 1 }); 

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getMessages,
};