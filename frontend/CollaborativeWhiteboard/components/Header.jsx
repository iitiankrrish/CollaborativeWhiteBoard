import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import instance from "../src/axios";

export default function Header() {
  const navigate = useNavigate();
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [joinId, setJoinId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [whiteboardName, setWhiteboardName] = useState("");
  const [whiteboardPurpose, setWhiteboardPurpose] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [editorPass, setEditorPass] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const resetCreateForm = () => {
    setWhiteboardName("");
    setWhiteboardPurpose("");
    setIsPublic(true);
    setEditorPass("");
    setOpenCreateModal(false);
  };
  const handleCreate = async () => {
    if (!whiteboardName || !whiteboardPurpose) {
      setSnackbar({
        open: true,
        message: "Name and purpose are required.",
        severity: "error",
      });
      return;
    }
    if (!isPublic && !editorPass) {
      setSnackbar({
        open: true,
        message: "A password is required for private boards.",
        severity: "error",
      });
      return;
    }

    try {
      const res = await instance.post("/whiteboards", {
        title: whiteboardName,
        purpose: whiteboardPurpose,
        publicAccess: isPublic,
        editorPass: isPublic ? null : editorPass,
      });

      if (res.data.success) {
        const newWhiteboard = res.data.whiteboard;
        setSnackbar({
          open: true,
          message: "Whiteboard created! Joining now...",
          severity: "success",
        });
        resetCreateForm();
        navigate(`/whiteboard/${newWhiteboard._id}/live`);
      }
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to create whiteboard.";
      setSnackbar({ open: true, message, severity: "error" });
    }
  };

  const handleJoin = async () => {
    if (!joinId) {
      setSnackbar({
        open: true,
        message: "Please enter a Whiteboard ID.",
        severity: "error",
      });
      return;
    }
    try {
      
      const res = await instance.post("/whiteboards/join", {
        whiteboardId: joinId,
        password: joinPassword,
      });
      if (res.data.success) {
        setSnackbar({
          open: true,
          message: res.data.message,
          severity: "success",
        });
        setOpenJoinModal(false);
        setJoinId("");
        setJoinPassword("");
      
        navigate(`/whiteboard/${res.data.whiteboardId}/live`);
      }
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to join whiteboard.";
      setSnackbar({ open: true, message, severity: "error" });
    }
  };
  const dialogStyle = {
    sx: {
      bgcolor: "#121212",
      color: "#b3b3b3",
      minWidth: 400,
      borderRadius: 3,
      padding: 2,
      boxShadow: "0 0 20px rgba(29, 185, 84, 0.6)",
    },
  };
  const titleStyle = {
    fontWeight: 700,
    fontSize: "1.5rem",
    color: "#1DB954",
    borderBottom: "1px solid #282828",
    pb: 1,
    position: "relative",
  };
  const contentStyle = {
    pt: 3,
    pb: 3,
    "& .MuiInputBase-root": { color: "#e0e0e0" },
    "& .MuiInput-underline:before": { borderBottomColor: "#555" },
    "& .MuiInput-underline:hover:before": { borderBottomColor: "#1DB954" },
    "& .MuiInput-underline:after": { borderBottomColor: "#1DB954" },
    "& label": { color: "#999", fontWeight: 500 },
    "& label.Mui-focused": { color: "#1DB954" },
  };
  const actionStyle = { pt: 2, pb: 2, px: 3 };
  const cancelStyle = {
    color: "#b3b3b3",
    textTransform: "none",
    fontWeight: 600,
    "&:hover": { color: "#fff" },
  };
  const confirmStyle = {
    backgroundColor: "#1DB954",
    textTransform: "none",
    fontWeight: 700,
    "&:hover": { backgroundColor: "#17a44c", boxShadow: "0 0 8px #17a44c" },
  };
  const closeButtonStyle = {
    position: "absolute",
    right: 8,
    top: 8,
    color: "#b3b3b3",
    "&:hover": { color: "#1DB954" },
  };
  const joinButtonStyles = {
    color: "#b3b3b3",
    fontWeight: 600,
    textTransform: "none",
    fontSize: "1rem",
    fontFamily: "'Montserrat', 'Poppins', sans-serif",
    position: "relative",
    padding: "8px 20px",
    borderRadius: "8px",
    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    overflow: "hidden",
    zIndex: 1,
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        "linear-gradient(45deg, transparent 30%, rgba(29, 185, 84, 0.1) 50%, transparent 70%)",
      transform: "translateX(-100%) skewX(-15deg)",
      transition: "transform 0.6s ease",
      zIndex: -1,
    },
    "&:hover": {
      color: "#fff",
      backgroundColor: "rgba(29, 185, 84, 0.05)",
      transform: "translateY(-3px) scale(1.05)",
      boxShadow: `0 10px 30px rgba(29, 185, 84, 0.4), 0 0 30px rgba(29, 185, 84, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
      textShadow: "0 0 15px rgba(29, 185, 84, 0.8)",
      border: "1px solid rgba(29, 185, 84, 0.3)",
    },
    "&:hover::after": { transform: "translateX(100%) skewX(-15deg)" },
    "&:active": { transform: "translateY(-1px) scale(0.98)" },
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#121212",
          height: 75,
          paddingTop: 0.6,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: "none",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 1.5,
              marginLeft: 1,
              fontFamily: "'Montserrat', 'Poppins', sans-serif",
              color: "#b3b3b3",
              userSelect: "none",
            }}
          >
            WHITEBOARD
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Button
              variant="text"
              onClick={() => setOpenJoinModal(true)}
              sx={joinButtonStyles}
            >
              Join
            </Button>
            <Button
              variant="text"
              onClick={() => setOpenCreateModal(true)}
              sx={joinButtonStyles}
            >
              Create Session
            </Button>
            <Avatar
              sx={{
                bgcolor: "#282828",
                color: "#b3b3b3",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "#1DB954",
                  color: "#fff",
                  transform: "rotate(360deg) scale(1.1)",
                  boxShadow: "0 0 20px rgba(29, 185, 84, 0.5)",
                },
              }}
            >
              U
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      <Dialog
        open={openJoinModal}
        onClose={() => setOpenJoinModal(false)}
        slotProps={{
          paper: dialogStyle,
        }}
      >
        <DialogTitle sx={titleStyle}>
          Join Whiteboard
          <IconButton
            onClick={() => setOpenJoinModal(false)}
            sx={closeButtonStyle}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={contentStyle}>
          <TextField
            autoFocus
            margin="dense"
            label="Whiteboard ID"
            type="text"
            fullWidth
            variant="standard"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Password (if private)"
            type="password"
            fullWidth
            variant="standard"
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={actionStyle}>
          <Button
            onClick={() => {
              setOpenJoinModal(false);
              setJoinId("");
              setJoinPassword("");
            }}
            sx={cancelStyle}
          >
            Cancel
          </Button>
          <Button onClick={handleJoin} variant="contained" sx={confirmStyle}>
            Join
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openCreateModal}
        onClose={resetCreateForm}
        slotProps={{
          paper: dialogStyle,
        }}
      >
        <DialogTitle sx={titleStyle}>
          Create Session
          <IconButton onClick={resetCreateForm} sx={closeButtonStyle}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={contentStyle}>
          <TextField
            margin="dense"
            label="Whiteboard Name"
            type="text"
            fullWidth
            variant="standard"
            value={whiteboardName}
            onChange={(e) => setWhiteboardName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Purpose / Description"
            type="text"
            fullWidth
            variant="standard"
            value={whiteboardPurpose}
            onChange={(e) => setWhiteboardPurpose(e.target.value)}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                sx={{ "& .MuiSwitch-thumb": { bgcolor: "#1DB954" } }}
              />
            }
            label="Public Access"
            sx={{ mt: 2, color: "#b3b3b3" }}
          />
          {!isPublic && (
            <TextField
              margin="dense"
              label="Editor Password"
              type="password"
              fullWidth
              variant="standard"
              value={editorPass}
              onChange={(e) => setEditorPass(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions sx={actionStyle}>
          <Button onClick={resetCreateForm} sx={cancelStyle}>
            Cancel
          </Button>
          <Button onClick={handleCreate} variant="contained" sx={confirmStyle}>
            Create & Join
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
