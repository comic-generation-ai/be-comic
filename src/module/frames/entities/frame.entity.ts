import { BaseEntity } from "src/common/base/base-entity.base";
import { FrameStatus } from "src/common/constants";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "src/module/projects/entities/project.entity";
import { Script } from "src/module/scripts/entities/script.entity";
import { SpeechBubble } from "src/module/speech-bubbles/entities/speech-bubble.entity";
import { GenerationJob } from "src/module/generation-jobs/entities/generation-job.entity";

@Entity('COMIC_FRAME')
export class Frame extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        name: 'project_id',
        type: 'uuid',
        nullable: false,
    })
    project_id: string

    @Column({
        name: 'script_id',
        type: 'uuid',
        nullable: true,
    })
    script_id: string

    @ManyToOne(() => Project, (project) => project.frames, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @ManyToOne(() => Script, (script) => script.frames, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'script_id' })
    script: Script;

    @OneToMany(() => SpeechBubble, (bubble) => bubble.frame)
    speech_bubbles: SpeechBubble[];

    @OneToMany(() => GenerationJob, (job) => job.frame)
    generation_jobs: GenerationJob[];


    //    UNIQUE(project_id, order_index)
    @Index('idx_comicframe_project_id_order_index', {
        unique: true
    })
    @Column({
        name: 'order_index',
        type: 'smallint',
        nullable: false,
    })
    order_index: number

    @Column({
        name: 'image_prompt',
        type: 'text',
        nullable: true,
    })
    image_prompt: string

    @Column({
        name: 'image_url',
        type: 'varchar',
        length: 500,
        nullable: true,
    })
    image_url: string

    @Column({
        name: 'thumbnail_url',
        type: 'varchar',
        length: 500,
        nullable: true,
    })
    thumbnail_url: string

    @Column({
        name: 'status',
        type: 'enum',
        enum: FrameStatus,
        nullable: false,
        default: FrameStatus.PENDING
    })
    status: FrameStatus
}
