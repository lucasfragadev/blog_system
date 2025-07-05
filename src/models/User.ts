import { Schema, model } from 'mongoose'; // Here I imported the Schema and the model / Schema is how the user should be / model is the operator, to create, read and delete users in the database;

 // Schema is an object that defines the structure of a document in MongoDB
 // The Model is the object that Mongoose gives us, generated from the Schema. It is through the Model that we effectively execute the CRUD operations.

// 1. Interface to give types to the User document;
export interface IUser {
  _id: any;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// 2. Schema that defines the structure and rules of the database;
const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true 
  },

  password: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now, // Default value
  },
});

// 3. Model that gives us the interface to interact with the 'users' collection;
const UserModel = model<IUser>('User', UserSchema);

export default UserModel;