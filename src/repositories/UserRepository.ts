import UserModel from "../models/User";
import { IUser } from "../models/User"; // Importing the Interface;

// Interface that defines the data needed to create the user.
// We do not include 'createdAt' as the bank will generate this automatically;

interface ICreateUserData {
  name: string;
  email: string;
  password: string;
}

export const userRepository = {
  /**
   * @description Creates a new user in the database.
   * @param userData - The user data to be created.
   * @returns The newly created user.
   */

  create: async (userData: ICreateUserData): Promise<IUser> => { // "create" é um método
    try {
      const newUser = await UserModel.create(userData);
      return newUser;
    } catch (error) {
      console.error("Erro ao criar usuário no repositório:", error);
      throw error; // This is used to throw the error so that the service layer can capture it.;
    }
  },

  findByEmail: async (email: string): Promise<IUser | null> => {
    try {
      const foundUser = await UserModel.findOne({ email });
      return foundUser;
    } catch (error) {
      console.error("Erro ao procura e-mail:", error);
      throw error;
    }
  },
};