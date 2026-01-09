import mongoose from 'mongoose';
const { Schema } = mongoose;

const chatSchema = new Schema({
  title: {
    type: String,
    default: 'New Chat'
  }
}, { timestamps: true });

export const Chat = mongoose.model('Chat', chatSchema);