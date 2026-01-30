import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserEntity } from 'secure-task-management-system/entities';
import { UserRole } from 'secure-task-management-system/data';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<UserEntity>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: '1',
        username: 'testuser',
        password: hashedPassword,
        role: UserRole.ADMIN,
        orgId: 'org1',
        organization: { id: 'org1', name: 'Test Org' },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'password123');

      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
      expect(result.password).toBeUndefined();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        relations: ['organization'],
        select: ['id', 'username', 'password', 'role', 'orgId'],
      });
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = {
        id: '1',
        username: 'testuser',
        password: hashedPassword,
        role: UserRole.ADMIN,
        orgId: 'org1',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        role: UserRole.ADMIN,
        orgId: 'org1',
      };

      const mockToken = 'mock.jwt.token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser);

      expect(result).toEqual({
        accessToken: mockToken,
        user: {
          id: '1',
          username: 'testuser',
          role: UserRole.ADMIN,
          orgId: 'org1',
        },
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: '1',
        role: UserRole.ADMIN,
        orgId: 'org1',
      });
    });
  });
});
