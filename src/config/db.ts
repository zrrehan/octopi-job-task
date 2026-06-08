import mongoose from "mongoose";
import { config } from ".";

export async function initialDatabase() {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}
