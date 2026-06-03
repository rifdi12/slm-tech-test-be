import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CustomersModule,
    InvoicesModule,
    DashboardModule,
  ],
})
export class AppModule {}
