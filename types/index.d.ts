import { Types } from "mongoose";

// This is the shape of a message, it's already safe.
export interface IMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// These interfaces now use `string` for IDs, making them safe for the frontend.
export interface IPersona {
  _id: string;
  name: string;
  description: string;
  systemPrompt: string;
  category: string;
  imageUrl: string;
  creatorId: string;
  isDefault: boolean;
  gender: "male" | "female" | "neutral";
}

export interface IUser {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
  role: "user" | "admin";
  subscriptionTier: "free" | "premium";
  personasCreated: number;
  monthlyMessageCount: number;
}

export interface IChatSession {
  _id: string;
  userId: string;
  personaId: IPersona; // We expect the full persona object
  messages: IMessage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
