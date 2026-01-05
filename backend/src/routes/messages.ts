import {Router} from "express";
import {getMessages, downloadFileByFilePath, uploadPdf, processMessage, sendMessage} from "../controllers/messages.js";
import {upload} from "../middlewares/multer.js";

const router = Router();

router.post("/", sendMessage);

router.post("/:messageId/process", processMessage);

router.post('/upload', upload.single("file"), uploadPdf);
router.get('/download', downloadFileByFilePath)
router.get("/:chatId", getMessages);
router.post('/upload', upload.single("file"), uploadPdf);

export default router;

