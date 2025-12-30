import mongoose from "mongoose";

const connection = mongoose.connection;

export const CheckPointWrites = connection.collection("checkpoint_writes");

export const CheckPoints = connection.collection("checkpoints");
