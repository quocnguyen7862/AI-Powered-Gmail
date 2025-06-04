import { BaseEntity } from '@/common/base/base.entity';
import { LabelEntity } from '@/label/entities/label.entity';
import { ModelEntity } from '@/model/entities/model.entity';
import { TrackingEntity } from '@/tracking/entities/tracking.entity';
import { Column, Entity, OneToMany, Unique } from 'typeorm';

@Entity({ name: 'users' })
@Unique(['userId', 'email'])
export class UserEntity extends BaseEntity {
  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ unique: true })
  userId: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt: Date;

  @Column({ nullable: true })
  idToken: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  refreshTokenExpiresIn: Date;

  @Column({ nullable: true })
  scope: string;

  @Column({ nullable: true })
  tokenType: string;

  @Column({ nullable: true })
  summaryLanguage: string;

  @Column({ default: true })
  enabledTracking: boolean;

  @OneToMany(() => TrackingEntity, (trackingEntity) => trackingEntity.user)
  trackings: TrackingEntity[];

  @OneToMany(() => ModelEntity, (modelEntity) => modelEntity.user)
  models: ModelEntity[];

  @OneToMany(() => LabelEntity, (label) => label.user)
  labels: LabelEntity[];
}
