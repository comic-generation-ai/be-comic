import { BaseEntity } from "src/common/base/base-entity.base";
import { BubbleType } from "src/common/constants";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Frame } from "src/module/frames/entities/frame.entity";

@Entity('COMIC_SPEECH_BUBBLE')
export class SpeechBubble extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        name: 'frame_id',
        type: 'uuid',
        nullable: false,
    })
    frame_id: string

    @ManyToOne(() => Frame, (frame) => frame.speech_bubbles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'frame_id' })
    frame: Frame;


    @Column({
        name: 'text_content',
        type: 'text',
        nullable: false,
    })
    text_content: string

    @Column({
        name: 'bubble_type',
        type: 'enum',
        enum: BubbleType,
        nullable: false,
    })
    bubble_type: BubbleType

    @Column({
        name: 'pos_x',
        type: 'real',
        nullable: false,
    })
    pos_x: number

    @Column({
        name: 'pos_y',
        type: 'real',
        nullable: false,
    })
    pos_y: number

    @Column({
        name: 'width',
        type: 'real',
        nullable: false,
    })
    width: number

    @Column({
        name: 'height',
        type: 'real',
        nullable: false,
    })
    height: number

    @Column({
        name: 'tail_direction',
        type: 'varchar',
        length: 20,
        nullable: true,
    })
    tail_direction: string

    @Column({
        name: 'style_config',
        type: 'jsonb',
        nullable: false,
        default: '{}'
    })
    style_config: Record<string, any>

}
