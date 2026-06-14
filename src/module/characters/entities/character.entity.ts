import { BaseEntity } from "src/common/base/base-entity.base";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "src/module/projects/entities/project.entity";

@Entity('COMIC_CHARACTER')
export class Character extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        name: 'project_id',
        type: 'uuid',
        nullable: false,
    })
    project_id: string

    @ManyToOne(() => Project, (project) => project.characters, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: Project;


    @Column({
        name: 'name',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    name: string

    @Column({
        name: 'appearance_desc',
        type: 'text',
        nullable: true,
    })
    appearance_desc: string

    @Column({
        name: 'clothing_desc',
        type: 'text',
        nullable: true,
    })
    clothing_desc: string

    @Column({
        name: 'reference_image_url',
        type: 'varchar',
        length: 500,
        nullable: true,
    })
    reference_image_url: string
}
