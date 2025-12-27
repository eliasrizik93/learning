import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}
  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    console.log('👤 Creating user with DTO:', createUserDto);
    console.log('👤 Password value:', createUserDto.password, 'Type:', typeof createUserDto.password);
    
    if (!createUserDto.password) {
      throw new Error('Password is required');
    }
    
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const fullName =
      `${createUserDto.firstName} ${createUserDto.lastName}`.trim();

    const user = await this.databaseService.user.create({
      data: {
        email: createUserDto.email,
        name: fullName,
        password: hashedPassword,
        profile: createUserDto.profile ?? undefined,
        birthday: createUserDto.birthday
          ? new Date(createUserDto.birthday)
          : undefined,
        country: createUserDto.country ?? undefined,
        phoneNumber: createUserDto.phoneNumber ?? undefined,
        profileVisible: createUserDto.profileVisible ?? true,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await this.databaseService.user.findMany();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return users.map(({ password, ...user }) => user);
  }

  async getUserById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.databaseService.user.findUnique({ where: { id } });
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(
    id: number,
    updateData: Partial<CreateUserDto & { currentPassword?: string; name?: string }>,
  ): Promise<Omit<User, 'password'>> {
    // If firstName and lastName are provided, combine them into name
    if (updateData.firstName || updateData.lastName) {
      const currentUser = await this.databaseService.user.findUnique({
        where: { id },
      });
      
      if (currentUser) {
        const parts = currentUser.name.split(/\s+/);
        const currentFirstName = parts[0] || '';
        const currentLastName = parts.slice(1).join(' ') || '';
        
        const firstName = updateData.firstName ?? currentFirstName;
        const lastName = updateData.lastName ?? currentLastName;
        updateData.name = `${firstName} ${lastName}`.trim();
      } else if (updateData.firstName || updateData.lastName) {
        updateData.name = `${updateData.firstName || ''} ${updateData.lastName || ''}`.trim();
      }
      
      // Remove firstName and lastName as they're not database fields
      delete (updateData as { firstName?: string; lastName?: string }).firstName;
      delete (updateData as { firstName?: string; lastName?: string }).lastName;
    }

    // If password is being updated, verify current password
    if (updateData.password && updateData.currentPassword) {
      const userWithPassword = await this.databaseService.user.findUnique({
        where: { id },
      });
      
      if (!userWithPassword) {
        throw new UnauthorizedException('User not found');
      }

      const isValid = await bcrypt.compare(
        updateData.currentPassword,
        userWithPassword.password,
      );
      
      if (!isValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Hash the new password
      updateData.password = await bcrypt.hash(updateData.password, 10);
      // Remove currentPassword from updateData as it's not a database field
      delete (updateData as { currentPassword?: string }).currentPassword;
    } else if (updateData.password) {
      // If password is provided without currentPassword, hash it (for backwards compatibility)
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await this.databaseService.user.update({
      where: { id },
      data: updateData,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUser(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.databaseService.user.delete({
      where: { id },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  async getUserByEmailWithPassword(email: string): Promise<User | null> {
    return await this.databaseService.user.findUnique({
      where: { email },
    });
  }
}
