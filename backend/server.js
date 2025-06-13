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
const corsOptions = {
  origin: process.env.CLIENT,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'], // Explicitly allow OPTIONS
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
connectToDB(process.env.DBURL)
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection error:', err));

// app.use('/whiteboards', WhiteBoardRoute);
// app.use('/users', UserRoute);
// app.use('/chat', ChatRoute);
// app.use('/api/history', HistoryRoute);
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