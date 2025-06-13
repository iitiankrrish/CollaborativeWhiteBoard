import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { LayoutDashboard, User, LogOut } from 'lucide-react';
import instance from '../src/axios';
import { useNavigate } from 'react-router-dom';
export default function SidePanel() {
  const navigate = useNavigate();

  const handleProtectedRedirect = async (path) => {
    try {
      const res = await instance.get('/users/getuser');
      console.log(res);
      if (res?.status === 200) {
        navigate(path);
      } else {
        navigate('/users/login');
      }
    } catch (err) {
      console.error('Error checking user:', err);
      navigate('/users/login');
    }
  };
  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      await instance.post('/users/logout');
      
      navigate('/users/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  const panelWidthExpanded = 240;

  const baseMenuItemStyles = {
    borderRadius: '8px',
    margin: '8px 12px',
    color: '#b3b3b3',
    fontFamily: "'Montserrat', 'Poppins', sans-serif",
    transition: 'all 0.2s ease-in-out',
    '& .MuiListItemIcon-root': {
      minWidth: '40px',
      color: '#b3b3b3',
      transition: 'all 0.2s ease-in-out',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    padding: '10px 16px',
    justifyContent: 'flex-start',
  };

  const standardMenuItemHoverStyles = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#1DB954',
    transform: 'translateY(-2px)',
    boxShadow: 'none',
    textShadow: 'none',
    border: 'none',
    '& .MuiListItemIcon-root': {
      color: '#1DB954',
    },
  };

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: panelWidthExpanded,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: panelWidthExpanded,
          boxSizing: 'border-box',
          backgroundColor: '#121212',
          color: '#b3b3b3',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'none',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', marginTop: 2 }}>
        <Box sx={{ minHeight: '70px', paddingY: '10px' }} />
        <List sx={{ padding: '0px', flexGrow: 1 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleProtectedRedirect('/users/dashboard')}
              sx={{ ...baseMenuItemStyles, '&:hover, &:focus': standardMenuItemHoverStyles }}
            >
              <ListItemIcon>
                <User size={25} />
              </ListItemIcon>
              <ListItemText primary="My Profile" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleProtectedRedirect('/users/dashboard')}
              sx={{ ...baseMenuItemStyles, '&:hover, &:focus': standardMenuItemHoverStyles }}
            >
              <ListItemIcon>
                <LayoutDashboard size={25} />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />

        <List sx={{ padding: 0, mb: 1 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                ...baseMenuItemStyles,
                '&:hover, &:focus': {
                  backgroundColor: 'rgba(229, 9, 20, 0.08)',
                  color: '#E50914',
                  transform: 'translateY(-2px)',
                  boxShadow: 'none',
                  textShadow: 'none',
                  border: 'none',
                },
                '& .MuiListItemIcon-root': {
                  color: '#b3b3b3',
                  '&:hover': {
                    color: '#E50914',
                  },
                },
              }}
            >
              <ListItemIcon>
                <LogOut size={20} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
