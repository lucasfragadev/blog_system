import { Request, Response } from 'express';
import { FamilyService } from '../services/FamilyService';

const familyService = new FamilyService();

export const familyController = {
  index: async (req: Request, res: Response) => {
    try {
      const members = await familyService.listAllMembers();
      return res.status(200).json(members);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar membros." });
    }
  },

  createManual: async (req: Request, res: Response) => {
    try {
      const member = await familyService.createVisualMember(req.body);
      return res.status(201).json(member);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao criar membro manual." });
    }
  },

  link: async (req: Request, res: Response) => {
    const { memberId, relativeId, type } = req.body;
    try {
      const updated = await familyService.linkMembers(memberId, relativeId, type);
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao criar vínculo." });
    }
  },

  getTree: async (req: Request, res: Response) => {
    try {
      const tree = await familyService.getTreeData();
      return res.status(200).json(tree);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar árvore." });
    }
  },

  migrateExistingUsers: async (req: Request, res: Response) => {
    try {
      const results = await familyService.createFamilyMemberForExistingUsers();
      return res.status(200).json({ 
        message: "Migração concluída", 
        migratedUsers: results.length,
        details: results 
      });
    } catch (error) {
      console.error('Erro na migração:', error);
      return res.status(500).json({ message: "Erro ao migrar usuários existentes." });
    }
  }
};