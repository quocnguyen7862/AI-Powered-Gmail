import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TrackingEntity } from './tracking.entity';
import { BaseEntity } from '@/common/base/base.entity';

@Entity({ name: 'readed' })
export class ReadedEntity extends BaseEntity {
  @Column()
  trackingId: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  readedAt: Date;

  @ManyToOne(() => TrackingEntity, (trackingEntity) => trackingEntity.readeds, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'trackingId', name: 'trackingId' })
  tracking: TrackingEntity;
}
