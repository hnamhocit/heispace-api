import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from './users/users.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';
import { CronJobsModule } from './cron-jobs/cron-jobs.module';
import { HealthModule } from './health/health.module';
import { minutes, seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: seconds(1),
        limit: 5,
      },
      {
        name: 'medium',
        ttl: minutes(1),
        limit: 100,
      },
      {
        name: 'long',
        ttl: minutes(15),
        limit: 1000,
      },
    ]),
    DatabaseModule,
    UsersModule,
    AuditLogsModule,
    MailModule,
    NotificationsModule,
    UploadsModule,
    CronJobsModule,
    HealthModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
