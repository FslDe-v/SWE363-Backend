import express from "express";
import Event from "../models/Event.js";
import jwt from "jsonwebtoken";
import process from "node:process";
const router = express.Router();

// reuse this to decode `req.userId`
function protect(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Unauthorized");
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = userId;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
}

// get all events
router.get("/", async (req, res) => {
  const events = await Event.find().lean();
  res.json(events);
});

// get only events where this user is enrolled
router.get("/enrolled", protect, async (req, res) => {
  // find events whose `enrolled` array contains the current user
  const events = await Event.find({ enrolled: req.userId }).lean();
  res.json(events);
});

// toggle enroll
router.post("/:id/enroll", protect, async (req, res) => {
  const ev = await Event.findById(req.params.id);
  const idx = ev.enrolled.indexOf(req.userId);
  if (idx >= 0) ev.enrolled.splice(idx, 1);
  else ev.enrolled.push(req.userId);
  await ev.save();
  res.json({ enrolled: idx < 0 });
});

export default router;
