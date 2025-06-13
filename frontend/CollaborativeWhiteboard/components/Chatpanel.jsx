import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useSocket } from '../src/chatsocket';
import CloseIcon from '@mui/icons-material/Close'; 
const UserAvatar = ({ username }) => {
  const generateAvatarColor = (str) => {
    let hash = 0;
    if (!str || str.length === 0) return '#4A4A4A';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash |= 0;
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  };

  return (
    <Avatar
      sx={{
        width: 36,
        height: 36,
        bgcolor: generateAvatarColor(username),
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: '1rem',
      }}
    >
      {username ? username[0].toUpperCase() : 'A'}
    </Avatar>
  );
};
const ChatPanel = ({ roomId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatHistoryRef = useRef(null);
  const socket = useSocket();
  const spotifyGreen = '#1DB954';
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!socket || !roomId) return; 
    const user = JSON.parse(localStorage.getItem('user'));
    if (socket && roomId && user) {
        socket.emit('roomJoined', { roomId, user });
    }
    const handleChatHistory = (history) => {
      setMessages(history.map(msg => ({ id: msg._id, text: msg.content, sender: msg.sender === socket.userId ? 'me' : 'other', senderUsername: msg.senderUsername || 'Anonymous', createdAt: msg.sentAt, })));
    }; 
    const handleMessageSent = (msg) => {
      setMessages(prev => [ ...prev, { id: msg._id || Date.now(), text: msg.message, sender: msg.sender === socket.userId ? 'me' : 'other', senderUsername: msg.senderUsername || 'Anonymous', createdAt: msg.createdAt, }, ]);
    };
    socket.on('chatHistory', handleChatHistory);
    socket.on('messageSent', handleMessageSent);
    return () => {
      socket.off('chatHistory', handleChatHistory);
      socket.off('messageSent', handleMessageSent);
    };
  }, [socket, roomId]);
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;
    socket.emit('sendMessage', { roomId, message: newMessage.trim() });
    setNewMessage('');
  };
  if (!socket) {
    return <Box sx={{ color: '#ffffff', p: 4, width: '510px' }}>Connecting to chat...</Box>;
  }
  return (
    <Box
      sx={{
        width: '25%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        bgcolor: '#000000',
        borderLeft: '1px solid #1A1A1A',
        flexShrink: 0,
      }}
    >
      <Box sx={{
          p: '16px 24px',
          bgcolor: '#121212',
          borderBottom: '1px solid #282828',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
        <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: '700' }}>
          Room Chat
        </Typography>
        {onClose && <IconButton onClick={onClose} sx={{ color: spotifyGreen }}><CloseIcon /></IconButton>}
      </Box>

      <Box
        ref={chatHistoryRef}
        sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 3,
            bgcolor: '#121212',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: spotifyGreen,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#1ed760', 
            }
        }}
      >
        {messages.map((msg, index) => {
          const previousMsg = messages[index - 1];
          const isMe = msg.sender === 'me';
          const isFirstInGroup = !previousMsg || previousMsg.senderUsername !== msg.senderUsername;
          const showAvatarAndName = !isMe && isFirstInGroup;

          return (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                mt: isFirstInGroup ? 3 : 0.5,
              }}
            >
              <Box sx={{ width: 36, flexShrink: 0 }}>
                {showAvatarAndName && <UserAvatar username={msg.senderUsername} />}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '75%' }}>
                {showAvatarAndName && (
                  <Typography variant="caption" sx={{ color: '#b3b3b3', fontWeight: '600', mb: 0.5 }}>
                    {msg.senderUsername}
                  </Typography>
                )}

                <Box
                  sx={{
                    p: '10px 14px',
                    wordBreak: 'break-word',
                    bgcolor: isMe ? spotifyGreen : '#2A2A2A',
                    color: isMe ? '#FFFFFF' : '#E0E0E0',
                    borderRadius: isMe ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.925rem', whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block', mt: 0.8, fontSize: '0.7rem', textAlign: 'right', fontWeight: 500,
                      color: isMe ? 'rgba(255,255,255,0.7)' : '#A0A0A0',
                    }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box component="form" onSubmit={handleSendMessage} sx={{ p: '16px 24px', borderTop: '1px solid #282828', bgcolor: '#121212' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#2A2A2A', borderRadius: '50px', padding: '6px 6px 6px 18px' }}>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Say something..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoComplete="off"
            sx={{
              '& .MuiInputBase-root': { color: '#fff', fontSize: '0.95rem' },
              '& .MuiInput-underline:before, & .MuiInput-underline:after, & .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
              '& .MuiInputBase-input::placeholder': { color: '#B3B3B3', opacity: 1, fontWeight: 500 },
            }}
          />
          <IconButton type="submit" sx={{ bgcolor: spotifyGreen, p: '10px', '&:hover': { bgcolor: '#1ed760' } }}>
            <SendIcon sx={{ color: 'white' }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPanel;