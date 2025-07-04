import mongoose from 'mongoose'; // Importando o "tradutor" do MongoDB, o mongoose.

const connectDB = async () => {
  try {
    const mongoURI = 'mongodb://localhost:27017/blog_api';

    await mongoose.connect(mongoURI);

    console.log('MongoDB conectado com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao MMongoDB:', error);
    process.exit(1); // Se falhar, a aplicação é interrompida.
  }
};

export default connectDB;