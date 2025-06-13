require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path'); 
const { MongoClient, ServerApiVersion } = require('mongodb');
const { connectToDB } = require('./connect.js');
const { attachSocketIO, userSocketMiddleware } = require('./middleware/ioMiddleware');
const WhiteBoardRoute = require('./routes/whiteboard');
const UserRoute = require('./routes/user');
const ChatRoute = require('./routes/chat');
const HistoryRoute = require('./routes/history.js');
const whiteboardSocket = require('./sockets/whiteboard');
const roomsSocket = require('./sockets/rooms');
const chatSocket = require('./sockets/chat');

const app = express();
const httpServer = http.createServer(app);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = process.env.CLIENT;

  if (origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
connectToDB(process.env.DBURL)
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection error:', err));

app.use('/whiteboards', WhiteBoardRoute);
app.use('/users', UserRoute);
app.use('/chat', ChatRoute);
app.use('/api/history', HistoryRoute);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(attachSocketIO(io));
io.use(userSocketMiddleware);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  whiteboardSocket(io, socket);
  roomsSocket(io, socket);
  chatSocket(io, socket);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});
const backendPort = process.env.PORT || 8000;
httpServer.listen(backendPort, () => {
  console.log(`Server running on port ${backendPort}`);
});