import { BadRequestException, ConflictException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from 'src/schemas/user.schema';
import mongoose from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from 'src/dto/signup.dto';
import * as bcrypt from 'bcryptjs';
import { Twilio } from 'twilio'; 
import parsePhoneNumberFromString from 'libphonenumber-js';
import { loginDto } from 'src/dto/login.dto';
import { VerifyOtpDto } from 'src/dto/verifyotp.dto';
import * as crypto from 'crypto';
import * as cron from 'node-cron'; 

@Injectable()
export class UsersService {
    private twilioClient: Twilio;
    private readonly logger = new Logger(UsersService.name);
    constructor(
        @InjectModel(Users.name)
        private userModel: mongoose.Model<Users>,
        private jwtservice: JwtService
    ){ 
        this.twilioClient = new Twilio("ACa1ae693469610944db9388135b7dd9df", "9a64af0be465fb5e02bb45abab04e838");
        this.setupUserCleanupTask(); 
    }

    private formatPhoneNumber(phone: string): string {
        const phoneNumber = parsePhoneNumberFromString(phone.toString(), 'IN');
        if (phoneNumber && phoneNumber.isValid()) {
            return phoneNumber.formatInternational();
        } else {
            throw new BadRequestException('Invalid phone number format');
        }
    }

    async findAll(): Promise<Users[]>{
        const users = await this.userModel.find();
        return users;
    }

    async findById(id: string): Promise<Users | null> {
        try {
            const user = await this.userModel.findById(id);
            return user;
        } catch (error) {
            throw new BadRequestException('Invalid user ID');
        }
    }
    

    async signUp(signUpDto: SignUpDto): Promise<Users> {
        const { fullname, email, dob, gender, phoneNumber, password } = signUpDto;
        const requiredFields = {
            fullname: 'Fullname',
            email: 'Email',
            dob: 'Date of birth',
            gender: 'gender',
            phoneNumber: 'Phone number',
            password: 'Password',          
            
        };
        for (const [field, label] of Object.entries(requiredFields)) {
            if (!signUpDto[field]) {
                throw new BadRequestException({ message: `${label} is required`, statusCode: HttpStatus.BAD_REQUEST });
            }
        }
       
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException({ message: 'Email already exists', statusCode: HttpStatus.CONFLICT });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);
        console.log(formattedPhoneNumber)
        try {
            const twilio=  await this.twilioClient.messages.create({
                from: '+12515721257', 
                body: `Your OTP for verification is: ${otp}`,
                to: "+91 7018362859"
            });
        } catch (error) {
            this.logger.error(`Error sending OTP: ${error.message}`);
            throw new BadRequestException({ message: 'Error sending OTP', statusCode: HttpStatus.BAD_REQUEST });
        }
        const user = await this.userModel.create({
            fullname,
            email,
            dob,
            gender,
            phoneNumber: formattedPhoneNumber,
            password: hashedPassword,
            otp 
        });
        return user;
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto) {
        const { phoneNumber, otp } = verifyOtpDto;
        const user = await this.userModel.findOne({ phoneNumber });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        if (otp !== user.otp) {
            throw new BadRequestException('Invalid OTP');
        }
        user.isAuthenticated = true;
        await user.save();
        await this.userModel.findByIdAndUpdate(user._id, { otp: null });
        return { message: 'OTP verification successful' };
    }

    async login(logindto: loginDto) {
        const { email, password } = logindto;
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        if (!user.isAuthenticated) {
            throw new UnauthorizedException('User is not registered');
        }
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const token = this.jwtservice.sign({ id: user._id,fullname:user.fullname });
        return { token,fullname:user.fullname };
    }

    async generateResetToken(phoneNumber: string): Promise<string> {
        const user = await this.userModel.findOne({ phoneNumber });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 3600000); 
        await user.save();
       
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        await user.save();
        return resetToken;
    }
 

    async sendResetOTP(phoneNumber: string, resetToken: string) {
        const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);
        const user = await this.userModel.findOne({ phoneNumber });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const otp = user.otp; 
        try {
            await this.twilioClient.messages.create({
                body: `Your OTP for password reset is: ${otp}`,
                from: '+12515721257', 
                to: formattedPhoneNumber,
            });
        } catch (error) {
            this.logger.error(`Error sending OTP: ${error.message}`);
            throw new BadRequestException('Error sending OTP');
        }
        return otp;
    }

      async verifyResetOTP(phoneNumber: string, otp: string): Promise<boolean> {
        const user = await this.userModel.findOne({ phoneNumber, otp });
        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return false; 
        }
        return true;
    }

    async resetPassword(phoneNumber: string, newPassword: string) {
        const user = await this.userModel.findOne({ phoneNumber });
        if (!user) {
            throw new BadRequestException('Invalid or expired reset token');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        
        user.otp = null;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();
        return { message: 'Password reset successful' };
    }
    
    private setupUserCleanupTask() {
        
        cron.schedule('* * * * *', async () => {
            try {
                
                const unverifiedUsers = await this.userModel.find({
                    isAuthenticated: false,
                    createdAt: { $lt: new Date(Date.now() - 3 * 60 * 1000) }
                });

                
                await Promise.all(unverifiedUsers.map(async (user) => {
                    await this.userModel.findByIdAndDelete(user._id);
                    console.log(`Deleted unverified user: ${user._id}`);
                }));
            } catch (error) {
                console.error('Error occurred during user deletion:', error);
            }
        });
    }

    async deleteUser(userId: string): Promise<void> {
        try {
            await this.userModel.findByIdAndDelete(userId);
            console.log(`Deleted user with ID: ${userId}`);
        } catch (error) {
            throw new Error('Failed to delete user');
        }
    }
}
