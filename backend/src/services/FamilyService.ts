import { prisma } from '../config/prisma';

export class FamilyService {
  // Lista membros para o painel de ADMIN
  async listAllMembers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        familyMember: {
          include: {
            father: true,
            mother: true,
            spouse: true
          }
        }
      }
    });
  }

  // Cria ou atualiza o vínculo de parentesco (Pai, Mãe ou Cônjuge)
  async linkMembers(memberId: string, relativeId: string, type: 'father' | 'mother' | 'spouse') {
    // 1. Garante que o membro principal exista na tabela FamilyMember
    let member = await prisma.familyMember.findFirst({ where: { user: { id: memberId } } });
    if (!member) {
      const user = await prisma.user.findUnique({ where: { id: memberId } });
      member = await prisma.familyMember.create({
        data: {
          name: user!.name,
          gender: user!.gender,
          birthDate: user!.birthDate,
          user: { connect: { id: memberId } }
        }
      });
    }

    // 2. Garante que o parente exista na tabela FamilyMember
    let relative = await prisma.familyMember.findFirst({ where: { user: { id: relativeId } } });
    if (!relative) {
      const relUser = await prisma.user.findUnique({ where: { id: relativeId } });
      relative = await prisma.familyMember.create({
        data: {
          name: relUser!.name,
          gender: relUser!.gender,
          birthDate: relUser!.birthDate,
          user: { connect: { id: relativeId } }
        }
      });
    }

    // 3. Aplica o vínculo
    const updateData: any = {};
    if (type === 'father') updateData.fatherId = relative.id;
    if (type === 'mother') updateData.motherId = relative.id;
    if (type === 'spouse') updateData.spouseId = relative.id;

    return await prisma.familyMember.update({
      where: { id: member.id },
      data: updateData
    });
  }

  // Busca dados completos para a Árvore Genealógica visual
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