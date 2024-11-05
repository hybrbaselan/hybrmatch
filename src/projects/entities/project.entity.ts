import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Freelancer } from 'src/users/entities/freelancer.entity';
import { User } from 'src/users/entities/user.entity';

export enum ProjectStatus {
  NOT_STARTED = 'Not started',
  IN_PROGRESS = 'In progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('decimal', { precision: 10, scale: 2 })
  budget: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  reviewScore: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.NOT_STARTED
  })
  status: ProjectStatus;

  @Column()
  clientId: number;

  @Column()
  freelancerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'clientId' })
  client: User;

  @ManyToOne(() => Freelancer, freelancer => freelancer.projects)
  @JoinColumn({ name: 'freelancerId' })
  freelancer: Freelancer;
} 