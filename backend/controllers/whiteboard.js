const mongoose = require("mongoose");
const { createCanvas, loadImage } = require("canvas"); 
const bcrypt = require("bcrypt");
const Whiteboard = require("../models/whiteboard");
const HistoryLog = require("../models/history");
const User = require("../models/user");

function drawActionOnNodeCanvas(ctx, action) {
  if (action.actionType === "clear") {
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }
  const data = action.data;
  if (!data) return;
  ctx.strokeStyle = data.color || "#ffffff";
  ctx.fillStyle = data.color || "#ffffff";
  ctx.lineWidth = data.size || 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  switch (action.actionType) {
    case "text":
      ctx.font = `${data.fontSize || 20}px Arial`;
      ctx.fillStyle = data.color;
      ctx.textBaseline = "top";
      ctx.fillText(data.text, data.x, data.y);
      break;
    case "pen":
    case "eraser":
      if (!data.points || data.points.length < 2) break;
      ctx.strokeStyle = data.color;
      ctx.beginPath();
      ctx.moveTo(data.points[0].x, data.points[0].y);
      for (let i = 1; i < data.points.length; i++) {
        ctx.lineTo(data.points[i].x, data.points[i].y);
      }
      ctx.stroke();
      break;
    case "rectangle":
      ctx.strokeRect(data.x, data.y, data.width, data.height);
      break;
    case "filledRectangle":
      ctx.fillRect(data.x, data.y, data.width, data.height);
      break;
    case "circle":
      ctx.beginPath();
      ctx.arc(data.x, data.y, data.radius, 0, 2 * Math.PI);
      ctx.stroke();
      break;
    case "filledCircle":
      ctx.beginPath();
      ctx.arc(data.x, data.y, data.radius, 0, 2 * Math.PI);
      ctx.fill();
      break;
  }
}

