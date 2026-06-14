import { BaseEntity } from "src/common/base/base-entity.base";
import { JobStatus, JobType } from "src/common/constants";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "src/module/projects/entities/project.entity";
import { Frame } from "src/module/frames/entities/frame.entity";

@Entity('COMIC_GENERATION_JOB')
export class GenerationJob extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        name: 'project_id',
        type: 'uuid',
        nullable: false,
    })
    project_id: string

    @Column({
        name: 'frame_id',
        type: 'uuid',
        nullable: true,
    })
    frame_id: string

    @ManyToOne(() => Project, (project) => project.generation_jobs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @ManyToOne(() => Frame, (frame) => frame.generation_jobs, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'frame_id' })
    frame: Frame;


    @Column({
        name: 'job_type',
        type: 'enum',
        enum: JobType,
        nullable: false,
    })
    job_type: JobType

    @Column({
        name: 'status',
        type: 'enum',
        enum: JobStatus,
        nullable: false,
    })
    status: JobStatus

    @Column({
        name: 'error_message',
        type: 'text',
        nullable: true,
    })
    error_message: string

    @Column({
        name: 'retry_count',
        type: 'smallint',
        nullable: false,
    })
    retry_count: number

    @Column({
        name: 'started_at',
        type: 'timestamptz',
        nullable: true,
    })
    started_at: Date

    @Column({
        name: 'completed_at',
        type: 'timestamptz',
        nullable: true,
    })
    completed_at: Date

}