import { BaseEntity } from "src/common/base/base-entity.base";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "src/module/projects/entities/project.entity";
import { Frame } from "src/module/frames/entities/frame.entity";

@Entity('COMIC_SCRIPT')
export class Script extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        name: 'project_id',
        type: 'uuid',
        nullable: false,
    })
    project_id: string

    @ManyToOne(() => Project, (project) => project.scripts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @OneToMany(() => Frame, (frame) => frame.script)
    frames: Frame[];


    @Column({
        name: 'structured_data',
        type: 'jsonb',
        nullable: false,
        default: '{}',
    })
    structured_data: Record<string, any>

    @Column({
        name: 'version',
        type: 'smallint',
        nullable: false,
        default: 1,
    })
    version: number

}
