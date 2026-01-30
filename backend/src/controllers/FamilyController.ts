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
      return res.status(500).json({ message: "Erro ao listar membros." });
    }
  },

  // POST /family/manual (NOVO: Cria membro sem conta)
  createManual: async (req: Request, res: Response) => {
    try {
      const member = await familyService.createVisualMember(req.body);
      return res.status(201).json(member);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao criar membro manual." });
    }
  },

  // POST /family/link
  link: async (req: Request, res: Response) => {
    const { memberId, relativeId, type } = req.body;
    try {
      const updated = await familyService.linkMembers(memberId, relativeId, type);
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao criar vínculo." });
    }
  },

  // GET /family/tree
  getTree: async (req: Request, res: Response) => {
    try {
      const tree = await familyService.getTreeData();
      return res.status(200).json(tree);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar árvore." });
    }
  }
};