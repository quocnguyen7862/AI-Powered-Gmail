import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TrackingEntity } from './tracking.entity';
import { BaseEntity } from '@/common/base/base.entity';

@Entity({ name: 'receiver' })
export class ReceiverEntity extends BaseEntity {
  @Column()
  threadId: string;

  @Column()
  receiverAddress: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(
    () => TrackingEntity,
    (trackingEntity) => trackingEntity.receivers,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ referencedColumnName: 'threadId', name: 'threadId' })
  tracking: TrackingEntity;
}
