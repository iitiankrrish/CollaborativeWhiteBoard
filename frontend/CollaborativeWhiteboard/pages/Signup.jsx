import React, { useState, useRef, useEffect, useCallback } from "react";
import { TextField, Button, Typography, Box, Modal } from "@mui/material";
import { useNavigate } from "react-router-dom";
import instance from "../src/axios";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [modalMessage, setModalMessage] = useState("");

  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const navigate = useNavigate();

  const colorPalettes = [
    { base: "rgba(29, 185, 84, 0.4)", active: "#1DB954", highlight: "#22C55E" },
    { base: "rgba(229, 9, 20, 0.4)", active: "#E50914", highlight: "#FF4500" },
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    const { username, email, password } = form;
    if (!username || !email || !password) {
      setModalMessage("Please fill in all fields.");
      return;
    }

    try {
      const res = await instance.post("/users/signup", form);
      if (res.data.success) {
        setModalMessage("Signup successful!");
        setTimeout(() => navigate("/users/login"), 1200);
      }
    } catch (err) {
      console.error(err);
      setModalMessage("Signup failed. Try again.");
    }
  };

  const Particle = useCallback(function (context, palette, w, h) {
    this.context = context;
    this.palette = palette;
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = Math.random() * 3 + 2;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = (Math.random() - 0.5) * 3;
    this.color = palette.base;

    this.draw = () => {
      context.fillStyle = this.color;
      context.beginPath();
      context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      context.fill();
    };

    this.update = () => {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x + this.size > w || this.x - this.size < 0) this.vx *= -1;
      if (this.y + this.size > h || this.y - this.size < 0) this.vy *= -1;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    const num = 400;

    const init = () => {
      particles = [];
      const w = canvas.width = window.innerWidth;
      const h = canvas.height = window.innerHeight;
      for (let i = 0; i < num; i++) {
        const p = new Particle(ctx, colorPalettes[Math.floor(Math.random() * colorPalettes.length)], w, h);
        particles.push(p);
      }
    };

    const animate = () => {
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId.current = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener("resize", init);
    };
  }, [Particle]);

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
        onSubmit={handleSignup}
        sx={{
          zIndex: 10,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          padding: { xs: "2rem", md: "3rem" },
          borderRadius: "20px",
          boxShadow: "0 0 60px rgba(229, 9, 20, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: { xs: "90%", sm: "400px" },
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(229, 9, 20, 0.4)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            color: "#E50914",
            fontWeight: "bold",
            textAlign: "center",
            letterSpacing: 1.2,
            textShadow: "0 0 15px rgba(229, 9, 20, 0.8)",
          }}
        >
          Create Account
        </Typography>

        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          sx={textFieldStyle}
        />
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          sx={textFieldStyle}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          sx={textFieldStyle}
        />

        <Button
          type="submit"
          variant="contained"
          sx={{
            background: "linear-gradient(90deg, #E50914, #FF4500)",
            color: "#000",
            fontWeight: "bold",
            padding: "14px",
            borderRadius: "12px",
            fontSize: "1.1rem",
            textTransform: "none",
            boxShadow: "0 5px 20px rgba(229, 9, 20, 0.6)",
            "&:hover": {
              background: "linear-gradient(90deg, #FF4500, #E50914)",
              boxShadow: "0 8px 25px rgba(229, 9, 20, 0.8)",
              transform: "translateY(-3px) scale(1.01)",
            },
            transition: "all 0.3s ease-in-out",
          }}
        >
          Sign Up
        </Button>

        <Typography
          variant="body2"
          sx={{ color: "#aaa", textAlign: "center", fontSize: "0.9rem" }}
        >
          Already have an account?{" "}
          <Typography
            component="span"
            onClick={() => navigate("/users/login")}
            sx={{
              color: "#1DB954",
              cursor: "pointer",
              fontWeight: "bold",
              "&:hover": { textDecoration: "underline", color: "#22C55E" },
              transition: "color 0.2s ease-in-out",
            }}
          >
            Login
          </Typography>
        </Typography>
      </Box>

      <Modal
        open={modalMessage !== ""}
        onClose={() => setModalMessage("")}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            color: "#eee",
            padding: 4,
            borderRadius: "12px",
            boxShadow: modalMessage === "Signup successful!"
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
            color={modalMessage === "Signup successful!" ? "#1DB954" : "#E50914"}
          >
            {modalMessage === "Signup successful!" ? "Success" : "Error"}
          </Typography>
          <Typography sx={{ mt: 2, mb: 3 }}>{modalMessage}</Typography>
          <Button
            onClick={() => setModalMessage("")}
            variant="contained"
            sx={{
              backgroundColor: modalMessage === "Signup successful!" ? "#1DB954" : "#E50914",
              color: "#000",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: modalMessage === "Signup successful!" ? "#17a44c" : "#FF4500",
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

const textFieldStyle = {
  input: { color: "#eee" },
  label: { color: "#bbb" },
  "& label.Mui-focused": { color: "#E50914" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#333" },
    "&:hover fieldset": { borderColor: "#E50914" },
    "&.Mui-focused fieldset": { borderColor: "#E50914" },
    borderRadius: "8px",
  },
};