async function handleRoomCleanup(roomId) {
  try {
    const history = await HistoryLog.findOne({ whiteboardId: roomId });
    if (!history || history.actions.length === 0) {
      console.log(`No new actions for room ${roomId}, skipping snapshot.`);
      return;
    }
    const canvas = createCanvas(930, 800);
    const ctx = canvas.getContext("2d");
    const whiteboard = await Whiteboard.findById(roomId);
    if (whiteboard && whiteboard.snapshotDataUrl) {
      try {
        const image = await loadImage(whiteboard.snapshotDataUrl);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      } catch (err) {
        console.error(`Could not load previous snapshot from data URL for room ${roomId}:`, err.message);
        ctx.fillStyle = "#1e1e1e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    for (const action of history.actions) {
      if (!action.undone) {
        drawActionOnNodeCanvas(ctx, action);
      }
    }
    const dataUrl = canvas.toDataURL("image/png");
    await Whiteboard.findByIdAndUpdate(roomId, { snapshotDataUrl: dataUrl });
    await HistoryLog.deleteOne({ whiteboardId: roomId });
    
    console.log(`Snapshot data URL created and history cleared for room ${roomId}`);
  } catch (err) {
    console.error("Critical error in handleRoomCleanup:", err);
  }
}

async function loadWhiteboard(req, res) {
  try {
    const { id } = req.params;
    const whiteboard = await Whiteboard.findById(id);
    const history = await HistoryLog.findOne({ whiteboardId: id });
    
    if (!whiteboard) {
      return res.status(404).json({ error: "Whiteboard not found" });
    }
    res.status(200).json({
        snapshotDataUrl: whiteboard.snapshotDataUrl || null,
        history: history?.actions || [],
    });
  } catch (error) {
    console.error("Error loading whiteboard:", error);
    res.status(500).json({ error: "Failed to load whiteboard" });
  }
}

async function createWhiteboard(req, res) {
  try {
    const { title, purpose, publicAccess, editorPass = null } = req.body;
    const owner = req.user._id;
    const isPublic = publicAccess === true;

    if (!isPublic && !editorPass) {
      return res
        .status(400)
        .json({ error: "Editor password required for private whiteboard" });
    }

    const newWhiteboard = new Whiteboard({
      title,
      purpose,
      owner,
      publicAccess: isPublic,
      annotators: [
        { user: new mongoose.Types.ObjectId(owner), role: "editor" },
      ],
    });

    if (!isPublic && editorPass) {
      const salt = await bcrypt.genSalt(10);
      newWhiteboard.editorPass = await bcrypt.hash(editorPass, salt);
    }

    const user = await User.findById(owner);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.whiteboards.push(newWhiteboard._id);
    await Promise.all([newWhiteboard.save(), user.save()]);

    res
      .status(201)
      .json({
        success: true,
        message: "Whiteboard created",
        whiteboard: newWhiteboard,
      });
  } catch (error) {
    console.error("Error creating whiteboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function joinWhiteboard(req, res) {
  try {
    const { whiteboardId, password } = req.body;
    const currentUserId = req.user._id;

    if (!whiteboardId) {
      return res.status(400).json({ error: "Whiteboard ID is required." });
    }

    const whiteboard = await Whiteboard.findById(whiteboardId);
    if (!whiteboard) {
      return res.status(404).json({ error: "Whiteboard not found." });
    }

    let determinedRole = "viewer";
    let joinMessage = "";

    if (whiteboard.publicAccess === true) {
        determinedRole = "editor";
      joinMessage = `Joined as ${determinedRole}.`;
    } else {
      if (!password) {
        determinedRole = "viewer";
        joinMessage = "No password provided. Joined as a viewer.";
      } else {
        const isMatch = await bcrypt.compare(password, whiteboard.editorPass);
        if (isMatch) {
          determinedRole = "editor";
          joinMessage = `Successfully joined as an editor.`;
        } else {
          determinedRole = "viewer";
          joinMessage = "Incorrect password. Joined as a viewer.";
        }
      }
    }

    const annotatorIndex = whiteboard.annotators.findIndex(
      (a) => a.user.toString() === currentUserId.toString()
    );

    let needsSave = false;
    if (annotatorIndex > -1) {
      if (whiteboard.annotators[annotatorIndex].role !== determinedRole) {
        whiteboard.annotators[annotatorIndex].role = determinedRole;
        needsSave = true;
      }
    } else {
      whiteboard.annotators.push({ user: currentUserId, role: determinedRole });
      needsSave = true;
    }

    if (needsSave) {
      await whiteboard.save();
    }

    res.status(200).json({
      success: true,
      message: joinMessage,
      role: determinedRole,
      whiteboardId: whiteboard._id,
    });
  } catch (error) {
    console.error("Error joining whiteboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function editWhiteboard(req, res) {
  try {
    const { actions, whiteboardId } = req.body;
    if (!whiteboardId || !Array.isArray(actions))
      return res
        .status(400)
        .json({ error: "Missing whiteboardId or invalid actions" });
    let history = await HistoryLog.findOne({ whiteboardId });
    if (!history) {
      history = new HistoryLog({
        whiteboardId: new mongoose.Types.ObjectId(whiteboardId),
        actions: [...actions],
      });
    } else {
      history.actions.push(...actions);
    }
    await history.save();
    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("Error editing whiteboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteWhiteboard(req, res) {
  try {
    const { whiteboardId } = req.params;
    if (!whiteboardId)
      return res.status(400).json({ error: "Missing whiteboardId" });
    const whiteboard = await Whiteboard.findById(whiteboardId);
    if (!whiteboard)
      return res.status(404).json({ error: "Whiteboard not found" });
    if (whiteboard.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Unauthorized: Not the owner" });
    const allUserIds = [
      whiteboard.owner,
      ...whiteboard.annotators.map((a) => a.user),
    ];
    await Promise.all(
      allUserIds.map((userId) =>
        User.findByIdAndUpdate(userId, {
          $pull: { whiteboards: whiteboard._id },
        })
      )
    );
    await Whiteboard.findByIdAndDelete(whiteboardId);
    res
      .status(200)
      .json({ success: true, message: "Whiteboard deleted successfully" });
  } catch (error) {
    console.error("Error deleting whiteboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getWhiteboardById(req, res) {
  try {
    const { whiteboardId } = req.params;
    if (!whiteboardId)
      return res.status(400).json({ error: "Missing whiteboardId" });
    const whiteboard = await Whiteboard.findById(whiteboardId);
    if (!whiteboard)
      return res.status(404).json({ error: "Whiteboard not found" });
    res.status(200).json(whiteboard);
  } catch (error) {
    console.error("Error fetching whiteboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAnnotators(req, res) {
  try {
    const { whiteboardId } = req.params;
    if (!whiteboardId)
      return res.status(400).json({ error: "Missing whiteboardId" });
    const whiteboard = await Whiteboard.findById(whiteboardId).populate(
      "annotators.user",
      "username"
    );
    if (!whiteboard)
      return res.status(404).json({ error: "Whiteboard not found" });
    res.status(200).json(whiteboard.annotators);
  } catch (error) {
    console.error("Error fetching annotators:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function cleanhandler(req, res){
  try {
    await handleRoomCleanup(req.params.whiteboardId);
    res.status(200).json({ success: true, message: "Room cleanup completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Room cleanup failed" });
  }
}

module.exports = {
  createWhiteboard,
  editWhiteboard,
  deleteWhiteboard,
  getWhiteboardById,
  getAnnotators,
  handleRoomCleanup,
  loadWhiteboard,
  joinWhiteboard,
  cleanhandler
};