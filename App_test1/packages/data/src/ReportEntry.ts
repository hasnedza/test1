import {
  entity,
  role,
  text,
  uuid,
} from '@microsoft/rayfin-core';
import { REPORT_DIRECTORY_ADMIN_EMAIL } from '@rayfin-app/shared';

@entity()
@role('authenticated', 'read')
@role('authenticated', ['create', 'update', 'delete'], {
  policy: (claims) => claims.email.eq(REPORT_DIRECTORY_ADMIN_EMAIL),
})
export class ReportEntry {
  @uuid() id!: string;
  @text({ min: 1, max: 200 }) reportName!: string;
  @text({ min: 1, max: 120 }) orgApp!: string;
  @text({ min: 1, max: 200 }) audienceName!: string;
  @text({ min: 1, max: 2048 }) audienceUrl!: string;
  @text({ min: 1, max: 2048 }) reportUrl!: string;
  @text({ min: 1, max: 2000 }) description!: string;
  @text({ max: 800 }) keywords!: string;
}
