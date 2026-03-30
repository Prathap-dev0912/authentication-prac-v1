import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/userSchema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async signup(firstName: string, lastName: string, email: string) {
    const exist = await this.userModel.findOne({ email });
    if (exist) throw new BadRequestException('User already exists');

    const otp = this.generateOtp();

    const user = await this.userModel.create({
      firstName,
      lastName,
      email,
      otp,
      otpExpiry: new Date(Date.now() + 5 * 60000),
    });

    const otpToken = this.jwtService.sign(
      { email: user.email },
      { expiresIn: '5m' },
    );

    return {
      message: 'OTP sent successfully',
      otpToken,
    };
  }

  async login(email: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) throw new UnauthorizedException('User not found');

    const otp = this.generateOtp();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60000);
    await user.save();

    const otpToken = this.jwtService.sign(
      { email: user.email },
      { expiresIn: '5m' },
    );

    return {
      message: 'OTP sent successfully',
      otpToken,
    };
  }

  async verifyOtp(otp: string, token: string, type: 'login' | 'signup') {
    let payload;

    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userModel.findOne({
      email: payload.email,
    });

    if (!user) throw new BadRequestException('User not found');

    if (type === 'signup' && user.isVerified) {
      throw new BadRequestException('User already verified');
    }

    if (!user.otp || !user.otpExpiry) {
      throw new BadRequestException('OTP not found');
    }

    if (user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    if (type === 'signup' && !user.isVerified) {
      user.isVerified = true;
    }

    user.otp = null;
    user.otpExpiry = null;

    let tokens: { accessToken: string; refreshToken: string } | null = null;

    if (type === 'login') {
      tokens = await this.generateTokens(user._id.toString());
      user.refreshToken = tokens.refreshToken;
    }

    await user.save();

    return {
      message: 'OTP verified successfully',
      ...(tokens || {}),
      sessionId: user._id,
    };
  }

  async resendOtp(email: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) throw new BadRequestException('User not found');
    if (user.isVerified) throw new BadRequestException('User already verified');
    const newOtp = this.generateOtp();
    user.otp = newOtp;
    user.otpExpiry = new Date(Date.now() + 5 * 60000);
    await user.save();
  }

  async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);

    if (!user || user.refreshToken !== refreshToken)
      throw new UnauthorizedException();

    return this.generateTokens(user._id.toString());
  }
}
