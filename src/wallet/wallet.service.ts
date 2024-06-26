import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet } from 'src/schemas/wallet.schema';
import mongoose from 'mongoose';
import Stripe from 'stripe';

@Injectable()
export class WalletService {
    private readonly stripe: Stripe;
    constructor(
          @InjectModel(Wallet.name)
          private walletModel:mongoose.Model<Wallet>,
                  
    ){
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            // apiVersion: '2024-04-10',
        });
    }
    async createPaymentIntent(amount: number) {
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: amount * 100, 
          currency: 'usd',
         
        });
        return paymentIntent;
      }

    async findById(id: string): Promise<Wallet> {
        try {
            const wallet = await this.walletModel.findOne({userId:id});
            console.log(wallet);
            
            return wallet;
        } catch (error) {
            throw new NotFoundException('Wallet not found');
        }
    } 
    
        async create(wallet: Wallet): Promise<Wallet> {
        try {
            const existingWallet = await this.walletModel.findOne({ userId: wallet.userId });
            
            if (existingWallet) {
                const availableFunds = existingWallet.availableFunds + Number(wallet.amount);

                const updatedWallet = await this.walletModel.findByIdAndUpdate(
                    { _id: existingWallet._id },
                    { $set: { availableFunds: availableFunds }, $push: { history: { amount: Number(wallet.amount) } } },
                    { new: true } 
                );
                return updatedWallet;
            } else {
                
                const { amount, ...newWalletWithoutAmount } = wallet;
                const newWallet = await this.walletModel.create({ ...newWalletWithoutAmount, history: [{ amount: Number(wallet.amount) }], availableFunds: Number(wallet.amount) });
                return newWallet;
            }
        } catch (err) {
            console.log(err);
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const deletedWallet = await this.walletModel.findByIdAndDelete(id);
            if (!deletedWallet) {
                throw new NotFoundException('Wallet not found');
            }
            return true;
        } catch (err) {
            console.log(err);
            throw new Error('Error deleting wallet');
        }
    }
}
