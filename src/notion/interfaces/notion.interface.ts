import { UserRole } from 'src/users/entities/user.entity';
import { ProjectStatus } from 'src/projects/entities/project.entity';

export interface FormattedUser {
    id: number;
    email: string;
    fullName: string;
    password: string;
    role: UserRole;
    phoneNumber: string;
    profileUrl: string;
    createdAt: Date;
    freelancerProfile?: string;
}

export interface FormattedFreelancer {
    id: number;
    userId: string;
    title: string;
    skills: string[];
    rating: number;
    totalProjects: number;
    linkedinUrl?: string;
    projects: string[];
}

export interface FormattedProject {
    id: number;
    title: string;
    budget: number;
    reviewScore: number;
    timeline: {
        start: Date;
        end: Date;
    };
    status: ProjectStatus;
    clientEmail: string;
    freelancerId: string;
} 