import { Schema, model, models, Types } from "mongoose";

const PersonaSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  systemPrompt: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  creatorId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  // --- NEW FIELD ---
  gender: {
    type: String,
    enum: ["male", "female", "neutral"],
    required: true,
  },
});

export default models.Persona || model("Persona", PersonaSchema);
