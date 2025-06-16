import { Schema, model, models, Types } from "mongoose";

const PersonaSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please provide a name for this persona."],
    maxlength: [60, "Name cannot be more than 60 characters"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description."],
  },
  systemPrompt: {
    type: String,
    required: [true, "Please provide a system prompt for the AI."],
  },
  category: {
    type: String,
    required: [true, "Please specify a category."],
  },
  imageUrl: {
    type: String,
    required: [true, "Please provide an image URL."],
  },
  // --- NEW FIELD FOR OWNERSHIP ---
  creatorId: {
    type: Types.ObjectId,
    ref: "User", // This creates a reference to a document in the 'User' collection
    required: true,
  },
  // We can add a field to distinguish between default and user-created personas
  isDefault: {
    type: Boolean,
    default: false,
  },
});

export default models.Persona || model("Persona", PersonaSchema);
