import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    newPassword: string;
}