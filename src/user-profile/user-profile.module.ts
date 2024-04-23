import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/user.schema';
import { userProfileSchema } from 'src/schemas/userProfile.schema';

@Module({
  imports:[MongooseModule.forFeature([{name:'Userprofile',schema: userProfileSchema},
  {name:'Users',schema:UserSchema}
])],
  providers: [UserProfileService],
  controllers: [UserProfileController]
})
export class UserProfileModule {}
