import express from "express";
import routes from "./routes/index.js";
import {connectDB} from "./config/db.js";
import {errorHandler} from "./middlewares/error.js";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use("/api", routes);
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

