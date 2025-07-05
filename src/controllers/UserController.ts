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
  },

  authenticate: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      // Check if email and password are provided
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }

      const user = await userService.authenticate(email, password);

      // Return the authenticated user
      return res.status(200).json(user);

    } catch (error: any) {
      // Handle invalid credentials error
      if (error.message === "Invalid Credentials.") { // This message is part of the error handling logic, not a comment to be translated.
        return res.status(401).json({ message: error.message });
      }

      // Log other unexpected errors
      console.error(error);
      // Return a generic server error message
      return res.status(500).json({ message: "An unexpected server error occurred." });

    }
  },
};