import mongoose from 'mongoose'; // Importing the MongoDB "translator", mongoose.

const connectDB = async () => {
  try {
    const mongoURI = 'mongodb://localhost:27017/blog_api';

    await mongoose.connect(mongoURI);

    console.log('MongoDB is connected successfully!');
  } catch (error) {
    console.error('Erro ao conectar ao MMongoDB:', error);
    process.exit(1); // If it fails, the application is stopped.
  }
};

export default connectDB;