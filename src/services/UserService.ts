import { userRepository } from "../repositories/UserRepository";
import { IUser } from "../models/User"; // Importing the Interface;
import bcrypt from "bcryptjs";
import { sensitiveHeaders } from "http2";

// Interface for the data this service expects to receive;
// For now, it will be the same as the repository.
interface ICreateUserData {
  name: string;
  email: string;
  password: string;
}

export const userService = {
  /**
   * @description Handles the business logic for creating a new user.
   * @param userData - User data.
   * @returns The newly created user.
   */
  create: async (userData: ICreateUserData): Promise<IUser> => {
    try {
      // Definimos o "custo" do hash. 10 é um ótimo padrão de segurança.
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const newUserPayload = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      };
      // --- Here will be the business logic ---
      // For now, the service just forwards the call to the repository;
      const newUser = await userRepository.create(newUserPayload);
      return newUser
    } catch (error) {
      // In this case, the service will capture the repository error (e.g. duplicate email, invalid password);
      // and will relaunch it so that the upper layer (Controller) can apply the appropriate treatment;
      throw error;
    }
  },
  
  authenticate: async (email: string, password: string): Promise<IUser | null> => {
    try {

      const user = await userRepository.findByEmail(email);
      
      if (!user) {
        throw new Error("Invalid Credentials.")
      } 

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        throw new Error("Invalid Credentials.")
      }
      return user;

    } catch (error) {
    throw error;
    }
  }
};