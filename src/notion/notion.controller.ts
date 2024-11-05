import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { NotionService } from './notion.service';
import { FormattedUser, FormattedFreelancer, FormattedProject } from './interfaces/notion.interface';

@Controller('notion')
export class NotionController {
    constructor(private readonly notionService: NotionService) {}

    @Get('test')
    async testConnection() {
        return await this.notionService.testConnection();
    }

    @Get('users')
    async getAllUsers(): Promise<{ total: number; users: FormattedUser[] }> {
        return await this.notionService.syncUsersFromNotion();
    }

    @Get('users/:id')
    async getUserByID(@Param('id') id: string): Promise<FormattedUser> {
        const user = await this.notionService.getUserById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    @Get('freelancers')
    async getAllFreelancers(): Promise<{ total: number; freelancers: FormattedFreelancer[] }> {
        return await this.notionService.syncFreelancersFromNotion();
    }

    @Get('freelancers/:id')
    async getFreelancerByID(@Param('id') id: string): Promise<FormattedFreelancer> {
        const freelancer = await this.notionService.getFreelancerById(id);
        if (!freelancer) {
            throw new NotFoundException(`Freelancer with ID ${id} not found`);
        }
        return freelancer;
    }

    @Get('projects')
    async getAllProjects(): Promise<{ total: number; projects: FormattedProject[] }> {
        return await this.notionService.syncProjectsFromNotion();
    }

    @Get('projects/:id')
    async getProjectByID(@Param('id') id: string): Promise<FormattedProject> {
        const project = await this.notionService.getProjectById(id);
        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return project;
    }
}
