import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Freelancer } from './freelancer.entity';

export enum UserRole {
  HYBRBASE = 'HYBRBASE',
  CLIENT = 'CLIENT',
  FREELANCER = 'FREELANCER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  profileUrl: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToOne(() => Freelancer, freelancer => freelancer.user)
  freelancerProfile?: Freelancer;
} 