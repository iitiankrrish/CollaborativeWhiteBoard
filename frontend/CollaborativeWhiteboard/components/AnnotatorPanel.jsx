import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer, Box, List, ListItem, ListItemIcon,
  ListItemText, Typography, Divider, Button
} from '@mui/material';
import { User, LogOut } from 'lucide-react';
import { useSocket } from '../src/chatsocket';
const panelWidth = 200;
const AnnotatorsPanel = ({ roomId, annotators = [] }) => {
  const socket = useSocket();
  const navigate = useNavigate();
  const handleExitRoom = () => {
    if (socket) {
      socket.emit('leaveRoom', { roomId });
    }
    
    navigate('/users/dashboard');
  };
  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: panelWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: panelWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1e1e1e',
          color: '#b3b3b3',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ pl: 2, pt: 2, pb: 1, color: '#ffffff', fontWeight: 600 }}>
          In Room
        </Typography>
        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.12)', mx: 2 }} />
        <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {annotators.map((user) => (
            <ListItem key={user._id || user.username} disablePadding sx={{ px: 2, py: 0.5 }}>
              <ListItemIcon sx={{ color: '#1DB954', minWidth: 36 }}>
                <User size={18} />
              </ListItemIcon>
              <ListItemText
                primary={<Typography sx={{ fontSize: 14, color: '#e0e0e0' }}>{user.username}</Typography>}
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<LogOut size={15} />}
            onClick={handleExitRoom}
            sx={{
              backgroundColor: '#1DB954',
              color: 'white',
              fontWeight: 'bold',
              textTransform: 'none',
              // borderRadius: '50px',
              padding: '7px 0',
              boxShadow: '0 0 5px #1DB954, 0 0 10px #1DB954, 0 0 15px #1DB954',
              '&:hover': {
                backgroundColor: '#1ED760',
                boxShadow: '0 0 8px #1ED760, 0 0 15px #1ED760, 0 0 20px #1ED760',
              },
            }}
          >
            Exit Room
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AnnotatorsPanel;