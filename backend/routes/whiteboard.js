const express = require("express");
const { UserLoggedInOrNot } = require("../middleware/authorisation");
const HistoryLog = require('../models/history');

const {
  createWhiteboard,
  editWhiteboard,
  getWhiteboardById,
  getAnnotators,
  handleRoomCleanup,
  loadWhiteboard,
  joinWhiteboard,
  cleanhandler 
} = require("../controllers/whiteboard");

const router = express.Router();

router.post("/", UserLoggedInOrNot, createWhiteboard);

router.get("/:whiteboardId", UserLoggedInOrNot, getWhiteboardById);

router.post("/edit/:whiteboardId", UserLoggedInOrNot, editWhiteboard);

router.get("/annotators/:whiteboardId", UserLoggedInOrNot, getAnnotators);

router.get("/load/:id", UserLoggedInOrNot, loadWhiteboard);

router.get('/logs/:roomId', async (req, res) => {
  const logs = await HistoryLog.find({ whiteboardId: req.params.roomId });
  res.json(logs);
});

router.post("/cleanup/:whiteboardId", UserLoggedInOrNot, cleanhandler);

router.post("/join", UserLoggedInOrNot, joinWhiteboard);


module.exports = router;