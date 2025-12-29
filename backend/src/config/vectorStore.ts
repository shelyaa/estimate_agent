import dotenv from "dotenv"
dotenv.config();

import {MongoDBAtlasVectorSearch} from "@langchain/mongodb";
import {MongoClient} from "mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import {CSVLoader} from "@langchain/community/document_loaders/fs/csv";
import {convertExcelToCSVAndSave} from "../utils/convertExcelToCSVAndSave.js";
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const excelPath = `${__dirname}/../../../mocks/HistoricalDataExcel.xlsx`;
const csvPath = `${__dirname}/../../../mocks/HistoricalDataCSV.csv`;

let vectorStore: MongoDBAtlasVectorSearch | null = null;
let collection: any = null;

const googleApiKey = process.env.GOOGLE_API_KEY;
if(!googleApiKey) {
    throw new Error("GOOGLE_API_KEY not set");
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

    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-001",
        apiKey: googleApiKey!,
    })

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
//     if (collection) {
//         await collection.deleteMany({ "source": csvPath });
//     }
//
//     await vectorStore.addDocuments(docs);
//     console.log("Saved documents to vector DB");
// }