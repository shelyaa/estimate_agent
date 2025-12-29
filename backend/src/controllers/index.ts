import type {Request, Response} from "express";
// import {
//   getAllMessages,
//   sendMessageToAgent,
// } from "../services/messagesService.js";
import {processPdf} from "../services/pdfService.js";

// export async function sendMessage(req: Request, res: Response) {
//   try {
//     const message = req?.body?.message;
//     if (!message) throw new Error("Message is required");
//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");

//     const stream = await sendMessageToAgent(message);

//     for await (const event of stream) {
//       if (event.event === "on_chat_model_stream") {
//         const token = event.data?.chunk?.content;

//         if (token) {
//           res.write(`data: ${token}\n\n`);
//         }
//       }

//       if (event.event === "on_chain_end") {
//         res.write(`event: end\ndata: done\n\n`);
//       }
//     }

//     res.end();
//   } catch (err: any) {
//     res.status(500).json({message: err.message});
//   }
// }

// export async function getMessages(req: Request, res: Response) {
//   try {
//     const messages = await getAllMessages();
//     res.json(messages);
//   } catch (err: any) {
//     res.status(500).json({message: err.message});
//   }
// }

export async function uploadPdf(req: Request, res: Response) {
  try {
    console.log(req.file)
    if (!req.file) {
      return res.status(400).json({message: "File not uploaded"});
    }
    console.log(req.file.path);

    const docs = await processPdf(req.file.path);

    res.status(200).json({
      message: "PDF successfully uploaded and processed",
      pageCount: docs.length,
    });
  } catch (err: any) {
    res.status(500).json({error: err.message});
  }
}
