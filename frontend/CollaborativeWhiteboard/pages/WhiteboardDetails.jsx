import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  Tooltip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { FileCopy as FileCopyIcon } from "@mui/icons-material";
import Header from "../components/Header";
import SidePanel from "../components/Sidepanel";
import { useParams } from "react-router-dom";
import instance from "../src/axios";

const WhiteboardDetails = () => {
  const { whiteboardId } = useParams();
  const [whiteboard, setWhiteboard] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [annotatorUsers, setAnnotatorUsers] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchWhiteboard = async () => {
      try {
        const res = await instance.get(`/whiteboards/${whiteboardId}`);
        setWhiteboard(res.data);
      } catch (e) {
        console.error("Error fetching whiteboard:", e);
      }
    };
    fetchWhiteboard();
  }, [whiteboardId]);

  useEffect(() => {
    const fetchOwner = async () => {
      if (!whiteboard?.owner) return;
      try {
        if (typeof whiteboard.owner === "string") {
          const res = await instance.post("/users/getowner", { userId: whiteboard.owner });
          setOwnerData(res.data.data);
        } else {
          setOwnerData(whiteboard.owner);
        }
      } catch (err) {
        console.error("Error fetching owner data:", err);
      }
    };
    fetchOwner();
  }, [whiteboard?.owner]);

  useEffect(() => {
    const fetchAnnotatorUsers = async () => {
      if (!whiteboard?.annotators?.length) return;
      try {
        const userRequests = whiteboard.annotators.map((annotator) =>
          instance.post("/users/getowner", { userId: annotator.user })
        );
        const responses = await Promise.all(userRequests);
        const enriched = responses.map((res, index) => ({
          user: res.data.data,
          role: whiteboard.annotators[index].role,
        }));
        setAnnotatorUsers(enriched);
      } catch (err) {
        console.error("Error fetching annotators:", err);
      }
    };
    fetchAnnotatorUsers();
  }, [whiteboard?.annotators]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(whiteboardId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!whiteboard || !ownerData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#121212", color: "white" }}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  
  const { title, purpose, publicAccess, editorPass, createdAt, updatedAt, snapshotDataUrl } = whiteboard;

  const generateAvatarColor = () => { return "#FF8A65" };
  const UserAvatar = ({ user }) => ( <Avatar sx={{ mr: 1.5, bgcolor: generateAvatarColor(), fontWeight: "bold" }}>{user?.username ? user.username[0].toUpperCase() : "U"}</Avatar> );
  const InfoItem = ({ label, value, isId = false }) => ( <Box sx={{ mb: 2 }}> <Typography variant="caption" sx={{ color: "#b3b3b3", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", }}>{label}</Typography> <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}> <Typography variant="body1" sx={{ color: "white", fontWeight: 400, wordBreak: "break-all" }}>{value}</Typography> {isId && ( <Tooltip title={copied ? "Copied!" : "Copy ID"} placement="top"> <IconButton onClick={handleCopyId} size="small"> <FileCopyIcon sx={{ color: copied ? "#1DB954" : "#b3b3b3", fontSize: "1rem", transition: "color 0.2s", }} /> </IconButton> </Tooltip> )} </Box> </Box> );
  const spotifyGreen = "#1DB954";

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#121212" }}>
      <SidePanel />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header />
        <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden", marginTop: 8, p: 3, gap: 3 }}>
          <Box sx={{ flex: 2, borderRadius: 2, overflow: "hidden", bgcolor: "#181818", display: "flex", justifyContent: "center", alignItems: "center" }}>
           
            <img src={snapshotDataUrl || "https://wallpapers.com/images/hd/black-background-texture-e05opaw21ymji0cz.jpg"} alt="Whiteboard Snapshot" style={{ width: "100%", height: "100%", objectFit: "contain" }}/>
          </Box>
          <Card sx={{ flex: 1.2, borderRadius: 2, bgcolor: "#181818", color: "white", overflowY: "auto", maxHeight: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, color: spotifyGreen }}>Whiteboard Details</Typography>
              <InfoItem label="Joining ID" value={whiteboardId} isId={true} />
              <InfoItem label="Title" value={title} />
              <InfoItem label="Purpose" value={purpose} />
              <InfoItem label="Public Access" value={publicAccess ? "Enabled" : "Disabled"}/>
              {!publicAccess && (<InfoItem label="Editor Password" value={editorPass ? "Set" : "Not Set"}/>)}
              <InfoItem label="Created" value={new Date(createdAt).toLocaleString()}/>
              <InfoItem label="Last Updated" value={new Date(updatedAt).toLocaleString()}/>
              <Divider sx={{ my: 3, height: "2px", background: `linear-gradient(to right, transparent, ${spotifyGreen}, transparent)`, border: 0, opacity: 0.7, }}/>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1.5, color: spotifyGreen }}>Owner</Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}> <UserAvatar user={ownerData} /> <Typography>{ownerData.username}</Typography> </Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: spotifyGreen }}>Annotators ({annotatorUsers.length})</Typography>
              <Box>
                {annotatorUsers.map((a, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center", p: 1.5, mb: 1, borderRadius: 1.5, transition: "all 0.2s ease-in-out", "&:hover": { bgcolor: "rgba(57, 255, 20, 0.1)" }, }}>
                    <UserAvatar user={a.user} />
                    <Box> <Typography variant="body1" sx={{ color: "white" }}>{a.user.username}</Typography> <Typography variant="caption" sx={{ fontWeight: "bold", textTransform: "capitalize", color: a.role === "editor" ? spotifyGreen : "#b3b3b3", }}>{a.role}</Typography> </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default WhiteboardDetails;