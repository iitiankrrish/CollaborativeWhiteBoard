const mongoose = require('mongoose');
const historySchema = new mongoose.Schema({
  whiteboardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Whiteboard',
    required: true,
  },
  actions: [
    {
      actionType: { type: String, required: true },
      data: mongoose.Schema.Types.Mixed,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      undone: { type: Boolean, default: false },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('HistoryLog', historySchema);
