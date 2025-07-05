import { Schema, model, Types } from 'mongoose';

export interface IPost {
  title: string;
  content: string;
  author: Types.ObjectId;
  createdAt: Date;
}

const PostSchemma = new Schema<IPost>({
  title: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const PostModel = model<IPost>('Post', PostSchemma);

export default PostModel;