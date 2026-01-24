import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // REGISTRAR NOVO USUÁRIO
  async register(data: any) {
    // 1. Verificar se usuário já existe
    const userExists = await this.userRepository.findByEmail(data.email);

    if (userExists) {
      throw new Error('User already exists');
    }

    // 2. Criptografar a senha (HASH)
    // O Prisma não faz isso sozinho (o Mongoose fazia via hooks/middleware)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // 3. Criar o usuário usando o repositório
    const newUser = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // 4. Retornar o usuário (idealmente sem a senha)
    // O "rest" operator separa a senha (...) do resto dos dados (userWithoutPassword)
    const { password, ...userWithoutPassword } = newUser;
    
    return userWithoutPassword;
  }

  // LOGIN
  async login(data: any) {
    // 1. Buscar usuário
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 2. Comparar senha (A mágica manual que substitui métodos do Mongoose)
    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    // 3. Gerar Token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name // <--- ADICIONE ISSO AQUI!
      }, 
      process.env.JWT_SECRET || 'secret_key_padrao',
      { expiresIn: '1d' }
    );

    // Retorna o token e os dados do usuário (opcional)
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }
}