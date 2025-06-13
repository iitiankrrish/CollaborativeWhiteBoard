const User = require("../models/user");
const Whiteboard = require("../models/whiteboard");
const bcrypt = require("bcrypt");
const { setUser } = require("../services/auth");
async function handleSignUp(req, res) {
  try {
    const { username, password, email } = req.body;

    const preExistingEmail = await User.findOne({ email });
    if (preExistingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({ username, password: hashedPassword, email });

    return res.status(201).json({ success: "Signed up successfully" });
  } catch (error) {
    console.error("Error in sign-up:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleLogIn(req, res) {
  try {
    const { email, password } = req.body;

    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, currentUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = setUser(currentUser);
    res.cookie("loginToken", token, { maxAge: 86400000, httpOnly: true });

    return res.json({ success: "Logged in successfully" , currentUser });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleLogOut(req, res) {
  res.clearCookie("loginToken");
  return res.status(200).json({ success: "Logged out successfully" });
}

async function getUserById(req, res) {
  try {
    const userId = req.user._id;
    const userdata = await User.findById(userId);
    if (!userdata) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ data: userdata });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
async function getOwnerById(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userdata = await User.findById(userId);

    if (!userdata) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ data: userdata });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getMyWhiteBoards(req, res) {
  try {
    const userid = req.user._id;
    const whiteboards = await Whiteboard.find({ owner: userid });
    if (whiteboards.length === 0) {
      return res.json({ data: [] }); 
    }
    return res.json({ data: whiteboards });
  } catch (error) {
    console.error("Error fetching whiteboards:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
async function joinSession(req, res) {
  try {
    const { whiteboardId } = req.params;
    const userId = req.user._id;

    const whiteboard = await Whiteboard.findById(whiteboardId);
    if (!whiteboard) {
      return res.status(404).json({ error: "Whiteboard not found" });
    }

    const userIdStr = userId.toString();
    const annotatorIndex = whiteboard.annotators.findIndex(
      (a) => a.user.toString() === userIdStr
    );

    if (whiteboard.publicAccess) {
      if (annotatorIndex === -1) {
        whiteboard.annotators.push({ user: userId, role: "editor" });
        await whiteboard.save();
        return res.status(200).json({ success: "Joined as editor (public board)" });
      } else {
        if (whiteboard.annotators[annotatorIndex].role !== "editor") {
          whiteboard.annotators[annotatorIndex].role = "editor";
          await whiteboard.save();
        }
        return res.status(200).json({ success: "Already joined as editor" });
      }
    } else {
      const editorPass = req.body?.editorPass;

      if (!editorPass || editorPass !== whiteboard.editorPass) {
        if (annotatorIndex !== -1) {
          return res.status(200).json({ success: "Joined as viewer in private board" });
        }
        return res.status(403).json({ error: "Invalid editor password" });
      }

      if (annotatorIndex === -1) {
        whiteboard.annotators.push({ user: userId, role: "editor" });
      } else if (whiteboard.annotators[annotatorIndex].role !== "editor") {
        whiteboard.annotators[annotatorIndex].role = "editor";
      }

      await whiteboard.save();
      return res.status(200).json({ success: "Joined as editor (private board)" });
    }
  } catch (error) {
    console.error("Error joining session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function getCollaboratingWhiteboardIds(req,res) {
   try {
    const userId = req.user._id;
    const whiteboards = await Whiteboard.find(
      {
        'annotators.user': userId,
        owner: { $ne: userId },
      },
      '_id'
    );

    const ids = whiteboards.map(wb => wb._id.toString());
    res.status(200).json({ whiteboardIds: ids });
  } catch (error) {
    console.error('Error fetching collaborating whiteboards:', error);
    res.status(500).json({ error: 'Server error while fetching whiteboard IDs' });
  }
}

module.exports = {
  handleSignUp,
  handleLogIn,
  handleLogOut,
  getUserById,
  getMyWhiteBoards,
  joinSession,
  getCollaboratingWhiteboardIds,
  getOwnerById
};
