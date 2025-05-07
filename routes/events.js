import express from "express";
import Event from "../models/Event.js";
import User from "../models/User.js"; // Import User model
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

// Helper function to calculate cosine similarity
function calculateCosineSimilarity(profileA, profileB) {
  const keys = ["social", "outdoorsy", "creative", "intellectual", "relaxed"];
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key of keys) {
    const valA = profileA[key] || 0;
    const valB = profileB[key] || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0; // Or handle as appropriate, e.g., if one profile is all zeros
  }
  return dotProduct / (normA * normB);
}

// get all events, sorted by similarity to user's interests
router.get("/", protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).lean();

    const allEvents = await Event.find().lean();
    const availableEvents = allEvents.filter(
      (event) =>
        !event.enrolled ||
        !event.enrolled.some(
          (enrolledUserId) => enrolledUserId.toString() === req.userId
        )
    );

    if (!currentUser || !currentUser.interests) {
      return res.json(availableEvents.slice(0, 5));
    }

    const userInterests = currentUser.interests;

    const eventsWithSimilarity = availableEvents.map((event) => {
      const similarity = calculateCosineSimilarity(
        userInterests,
        event.interestProfile
      );
      return { ...event, similarity };
    });

    eventsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

    const top5Events = eventsWithSimilarity.slice(0, 5).map((e) => {
      const { similarity, ...eventData } = e;
      return eventData;
    });

    res.json(top5Events);
  } catch (error) {
    console.error("Error fetching recommended events:", error);
    res.status(500).send("Error fetching recommended events");
  }
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
