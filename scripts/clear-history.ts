import mongoose from "mongoose";
import ChatSession from "../models/ChatSession";

const MONGODB_URI = process.env.MONGODB_URI;

const clearChatHistory = async () => {
  console.log("Connecting to the database...");
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Successfully connected to the database.");

  console.log("Attempting to clear the ChatSession collection...");

  const deleteResult = await ChatSession.deleteMany({});

  if (deleteResult.acknowledged) {
    console.log(`Success! Deleted ${deleteResult.deletedCount} chat sessions.`);
  } else {
    console.error(
      "An error occurred while trying to delete the chat sessions."
    );
  }

  await mongoose.connection.close();
  console.log("Database connection closed.");
};

clearChatHistory().catch((error) => {
  console.error("An error occurred while running the script:", error);
  process.exit(1);
});
