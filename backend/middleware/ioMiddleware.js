const { getUser } = require('../services/auth');
function attachSocketIO(io) {
  return function (req, res, next) {
    req.io = io;
    next();
  };
}


async function userSocketMiddleware(socket, next) {
  try {
    let token = null;
    if (socket.handshake.auth?.token) {
      token = socket.handshake.auth.token;
    }
    else if (socket.handshake.headers?.cookie) {
      const cookieHeader = socket.handshake.headers.cookie;
      const cookies = {};
      cookieHeader.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        if (parts.length === 2) {
          cookies[parts[0].trim()] = parts[1].trim();
        }
      });

      token = cookies.loginToken; 
    }
    if (!token) {
      console.error('Socket Auth Error: No token found after checking auth and cookie header.');
      return next(new Error("Unauthorized: No token provided"));
    }

    const user = getUser(token); 
    if (!user) {
      console.error('Socket Auth Error: Invalid token after getUser verification.');
      return next(new Error("Unauthorized: Invalid token"));
    }

    socket.user = user;
    socket.userId = user._id; 

    next();
  } catch (err) {
    console.error("Socket authentication middleware failed:", err); 
    next(new Error("Socket authentication failed")); 
  }
}

module.exports = { attachSocketIO, userSocketMiddleware };
