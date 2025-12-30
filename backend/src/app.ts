import express from "express";
import messageRoutes from "./routes/messages.js";
import chatRoutes from "./routes/chat.js";
import cors from "cors";
import {connectDB} from "./config/db.js";
import {errorHandler} from "./middlewares/error.js";

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors())
app.use(express.json());
app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use(errorHandler)


connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        })
    })
    .catch((error) => {
        console.error("Failed to connect to the database:", error);
        process.exit(1);
    })

