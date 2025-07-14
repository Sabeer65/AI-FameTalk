import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  emailVerified: Date,
  image: String,
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  subscriptionTier: {
    type: String,
    enum: ["free", "premium"],
    default: "free",
  },
  personasCreated: {
    type: Number,
    default: 0,
  },
  // --- NEW FIELD FOR MESSAGE LIMITS ---
  monthlyMessageCount: {
    type: Number,
    default: 0, // All new users start with 0 messages sent
  },
});

export default models.User || model("User", UserSchema);
