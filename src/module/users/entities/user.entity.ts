/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseEntity } from 'src/common/base/base-entity.base';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from 'src/module/projects/entities/project.entity';

@Entity('COMIC_USER')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password_hash: string;

  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  fullName: string;

  @Column({
    name: 'username',
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
  })
  username: string;

  @Column({
    name: 'avatar_url',
    type: 'text',
    nullable: true,
  })
  avatarUrl: string;
}
