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
  { _id: false }
);

const ChatSessionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      default: "anonymous_user",
    },
    personaId: {
      type: Types.ObjectId,
      ref: "Persona",
      required: true,
    },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export default models.ChatSession || model("ChatSession", ChatSessionSchema);
