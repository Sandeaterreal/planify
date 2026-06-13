const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  userId: String,
  title: String,
  date: String,
  time: {
    type: String,
    default: "00:00"
  },
  importance: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "low"
  }
});

module.exports = mongoose.model(
  "Task",
  TaskSchema
);