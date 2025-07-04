import { userRepository } from "../repositories/UserRepository";
import { IUser } from "../models/User"; // IImporting the Interface;

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
      // --- Here will be the business logic ---
      // For now, the service just forwards the call to the repository;
      const newUser = await userRepository.create(userData);
      return newUser
    } catch (error) {
      console.log("Erro ao criar o usuário.")
      // In this case, the service will capture the repository error (e.g. duplicate email, invalid password);
      // and will relaunch it so that the upper layer (Controller) can apply the appropriate treatment;
      throw error;
    }
  },
};