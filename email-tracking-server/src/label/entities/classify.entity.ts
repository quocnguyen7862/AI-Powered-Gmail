import { BaseEntity } from '@/common/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { LabelEntity } from './label.entity';

@Entity({ name: 'classifies' })
export class ClassifyEntity extends BaseEntity {
  @Column()
  messageId: string;

  @Column()
  labelId: number;

  @ManyToOne(() => LabelEntity, (label) => label.classifies, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'labelId' })
  label: LabelEntity;
}
