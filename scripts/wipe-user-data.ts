// This is the full code for the file: scripts/wipe-user-data.ts
// It replaces the entire existing content of this file.

import mongoose from "mongoose";
import ChatSession from "../models/ChatSession";
import Persona from "../models/Persona";
import User from "../models/User";

const MONGODB_URI = process.env.MONGODB_URI;

const getUserEmail = () => {
  const email = process.argv[2];
  if (!email) {
    console.error(
      "\nError: Please provide a user email address as an argument.",
    );
    console.log(
      "Usage: npx ts-node -r tsconfig-paths/register scripts/wipe-user-data.ts user@example.com\n",
    );
    process.exit(1);
  }
  return email;
};

const wipeAndRemoveUser = async () => {
  const userEmail = getUserEmail();

  console.log(
    `\nAttempting to wipe all data for and remove user: ${userEmail}`,
  );

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not defined.");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Successfully connected to the database.");

  // 1. Find the user by their email to get their ID
  const user = await User.findOne({ email: userEmail });

  if (!user) {
    console.error(
      `\nError: No user found with the email address: ${userEmail}`,
    );
    await mongoose.connection.close();
    process.exit(1);
  }

  const userId = user._id;
  console.log(`Found user with ID: ${userId}`);

  // 2. Delete all chat sessions created by this user
  const chatDeleteResult = await ChatSession.deleteMany({ userId: userId });
  console.log(`- Deleted ${chatDeleteResult.deletedCount} chat sessions.`);

  // 3. Delete all personas created by this user
  const personaDeleteResult = await Persona.deleteMany({
    creatorId: userId,
    isDefault: false,
  });
  console.log(
    `- Deleted ${personaDeleteResult.deletedCount} user-created personas.`,
  );
  await User.deleteOne({ _id: userId });
  console.log(`- Successfully deleted user: ${userEmail}`);

  console.log("\nUser data wipe and removal completed successfully.");
  await mongoose.connection.close();
  console.log("Database connection closed.");
};

wipeAndRemoveUser().catch((error) => {
  console.error("\nAn error occurred while running the script:", error);
  mongoose.connection.close();
  process.exit(1);
});
