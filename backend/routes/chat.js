const express = require("express");
const { UserLoggedInOrNot } = require("../middleware/authorisation");
const {
  getMessages,
} = require("../controllers/chat");
const router = express.Router();
router.get('/:whiteboardId/chat', UserLoggedInOrNot, getMessages);
module.exports = router;
