import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

export async function connectDB() {
    const mongoURI = process.env.MONGO_URI;

    if(!mongoURI) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }

    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}