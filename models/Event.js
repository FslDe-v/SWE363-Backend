import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  participants: { type: Number, default: 0 },
  imageUrl: { type: String },
  tags: [String],
  enrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  interestProfile: {
    social: { type: Number, default: 3, min: 1, max: 5 },
    outdoorsy: { type: Number, default: 3, min: 1, max: 5 },
    creative: { type: Number, default: 3, min: 1, max: 5 },
    intellectual: { type: Number, default: 3, min: 1, max: 5 },
    relaxed: { type: Number, default: 3, min: 1, max: 5 },
  },
  
});

export default mongoose.model("Event", eventSchema);

