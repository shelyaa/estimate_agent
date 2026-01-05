import express from "express";
import messageRoutes from "./routes/messages.js";
import chatRoutes from "./routes/chat.js";
import cors from "cors";
import {connectDB} from "./config/db.js";
import {errorHandler} from "./middlewares/error.js";
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import {ioHandler} from "./controllers/wsMessages.js";

const PORT = process.env.PORT || 5000;

const app = express();
app.use(
	cors({
		origin: "http://localhost:3000",
	})
);
const server = createServer(app);
const io = new Server(server);
app.use(cors())
app.use(express.json());
app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use(errorHandler);
app.use(errorHandler)

io.on('connection', ioHandler)

connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to the database:", error);
        process.exit(1);
    })

