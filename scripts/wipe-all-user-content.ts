// File: scripts/wipe-all-user-content.ts

import mongoose from "mongoose";
import ChatSession from "../models/ChatSession";
import Persona from "../models/Persona";
import User from "../models/User";
import readline from "readline";

const MONGODB_URI = process.env.MONGODB_URI;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const wipeAllUserContent = async () => {
  console.log(
    "\n WARNING: This script will irreversibly delete ALL user-created personas and ALL chat histories from the database.",
  );

  rl.question(
    "Are you sure you want to continue? (yes/no): ",
    async (answer) => {
      if (answer.toLowerCase() !== "yes") {
        console.log("Operation cancelled.");
        rl.close();
        process.exit(0);
      }

      try {
        if (!MONGODB_URI) {
          throw new Error("MONGODB_URI environment variable is not defined.");
        }

        await mongoose.connect(MONGODB_URI);
        console.log("\nSuccessfully connected to the database.");

        // 1. Delete all chat sessions
        const chatDeleteResult = await ChatSession.deleteMany({});
        console.log(
          `- Deleted ${chatDeleteResult.deletedCount} total chat sessions.`,
        );

        // 2. Delete all non-default personas
        const personaDeleteResult = await Persona.deleteMany({
          isDefault: false,
        });
        console.log(
          `- Deleted ${personaDeleteResult.deletedCount} user-created personas.`,
        );

        // 3. Reset the 'personasCreated' count for all users
        const userUpdateResult = await User.updateMany(
          {},
          { $set: { personasCreated: 0 } },
        );
        console.log(
          `- Reset 'personasCreated' count for ${userUpdateResult.modifiedCount} users.`,
        );

        console.log("\nFull content wipe completed successfully.");
        await mongoose.connection.close();
        console.log("Database connection closed.");
      } catch (error) {
        console.error("\nAn error occurred while running the script:", error);
        await mongoose.connection.close();
        process.exit(1);
      } finally {
        rl.close();
      }
    },
  );
};

wipeAllUserContent();
