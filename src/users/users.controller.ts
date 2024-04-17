import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Users } from 'src/schemas/user.schema';
import { SignUpDto } from 'src/dto/signup.dto';
import { loginDto } from 'src/dto/login.dto';
import { VerifyOtpDto } from 'src/dto/verifyotp.dto';
import { ResetPasswordDto } from 'src/dto/resetpassword.dto';
import { VerifyResetDto } from 'src/dto/verfiyreset.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Get()
    async getAllUsers(): Promise<Users[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.userService.findById(id);
    }

    @Post('/signup')
    signUp(@Body() signUpDto:SignUpDto):Promise<Users>{
        if(!signUpDto.fullname){
        throw new BadRequestException('User Name is required')
        }
        return this.userService.signUp(signUpDto);
    }

    @Post('/login')
    login(@Body() logindto:loginDto):Promise<{token:string}>{
        return this.userService.login(logindto);
    }

    @Post('verify-otp')
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
        return this.userService.verifyOtp(verifyOtpDto);
    }

    @Post('reset-password/request')
async requestPasswordReset(@Body('phoneNumber') phoneNumber: string) {
    const resetToken = await this.userService.generateResetToken(phoneNumber);
    await this.userService.sendResetOTP(phoneNumber, resetToken, );
    return { message: 'Reset OTP sent successfully' };
}

@Post('reset-password/verify')
async verifyResetOTP(@Body() resetDto: VerifyResetDto) {
    const { phoneNumber, otp } = resetDto;
    const isValidOTP = await this.userService.verifyResetOTP(phoneNumber, otp);
    if (!isValidOTP) {
        throw new BadRequestException('Invalid or expired OTP');
    }
    return { message: 'Reset OTP verified successfully' };
}

@Post('reset-password')
async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { phoneNumber, newPassword } = resetPasswordDto;
    await this.userService.resetPassword(phoneNumber, newPassword);
    return { message: 'Password reset successful' };
}

}
