import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { SubscriptionTier } from 'src/common/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  // Dùng bởi AuthModule (register/login)
  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  createUser(email: string, passwordHash: string, fullName?: string) {
    const user = this.userRepo.create({
      email,
      password_hash: passwordHash,
      fullName,
      subscription_tier: SubscriptionTier.FREE,
      credits_balance: 100,
    });
    return this.userRepo.save(user);
  }

  findAll() {
    return this.userRepo.find();
  }

  findOne(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepo.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    if (user) {
      await this.userRepo.remove(user);
    }
    return user;
  }
}
