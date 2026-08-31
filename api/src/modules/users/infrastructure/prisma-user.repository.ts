import type { PrismaClient, User as PrismaUser } from "@prisma/client";
import type { NewUser, User, WeightUnit } from "../domain/user.entity";
import type { UserRepository } from "../domain/user.repository";

function toDomainUser(record: PrismaUser): User {
  return {
    ...record,
    preferredUnit: record.preferredUnit === "lb" ? "lb" : "kg",
  };
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? toDomainUser(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? toDomainUser(record) : null;
  }

  async create(user: NewUser): Promise<User> {
    const record = await this.prisma.user.create({
      data: { email: user.email, passwordHash: user.passwordHash, name: user.name },
    });
    return toDomainUser(record);
  }

  async updatePreferredUnit(userId: string, preferredUnit: WeightUnit): Promise<User> {
    const record = await this.prisma.user.update({
      where: { id: userId },
      data: { preferredUnit },
    });
    return toDomainUser(record);
  }
}
