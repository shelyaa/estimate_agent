import mongoose, {type Model, Schema, Types} from 'mongoose';

const senders = ['user', 'agent'] as const;

export interface IMessage {
    content: string;
    attachedFiles?: string | null
    sender: 'user' | 'agent';
    chatId: Types.ObjectId;
}

const messageSchema = new Schema<IMessage>({
    content: String,
    attachedFiles: {
        type: String,
        nullable: true
    },
    sender: {
        type: String,
        enum: senders
    },
    chatId: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        index: true
    }
}, { timestamps: true });

export const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);