import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/data-source';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ShoppingModule } from './modules/shopping/shopping.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), UserModule, AuthModule, CatalogModule, ShoppingModule, InventoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
