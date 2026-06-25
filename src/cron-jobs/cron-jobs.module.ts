import { Module } from '@nestjs/common';
import { CronJobsService } from './cron-jobs.service';
import { CronJobsController } from './cron-jobs.controller';

@Module({
  controllers: [CronJobsController],
  providers: [CronJobsService],
})
export class CronJobsModule { }
