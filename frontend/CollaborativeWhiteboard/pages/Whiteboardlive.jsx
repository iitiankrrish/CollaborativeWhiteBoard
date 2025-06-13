// WhiteboardRoomLive.jsx - FULL, FINAL, CORRECTED FILE

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../src/chatsocket";
import axios from "../src/axios";
import ChatPanel from "../components/Chatpanel";
import AnnotatorsPanel from "../components/AnnotatorPanel";
import Canvas from "../components/Canvas";
import { Box, CircularProgress } from "@mui/material";

const WhiteboardRoomLive = () => {
  const { roomId } = useParams();
  const socket = useSocket();
  const [user, setUser] = useState(null);
  const [annotators, setAnnotators] = useState([]);
  const [initialData, setInitialData] = useState({
    snapshotDataUrl: null,
    history: [],
  });
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/users/getuser", {
          withCredentials: true,
        });
        setUser(res.data.data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!roomId || !user) return;
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [boardDetailsRes, loadDataRes] = await Promise.all([
          axios.get(`/whiteboards/${roomId}`),
          axios.get(`/whiteboards/load/${roomId}`),
        ]);
        const whiteboard = boardDetailsRes.data;
        const role =
          whiteboard.annotators.find(
            (a) => a.user.toString() === user._id.toString()
          )?.role || (whiteboard.publicAccess ? "viewer" : "none");
        setUserRole(role);

        setInitialData({
          snapshotDataUrl: loadDataRes.data.snapshotDataUrl,
          history: loadDataRes.data.history || [],
        });
      } catch (err) {
        console.error("Failed to load initial whiteboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [roomId, user]);

  useEffect(() => {
    if (socket && roomId && user) {
      socket.emit("roomJoined", { roomId, user });
      socket.on("roomUsers", (users) => setAnnotators(users));
      return () => {
        socket.off("roomUsers");
      };
    }
  }, [socket, roomId, user]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#121212", color: "white" }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#121212" }}>
      <AnnotatorsPanel roomId={roomId} annotators={annotators} />
      
      <Canvas
        roomId={roomId}
        snapshotDataUrl={initialData.snapshotDataUrl}
        initialHistory={initialData.history}
        annotators={annotators}
        userRole={userRole} 
      />
      <ChatPanel roomId={roomId} />
    </div>
  );
};

export default WhiteboardRoomLive;