import dotenv from "dotenv"
dotenv.config();

import {MongoDBAtlasVectorSearch} from "@langchain/mongodb";
import {MongoClient} from "mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import {CSVLoader} from "@langchain/community/document_loaders/fs/csv";
import {convertExcelToCSVAndSave} from "../utils/convertExcelToCSVAndSave.js";
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OpenAIEmbeddings } from "@langchain/openai";

const __dirname = dirname(fileURLToPath(import.meta.url));

const excelPath = `${__dirname}/../../../mocks/utilities_mvp_mock_format_2.xlsx`;
const csvPath = `${__dirname}/../../../mocks/utilities_mvp_mock_format.csv`;

let vectorStore: MongoDBAtlasVectorSearch | null = null;
let collection: any = null;

const googleApiKey = process.env.GOOGLE_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;

const embedding = () => {
  if (!googleApiKey && !openAiApiKey) {
    throw new Error('ALARM! No API keys for LLM')
  }
  if(googleApiKey) {
    return new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-001",
        apiKey: googleApiKey,
    })
} else {
    return new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      apiKey: openAiApiKey,
    })
}
}


export function getVectorStore() {
    if(vectorStore && collection) {
        return { vectorStore, collection }
    }

    const dbName = process.env.MONGODB_DB_NAME;
    const dbCollection = process.env.MONGODB_COLLECTION_NAME;
    const mongoUri = process.env.MONGO_URI;

    if(!dbName || !dbCollection || !mongoUri) {
        throw new Error("MongoDB Atlas environment variables not set");
    }

    const client = new MongoClient(mongoUri);
    collection = client
        .db(dbName)
        .collection(dbCollection);

    // const embeddings = new GoogleGenerativeAIEmbeddings({
    //     model: "gemini-embedding-001",
    //     apiKey: googleApiKey!,
    // })
    const embeddings = embedding();

    vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        // @ts-ignore
        collection: collection,
        indexName: "vector_index",
        textKey: "text",
        embeddingKey: "embedding",
    });

    return {vectorStore, collection};
}

// export async function saveExcelToVectorDB() {
//     await convertExcelToCSVAndSave(excelPath, csvPath);
//
//     const {vectorStore, collection} = getVectorStore();
//
//     const loader = new CSVLoader(csvPath)
//     const docs = await loader.load();
//
//     // if (collection) {
//     //     await collection.deleteMany({ "source": csvPath });
//     // }
//
//     await vectorStore.addDocuments(docs);
//     console.log("Saved documents to vector DB");
// }