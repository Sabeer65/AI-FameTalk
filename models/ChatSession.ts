import { Schema, model, models, Types } from "mongoose";

const MessageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "model"],
      required: true,
    },
    parts: [
      {
        text: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { _id: false },
);

const ChatSessionSchema = new Schema(
  {
    userId: {
      type: String,
      ref: "User", // A soft reference to the User model's _id
      required: true,
    },
    personaId: {
      type: Types.ObjectId,
      ref: "Persona",
      required: true,
    },
    messages: [MessageSchema],
    // --- NEW FIELD FOR HIDING/ARCHIVING CHATS ---
    isActive: {
      type: Boolean,
      default: true, // By default, all new chat sessions are active and visible
    },
  },
  { timestamps: true },
);

// Add a compound index for efficient lookups
ChatSessionSchema.index({ userId: 1, personaId: 1 });

export default models.ChatSession || model("ChatSession", ChatSessionSchema);
