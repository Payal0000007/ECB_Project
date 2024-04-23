import { Controller, Get, Param } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { Users } from 'src/schemas/user.schema';

@Controller('user-profile')
export class UserProfileController {
    constructor(private userprofileService:UserProfileService){}

    @Get(':id')
    async getprofileById(@Param('id')userId:string):Promise<Users|null>{
      const user=await this.userprofileService.findById(userId);
      return user;
    }
}
