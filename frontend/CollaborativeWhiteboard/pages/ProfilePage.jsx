import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  GlobalStyles,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import Header from "../components/Header";
import SidePanel from "../components/Sidepanel";
import WhiteboardCard from "../components/Whiteboardcard";
import PersonalInfo from "../components/PersonalInfo";
import instance from "../src/axios.js";
import { useNavigate } from "react-router-dom";
const CustomCarousel = ({ children, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 3;
  const totalItems = React.Children.count(children);
  const maxIndex = Math.max(0, totalItems - itemsPerView);
  const nextSlide = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex)); 
  const prevSlide = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
  if (totalItems === 0) {
    return (
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            mb: 3,
            background: "linear-gradient(45deg, #1DB954, #1ed760)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            p: 4,
            border: "2px dashed #333",
            borderRadius: 3,
            textAlign: "center",
            backgroundColor: "rgba(40, 40, 40, 0.3)",
          }}
        >
          <Typography
            sx={{ color: "#888", fontSize: "1.1rem", fontStyle: "italic" }}
          >
            No whiteboards found in this category
          </Typography>
        </Box>
      </Box>
    );
  }
  return (
    <Box sx={{ mb: 8 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "#fff",
            background: "linear-gradient(45deg, #1DB954, #1ed760)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={prevSlide}
            disabled={currentIndex === 0}
            sx={{
              backgroundColor: currentIndex === 0 ? "#333" : "#1DB954",
              color: currentIndex === 0 ? "#666" : "#fff",
              "&:hover": {
                backgroundColor: currentIndex === 0 ? "#333" : "#1ed760",
              },
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            sx={{
              backgroundColor: currentIndex >= maxIndex ? "#333" : "#1DB954",
              color: currentIndex >= maxIndex ? "#666" : "#fff",
              "&:hover": {
                backgroundColor: currentIndex >= maxIndex ? "#333" : "#1ed760",
              },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            gap: "2%",
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            transition: "transform 0.5s ease-in-out",
          }}
        >
          {React.Children.map(children, (child) => (
            <Box sx={{ flex: `0 0 calc(${100 / itemsPerView}% - 2%)` }}>
              {child}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const WhiteboardCarousel = ({ title, whiteboards = [] }) => {
  const whiteboardCards = whiteboards.map((board) => (
    <WhiteboardCard
      key={board._id || board}
      whiteboardData={board}
    />
  ));

  return <CustomCarousel title={title}>{whiteboardCards}</CustomCarousel>;
};

// API calls
const getUserInformation = async () => {
  try {
    const response = await instance.get(`/users/getuser`);
    return response.data;
  } catch (e) {
    console.error("Error Occurred:", e);
    return null;
  }
};

const getUserWhiteBoards = async () => {
  try {
    const response = await instance.get(`/users/my/whiteboards`);
    return response.data; 
  } catch (e) {
    console.error("Error Occurred:", e);
    return { data: [] };
  }
};

const getCollabWhiteBoards = async () => {
  try {
    const response = await instance.get(`/users/collab/whiteboards`);
    return response.data; 
  } catch (e) {
    console.error("Error Occurred:", e);
    return { whiteboardIds: [] };
  }
};

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [ownedWhiteboards, setOwnedWhiteboards] = useState([]);
  const [annotatorWhiteboards, setAnnotatorWhiteboards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, ownedRes, collabRes] = await Promise.all([
          getUserInformation(),
          getUserWhiteBoards(),
          getCollabWhiteBoards(),
        ]);

        setUserData(userRes?.data || null);
        setOwnedWhiteboards(ownedRes?.data || []);
        setAnnotatorWhiteboards(collabRes?.whiteboardIds || []);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  
  const ownedIds = new Set(ownedWhiteboards.map((wb) => wb._id));
  const uniqueAnnotatorWhiteboards = annotatorWhiteboards.filter(
    (id) => !ownedIds.has(id)
  );

  const allWhiteboards = [...ownedWhiteboards, ...uniqueAnnotatorWhiteboards];

  const headerHeight = "75px";

  return (
    <>
      <GlobalStyles/>
      <Box sx={{ display: "flex", bgcolor: "#121212", minHeight: "100vh" }}>
        <Header />
        <SidePanel />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            marginTop: headerHeight,
            marginLeft: 2,
            height: `calc(100vh - ${headerHeight})`,
            overflowY: "auto" ,
          }}
        >
          <Box
            sx={{
              maxWidth: "1300px",
              margin: "auto",
              p: { xs: 2, sm: 3, md: 4 },
            }}
          >
            {loading ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    bgcolor: "#121212",
                    color: "white",
                  }}
                >
                  <Typography
                    sx={{
                      color: "white",
                     
                      display: "flex",
                      alignSelf: "center",
                      alignContent: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress color="success" />
                  </Typography>
                </Box>
              </>
            ) : userData ? (
              <>
                <PersonalInfo
                  userData={userData}
                  ownedWhiteboards={ownedWhiteboards}
                  annotatorWhiteboards={annotatorWhiteboards}
                />
                <WhiteboardCarousel
                  title="My Whiteboards"
                  whiteboards={ownedWhiteboards}
                />
                <WhiteboardCarousel
                  title="Collaborative Whiteboards"
                  whiteboards={uniqueAnnotatorWhiteboards}
                />
                <WhiteboardCarousel
                  title="All Whiteboards"
                  whiteboards={allWhiteboards}
                />
              </>
            ) : (
              <Typography sx={{ color: "#ccc", fontStyle: "italic", mt: 4 }}>
                Could not load user data.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
