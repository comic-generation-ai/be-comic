import { BaseEntity } from "src/common/base/base-entity.base";
import { TransactionStatus, TransactionType } from "src/common/constants";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/module/users/entities/user.entity";

@Entity('COMIC_TRANSACTION')
export class Transaction extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        name: 'user_id',
        type: 'uuid',
        nullable: false,
    })
    user_id: string;

    @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;


    @Column({
        name: 'amount',
        type: 'numeric',
        precision: 10,
        scale: 2,
        nullable: false,
    })
    amount: number;

    @Column({
        name: 'type',
        type: 'enum',
        enum: TransactionType,
        nullable: false,
    })
    transaction_type: TransactionType;

    @Column({
        name: 'status',
        type: 'enum',
        enum: TransactionStatus,
        nullable: false,
        default: TransactionStatus.PENDING,
    })
    status: TransactionStatus

    @Column({
        name: 'payment_gateway_ref',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    payment_gateway_ref: string;

    @Column({
        name: 'credit_delta',
        type: 'integer',
        nullable: false,
        default: 0
    })
    credit_delta: number;
}
