import { Request, Response } from 'express'; // Import Request and Response from Express.

export const welcomeController = {
  /**
   * @description Handles the request to the root endpoint and sends a welcome message.
   * @param { Request } req - The request object from Express.
   * @param { Response } res - The response object from Express.
   */

  getWelcomeMessage: (req: Request, res: Response) => {
    res.json({ message: "Bem vindo à API Blog!" });
  }
};