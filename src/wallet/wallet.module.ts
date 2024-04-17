import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, walletSchemam } from 'src/schemas/wallet.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{name:Wallet.name,schema:walletSchemam}])
  ],
  providers: [WalletService],
  controllers: [WalletController]
})
export class WalletModule {}
