import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Freelancer } from './entities/freelancer.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Freelancer)
        private freelancerRepository: Repository<Freelancer>
    ) {}

    async createUser(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return await this.userRepository.save(user);
    }

    async createFreelancer(freelancerData: Partial<Freelancer>): Promise<Freelancer> {
        const freelancer = this.freelancerRepository.create(freelancerData);
        return await this.freelancerRepository.save(freelancer);
    }

    async findAllUsers(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async findUserById(id: number): Promise<User> {
        return await this.userRepository.findOne({ 
            where: { id },
            relations: ['freelancerProfile']
        });
    }

    async findUserByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({ 
            where: { email },
            relations: ['freelancerProfile']
        });
    }
}
