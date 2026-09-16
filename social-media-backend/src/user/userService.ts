import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  constructor(private jwtService: JwtService) {}

  async signUp(body: any) {
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new BadRequestException('Email is already registered!');

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: { name: body.name, email: body.email, password: hashedPassword },
    });

    const { password, ...result } = user;
    return { message: 'User registered successfully', user: result };
  }

  async login(body: any) {
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password!');

    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid email or password!');

    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    const { password, ...result } = user;
    return {
      message: 'Login successful',
      access_token: token,
      user: result,
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('No account found with this email address!');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtp: otp, resetOtpExpiry: expiry },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ConnectPulse" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'ConnectPulse - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #0070f3;">ConnectPulse Password Reset</h2>
          <p>You requested a password reset. Your 6-digit verification code is:</p>
          <div style="background-color: #f0f7ff; padding: 15px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0070f3;">
            ${otp}
          </div>
          <p style="margin-top: 15px; color: #666; font-size: 14px;">This code is valid for 15 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { message: 'Password reset code has been sent to your Gmail!' };
  }

  async resetPassword(body: { email: string; otp: string; newPassword: string }) {
    const { email, otp, newPassword } = body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.resetOtp || user.resetOtp !== otp) {
      throw new BadRequestException('Invalid OTP code entered!');
    }

    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
      throw new BadRequestException('OTP code has expired. Please request a new one!');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    return { message: 'Password updated successfully! You can now log in.' };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, bio: true, createdAt: true },
    });
    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  async updateProfile(userId: string, body: { bio?: string; name?: string; email?: string }) {
    if (body.email) {
      const existing = await prisma.user.findFirst({
        where: { email: body.email, NOT: { id: userId } },
      });
      if (existing) {
        throw new BadRequestException('This email is already in use!');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
      },
      select: { id: true, name: true, email: true, bio: true, createdAt: true },
    });
    return updatedUser;
  }
}