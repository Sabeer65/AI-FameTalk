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
});

export default models.User || model("User", UserSchema);
