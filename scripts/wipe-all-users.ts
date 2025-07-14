import mongoose, { Schema } from "mongoose";
import readline from "readline";

const MONGODB_URI = process.env.MONGODB_URI;

// We need to access collections that NextAuth manages,
// so we'll define simple schemas to interact with them.
const UserSchema = new Schema({}, { strict: false });
const AccountSchema = new Schema({}, { strict: false });
const SessionSchema = new Schema({}, { strict: false });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Account =
  mongoose.models.Account || mongoose.model("Account", AccountSchema);
const Session =
  mongoose.models.Session || mongoose.model("Session", SessionSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const wipeAllUsers = async () => {
  console.log(
    "\n  DANGER: This script will irreversibly delete ALL data from the `users`, `accounts`, and `sessions` collections.",
  );
  console.log(
    "This will effectively delete all user accounts from your application.",
  );

  rl.question(
    'Are you absolutely sure you want to continue? (type "yes" to confirm): ',
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

        // 1. Delete all user documents
        const userDeleteResult = await User.deleteMany({});
        console.log(
          `- Deleted ${userDeleteResult.deletedCount} documents from the 'users' collection.`,
        );

        // 2. Delete all account link documents
        const accountDeleteResult = await Account.deleteMany({});
        console.log(
          `- Deleted ${accountDeleteResult.deletedCount} documents from the 'accounts' collection.`,
        );

        // 3. Delete all session documents
        const sessionDeleteResult = await Session.deleteMany({});
        console.log(
          `- Deleted ${sessionDeleteResult.deletedCount} documents from the 'sessions' collection.`,
        );

        console.log("\nUser data wipe completed successfully.");
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

wipeAllUsers();
