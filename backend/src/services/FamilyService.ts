import { prisma } from '../config/prisma';

export class FamilyService {
  /**
   * 1. Lista TODOS os membros da árvore.
   * Antes listava usuários, agora lista a tabela FamilyMember diretamente
   * para que membros sem conta (visuais) também apareçam no seu painel.
   */
  async listAllMembers() {
    return await prisma.familyMember.findMany({
      include: {
        father: true,
        mother: true,
        spouse: true,
        user: {
          select: {
            email: true,
            id: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * 2. Cria um membro "Visual" (Sem conta/user).
   * Útil para antepassados ou crianças que ainda não acessam o sistema.
   */
  async createVisualMember(data: { name: string, gender: string, birthDate?: string }) {
    return await prisma.familyMember.create({
      data: {
        name: data.name,
        gender: data.gender,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
      }
    });
  }

  /**
   * 3. Realiza o vínculo usando IDs de Membros.
   * Atualizado para usar IDs da tabela FamilyMember, permitindo
   * conectar qualquer pessoa da lista, com ou sem conta.
   */
  async linkMembers(memberId: string, relativeId: string, type: 'father' | 'mother' | 'spouse') {
    const updateData: any = {};
    if (type === 'father') updateData.fatherId = relativeId;
    if (type === 'mother') updateData.motherId = relativeId;
    if (type === 'spouse') {
      updateData.spouseId = relativeId;
      
      // Vínculo bidirecional: Se João é esposo de Maria, Maria é esposa de João
      await prisma.familyMember.update({
        where: { id: relativeId },
        data: { spouseId: memberId }
      });
    }

    return await prisma.familyMember.update({
      where: { id: memberId },
      data: updateData
    });
  }

  /**
   * 4. Vincula um Membro Visual a um Usuário Real.
   * Use isto quando seu sobrinho criar uma conta e você quiser "fundir"
   * o registro visual dele com a conta nova.
   */
  async connectUserToMember(memberId: string, userId: string) {
    return await prisma.familyMember.update({
      where: { id: memberId },
      data: { userId: userId }
    });
  }

  // Busca dados para a árvore (Mantido para compatibilidade)
  async getTreeData() {
    return await prisma.familyMember.findMany({
      include: {
        father: true,
        mother: true,
        spouse: true,
        user: { select: { id: true, name: true, gender: true } }
      }
    });
  }
}