import { Schema, Prop, SchemaFactory} from "@nestjs/mongoose";


@Schema({
    timestamps:true,
})

export class userProfile{

    @Prop()
    fullname:string;

    @Prop()
    email:string;

    @Prop()
    phoneNumber:string;

    @Prop()
    dob:string;
}

export const userProfileSchema=SchemaFactory.createForClass(userProfile)