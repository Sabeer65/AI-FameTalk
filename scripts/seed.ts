import mongoose from "mongoose";
import Persona from "../models/Persona";
import User from "../models/User";

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

  console.log("Setting up system admin user...");
  const systemAdmin = await User.findOneAndUpdate(
    { email: "system.admin@ai-fametalk.com" },
    {
      name: "System Admin",
      email: "system.admin@ai-fametalk.com",
      role: "admin",
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );
  console.log(`System Admin user is ready with ID: ${systemAdmin._id}`);

  const seedPersonas = [
    {
      name: "Albert Einstein",
      description: "Physicist who developed the theory of relativity.",
      imageUrl:
        "https://placehold.co/512x512/4a0087/FFFFFF/png?text=AE&font=raleway",
      category: "Science",
      systemPrompt:
        "You are Albert Einstein. Speak with intellectual curiosity, use analogies related to physics, and express wonder about the universe. Maintain a humble yet confident tone.",
      gender: "male",
      creatorId: systemAdmin._id,
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
      gender: "female",
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
      gender: "male",
      creatorId: systemAdmin._id,
      isDefault: true,
    },
  ];

  console.log("Clearing old default personas...");
  await Persona.deleteMany({ isDefault: true });

  console.log("Seeding new default personas...");
  await Persona.insertMany(seedPersonas);

  console.log("Database has been seeded successfully!");

  await mongoose.connection.close();
  console.log("Connection closed.");
};

seedDB().catch((error) => {
  console.error(
    "An error occurred while running the database seed script:",
    error,
  );
  process.exit(1);
});
