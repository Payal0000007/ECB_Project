import { Body, Controller, Delete, Get, InternalServerErrorException, NotFoundException, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from 'src/schemas/wallet.schema';
import { CreateWalletDto } from 'src/dto/wallet.dto';
import { VerifyTokenService } from 'src/verify-token/verify-token.service';

@Controller('wallet')
export class WalletController {
    constructor (private WalletService:WalletService){}

    // @Get(':id')
    // async getWalletById(@Param('id') id: string): Promise<Wallet> {
    //     try {
    //         const wallet = await this.WalletService.findById(id);
            
    //         if (!wallet) {
    //             throw new NotFoundException('Wallet not found');
    //         }

    //         return wallet;
    //     } catch (error) {
    //         throw new InternalServerErrorException('Error finding wallet by ID');
    //     }
    // }

    @Get(':id')
    @UseInterceptors(VerifyTokenService)
    async findById(@Param('id') id: string) {
        return this.WalletService.findById(id);
    }

    @Post()
    // @UseGuards(VerifyTokenService)
    @UseInterceptors(VerifyTokenService)
    async createWallet(
        @Body()
        wallet:CreateWalletDto
    ):Promise<Wallet>{
        return this.WalletService.create(wallet);
    }

    @Delete(':id')
    @UseInterceptors(VerifyTokenService)
    async deleteWallet(@Param('id') id: string): Promise<boolean> {
        try {
            return await this.WalletService.delete(id);
        } catch (error) {
            throw new InternalServerErrorException('Error deleting wallet');
        }
    }
    @Post('add-funds')
    async addFunds(@Body() data: { amount: number }) {
      const { amount } = data;
      // Create a PaymentIntent with Stripe
      const paymentIntent = await this.WalletService.createPaymentIntent(amount);
      return { clientSecret: paymentIntent.client_secret };
    }
}
