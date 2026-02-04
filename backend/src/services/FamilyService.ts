import { prisma } from '../config/prisma';
import { Gender } from '@prisma/client';

export class FamilyService {
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

  async createVisualMember(data: { name: string, gender: string, birthDate?: string }) {
    // Converter string para o enum Gender
    let genderEnum: Gender;
    
    switch (data.gender.toUpperCase()) {
      case 'MASCULINO':
      case 'M':
        genderEnum = Gender.MASCULINO;
        break;
      case 'FEMININO':
      case 'F':
        genderEnum = Gender.FEMININO;
        break;
      default:
        genderEnum = Gender.OUTRO;
        break;
    }

    return await prisma.familyMember.create({
      data: {
        name: data.name,
        gender: genderEnum,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
      }
    });
  }

  async linkMembers(memberId: string, relativeId: string, type: 'father' | 'mother' | 'spouse') {
    const updateData: any = {};
    if (type === 'father') updateData.fatherId = relativeId;
    if (type === 'mother') updateData.motherId = relativeId;
    if (type === 'spouse') {
      updateData.spouseId = relativeId;
      
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

  async connectUserToMember(memberId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { familyMemberId: memberId }
      });

      return await tx.familyMember.findUnique({
        where: { id: memberId },
        include: { user: true }
      });
    });
  }

  async createFamilyMemberForExistingUsers() {
    const usersWithoutFamilyMember = await prisma.user.findMany({
      where: { familyMemberId: null },
    });

    const results = [];
    
    for (const user of usersWithoutFamilyMember) {
      const result = await prisma.$transaction(async (tx) => {
        const familyMember = await tx.familyMember.create({
          data: {
            name: user.name,
            birthDate: user.birthDate,
            gender: user.gender,
          },
        });

        await tx.user.update({
          where: { id: user.id },
          data: { familyMemberId: familyMember.id },
        });

        return { user: user.name, familyMemberId: familyMember.id };
      });
      
      results.push(result);
    }

    return results;
  }

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