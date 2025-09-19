import mongoose from "mongoose";
import { DB_NAME } from "../constants/constants.js";

async function connectDB() {
    const DB_URI = `${process.env.MONGODB_URI}/${DB_NAME}`;

    try {
        const connectionInstance = await mongoose.connect(DB_URI);

        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;
