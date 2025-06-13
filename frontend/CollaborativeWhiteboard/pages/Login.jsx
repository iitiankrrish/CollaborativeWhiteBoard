import React, { useState, useEffect, useRef, useCallback } from "react";
import { TextField, Button, Typography, Box, Modal } from "@mui/material";
import { useNavigate } from "react-router-dom";
import instance from "../src/axios";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const navigate = useNavigate();

  const colorPalettes = [
    { base: "rgba(29, 185, 84, 0.4)", active: "#1DB954", highlight: "#22C55E" }, 
    { base: "rgba(229, 9, 20, 0.4)", active: "#E50914", highlight: "#FF4500" }  
  ];
  
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setModalMessage("Please fill in both fields.");
      return;
    }

    try {
      
      const response = await instance.post("/users/login", { email, password });
      console.log(response);
      if (response.data.success) {
          localStorage.setItem("user", JSON.stringify(response.data.currentUser));
        setModalMessage("Login successful!");
        setTimeout(() => {
          navigate("/users/dashboard");
        }, 1200);
      }
    } catch (error) {
      console.error("Login error:", error);
      setModalMessage("Invalid credentials.");
    }
  };

  const handleCloseModal = () => {
    setModalMessage("");
  };

  const Particle = useCallback(function (context, palette, canvasWidth, canvasHeight) {
    this.context = context;
    this.palette = palette;
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * 3 + 2;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = (Math.random() - 0.5) * 3;
    this.color = palette.base;

    this.draw = () => {
      this.context.fillStyle = this.color;
      this.context.beginPath();
      this.context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      this.context.closePath();
      this.context.fill();
    };

    this.update = () => {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x + this.size > this.context.canvas.width || this.x - this.size < 0) {
        this.vx *= -1;
      }
      if (this.y + this.size > this.context.canvas.height || this.y - this.size < 0) {
        this.vy *= -1;
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    let particlesArray = [];
    const numberOfParticles = 400;

    const initParticles = () => {
      particlesArray = [];
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      for (let i = 0; i < numberOfParticles; i++) {
        const randomPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
        particlesArray.push(new Particle(context, randomPalette, canvasWidth, canvasHeight));
      }
    };

    const animateParticles = () => {
      context.fillStyle = "rgba(0, 0, 0, 0.1)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }

      animationFrameId.current = requestAnimationFrame(animateParticles);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    animateParticles();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [Particle, colorPalettes]);

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000000",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          backgroundColor: "#000000",
        }}
      />

      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          zIndex: 10,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          padding: { xs: "2rem", md: "3rem" },
          borderRadius: "20px",
          boxShadow: "0 0 60px rgba(29, 185, 84, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: { xs: "90%", sm: "400px" },
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(29, 185, 84, 0.4)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            color: "#1DB954",
            fontWeight: "bold",
            textAlign: "center",
            letterSpacing: 1.2,
            textShadow: "0 0 15px rgba(29, 185, 84, 0.8)",
          }}
        >
          Welcome Back
        </Typography>

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            input: { color: "#eee" },
            label: { color: "#bbb" },
            "& label.Mui-focused": { color: "#1DB954" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: "#1DB954" },
              "&.Mui-focused fieldset": { borderColor: "#1DB954" },
              borderRadius: "8px",
            },
          }}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            input: { color: "#eee" },
            label: { color: "#bbb" },
            "& label.Mui-focused": { color: "#1DB954" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: "#1DB954" },
              "&.Mui-focused fieldset": { borderColor: "#1DB954" },
              borderRadius: "8px",
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          sx={{
            background: "linear-gradient(90deg, #1DB954, #17a44c)",
            color: "#000",
            fontWeight: "bold",
            padding: "14px",
            borderRadius: "12px",
            fontSize: "1.1rem",
            textTransform: "none",
            boxShadow: "0 5px 20px rgba(29, 185, 84, 0.6)",
            "&:hover": {
              background: "linear-gradient(90deg, #17a44c, #1DB954)",
              boxShadow: "0 8px 25px rgba(29, 185, 84, 0.8)",
              transform: "translateY(-3px) scale(1.01)",
            },
            transition: "all 0.3s ease-in-out",
          }}
        >
          Login
        </Button>

        <Typography
          variant="body2"
          sx={{ color: "#aaa", textAlign: "center", fontSize: "0.9rem" }}
        >
          Don’t have an account?{" "}
          <Typography
            component="span"
            onClick={() => navigate("/users/signup")}
            sx={{
              color: "#E50914", 
              cursor: "pointer",
              fontWeight: "bold",
              "&:hover": { textDecoration: "underline", color: "#FF4500" },
              transition: "color 0.2s ease-in-out",
            }}
          >
            Sign Up
          </Typography>
        </Typography>
      </Box>

      <Modal
        open={modalMessage !== ""}
        onClose={handleCloseModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            color: "#eee",
            padding: 4,
            borderRadius: "12px",
            boxShadow: modalMessage === "Login successful!"
              ? "0 0 25px rgba(29, 185, 84, 0.9)"
              : "0 0 25px rgba(229, 9, 20, 0.9)", 
            textAlign: "center",
            maxWidth: "300px",
            animation: "fade-in 0.3s ease-out forwards",
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            mb={2}
            color={modalMessage === "Login successful!" ? "#1DB954" : "#E50914"}
          >
            {modalMessage === "Login successful!" ? "Success" : "Error"}
          </Typography>
          <Typography sx={{ mt: 2, mb: 3 }}>{modalMessage}</Typography>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            sx={{
              backgroundColor: modalMessage === "Login successful!" ? "#1DB954" : "#E50914",
              color: "#000",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: modalMessage === "Login successful!" ? "#17a44c" : "#FF4500",
              },
            }}
          >
            OK
          </Button>
        </Box>
      </Modal>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}
