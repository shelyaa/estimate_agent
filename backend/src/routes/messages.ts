import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/messages.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.post("/", upload.single("file"), sendMessage);
router.get("/:chatId", getMessages);

export default router;

