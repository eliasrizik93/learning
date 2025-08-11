import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { DatabaseService } from '../database/database.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

describe('GroupService', () => {
  let service: GroupService;

  const mockGroup = {
    id: 'test-uuid',
    name: 'Test Group',
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDatabaseService = {
    group: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGroup', () => {
    it('should create a group successfully', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Test Group',
        userId: 1,
      };

      mockDatabaseService.group.create.mockResolvedValue(mockGroup);

      const result = await service.createGroup(createGroupDto);

      expect(result).toEqual({
        success: true,
        data: mockGroup,
      });
      expect(mockDatabaseService.group.create).toHaveBeenCalledWith({
        data: {
          name: createGroupDto.name,
          userId: createGroupDto.userId,
        },
      });
    });

    it('should handle creation errors', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Test Group',
        userId: 1,
      };

      mockDatabaseService.group.create.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.createGroup(createGroupDto);

      expect(result).toEqual({
        success: false,
        message: 'Failed to create group',
      });
    });
  });

  describe('getAllGroups', () => {
    it('should return all groups', async () => {
      const mockGroups = [mockGroup];
      mockDatabaseService.group.findMany.mockResolvedValue(mockGroups);

      const result = await service.getAllGroups();

      expect(result).toEqual(mockGroups);
      expect(mockDatabaseService.group.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });
  });

  describe('getGroupById', () => {
    it('should return a group by id', async () => {
      const groupId = 'test-uuid';
      mockDatabaseService.group.findUnique.mockResolvedValue(mockGroup);

      const result = await service.getGroupById(groupId);

      expect(result).toEqual(mockGroup);
      expect(mockDatabaseService.group.findUnique).toHaveBeenCalledWith({
        where: { id: groupId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          cards: true,
        },
      });
    });
  });

  describe('getGroupsByUserId', () => {
    it('should return groups by user id', async () => {
      const userId = 1;
      const mockGroups = [mockGroup];
      mockDatabaseService.group.findMany.mockResolvedValue(mockGroups);

      const result = await service.getGroupsByUserId(userId);

      expect(result).toEqual(mockGroups);
      expect(mockDatabaseService.group.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          cards: true,
        },
      });
    });
  });

  describe('updateGroup', () => {
    it('should update a group successfully', async () => {
      const groupId = 'test-uuid';
      const updateGroupDto: UpdateGroupDto = {
        name: 'Updated Group',
      };

      mockDatabaseService.group.update.mockResolvedValue({
        ...mockGroup,
        name: 'Updated Group',
      });

      const result = await service.updateGroup(groupId, updateGroupDto);

      expect(result).toEqual({
        success: true,
        data: { ...mockGroup, name: 'Updated Group' },
      });
      expect(mockDatabaseService.group.update).toHaveBeenCalledWith({
        where: { id: groupId },
        data: updateGroupDto,
      });
    });

    it('should handle update errors', async () => {
      const groupId = 'test-uuid';
      const updateGroupDto: UpdateGroupDto = {
        name: 'Updated Group',
      };

      mockDatabaseService.group.update.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.updateGroup(groupId, updateGroupDto);

      expect(result).toEqual({
        success: false,
        message: 'Failed to update group',
      });
    });
  });

  describe('deleteGroup', () => {
    it('should delete a group successfully', async () => {
      const groupId = 'test-uuid';
      mockDatabaseService.group.delete.mockResolvedValue(mockGroup);

      const result = await service.deleteGroup(groupId);

      expect(result).toEqual({
        success: true,
        data: mockGroup,
      });
      expect(mockDatabaseService.group.delete).toHaveBeenCalledWith({
        where: { id: groupId },
      });
    });

    it('should handle delete errors', async () => {
      const groupId = 'test-uuid';
      mockDatabaseService.group.delete.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.deleteGroup(groupId);

      expect(result).toEqual({
        success: false,
        message: 'Failed to delete group',
      });
    });
  });
});
