import mongoose from "mongoose";
import Persona from "../models/Persona";
import User from "../models/User"; // Import the User model

const MONGODB_URI = process.env.MONGODB_URI;

const seedDB = async () => {
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local",
    );
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully.");

  // --- Step 1: Create or find the System Admin User ---
  console.log("Setting up system admin user...");
  const systemAdmin = await User.findOneAndUpdate(
    { email: "system.admin@ai-fametalk.com" }, // Find user by a unique email
    {
      // Data to set if user is new or found
      name: "System Admin",
      email: "system.admin@ai-fametalk.com",
      role: "admin",
    },
    {
      upsert: true, // Creates the user if it doesn't exist
      new: true, // Returns the new or updated document
      setDefaultsOnInsert: true, // Ensures our model defaults are applied
    },
  );
  console.log(`System Admin user is ready with ID: ${systemAdmin._id}`);

  // --- Step 2: Define Default Personas ---
  const seedPersonas = [
    {
      name: "Albert Einstein",
      description: "Physicist who developed the theory of relativity.",
      imageUrl:
        "https://placehold.co/512x512/4a0087/FFFFFF/png?text=AE&font=raleway",
      category: "Science",
      systemPrompt:
        "You are Albert Einstein. Speak with intellectual curiosity, use analogies related to physics, and express wonder about the universe. Maintain a humble yet confident tone.",
      creatorId: systemAdmin._id, // Assign the admin's ID
      isDefault: true,
    },
    {
      name: "Cleopatra",
      description: "The last active ruler of the Ptolemaic Kingdom of Egypt.",
      imageUrl:
        "https://placehold.co/512x512/4a0087/FFFFFF/png?text=C&font=raleway",
      category: "History",
      systemPrompt:
        "You are Cleopatra, the powerful and charismatic Queen of Egypt. Speak with authority, elegance, and a hint of political cunning. Your goal is to preserve the legacy and power of your kingdom.",
      creatorId: systemAdmin._id,
      isDefault: true,
    },
    {
      name: "Sherlock Holmes",
      description:
        "A fictional detective of the late 19th and early 20th centuries.",
      imageUrl:
        "https://placehold.co/512x512/4a0087/FFFFFF/png?text=SH&font=raleway",
      category: "Literature",
      systemPrompt:
        "You are the brilliant detective Sherlock Holmes. You are highly observant, logical, and speak with precise, deductive reasoning. Address the user as 'my dear Watson'.",
      creatorId: systemAdmin._id,
      isDefault: true,
    },
    // Add more default personas here if you wish...
  ];

  // --- Step 3: Clear old default personas and insert new ones ---
  console.log("Clearing old default personas...");
  await Persona.deleteMany({ isDefault: true });

  console.log("Seeding new default personas...");
  await Persona.insertMany(seedPersonas);

  console.log("Database has been seeded successfully!");

  await mongoose.connection.close();
  console.log("Connection closed.");
};

seedDB().catch((error) => {
  console.error("An error occurred while seeding the database:", error);
  process.exit(1);
});
