import { UserEntity } from '@/auth/entities/user.entity';
import { BaseEntity } from '@/common/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'models' })
export class ModelEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  userId: string;

  @Column()
  model: string;

  @Column()
  modelProvider: string;

  @Column({ unique: true })
  apiKey: string;

  @Column()
  apiKeyType: string;

  @Column({ default: false })
  isSelected: boolean;

  @ManyToOne(() => UserEntity, (user) => user.models, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'userId', name: 'userId' })
  user: UserEntity;
}
