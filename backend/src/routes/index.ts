import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/index.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.post("/send-message", upload.single("file"), sendMessage);
router.get("/get-messages", getMessages);

// router.post("/upload-pdf", upload.single("pdf"), uploadPdf);

export default router;

