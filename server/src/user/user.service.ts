import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return await this.databaseService.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
      },
    });
  }

  async getAllUsers(): Promise<User[]> {
    return await this.databaseService.user.findMany();
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.databaseService.user.findUnique({
      where: { id },
    });
  }

  async updateUser(
    id: number,
    updateData: Partial<CreateUserDto>,
  ): Promise<User> {
    return await this.databaseService.user.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteUser(id: number): Promise<User> {
    return await this.databaseService.user.delete({
      where: { id },
    });
  }
}
