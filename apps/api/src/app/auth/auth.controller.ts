
import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from 'secure-task-management-system/auth';
import { JwtAuthGuard } from 'secure-task-management-system/auth';

@Controller('auth')
export class AuthController {
        constructor(private authService: AuthService) { }

        @Post('login')
        async login(@Body() body: any) {
                const user = await this.authService.validateUser(body.username, body.password);
                if (!user) {
                        throw new UnauthorizedException();
                }
                return this.authService.login(user);
        }

        @UseGuards(JwtAuthGuard)
        @Get('profile')
        getProfile(@Request() req) {
                return req.user;
        }
}
