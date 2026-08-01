import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      findById: jest.fn(),
      updatePasswordHash: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('register throws when passwords mismatch', async () => {
    await expect(
      service.register({
        email: 'a@b.com',
        password: '12345678',
        confirmPassword: 'x',
        fullName: 'A',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('register throws when email exists', async () => {
    usersService.findByEmail!.mockResolvedValue({ id: '1' } as any);
    await expect(
      service.register({
        email: 'a@b.com',
        password: '12345678',
        confirmPassword: '12345678',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('login throws when user not found', async () => {
    usersService.findByEmail!.mockResolvedValue(null);
    await expect(
      service.login({ email: 'a@b.com', password: 'x' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('login throws on wrong password', async () => {
    usersService.findByEmail!.mockResolvedValue({ password_hash: 'hash' } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ email: 'a@b.com', password: 'wrong' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('changePassword updates hash when current password valid', async () => {
    usersService.findById!.mockResolvedValue({ id: 'u1', password_hash: 'hash' } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

    const res = await service.changePassword('u1', {
      currentPassword: 'old',
      newPassword: 'newpass12',
    });

    expect(usersService.updatePasswordHash).toHaveBeenCalledWith('u1', 'new-hash');
    expect(res.message).toBe('CHANGE_PASSWORD_SUCCESS');
  });
});
