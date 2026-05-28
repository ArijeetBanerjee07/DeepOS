const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { User, Todo, Roadmap, Whiteboard } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

const DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/deep_os';
mongoose.connect(DB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-deep-os';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/auth/signup', async (req, res) => {
  console.log('Signup attempt received for email:', req.body.email);
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, user: { id: user._id, email } });
  } catch (err) {
    console.error('Signup error details:', err);
    res.status(400).json({ error: 'Signup failed. ' + (err.code === 11000 ? 'Email might exist.' : err.message) });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, user: { id: user._id, email } });
  } catch (err) {
    res.status(400).json({ error: 'Login failed' });
  }
});

// APIs for memory context
app.get('/api/todos', authMiddleware, async (req, res) => {
  const todos = await Todo.find({ userId: req.userId });
  res.json(todos);
});
app.post('/api/todos', authMiddleware, async (req, res) => {
  const todo = new Todo({ ...req.body, userId: req.userId });
  await todo.save();
  res.json(todo);
});
app.put('/api/todos/:id', authMiddleware, async (req, res) => {
  const todo = await Todo.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
  res.json(todo);
});
app.delete('/api/todos/:id', authMiddleware, async (req, res) => {
  await Todo.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ success: true });
});

app.get('/api/roadmaps', authMiddleware, async (req, res) => {
  const roadmaps = await Roadmap.find({ userId: req.userId });
  res.json(roadmaps);
});
app.post('/api/roadmaps', authMiddleware, async (req, res) => {
  const roadmap = new Roadmap({ ...req.body, userId: req.userId });
  await roadmap.save();
  res.json(roadmap);
});
app.put('/api/roadmaps/:id', authMiddleware, async (req, res) => {
  const roadmap = await Roadmap.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
  res.json(roadmap);
});
app.delete('/api/roadmaps/:id', authMiddleware, async (req, res) => {
  await Roadmap.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ success: true });
});

app.listen(3002, () => {
  console.log('Server running on port 3002');
});
