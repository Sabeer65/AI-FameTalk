import mongoose from "mongoose";
import ChatSession from "../models/ChatSession";
import User from "../models/User";

const MONGODB_URI = process.env.MONGODB_URI;

const getUserEmail = () => {
  const email = process.argv[2];
  if (!email) {
    console.error("Error: Please provide a user email address as an argument.");
    console.log(
      "Usage: npx tsx --env-file=.env.local scripts/clear-user-history.ts user@example.com",
    );
    process.exit(1);
  }
  return email;
};

const clearUserChatHistory = async () => {
  const userEmail = getUserEmail();

  console.log(`Attempting to clear chat history for user: ${userEmail}`);
  console.log("Connecting to the database...");

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local",
    );
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Successfully connected.");

  const user = await User.findOne({ email: userEmail });

  if (!user) {
    console.error(`Error: No user found with the email address: ${userEmail}`);
    await mongoose.connection.close();
    process.exit(1);
  }

  const userId = user._id;
  console.log(`Found user with ID: ${userId}`);

  console.log("Attempting to clear the user's ChatSession documents...");

  const deleteResult = await ChatSession.deleteMany({ userId: userId });

  if (deleteResult.acknowledged) {
    console.log(
      `Success! Deleted ${deleteResult.deletedCount} chat sessions for ${userEmail}.`,
    );
  } else {
    console.error(
      "An error occurred while trying to delete the chat sessions.",
    );
  }

  await mongoose.connection.close();
  console.log("Database connection closed.");
};

clearUserChatHistory().catch((error) => {
  console.error("An error occurred while running the script:", error);
  process.exit(1);
});
