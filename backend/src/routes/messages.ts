import { Router } from "express";
import {sendMessage, getMessages, downloadFileByMessageId} from "../controllers/messages.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.post("/", upload.single("file"), sendMessage);
router.get('/download', downloadFileByMessageId)
router.get("/:chatId", getMessages);

export default router;

