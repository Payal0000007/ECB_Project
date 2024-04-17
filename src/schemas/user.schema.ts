import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator";
import { Document } from 'mongoose';

enum Gender {
    Male = 'male',
    Female = 'female',
    Other = 'other'
}

@Schema({
    timestamps:true
})
export class Users extends Document {

    @Prop({required:true})
    @IsNotEmpty()
    fullname: string;

    @Prop({ required: true, unique: true , lowercase:true })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Prop({required:true,enum: Gender})
    @IsNotEmpty()
    gender:Gender;

    @Prop({required:true})
    @IsNotEmpty()
    dob:string;

    @Prop({required:true})
    phoneNumber:string;

    @Prop({required:true})
    @IsNotEmpty()
    @MinLength(8) 
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must meet complexity requirements',
  }) 
    password:string;

    @Prop({required:true})
    @IsNotEmpty()
    @MinLength(8) 
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'confirm password is not matched',
    })
    confirmpassword:string;

    @Prop()
    otp: string;

    @Prop()
    resetToken: string;

    @Prop()
    resetTokenExpiry: Date;

    @Prop({default:false})
    isAuthenticated: boolean;

    @Prop({ default: Date.now }) 
    createdAt: Date;

}

export const UserSchema = SchemaFactory.createForClass(Users);
