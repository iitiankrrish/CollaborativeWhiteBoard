const mongoose = require("mongoose");

const whiteboardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    annotators: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["editor", "viewer"],
          default: "viewer",
        },
      },
    ],
    publicAccess: {
      type: Boolean,
      default: false,
    },
    editorPass: {
      type: String,
      default: null,
    },
    snapshotDataUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Whiteboard = mongoose.model("Whiteboard", whiteboardSchema);

module.exports = Whiteboard;