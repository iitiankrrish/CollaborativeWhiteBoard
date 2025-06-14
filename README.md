# Collaborative Whiteboard 

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=nodedotjs)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black?logo=socketdotio)


<p>
A powerful, real-time collaborative whiteboard app that makes it easier to work together, and be creative from a distance. It has a modern, decoupled MERN stack architecture that lets users draw, annotate, and talk to each other in virtual rooms. Every interaction is instantly synced through WebSockets.The platform has a strong chat system with a message history that never goes away, as well as a whiteboard action log that keeps track of the entire drawing session so that it can be easily recovered and reloaded. Users can make rooms that are either public or private. The private rooms are protected by passwords so that people can work together safely. Users can also set permissions based on roles, so that viewers and editors can be separated. The app offers a full and easy-to-use collaborative experience for teams working from different places. It supports advanced annotative tools (pen, eraser, shapes, text, fill), real-time presence updates, and secure JWT-based authentication.
</p>

## Table of Contents

1.  [Live Demo](#live-demo)
2.  [Key Features](#key-features)
3.  [System Architecture & Tech Stack](#system-architecture--tech-stack)
4.  [Local Setup & Installation](#local-setup--installation)
5.  [Deployment Guide](#deployment-guide)
6.  [Demonstration Video](#demo-video)


## Live Demo
-   **Live Frontend (Vercel):** [collaborative-white-board-kappa.vercel.app](https://collaborative-white-board-kappa.vercel.app/)

> **Note:** The free-tier backend on Render may "spin down" after 15 minutes of inactivity. The first API request (like logging in or signing up) might take 30-60 seconds to complete while the server wakes up. Please be patient!

---

## Key Features

### Core Whiteboard Functionality
-   **Real-time Canvas:** All drawing actions are instantly broadcasted to every user in the room for a zero-latency collaborative feel.
-   **Rich Drawing Tools:** A full suite of tools including Pen, Eraser, Text, and Shapes (Rectangle & Circle, both stroked and filled).
-   **Dynamic Tool Customization:** Easily adjust brush/stroke color, fill color, stroke weight, and font size on the fly.
-   **Persistent State:** The complete drawing history and latest snapshot of the canvas are saved to the database, so your work is never lost.
-   **Infinite Undo/Redo:** A robust history stack allows users to step backward and forward through their actions.
-   **Canvas Management:** Clear the entire board for everyone or export the current view as a high-quality PNG, JPG, or PDF.

### User & Room Management
-   **Secure Authentication:** User signup and login are secured using JWT (JSON Web Tokens) and password hashing with `bcrypt`. Tokens are stored in secure, HttpOnly cookies.
-   **Personalized Dashboard:** A central hub for each user to view and manage all whiteboards they own or have been invited to.
-   **Flexible Room Creation:** Users can create new whiteboard sessions and configure them as public or private.
-   **Access Control:** Private rooms are protected by a password that is required to gain editor access.
-   **Role-Based Permissions:** Users have distinct roles (`editor` or `viewer`). Viewers can see all activity and chat, but cannot draw or modify the canvas.

### Real-time Collaboration
-   **Live Presence:** An "Annotators" panel shows a real-time list of all users currently active in the room.
-   **Integrated Live Chat:** A dedicated chat panel allows for seamless text communication between participants within the same room.

---

## System Architecture & Tech Stack

This project follows an architecture where the React frontend communicates with the Express.js backend via a REST API for standard HTTP requests and a WebSocket connection for real-time events.

<p align="center">
  <b>[ Frontend (Vercel) ]</b> <i>--- REST API / WebSockets ---></i> <b>[ Backend (Render) ]</b> <i>--- Mongoose ---></i> <b>[ MongoDB Atlas ]</b>
</p>

| Category                | Technology / Library                                           | Purpose                                                    |
| ----------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| **Frontend**            | React 18, Vite, React Router, Material-UI (MUI), Axios         | Building a fast, interactive UI and handling client-side logic. |
| **Backend**             | Node.js, Express.js, Mongoose, CORS, Cookie Parser     | Creating the REST API, managing server logic, and security.  |
| **Database**            | MongoDB Atlas                           | Storing user data, whiteboard sessions, and drawing history. |
| **Real-time Engine**    | Socket.IO                                                      | Enabling bi-directional, real-time communication.          |
| **Authentication**      | JSON Web Tokens (JWT), Bcrypt (Password Hashing)               | Securing user accounts and authenticating requests.        |
| **Deployment**          | Vercel (Frontend CI/CD) & Render (Backend CI/CD)               | Automating builds and hosting the live application.        |

---

## Local Setup

Follow these instructions to get the project up and running on your local machine.

### Prerequisites
-   **Node.js:** v18 or later is recommended.
-   **npm:** Should be included with Node.js.
-   **Git:** To clone the repository.
-   **MongoDB Atlas:** A free account is needed to get a database connection string.

### 1. Clone the Repository
First, clone the project from GitHub to your local machine.

```bash
git clone https://github.com/iitiankrrish/CollaborativeWhiteBoard.git
```
Then move to the CollaborativeWhiteBoard directory 
```bash
cd CollaborativeWhiteBoard
```

### 2. Configure the Backend

#### Navigate to the backend directory

```bash
cd backend
```

### 3. Create the environment file (.env)

Create a .env file in the backend/ folder and fill it with the environment variables.

```bash
# backend/.env

# Your MongoDB connection string (from MongoDB Atlas or local instance)
MONGO_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/yourDatabase?retryWrites=true&w=majority"

# Strings for encryption and security
JWT_SECRET="JWT_SECRET"

COOKIE_SECRET="COOKIE_SECRET"

# URL where your frontend runs (during local development)
CLIENT_ORIGIN="http://localhost:5173"

# Port for the backend server
PORT=8000
```

### 4. Install the backend dependencies 
```bash
npm install
```

### 5. Start the backend server  
```bash
npm start
```
Now , your backend server should be running at the port 8000 

### 1. Configure the Frontend

The frontend is built using React 18 + Vite and serves the user interface.

### 2. Open a new terminal and navigate to the frontend directory

Make sure the backend server is still running in the first terminal window.
```bash
cd frontend/CollaborativeWhiteboard
```

### 3. Create the environment file (.env)

Create a .env file in the frontend directory to define the base URL for API requests.
```bash
# frontend/CollaborativeWhiteboard/.env

VITE_API_BASE_URL="http://localhost:8000"
```

### 4. Install the backend dependencies 
```bash
npm install
```

### 5. Start the backend server  
```bash
npm run dev
```

Your default browser should open to http://localhost:5173, where you can see and interact with the application.

Now , you can make your own changes or improve the codebase of this Collaborative Whiteboard 

## Demo Video 

Below is a video demonstration of the Collaborative Whiteboard 

