import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core/constants';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from './db/data-source';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ShoppingModule } from './modules/shopping/shopping.module';
import { UserModule } from './modules/user/user.module';
import { TransformInterceptor } from './modules/common/interceptors/message-response.interceptor';
import { OtpModule } from './modules/auth/otp/otp.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { UploadModule } from './modules/uploads/upload.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AddressModule } from './modules/address/address.module';
import { PromotionController } from './modules/promotion/promotion.controller';
import { PromotionModule } from './modules/promotion/promotion.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    UserModule,
    AuthModule,
    ShoppingModule,
    InventoryModule,
    OtpModule,
    CatalogModule,
    UploadModule,
    PaymentModule,
    AddressModule,
    PromotionModule,
  ],
  controllers: [AppController, PromotionController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
