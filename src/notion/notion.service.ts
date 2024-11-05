import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@notionhq/client';
import { FormattedUser, FormattedFreelancer, FormattedProject } from './interfaces/notion.interface';
import { UserRole } from 'src/users/entities/user.entity';
import { ProjectStatus } from 'src/projects/entities/project.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotionService {
    private notion: Client;
    private userDatabaseId: string;
    private freelancerDatabaseId: string;
    private projectDatabaseId: string;
    private readonly logger = new Logger(NotionService.name);

    constructor(private configService: ConfigService) {
        this.notion = new Client({
            auth: configService.get('NOTION_API_KEY'),
        });
        this.userDatabaseId = configService.get('NOTION_USER_DATABASE_ID');
        this.freelancerDatabaseId = configService.get('NOTION_FREELANCER_DATABASE_ID');
        this.projectDatabaseId = configService.get('NOTION_PROJECT_DATABASE_ID');
    }

    // @Cron(CronExpression.EVERY_10_SECONDS, {
    //     name: 'notion-sync',
    //     timeZone: 'Asia/Ho_Chi_Minh'
    // })
    // async handlePeriodicSync() {
    //     this.logger.log('Starting periodic sync with Notion...');

    //     try {
    //         const usersResult = await this.syncUsersFromNotion();
    //         const freelancersResult = await this.syncFreelancersFromNotion();
    //         const projectsResult = await this.syncProjectsFromNotion();

    //         this.logger.log(`Sync completed: ${usersResult.total} users, ${freelancersResult.total} freelancers, ${projectsResult.total} projects`);
    //     } catch (error) {
    //         this.logger.error(`Sync failed: ${error.message}`);
    //     }
    // }

    async testConnection() {
        try {
            const response = await this.notion.users.list({});
            return response;
        } catch (error) {
            throw new Error(`Notion API connection failed: ${error.message}`);
        }
    }

    async syncUsersFromNotion(): Promise<{ total: number; users: FormattedUser[] }> {
        try {
            const response = await this.notion.databases.query({
                database_id: this.userDatabaseId,
            });

            const formattedUsers = this.formatUsers(response.results);
            return {
                total: formattedUsers.length,
                users: formattedUsers
            };
        } catch (error) {
            throw new Error(`Failed to sync users from Notion: ${error.message}`);
        }
    }

    async syncFreelancersFromNotion(): Promise<{ total: number; freelancers: FormattedFreelancer[] }> {
        try {
            const response = await this.notion.databases.query({
                database_id: this.freelancerDatabaseId,
            });

            const formattedFreelancers = this.formatFreelancers(response.results);
            return {
                total: formattedFreelancers.length,
                freelancers: formattedFreelancers
            };
        } catch (error) {
            throw new Error(`Failed to sync freelancers from Notion: ${error.message}`);
        }
    }

    async syncProjectsFromNotion(): Promise<{ total: number; projects: FormattedProject[] }> {
        try {
            const response = await this.notion.databases.query({
                database_id: this.projectDatabaseId,
            });

            const formattedProjects = this.formatProjects(response.results);
            return {
                total: formattedProjects.length,
                projects: formattedProjects
            };
        } catch (error) {
            throw new Error(`Failed to sync projects from Notion: ${error.message}`);
        }
    }

    async getUserById(id: string): Promise<FormattedUser | null> {
        try {
            const response = await this.notion.databases.query({
                database_id: this.userDatabaseId,
                filter: {
                    property: 'ID',
                    unique_id: {
                        equals: parseInt(id)
                    }
                }
            });

            if (!response.results.length) {
                return null;
            }

            const formattedUsers = this.formatUsers(response.results);
            return formattedUsers[0];
        } catch (error) {
            throw new Error(`Failed to get user from Notion: ${error.message}`);
        }
    }

    async getFreelancerById(id: string): Promise<FormattedFreelancer | null> {
        try {
            const response = await this.notion.databases.query({
                database_id: this.freelancerDatabaseId,
                filter: {
                    property: 'ID',
                    unique_id: {
                        equals: parseInt(id)
                    }
                }
            });

            if (!response.results.length) {
                return null;
            }

            const formattedFreelancers = this.formatFreelancers(response.results);
            return formattedFreelancers[0];
        } catch (error) {
            throw new Error(`Failed to get freelancer from Notion: ${error.message}`);
        }
    }

    async getProjectById(id: string): Promise<FormattedProject | null> {
        try {
            const response = await this.notion.databases.query({
                database_id: this.projectDatabaseId,
                filter: {
                    property: 'ID',
                    unique_id: {
                        equals: parseInt(id)
                    }
                }
            });

            if (!response.results.length) {
                return null;
            }

            const formattedProjects = this.formatProjects(response.results);
            return formattedProjects[0];
        } catch (error) {
            throw new Error(`Failed to get project from Notion: ${error.message}`);
        }
    }

    private async queryNotionDatabase(databaseId: string, filter: any) {
        try {
            return await this.notion.databases.query({
                database_id: databaseId,
                filter: filter
            });
        } catch (error) {
            throw new Error(`Failed to query Notion database: ${error.message}`);
        }
    }

    private formatUsers(results: any[]): FormattedUser[] {
        return results.map(page => {
            const props = page.properties;
            return {
                id: props.ID.unique_id.number,
                email: props.Email.title[0]?.plain_text || '',
                fullName: props['Full Name'].people[0]?.name || '',
                password: props.Password.rich_text[0]?.plain_text || '',
                role: props.Role.select?.name as UserRole,
                phoneNumber: props['Phone Number'].phone_number || '',
                profileUrl: props.Profile.files[0]?.external?.url || '',
                createdAt: new Date(props['Created At'].created_time),
                freelancerProfile: props['Freelancer Profile'].relation[0]?.id || null
            };
        });
    }

    private formatFreelancers(results: any[]): FormattedFreelancer[] {
        return results.map(page => {
            const props = page.properties;
            return {
                id: props.ID?.unique_id?.number,
                userId: props['User ID']?.rich_text[0]?.text?.content || '',
                title: props.Title?.title[0]?.text?.content || '',
                skills: props.Skills?.multi_select?.map(skill => skill.name) || [],
                rating: props.Rating?.number || 0,
                totalProjects: props['Total Projects']?.number || 0,
                linkedinUrl: props.Linkedin?.url || '',
                projects: props.Projects?.relation?.map(project => project.id) || []
            };
        });
    }

    private formatProjects(results: any[]): FormattedProject[] {
        return results.map(page => {
            const props = page.properties;
            return {
                id: props.ID.unique_id.number,
                title: props.Title.title[0]?.plain_text || '',
                budget: props.Budget.number || 0,
                reviewScore: props['Review Score'].number || 0,
                timeline: {
                    start: new Date(props.Timeline.date?.start),
                    end: new Date(props.Timeline.date?.end)
                },
                status: props.Status.status?.name as ProjectStatus,
                clientEmail: props.Client.people[0]?.person?.email || '',
                freelancerId: props.Freelancers.relation[0]?.id || ''
            };
        });
    }

    async createUser(userData: Partial<FormattedUser>): Promise<FormattedUser> {
        try {
            const response = await this.notion.pages.create({
                parent: { database_id: this.userDatabaseId },
                properties: {
                    'Email': { title: [{ text: { content: userData.email } }] },
                    'Full Name': { 
                        people: [{
                            id: userData.fullName,
                            person: { email: userData.email }
                        }]
                    },
                    'Password': { rich_text: [{ text: { content: userData.password } }] },
                    'Role': { select: { name: userData.role } },
                    'Phone Number': { phone_number: userData.phoneNumber },
                    'Profile': userData.profileUrl ? {
                        files: [{
                            name: 'Profile Picture',
                            external: { url: userData.profileUrl }
                        }]
                    } : undefined,
                    'Freelancer Profile': userData.freelancerProfile ? {
                        relation: [{ id: userData.freelancerProfile }]
                    } : undefined
                }
            });

            const formattedUser = this.formatUsers([response])[0];
            return formattedUser;
        } catch (error) {
            throw new Error(`Failed to create user in Notion: ${error.message}`);
        }
    }

    async createFreelancer(freelancerData: Partial<FormattedFreelancer>): Promise<FormattedFreelancer> {
        try {         
            console.log('Creating freelancer with data:', freelancerData);

            // Kiểm tra database ID
            console.log('Freelancer Database ID:', this.freelancerDatabaseId);

            const response = await this.notion.pages.create({
                parent: { database_id: this.freelancerDatabaseId },
                properties: {
                    // Title là trường bắt buộc trong Notion và phải là trường đầu tiên
                    'Title': { 
                        title: [{ 
                            text: { content: freelancerData.title || 'Untitled' } 
                        }] 
                    },
                    // Các trường khác
                    'User': {
                        relation: [{
                            id: freelancerData.userId
                        }]
                    },
                    'Skills': {
                        multi_select: (freelancerData.skills || []).map(skill => ({
                            name: skill
                        }))
                    },
                    'Rating': {
                        number: freelancerData.rating || 0
                    },
                    'Total Projects': {
                        number: freelancerData.totalProjects || 0
                    },
                    'Linkedin': {
                        url: freelancerData.linkedinUrl || ''
                    },
                    'Projects': {
                        relation: (freelancerData.projects || []).map(projectId => ({
                            id: projectId
                        }))
                    }
                }
            });
            
            console.log('Notion response:', JSON.stringify(response, null, 2));
            
            // Thử lấy dữ liệu ngay sau khi tạo để kiểm tra
            const checkResponse = await this.notion.pages.retrieve({ 
                page_id: response.id 
            });
            console.log('Check created page:', JSON.stringify(checkResponse, null, 2));
            
            const formattedFreelancer = this.formatFreelancers([response])[0];
            return formattedFreelancer;
        } catch (error) {
            console.error('Full error:', error);
            throw new Error(`Failed to create freelancer in Notion: ${error.message}`);
        }
    }

    async createProject(projectData: Partial<FormattedProject>): Promise<FormattedProject> {
        try {
            const response = await this.notion.pages.create({
                parent: { database_id: this.projectDatabaseId },
                properties: {
                    'Title': { title: [{ text: { content: projectData.title } }] },
                    'Budget': { number: projectData.budget },
                    'Review Score': { number: projectData.reviewScore },
                    'Timeline': {
                        date: {
                            start: projectData.timeline.start.toISOString(),
                            end: projectData.timeline.end.toISOString()
                        }
                    },
                    'Status': { status: { name: projectData.status } },
                    'Client': { 
                        people: [{
                            id: 'user_id',
                            person: { email: projectData.clientEmail },
                            type: 'person'
                        }]
                    },
                    'Freelancers': projectData.freelancerId ? {
                        relation: [{ id: projectData.freelancerId }]
                    } : undefined
                }
            });

            const formattedProject = this.formatProjects([response])[0];
            return formattedProject;
        } catch (error) {
            throw new Error(`Failed to create project in Notion: ${error.message}`);
        }
    }
}
