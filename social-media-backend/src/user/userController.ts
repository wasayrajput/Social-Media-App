import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './userService';
import { JwtAuthGuard } from './jwtAuth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('signup')
  signUp(@Body() body: any) {
    return this.userService.signUp(body);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.userService.login(body);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.userService.forgotPassword(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { email: string; otp: string; newPassword: string }) {
    return this.userService.resetPassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(@Request() req, @Body() body: { bio?: string; name?: string; email?: string }) {
    return this.userService.updateProfile(req.user.id, body);
  }
}