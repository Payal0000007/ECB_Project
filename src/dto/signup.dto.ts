import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator";

export class SignUpDto{
    @IsNotEmpty()
    readonly fullname:string; 

    @IsNotEmpty()
    @IsEmail()
    readonly email:string;
    @IsNotEmpty()
    readonly gender:string;
    @IsNotEmpty()
    readonly dob:string;

    readonly phoneNumber:string;

    @IsNotEmpty()
    @MinLength(8) 
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must meet complexity requirements',
  }) 
    readonly password:string;
    
}