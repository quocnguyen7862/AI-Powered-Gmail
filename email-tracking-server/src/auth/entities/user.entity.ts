import { BaseEntity } from '@/common/base/base.entity';
import { TrackingEntity } from '@/tracking/entities/tracking.entity';
import { Column, Entity, OneToMany, Unique } from 'typeorm';

@Entity({ name: 'users' })
@Unique(['userId', 'email'])
export class UserEntity extends BaseEntity {
  @Column({ nullable: true })
  sessionId: string;

  @Column({ unique: true })
  userId: string;

  @Column()
  email: string;

  @Column()
  accessToken: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  expiresAt: Date;

  @OneToMany(() => TrackingEntity, (trackingEntity) => trackingEntity.user)
  trackings: TrackingEntity[];
}
