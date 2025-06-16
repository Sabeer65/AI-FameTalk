import { Schema, model, models } from "mongoose";

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
  // The core instruction prompt for the AI
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
});

export default models.Persona || model("Persona", PersonaSchema);
