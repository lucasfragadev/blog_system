import { Request, Response } from 'express';
import { userService } from '../services/UserService';

export const userController = {
  create: async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
      // Check if name, email, and password are provided
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required." });
      }

      const newUser = await userService.create({ name, email, password });
      
      // Return the newly created user
      return res.status(201).json(newUser);

    } catch (error: any) {
      // Handle duplicate email error
      if (error.code === 11000) {
        return res.status(409).json({ message: "This email is already registered." });
      }
      
      // Log other unexpected errors
      console.error(error);
      // Return a generic server error message
      return res.status(500).json({ message: "An unexpected server error occurred." });
    }
  }
};