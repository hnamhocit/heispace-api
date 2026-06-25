import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from './users/users.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';
import { CronJobsModule } from './cron_jobs/cron_jobs.module';
import { HealthModule } from './health/health.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { EventsModule } from './events/events.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuditLogsModule,
    MailModule,
    NotificationsModule,
    UploadsModule,
    CronJobsModule,
    HealthModule,
    ApiKeysModule,
    EventsModule,
    LogsModule
  ],
})
export class AppModule { }
