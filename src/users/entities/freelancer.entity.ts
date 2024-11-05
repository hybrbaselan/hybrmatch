import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Project } from 'src/projects/entities/project.entity';

@Entity('freelancers')
export class Freelancer {
  @PrimaryColumn()
  userId: number;

  @Column()
  title: string;

  @Column('decimal', { precision: 10, scale: 2 })
  hourlyRate: number;

  @Column()
  expYears: number;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  totalProjects: number;

  @Column('simple-array')
  skills: string[];

  @Column({ nullable: true })
  linkedinUrl: string;

  @OneToOne(() => User, user => user.freelancerProfile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Project, project => project.freelancer)
  projects: Project[];
}