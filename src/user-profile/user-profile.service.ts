import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from 'src/schemas/user.schema';
import mongoose from 'mongoose';

@Injectable()
export class UserProfileService {
    constructor(
        @InjectModel(Users.name)
        private userModel:mongoose.Model<Users>
    ){}
 
    async findById(userId):Promise<Users|null>{
        const user=await this.userModel.findOne({
          _id:userId 
        })
        .select('fullname  email phoneNumber dob')
        .exec();
        if(!user){
            return null;
        }
       
        return user;
    }
}
