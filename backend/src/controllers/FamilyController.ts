import { Request, Response } from 'express';
import { FamilyService } from '../services/FamilyService';

const familyService = new FamilyService();

export const familyController = {
  // GET /family/members
  index: async (req: Request, res: Response) => {
    try {
      const members = await familyService.listAllMembers();
      return res.status(200).json(members);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar membros da família." });
    }
  },

  // POST /family/link
  link: async (req: Request, res: Response) => {
    const { memberId, relativeId, type } = req.body;

    if (!memberId || !relativeId || !type) {
      return res.status(400).json({ message: "Dados incompletos para realizar o vínculo." });
    }

    try {
      const updated = await familyService.linkMembers(memberId, relativeId, type);
      return res.status(200).json(updated);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao criar vínculo de parentesco." });
    }
  }
};