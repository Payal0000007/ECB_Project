import { Body, Controller, Get, InternalServerErrorException, NotFoundException, Param, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from 'src/schemas/wallet.schema';
import { CreateWalletDto } from 'src/dto/wallet.dto';

@Controller('wallet')
export class WalletController {
    constructor (private WalletService:WalletService){}

    @Get(':id')
    async getWalletById(@Param('id') id: string): Promise<Wallet> {
        try {
            const wallet = await this.WalletService.findById(id);
            
            if (!wallet) {
                throw new NotFoundException('Wallet not found');
            }

            return wallet;
        } catch (error) {
            throw new InternalServerErrorException('Error finding wallet by ID');
        }
    }

    @Post()
    async createWallet(
        @Body()
        wallet:CreateWalletDto
    ):Promise<Wallet>{
        return this.WalletService.create(wallet);
    }
}
