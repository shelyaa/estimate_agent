import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export const processPdf = async (filePath: string) => {
  const loader = new PDFLoader(path.resolve(filePath));
  const docs = await loader.load();

  const fullContent = docs
    .map((doc) => doc.pageContent)
    .join("\n---\n");
  
  return fullContent;
};