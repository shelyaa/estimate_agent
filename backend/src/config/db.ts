import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const mongoURI = process.env.MONGO_URI;

export async function connectDB() {
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

export async function getMongoClient() {
    return mongoose.connection.getClient();
}
