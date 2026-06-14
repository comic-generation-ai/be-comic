import { BaseEntity } from "src/common/base/base-entity.base";
import { ProjectStatus } from "src/common/constants";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/module/users/entities/user.entity";
import { Script } from "src/module/scripts/entities/script.entity";
import { Character } from "src/module/characters/entities/character.entity";
import { Frame } from "src/module/frames/entities/frame.entity";
import { GenerationJob } from "src/module/generation-jobs/entities/generation-job.entity";

@Entity('COMIC_PROJECT')
export class Project extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        name: 'user_id',
        type: 'uuid',
        nullable: false,
    })
    user_id: string;

    @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Script, (script) => script.project)
    scripts: Script[];

    @OneToMany(() => Character, (character) => character.project)
    characters: Character[];

    @OneToMany(() => Frame, (frame) => frame.project)
    frames: Frame[];

    @OneToMany(() => GenerationJob, (job) => job.project)
    generation_jobs: GenerationJob[];


    @Column({
        name: 'title',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    title: string;

    @Column({
        name: 'genre',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    genre: string;

    @Column({
        name: 'art_style',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    art_style: string;

    @Column({
        name: 'layout_type',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    layout_type: string;

    @Column({
        name: 'raw_prompt',
        type: 'text',
        nullable: false,
    })
    raw_prompt: string;

    @Column({
        name: 'status',
        type: 'enum',
        enum: ProjectStatus,
        nullable: false,
        default: ProjectStatus.DRAFT,
    })
    status: ProjectStatus;

    @Column({
        name: 'credits_used',
        type: 'integer',
        nullable: false,
        default: 0,
    })
    credits_used: number;

}
