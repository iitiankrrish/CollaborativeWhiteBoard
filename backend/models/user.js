const mongoose = require('mongoose');
const Whiteboard = require('./whiteboard');
const userSchema = new mongoose.Schema(
    {
      username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 10,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => {
          `${props.value} is not a valid email address`;
        },
      },
    },
    whiteboards:{
        type: [mongoose.Schema.ObjectId],
        ref: "Whiteboard"
    }
  },
  { timestamps: true }
);
const User = mongoose.model("users", userSchema);
module.exports = User;

