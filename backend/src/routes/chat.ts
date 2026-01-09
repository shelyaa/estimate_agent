import { Router } from "express";
import { createChat, deleteChat, getChats, updateChat } from "../controllers/chat.js";

const router = Router();

router.post("/", createChat);
router.get("/", getChats);
router.delete("/:chatId", deleteChat);
router.put("/:chatId", updateChat);

export default router;
