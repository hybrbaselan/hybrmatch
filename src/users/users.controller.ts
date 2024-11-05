import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Freelancer } from './entities/freelancer.entity';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get()
    async findAll(): Promise<User[]> {
        return await this.usersService.findAllUsers();
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<User> {
        return await this.usersService.findUserById(id);
    }

    @Post()
    async create(@Body() userData: Partial<User>): Promise<User> {
        return await this.usersService.createUser(userData);
    }

    @Post('freelancer')
    async createFreelancer(@Body() freelancerData: Partial<Freelancer>): Promise<Freelancer> {
        return await this.usersService.createFreelancer(freelancerData);
    }
}
