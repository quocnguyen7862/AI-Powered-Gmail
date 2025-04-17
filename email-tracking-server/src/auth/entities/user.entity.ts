import { BaseEntity } from '@/common/base/base.entity';
import { TrackingEntity } from '@/tracking/entities/tracking.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  sessionId: string;

  @Column({ unique: true })
  userId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column()
  expiresAt: Date;

  @OneToMany(() => TrackingEntity, (trackingEntity) => trackingEntity.user)
  trackings: TrackingEntity[];
}
