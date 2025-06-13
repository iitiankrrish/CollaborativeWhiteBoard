const express = require("express");
const { UserLoggedInOrNot } = require("../middleware/authorisation");
const {
  handleSignUp,
  handleLogIn,
  handleLogOut,
  getUserById,
  getMyWhiteBoards,
  joinSession,
  getCollaboratingWhiteboardIds,
  getOwnerById
} = require("../controllers/user");
const router = express.Router();
router.post('/signup', handleSignUp);
router.post('/login', handleLogIn);
router.post('/logout', UserLoggedInOrNot, handleLogOut);
router.get('/getuser', UserLoggedInOrNot, getUserById);
router.post('/getowner', UserLoggedInOrNot, getOwnerById);
router.get('/my/whiteboards', UserLoggedInOrNot, getMyWhiteBoards);
router.get('/collab/whiteboards', UserLoggedInOrNot, getCollaboratingWhiteboardIds);
router.post('/session/:whiteboardId/join', UserLoggedInOrNot, joinSession);
module.exports = router;
