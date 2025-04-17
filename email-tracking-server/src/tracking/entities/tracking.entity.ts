import { BaseEntity } from '@/common/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ReadedEntity } from './readed.entity';
import { UserEntity } from '@/auth/entities/user.entity';

@Entity({ name: 'tracking' })
export class TrackingEntity extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  messageId: string;

  @Column({ unique: true })
  threadId: string;

  @Column({ unique: true })
  trackingId: string;

  @Column({ default: false })
  isSent: boolean;

  @ManyToOne(() => UserEntity, (user) => user.trackings, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'userId', name: 'userId' })
  user: UserEntity;

  @OneToMany(() => ReadedEntity, (readedEntity) => readedEntity.tracking)
  readeds: ReadedEntity[];
}
