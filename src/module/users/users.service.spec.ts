import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: { softDelete: jest.Mock; update: jest.Mock };

  beforeEach(async () => {
    userRepo = {
      softDelete: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('deleteMe soft-deletes user', async () => {
    await service.deleteMe('user-1');
    expect(userRepo.softDelete).toHaveBeenCalledWith('user-1');
  });

  it('updatePasswordHash updates password column', async () => {
    await service.updatePasswordHash('user-1', 'hash');
    expect(userRepo.update).toHaveBeenCalledWith('user-1', { password_hash: 'hash' });
  });
});
