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
    const userExists = await this.userRepository.findByEmail(data.email);

    if (userExists) {
      throw new Error('User already exists');
    }

    // Segurança: Hash da senha com Salt (Custo 10) antes de persistir
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Remove a senha do objeto de retorno para não vazar dados sensíveis
    const { password, ...userWithoutPassword } = newUser;
    
    return userWithoutPassword;
  }

  // LOGIN
  async login(data: any) {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Comparação segura do hash (não descriptografa, apenas verifica match)
    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    // Geração do Token JWT (Stateless)
    // Payload contém dados úteis para o Front identificar o usuário e suas permissões
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name,
        role: user.role,
      }, 
      process.env.JWT_SECRET || 'secret_key_padrao',
      { expiresIn: '1d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }
}