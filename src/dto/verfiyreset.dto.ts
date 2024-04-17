import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyResetDto {
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    otp: string;
}