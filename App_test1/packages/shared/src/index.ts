/**
 * Browser-safe contracts shared by the data registration package and frontend.
 */
export const REPORT_DIRECTORY_ADMIN_EMAIL =
  'nurhasnedza.radzali@asia1health.com';

export interface ReportEntryRecord {
  id: string;
  reportName: string;
  orgApp: string;
  audienceName: string;
  audienceUrl: string;
  reportUrl: string;
  description: string;
  keywords: string;
}

export type UniversalAppSchema = {
  ReportEntry: ReportEntryRecord;
};
