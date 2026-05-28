const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const todoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  nodes: { type: Array, default: [] },
  edges: { type: Array, default: [] }
});

const whiteboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  data: { type: Object, default: {} }
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Todo: mongoose.model('Todo', todoSchema),
  Roadmap: mongoose.model('Roadmap', roadmapSchema),
  Whiteboard: mongoose.model('Whiteboard', whiteboardSchema),
};
