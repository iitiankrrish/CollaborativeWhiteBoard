
import React, { useState, useEffect } from "react";
import {
  Card,
  CardMedia,
  Box,
  Typography,
  Stack,
  Avatar,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import { Public, Lock, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import instance from "../src/axios";

function WhiteboardCard({ whiteboardData }) {
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const processData = async () => {
      setIsLoading(true);
      setDetails(null);
      setOwner(null);
      if (typeof whiteboardData === "object" && whiteboardData !== null && whiteboardData._id) {
        setDetails(whiteboardData);
      } else if (typeof whiteboardData === "string") {
        try {
          const res = await instance.get(`/whiteboards/${whiteboardData}`);
          setDetails(res.data);
        } catch (err) {
          console.error(`Failed to fetch whiteboard data for ID ${whiteboardData}:`, err);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    processData();
  }, [whiteboardData]);

  useEffect(() => {
    const fetchOwner = async () => {
      if (!details?.owner) {
        if (details) setIsLoading(false);
        return;
      }
      try {
        const res = await instance.post("/users/getowner", { userId: details.owner });
        setOwner(res.data.data);
      } catch (err) {
        console.error("Failed to fetch owner data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOwner();
  }, [details]);

  if (isLoading) {
    return (
      <Box sx={{ width: 360, height: 200, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#1c1c1c", borderRadius: 4 }}>
        <CircularProgress size={24} sx={{ color: "#666" }} />
      </Box>
    );
  }

  if (!details) {
    return (
      <Box sx={{ width: 360, height: 200, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#1c1c1c", borderRadius: 4, border: "1px dashed #444" }}>
        <Typography variant="body2" color="#666">Could not load whiteboard</Typography>
      </Box>
    );
  }

  
  const { _id, title, purpose, publicAccess, createdAt, snapshotDataUrl } = details;

  const handleOpenClick = (e) => {
    e.stopPropagation();
    navigate(`/whiteboard/view/${_id}`);
  };
  const truncatedDescription = purpose.length > 50 ? purpose.substring(0, 50) + "..." : purpose;

  const openButtonStyles = { backgroundColor: "#1DB954", color: "#fff", fontWeight: "bold", textTransform: "none", borderRadius: "8px", padding: "6px 16px", transition: "all 0.3s ease", "&:hover": { backgroundColor: "#1ED760", transform: "translateY(-2px)", boxShadow: "0 4px 10px rgba(29, 185, 84, 0.4)", }, "&:active": { transform: "translateY(0px)" } };

  return (
    <Card sx={{ width: 360, height: 200, borderRadius: 4, overflow: "hidden", backgroundColor: "#121212", boxShadow: "0 6px 15px rgba(0, 0, 0, 0.7)", position: "relative", cursor: "pointer", transition: "transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease", "&:hover": { boxShadow: "0 8px 20px rgba(0, 0, 0, 0.9)", border: "1px solid #1DB954", }, border: "1px solid transparent", }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      
      {snapshotDataUrl ? (
        <CardMedia
          component="img"
          image={snapshotDataUrl} 
          alt="Whiteboard preview"
          sx={{ filter: hovered ? "brightness(0.5)" : "none", transition: "filter 0.3s ease", objectFit: "cover", display: hovered ? "none" : "block", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", }}
        />
      ) : (
        <Box sx={{ display: hovered ? "none" : "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#282828", color: "#888", position: "absolute", top: 0, left: 0, zIndex: 1, textAlign: "center", }}>
          <Edit sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="subtitle1" fontWeight="bold">No Preview Available</Typography>
        </Box>
      )}
      <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(18, 18, 18, 0.98)", display: "flex", flexDirection: "column", justifyContent: "space-between", p: "16px", zIndex: 2, opacity: hovered ? 1 : 0, visibility: hovered ? "visible" : "hidden", transition: "opacity 0.3s ease, visibility 0.3s ease", color: "#e0e0e0", }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#fff" lineHeight={1.2} mb={0.5}>{title}</Typography>
          <Typography variant="body2" color="#b3b3b3" sx={{ display: "-webkit-box", overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}>{truncatedDescription}</Typography>
        </Box>
        <Stack spacing={1.5}>
          {owner && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 28, height: 28, bgcolor: "#333" }}>{owner.username[0]?.toUpperCase()}</Avatar>
              <Typography variant="body2" color="#b3b3b3">{owner.username}</Typography>
            </Stack>
          )}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip size="small" icon={publicAccess ? <Public fontSize="small" /> : <Lock fontSize="small" />} label={publicAccess ? "Public" : "Private"} sx={{ fontWeight: "bold", backgroundColor: publicAccess ? "rgba(29, 185, 84, 0.2)" : "rgba(128, 128, 128, 0.2)", color: publicAccess ? "#1DB954" : "#b3b3b3", }}/>
            <Button variant="contained" size="small" sx={openButtonStyles} onClick={handleOpenClick}>Open</Button>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}

export default WhiteboardCard;