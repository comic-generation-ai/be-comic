import { BaseEntity } from "src/common/base/base-entity.base";
import { IsNotEmpty } from 'class-validator';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { SubscriptionTier } from "src/common/constants";
import { Project } from "src/module/projects/entities/project.entity";
import { Transaction } from "src/module/transactions/entities/transaction.entity";

@Entity('COMIC_USER')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => Project, (project) => project.user)
    projects: Project[];

    @OneToMany(() => Transaction, (transaction) => transaction.user)
    transactions: Transaction[];

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
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    avatarUrl: string;

    @Column({
        name: 'subscription_tier',
        type: 'enum',
        enum: SubscriptionTier,
        nullable: false,
        default: SubscriptionTier.FREE,
    })
    subscription_tier: SubscriptionTier;

    @Column({
        name: 'subscription_renews_at',
        type: 'timestamp',
        nullable: true,
    })
    subscriptionRenewsAt: Date;

    @Column({
        name: 'credits_balance',
        type: 'integer',
        nullable: false,
        default: 0,
    })
    credits_balance: number;

}