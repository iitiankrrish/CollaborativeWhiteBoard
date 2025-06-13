import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/Login";
import SignupPage from "../pages/Signup";
import ProfilePage from "../pages/ProfilePage";
import WhiteboardDetails from "../pages/WhiteboardDetails";
import WhiteboardRoomLive from "../pages/Whiteboardlive";
import { SocketProvider } from "./chatsocket";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/users/login" element={<LoginPage />} />
        <Route path="/users/signup" element={<SignupPage />} />
        <Route path="/users/dashboard" element={<ProfilePage />} />
        <Route path="/whiteboard/view/:whiteboardId" element={<WhiteboardDetails />} />
        <Route
          path="/whiteboard/:roomId/live"
          element={
            <SocketProvider>
              <WhiteboardRoomLive />
            </SocketProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
