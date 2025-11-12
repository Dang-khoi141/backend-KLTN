import { Module, forwardRef } from '@nestjs/common';
import { PaymentMobileService } from './payment-mobile.service';
import { PaymentMobileController } from './payment-mobile.controller';
import { ConfigModule } from '@nestjs/config';
import { ShoppingModule } from '../shopping/shopping.module'; 
import { OrderService } from '../shopping/service/order.service';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => ShoppingModule),
  ],
  controllers: [PaymentMobileController],
  providers: [PaymentMobileService],
  exports: [PaymentMobileService],
})
export class PaymentMobileModule {}
