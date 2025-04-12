import { BaseEntity } from '@/common/base/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ReadedEntity } from './readed.entity';

@Entity({ name: 'tracking' })
export class TrackingEntity extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  userAddress: string;

  @Column()
  messageId: string;

  @Column({ unique: true })
  threadId: string;

  @Column({ unique: true })
  trackingId: string;

  @Column({ default: false })
  isSent: boolean;

  @OneToMany(() => ReadedEntity, (readedEntity) => readedEntity.tracking)
  readeds: ReadedEntity[];
}
