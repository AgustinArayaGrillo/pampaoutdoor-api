import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

const mockUser = {
  id: 1,
  email: 'test@test.com',
  name: 'Test User',
  password: 'hashed_password',
  role: 'customer',
  isActive: true,
  createdAt: new Date(),
};

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock_token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── register ──────────────────────────────────────────────
  describe('register', () => {
    it('debe crear un usuario y devolver token', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register('test@test.com', 'Test User', 'password123');

      expect(mockUsersService.create).toHaveBeenCalledWith('test@test.com', 'Test User', 'password123');
      expect(result.token).toBe('mock_token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('test@test.com');
    });

    it('no debe incluir la contraseña en la respuesta', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);
      const result = await service.register('test@test.com', 'Test User', 'password123');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  // ── login ─────────────────────────────────────────────────
  describe('login', () => {
    it('debe retornar token con credenciales válidas', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@test.com', 'password123');

      expect(result.token).toBe('mock_token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('debe lanzar UnauthorizedException si el email no existe', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login('noexiste@test.com', 'password123'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('test@test.com', 'wrong_password'))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
