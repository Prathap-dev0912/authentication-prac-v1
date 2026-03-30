import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('signup')
  signup(@Body() body: any) {
    console.log('BODY RECEIVED:', body); // 👈 ADD THIS
    return this.usersService.signup(body.firstName, body.lastName, body.email);
  }

  @Post('verify-otp')
  verifyOtp(
    @Body('otp') otp: string,
    @Body('token') token: string,
    @Body('type') type: 'login' | 'signup', // ✅ FIXED
  ) {
    return this.usersService.verifyOtp(otp, token, type);
  }

  @Post('/resend-otp')
  resendOtp(@Body('email') email: string) {
    return this.usersService.resendOtp(email);
  }

  @Post('/login')
  login(@Body() body: any) {
    return this.usersService.login(body?.email);
  }

  @Post('/refresh')
  refresh(@Body() body: any) {
    return this.usersService.refreshToken(body.userId, body.refreshToken);
  }
}
