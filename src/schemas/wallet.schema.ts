import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    timestamps:true,
})

export class Wallet{

    @Prop()
    availableFunds:number;

    @Prop()
    userId:string;

    @Prop()
    amount:number;

    @Prop()
    history:[];
}

export const walletSchemam= SchemaFactory.createForClass(Wallet);