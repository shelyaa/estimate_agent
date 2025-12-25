import mongoose from 'mongoose';
const { Schema } = mongoose;

const senders = ['user', 'agent'] as const;

export interface IMessage {
    content: string;
    attachedFiles: Array<{path: string}>
    sender: 'user' | 'agent';
}

const messageSchema = new Schema<IMessage>({
    content: String,
    attachedFiles: [{path: String}],
    sender: {
        type: String,
        enum: senders
    }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);