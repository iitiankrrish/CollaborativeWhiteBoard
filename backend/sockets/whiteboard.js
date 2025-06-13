const HistoryLog = require("../models/history");
const Whiteboard = require("../models/whiteboard");
const { handleRoomCleanup } = require("../controllers/whiteboard");
const roomUsers = new Map();
const findLastIndex = (arr, predicate) => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) {
      return i;
    }
  }
  return -1;
};

function whiteboardSocket(io, socket) {
  const userId = socket.user?._id;

  const protectAndAct = async (roomId, actionCallback) => {
    if (!socket.user || !socket.user._id) {
      return socket.emit("error", { message: "Authentication error." });
    }
    try {
      const whiteboard = await Whiteboard.findById(roomId);
      if (!whiteboard) return socket.emit("error", { message: "Whiteboard not found." });
      
      const annotator = whiteboard.annotators.find(a => a.user.toString() === socket.user._id.toString());
      
      if (annotator && annotator.role === 'editor') {
        await actionCallback();
      } else {
         return socket.emit("error", { message: "You do not have permission to perform this action." });
      }
    } catch(error) {
        console.error("Error during protected action:", error);
        socket.emit("error", { message: "An internal server error occurred." });
    }
  };

  socket.on("joinWhiteboard", async ({ roomId }) => {
    if (!roomId) return;
    socket.join(roomId);

    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    roomUsers.get(roomId).add(socket.id);

    try {
      const history = await HistoryLog.findOne({ whiteboardId: roomId });
      if (history && history.actions.length > 0) {
        socket.emit("loadInitialHistory", history.actions);
      }
    } catch (error) {
      console.error(`Error fetching history for room ${roomId}:`, error);
    }
  });

  socket.on("drawingAction", async ({ roomId, action }) => {
    if (!roomId || !action) return;
    
    protectAndAct(roomId, async () => {
      const actionToSave = {
        actionType: action.type,
        data: action,
        userId,
        undone: false,
        timestamp: new Date(),
      };
      
      const updatedHistory = await HistoryLog.findOneAndUpdate(
        { whiteboardId: roomId },
        { $push: { actions: actionToSave } },
        { upsert: true, new: true }
      );

      const savedAction = updatedHistory.actions[updatedHistory.actions.length - 1];
      io.in(roomId).emit("newAction", { action: savedAction });
    });
  });

  socket.on("undoAction", ({ roomId }) => {
    protectAndAct(roomId, async () => {
      const history = await HistoryLog.findOne({ whiteboardId: roomId });
      if (!history || !history.actions.length) return;

      const lastActionIndex = findLastIndex(history.actions, a => !a.undone);
      
      if (lastActionIndex > -1) {
        const actionToUndo = history.actions[lastActionIndex];
        actionToUndo.undone = true;
        await history.save();
        io.in(roomId).emit("actionUndone", { actionId: actionToUndo._id });
      }
    });
  });

  socket.on("redoAction", ({ roomId }) => {
    protectAndAct(roomId, async () => {
      const history = await HistoryLog.findOne({ whiteboardId: roomId });
      if (!history || !history.actions.length) return;

      const lastUndoneActionIndex = findLastIndex(history.actions, a => a.undone);

      if (lastUndoneActionIndex > -1) {
        const actionToRedo = history.actions[lastUndoneActionIndex];
        actionToRedo.undone = false;
        await history.save();
        io.in(roomId).emit("actionRedone", { action: actionToRedo });
      }
    });
  });
  
  socket.on("clearCanvas", ({ roomId }) => {
    protectAndAct(roomId, async () => {
        const actionToSave = { actionType: 'clear', data: {}, userId, undone: false, timestamp: new Date() };
        await HistoryLog.findOneAndUpdate(
            { whiteboardId: roomId },
            { $push: { actions: actionToSave } },
            { upsert: true }
        );
        io.in(roomId).emit("canvasCleared");
    });
  });

  socket.on("disconnect", async () => {
    for (const [roomId, users] of roomUsers.entries()) {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        if (users.size === 0) {
          roomUsers.delete(roomId);
          await handleRoomCleanup(roomId);
        }
      }
    }
  });
}

module.exports = whiteboardSocket;