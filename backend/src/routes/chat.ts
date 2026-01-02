import { Router } from "express";
import { createChat, deleteChat, getChats } from "../controllers/chat.js";

const router = Router();

router.post("/", createChat);
router.get("/", getChats);
router.delete("/:chatId", deleteChat);

export default router;
