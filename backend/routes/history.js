const express = require('express');
const router = express.Router();
const HistoryLog = require('../models/history');
router.get('/:roomId', async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const log = await HistoryLog.findOne({ whiteboardId: roomId });

    if (!log) return res.status(200).json({ actions: [] });

    const validActions = log.actions.filter((a) => !a.undone);
    res.json({ actions: validActions.map((a) => a.data) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/:roomId', async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const { action } = req.body;

    let log = await HistoryLog.findOne({ whiteboardId: roomId });
    if (!log) {
      log = new HistoryLog({ whiteboardId: roomId, actions: [] });
    }

    log.actions.push({
      actionType: action.type,
      data: action,
    });

    await log.save();
    res.status(201).json({ message: 'Action saved' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to save action');
  }
});

module.exports = router;
