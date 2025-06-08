import { UserEntity } from '@/auth/entities/user.entity';
import { BaseEntity } from '@/common/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ClassifyEntity } from './classify.entity';

@Entity({ name: 'labels' })
export class LabelEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  color: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.labels, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'userId', name: 'userId' })
  user: UserEntity;

  @OneToMany(() => ClassifyEntity, (classify) => classify.label)
  classifies: ClassifyEntity[];
}
