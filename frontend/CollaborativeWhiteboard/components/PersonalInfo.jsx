import React from 'react';
import { Box, Typography, Avatar, TextField } from '@mui/material';

const PersonalInfo = ({ userData, ownedWhiteboards = [], annotatorWhiteboards = [] }) => {
  if (!userData) {
    console.log('No user data');
    return null;
  }
  const textFieldStyles = {
    '& .MuiFilledInput-root': {
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: 2,
      '&:hover': {
        backgroundColor: '#222',
        borderColor: '#1DB954',
      },
      '&.Mui-focused': {
        backgroundColor: '#222',
        borderColor: '#1DB954',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#b3b3b3',
      fontWeight: 500,
      fontSize: '0.85rem',
      textTransform: 'uppercase',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#1DB954',
    },
    '& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after': {
      display: 'none',
    },
    '& .MuiFilledInput-input': {
      padding: '22px 16px 8px',
      fontSize: '0.95rem',
      color: '#fff',
    },
  };

  const getInitial = (name) => name?.[0]?.toUpperCase() || '';
  const allBoards = [
    ...ownedWhiteboards,
    ...annotatorWhiteboards.filter(
      (collab) => !ownedWhiteboards.find((own) => own._id === collab._id)
    ),
  ];
  const stats = [
    { value: ownedWhiteboards.length, label: 'My Boards' },
    { value: annotatorWhiteboards.length, label: 'Collab Boards' },
    { value: allBoards.length, label: 'All Boards' },
  ];
  return (
    <Box
      sx={{
        p: { xs: 3, md: 5 },
        background: 'linear-gradient(145deg, #181818 0%, #121212 100%)',
        border: '1px solid #282828',
        borderRadius: 4,
        mb: 6,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 5,
          textAlign: 'center',
          color: '#fff',
          textTransform: 'uppercase',
        }}
      >
        Account Details
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 4, md: 6 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={userData.profilePictureUrl || null}
              alt={userData.username}
              sx={{
                width: 200,
                height: 200,
                border: '4px solid #1DB954',
                background: userData.profilePictureUrl
                  ? undefined
                  : 'linear-gradient(135deg, #1DB954, #121212)',
                fontSize: 72,
                fontWeight: 600,
              }}
            >
              {!userData.profilePictureUrl && getInitial(userData.username)}
            </Avatar>
          </Box>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
            @{userData.username}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, width: '100%', maxWidth: 600 }}>
          {[
            { label: 'Username', value: userData.username },
            { label: 'Email Address', value: userData.email },
            { label: 'Password', value: '••••••••••' },
          ].map((field, idx) => (
            <TextField
              key={idx}
              fullWidth
              variant="filled"
              label={field.label}
              value={field.value}
              sx={{ ...textFieldStyles, mt: idx === 0 ? 0 : 2 }}
              InputProps={{ readOnly: true, disableUnderline: true }}
            />
          ))}

          <Box
            sx={{
              display: 'flex',
              mt: 4,
              p: 2,
              border: '1px solid #282828',
              borderRadius: 2,
              backgroundColor: '#1a1a1a',
            }}
          >
            {stats.map((stat, i) => (
              <Box
                key={i}
                sx={{
                  textAlign: 'center',
                  flex: 1,
                  borderRight: i < stats.length - 1 ? '1px solid #333' : 'none',
                }}
              >
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#b3b3b3',
                    textTransform: 'uppercase',
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PersonalInfo;
