import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';

/** Safe fields returned to clients — never includes password_hash or removed payment columns. */
const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  username: true,
  avatarUrl: true,
  created_at: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Dùng bởi AuthModule (register/login)
  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  /**
   * [story-p0-be-security-payment] Changed: removed subscription_tier and credits_balance on register.
   */
  createUser(email: string, passwordHash: string, fullName?: string) {
    const user = this.userRepo.create({
      email,
      password_hash: passwordHash,
      fullName,
    });
    return this.userRepo.save(user);
  }

  /**
   * [story-p0-be-security-payment] Changed: select whitelist excludes password_hash and payment fields.
   */
  findMe(id: string) {
    return this.userRepo.findOne({
      where: { id },
      select: PUBLIC_USER_SELECT,
    });
  }

  // Dùng bởi PATCH /users/me — chỉ set field trong UpdateProfileDto (whitelist)
  async updateMe(id: string, dto: UpdateProfileDto) {
    await this.userRepo.update(id, dto);
    return this.findMe(id);
  }
}
