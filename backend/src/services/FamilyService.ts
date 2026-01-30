import { prisma } from '../config/prisma';

export class FamilyService {
  // Lista todos os usuários e seus respectivos vínculos na árvore
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

  // Cria ou atualiza o vínculo de parentesco
  async linkMembers(memberId: string, relativeId: string, type: 'father' | 'mother' | 'spouse') {
    // 1. Garantir que o membro principal tenha um registro em FamilyMember
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

    // 2. Garantir que o parente tenha um registro em FamilyMember
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

    // 3. Aplicar o vínculo conforme o tipo
    const updateData: any = {};
    if (type === 'father') updateData.fatherId = relative.id;
    if (type === 'mother') updateData.motherId = relative.id;
    if (type === 'spouse') updateData.spouseId = relative.id;

    return await prisma.familyMember.update({
      where: { id: member.id },
      data: updateData
    });
  }
}