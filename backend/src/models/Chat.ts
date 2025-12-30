import mongoose from 'mongoose';
const { Schema } = mongoose;

const chatSchema = new Schema({}, { timestamps: true });

export const Chat = mongoose.model('Chat', chatSchema);