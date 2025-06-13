import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "../src/chatsocket";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import {
  Box,
  IconButton,
  Slider,
  Tooltip,
  Typography,
  TextField,
  Menu,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  FileCopy as FileCopyIcon,
  Visibility,
  Download as DownloadIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import ClearIcon from "@mui/icons-material/Clear";

export default function Canvas({
  roomId,
  snapshotDataUrl,
  initialHistory = [],
  userRole,
}) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);
  const socket = useSocket();
  const currentStroke = useRef([]);
  const startPoint = useRef(null);
  const isViewer = userRole === "viewer";

  const [tool, setTool] = useState("pen");
  const [penColor, setPenColor] = useState("#ffffff");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [penSize, setPenSize] = useState(5);
  const [fontSize, setFontSize] = useState(20);
  const [history, setHistory] = useState(initialHistory);

  const [copied, setCopied] = useState(false);
  const [isTextInputActive, setIsTextInputActive] = useState(false);
  const [textInputPosition, setTextInputPosition] = useState({ x: 0, y: 0 });
  const [textInputValue, setTextInputValue] = useState("");
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const drawAction = (ctx, action) => {
    if (!ctx || !action) return;
    ctx.strokeStyle = action.color || "#ffffff";
    ctx.fillStyle = action.color || "#ffffff";
    ctx.lineWidth = action.size || 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    switch (action.type) {
      case "pen":
      case "eraser":
        ctx.strokeStyle = action.color;
        ctx.beginPath();
        if (action.points.length > 0)
          ctx.moveTo(action.points[0].x, action.points[0].y);
        for (let i = 1; i < action.points.length; i++) {
          ctx.lineTo(action.points[i].x, action.points[i].y);
        }
        ctx.stroke();
        break;
      case "rectangle":
        ctx.strokeRect(action.x, action.y, action.width, action.height);
        break;
      case "filledRectangle":
        ctx.fillRect(action.x, action.y, action.width, action.height);
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(action.x, action.y, action.radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case "filledCircle":
        ctx.beginPath();
        ctx.arc(action.x, action.y, action.radius, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case "text":
        ctx.fillStyle = action.color;
        ctx.font = `${action.fontSize}px Arial`;
        ctx.textBaseline = "top";
        ctx.fillText(action.text, action.x, action.y);
        break;
      case "clear":
        ctx.fillStyle = "#1e1e1e";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        break;
      default:
        break;
    }
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const findLastClearIndex = (actions) =>
      actions.map((a) => a.actionType).lastIndexOf("clear");
    const lastClearIndex = findLastClearIndex(history);
    const relevantActions =
      lastClearIndex > -1 ? history.slice(lastClearIndex) : history;
    const actionsToDraw = relevantActions.filter((action) => !action.undone);
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawAllActions = () => {
      actionsToDraw.forEach((action) => {
        drawAction(ctx, { type: action.actionType, ...action.data });
      });
    };
    if (snapshotDataUrl && lastClearIndex === -1) {
      const img = new Image();
      img.src = snapshotDataUrl;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawAllActions();
      };
      img.onerror = () => {
        console.error("Failed to load snapshot image from data URL.");
        drawAllActions();
      };
    } else {
      drawAllActions();
    }
  }, [history, snapshotDataUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 930;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("joinWhiteboard", { roomId });
    const handleLoadHistory = (serverHistory) => setHistory(serverHistory);
    const handleNewAction = ({ action }) =>
      setHistory((prev) => [...prev, action]);
    const handleActionUndone = ({ actionId }) =>
      setHistory((prev) =>
        prev.map((a) => (a._id === actionId ? { ...a, undone: true } : a))
      );
    const handleActionRedone = ({ action }) =>
      setHistory((prev) =>
        prev.map((a) => (a._id === action._id ? { ...a, undone: false } : a))
      );
    const handleCanvasCleared = () => {
      const clearAction = {
        actionType: "clear",
        data: {},
        undone: false,
        _id: `clear-${Date.now()}`,
      };
      setHistory((prev) => [...prev, clearAction]);
    };
    socket.on("loadInitialHistory", handleLoadHistory);
    socket.on("newAction", handleNewAction);
    socket.on("actionUndone", handleActionUndone);
    socket.on("actionRedone", handleActionRedone);
    socket.on("canvasCleared", handleCanvasCleared);
    return () => {
      socket.off("loadInitialHistory");
      socket.off("newAction");
      socket.off("actionUndone");
      socket.off("actionRedone");
      socket.off("canvasCleared");
    };
  }, [socket, roomId]);

  const handleMouseDown = (e) => {
    if (isViewer || tool === "text") return;
    isDrawing.current = true;
    const { offsetX, offsetY } = e.nativeEvent;
    if (["pen", "eraser"].includes(tool)) {
      currentStroke.current = [{ x: offsetX, y: offsetY }];
    } else {
      startPoint.current = { x: offsetX, y: offsetY };
    }
  };
  const handleMouseMove = (e) => {
    if (isViewer || !isDrawing.current || tool === "text") return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = ctxRef.current;
    if (["pen", "eraser"].includes(tool)) {
      currentStroke.current.push({ x: offsetX, y: offsetY });
      const strokeColor = tool === "eraser" ? "#1e1e1e" : penColor;
      const last = currentStroke.current[currentStroke.current.length - 2];
      if (last) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = penSize;
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
      }
    } else {
      redrawCanvas();
      const x0 = startPoint.current?.x ?? 0,
        y0 = startPoint.current?.y ?? 0;
      const width = offsetX - x0,
        height = offsetY - y0;
      const radius = Math.sqrt(
        Math.pow(offsetX - x0, 2) + Math.pow(offsetY - y0, 2)
      );
      let previewAction;
      if (tool === "rectangle")
        previewAction = {
          type: "rectangle",
          color: penColor,
          size: penSize,
          x: x0,
          y: y0,
          width,
          height,
        };
      else if (tool === "filledRectangle")
        previewAction = {
          type: "filledRectangle",
          color: fillColor,
          size: penSize,
          x: x0,
          y: y0,
          width,
          height,
        };
      else if (tool === "circle")
        previewAction = {
          type: "circle",
          color: penColor,
          size: penSize,
          x: x0,
          y: y0,
          radius,
        };
      else if (tool === "filledCircle")
        previewAction = {
          type: "filledCircle",
          color: fillColor,
          size: penSize,
          x: x0,
          y: y0,
          radius,
        };
      if (previewAction) drawAction(ctx, previewAction);
    }
  };
  const handleMouseUp = (e) => {
    if (isViewer || !isDrawing.current || tool === "text") return;
    isDrawing.current = false;
    let action = null;
    const { offsetX, offsetY } = e.nativeEvent;
    const x0 = startPoint.current?.x ?? 0,
      y0 = startPoint.current?.y ?? 0;
    if (tool === "pen" || tool === "eraser") {
      const strokeColor = tool === "eraser" ? "#1e1e1e" : penColor;
      action = {
        type: tool,
        color: strokeColor,
        size: penSize,
        points: [...currentStroke.current],
      };
    } else if (tool === "rectangle") {
      action = {
        type: "rectangle",
        color: penColor,
        size: penSize,
        x: x0,
        y: y0,
        width: offsetX - x0,
        height: offsetY - y0,
      };
    } else if (tool === "filledRectangle") {
      action = {
        type: "filledRectangle",
        color: fillColor,
        size: penSize,
        x: x0,
        y: y0,
        width: offsetX - x0,
        height: offsetY - y0,
      };
    } else if (tool === "circle") {
      const radius = Math.sqrt(
        Math.pow(offsetX - x0, 2) + Math.pow(offsetY - y0, 2)
      );
      action = {
        type: "circle",
        color: penColor,
        size: penSize,
        x: x0,
        y: y0,
        radius,
      };
    } else if (tool === "filledCircle") {
      const radius = Math.sqrt(
        Math.pow(offsetX - x0, 2) + Math.pow(offsetY - y0, 2)
      );
      action = {
        type: "filledCircle",
        color: fillColor,
        size: penSize,
        x: x0,
        y: y0,
        radius,
      };
    }
    if (action && (action.points?.length > 1 || action.type !== "pen")) {
      socket?.emit("drawingAction", { roomId, action });
    }
    redrawCanvas();
    currentStroke.current = [];
    startPoint.current = null;
  };
  const handleMouseLeave = (e) => {
    if (isDrawing.current) handleMouseUp(e);
  };
  const handleCanvasClick = (e) => {
    if (isViewer || tool !== "text") return;
    const { offsetX, offsetY } = e.nativeEvent;
    setTextInputPosition({ x: offsetX, y: offsetY });
    setIsTextInputActive(true);
    setTextInputValue("");
  };
  const handleTextSubmit = () => {
    if (textInputValue.trim() === "") {
      setIsTextInputActive(false);
      return;
    }
    const action = {
      type: "text",
      text: textInputValue,
      x: textInputPosition.x,
      y: textInputPosition.y,
      color: penColor,
      fontSize,
    };
    socket?.emit("drawingAction", { roomId, action });
    setIsTextInputActive(false);
    setTextInputValue("");
  };
  const handleTextCancel = () => {
    setIsTextInputActive(false);
    setTextInputValue("");
  };
  const handleUndo = () => {
    if (!isViewer && canUndo) socket.emit("undoAction", { roomId });
  };
  const handleRedo = () => {
    if (!isViewer && canRedo) socket.emit("redoAction", { roomId });
  };
  const handleClear = () => {
    if (!isViewer) socket.emit("clearCanvas", { roomId });
  };
  const canUndo = history.some((a) => !a.undone);
  const canRedo = history.some((a) => a.undone);
  const getCanvasAsBlob = () => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject(new Error("Canvas not found"));
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx)
        return reject(new Error("Could not get temporary canvas context"));
      const findLastClearIndex = (actions) =>
        actions.map((a) => a.actionType).lastIndexOf("clear");
      const lastClearIndex = findLastClearIndex(history);
      const relevantActions =
        lastClearIndex > -1 ? history.slice(lastClearIndex) : history;
      const actionsToDraw = relevantActions.filter((action) => !action.undone);
      tempCtx.fillStyle = "#1e1e1e";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      const drawAllActions = () => {
        actionsToDraw.forEach((action) => {
          drawAction(tempCtx, { type: action.actionType, ...action.data });
        });
        tempCanvas.toBlob(resolve, "image/png");
      };
      if (snapshotDataUrl && lastClearIndex === -1) {
        const img = new Image();
        img.src = snapshotDataUrl;
        img.onload = () => {
          tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
          drawAllActions();
        };
        img.onerror = () => {
          console.error("Failed to load snapshot for export.");
          drawAllActions();
        };
      } else {
        drawAllActions();
      }
    });
  };
  const exportAsImage = async (format) => {
    setIsExporting(true);
    handleExportClose();
    try {
      const blob = await getCanvasAsBlob();
      if (blob) saveAs(blob, `whiteboard-export.${format}`);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };
  const exportAsPDF = async () => {
    setIsExporting(true);
    handleExportClose();
    try {
      const blob = await getCanvasAsBlob();
      if (blob) {
        const dataUrl = URL.createObjectURL(blob);
        const img = await new Promise((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = dataUrl;
        });
        const pdf = new jsPDF({
          orientation: img.width > img.height ? "landscape" : "portrait",
          unit: "px",
          format: [img.width, img.height],
        });
        pdf.addImage(img, "PNG", 0, 0, img.width, img.height);
        pdf.save("whiteboard-export.pdf");
        URL.revokeObjectURL(dataUrl);
      }
    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleExportClick = (e) => setExportMenuAnchor(e.currentTarget);
  const handleExportClose = () => setExportMenuAnchor(null);

  return (
    <Box position="relative" margin="auto">
      <canvas
        ref={canvasRef}
        style={{
          background: "#1e1e1e",
          cursor: isViewer
            ? "not-allowed"
            : tool === "text"
            ? "text"
            : "crosshair",
          border: "1px solid #444",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleCanvasClick}
      />
      {isTextInputActive && (
        <Box
          position="absolute"
          left={textInputPosition.x}
          top={textInputPosition.y - 40}
          sx={{
            zIndex: 1000,
            backgroundColor: "rgba(40,40,40,0.95)",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #666",
          }}
        >
          {" "}
          <TextField
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleTextSubmit();
              else if (e.key === "Escape") handleTextCancel();
            }}
            autoFocus
            size="small"
            placeholder="Enter text..."
            sx={{
              input: { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#666" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#fff" },
              },
            }}
          />{" "}
          <Box sx={{ mt: 1 }}>
            {" "}
            <Button
              onClick={handleTextSubmit}
              variant="contained"
              color="success"
              size="small"
            >
              {" "}
              Add Text{" "}
            </Button>{" "}
          </Box>{" "}
        </Box>
      )}
      <Box
        position="absolute"
        top={10}
        left={10}
        display="flex"
        alignItems="center"
        gap={1}
        bgcolor="rgba(40,40,40,0.8)"
        p={1}
        borderRadius={2}
        sx={{
          pointerEvents: isViewer ? "none" : "auto",
          opacity: isViewer ? 0.6 : 1,
        }}
      >
        <select
          value={tool}
          onChange={(e) => setTool(e.target.value)}
          style={{
            background: "#333",
            color: "white",
            border: "none",
            padding: "8px",
            borderRadius: "4px",
          }}
          disabled={isViewer}
        >
          {" "}
          <option value="pen">Pen</option>{" "}
          <option value="eraser">Eraser</option>{" "}
          <option value="rectangle">Rectangle</option>{" "}
          <option value="filledRectangle">Filled Rect</option>{" "}
          <option value="circle">Circle</option>{" "}
          <option value="filledCircle">Filled Circle</option>{" "}
          <option value="text">Text</option>{" "}
        </select>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={0.5}
        >
          {" "}
          <input
            type="color"
            value={penColor}
            onChange={(e) => setPenColor(e.target.value)}
            disabled={isViewer}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              border: "2px solid #666",
              cursor: isViewer ? "not-allowed" : "pointer",
              padding: "0",
            }}
          />{" "}
          <Typography
            variant="caption"
            sx={{ color: "white", fontSize: "10px" }}
          >
            {" "}
            Stroke{" "}
          </Typography>{" "}
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={0.5}
        >
          {" "}
          <input
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            disabled={isViewer}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              border: "2px solid #666",
              cursor: isViewer ? "not-allowed" : "pointer",
              padding: "0",
            }}
          />{" "}
          <Typography
            variant="caption"
            sx={{ color: "white", fontSize: "10px" }}
          >
            {" "}
            Fill{" "}
          </Typography>{" "}
        </Box>
        {!["text"].includes(tool) && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={0.5}
          >
            {" "}
            <Slider
              min={1}
              max={50}
              value={penSize}
              onChange={(e, val) => setPenSize(val)}
              sx={{ width: 100, color: "white" }}
              disabled={isViewer}
            />{" "}
            <Typography
              variant="caption"
              sx={{ color: "white", fontSize: "10px" }}
            >
              {" "}
              Size{" "}
            </Typography>{" "}
          </Box>
        )}
        {tool === "text" && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={0.5}
          >
            {" "}
            <Slider
              min={10}
              max={72}
              value={fontSize}
              onChange={(e, val) => setFontSize(val)}
              sx={{ width: 100, color: "white" }}
              disabled={isViewer}
            />{" "}
            <Typography
              variant="caption"
              sx={{ color: "white", fontSize: "10px" }}
            >
              {" "}
              Font Size{" "}
            </Typography>{" "}
          </Box>
        )}
        <IconButton
          onClick={handleUndo}
          sx={{ color: "white" }}
          disabled={isViewer || !canUndo}
        >
          {" "}
          <UndoIcon />{" "}
        </IconButton>
        <IconButton
          onClick={handleRedo}
          sx={{ color: "white" }}
          disabled={isViewer || !canRedo}
        >
          {" "}
          <RedoIcon />{" "}
        </IconButton>
        <IconButton
          onClick={handleClear}
          sx={{ color: "white" }}
          disabled={isViewer}
        >
          {" "}
          <ClearIcon />{" "}
        </IconButton>
        <Tooltip title="Export Whiteboard">
          {" "}
          <IconButton
            onClick={handleExportClick}
            sx={{ color: "white" }}
            disabled={isExporting}
          >
            {" "}
            {isExporting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <DownloadIcon />
            )}{" "}
          </IconButton>{" "}
        </Tooltip>
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={handleExportClose}
        >
          {" "}
          <MenuItem onClick={() => exportAsImage("png")} disabled={isExporting}>
            {" "}
            <GetAppIcon sx={{ mr: 1 }} /> Export as PNG{" "}
          </MenuItem>{" "}
          <MenuItem onClick={() => exportAsImage("jpg")} disabled={isExporting}>
            {" "}
            <GetAppIcon sx={{ mr: 1 }} /> Export as JPG{" "}
          </MenuItem>{" "}
          <MenuItem onClick={exportAsPDF} disabled={isExporting}>
            {" "}
            <GetAppIcon sx={{ mr: 1 }} /> Export as PDF{" "}
          </MenuItem>{" "}
        </Menu>
      </Box>
      {isViewer && (
        <Box
          position="absolute"
          top={10}
          right={20}
          sx={{
            padding: "6px 12px",
            backgroundColor: "rgba(255, 165, 0, 0.8)",
            borderRadius: 2,
            color: "white",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {" "}
          <Visibility sx={{ fontSize: "1rem" }} />{" "}
          <Typography variant="body2">View-Only Mode</Typography>{" "}
        </Box>
      )}
      <Box
        position="absolute"
        bottom={20}
        right={20}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          padding: "6px 12px",
          backgroundColor: "rgba(40,40,40,0.8)",
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: "#b3b3b3" }}>
          {" "}
          Room ID:{" "}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "white", fontFamily: "monospace" }}
        >
          {" "}
          {roomId}{" "}
        </Typography>
        <Tooltip title={copied ? "Copied!" : "Copy ID"}>
          {" "}
          <IconButton onClick={handleCopyRoomId} size="small">
            {" "}
            <FileCopyIcon
              sx={{ color: copied ? "#1DB954" : "#b3b3b3", fontSize: "1rem" }}
            />{" "}
          </IconButton>{" "}
        </Tooltip>
      </Box>
    </Box>
  );
}
