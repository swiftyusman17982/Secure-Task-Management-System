
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, OrganizationEntity } from 'secure-task-management-system/entities';
import { UserRole } from 'secure-task-management-system/data';

@Injectable()
export class SeedService implements OnModuleInit {
        constructor(
                @InjectRepository(UserEntity)
                private userRepository: Repository<UserEntity>,
                @InjectRepository(OrganizationEntity)
                private orgRepository: Repository<OrganizationEntity>,
        ) { }

        async onModuleInit() {
                const userCount = await this.userRepository.count();
                if (userCount > 0) return;

                console.log('Seeding initial data...');

                // 1. Create Organizations
                const mainOrg = this.orgRepository.create({ name: 'Acme Corp' });
                await this.orgRepository.save(mainOrg);

                const subOrg = this.orgRepository.create({ name: 'Acme Research', parentId: mainOrg.id });
                await this.orgRepository.save(subOrg);

                // 2. Create Users
                const password = await bcrypt.hash('password123', 10);

                const users = [
                        { username: 'owner', role: UserRole.OWNER, orgId: mainOrg.id },
                        { username: 'admin', role: UserRole.ADMIN, orgId: mainOrg.id },
                        { username: 'viewer', role: UserRole.VIEWER, orgId: mainOrg.id },
                        { username: 'research_admin', role: UserRole.ADMIN, orgId: subOrg.id },
                ];

                for (const u of users) {
                        const user = this.userRepository.create({ ...u, password });
                        await this.userRepository.save(user);
                }

                console.log('Seeding complete.');
        }
}
