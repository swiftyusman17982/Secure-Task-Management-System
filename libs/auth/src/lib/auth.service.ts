
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'secure-task-management-system/entities';
import { AuthResponse } from 'secure-task-management-system/data';

@Injectable()
export class AuthService {
        constructor(
                @InjectRepository(UserEntity)
                private userRepository: Repository<UserEntity>,
                private jwtService: JwtService,
        ) { }

        async validateUser(username: string, pass: string): Promise<any> {
                const user = await this.userRepository.findOne({
                        where: { username },
                        relations: ['organization'],
                        select: ['id', 'username', 'password', 'role', 'orgId'],
                });
                if (user && await bcrypt.compare(pass, user.password)) {
                        const { password, ...result } = user;
                        return result;
                }
                return null;
        }

        async login(user: any): Promise<AuthResponse> {
                const payload = { username: user.username, sub: user.id, role: user.role, orgId: user.orgId };
                return {
                        accessToken: this.jwtService.sign(payload),
                        user: {
                                id: user.id,
                                username: user.username,
                                role: user.role,
                                orgId: user.orgId,
                        },
                };
        }
}
