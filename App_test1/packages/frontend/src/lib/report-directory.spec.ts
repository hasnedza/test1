import { describe, expect, it } from 'vitest';

import type { ReportEntryRecord } from '@rayfin-app/shared';
import { REPORT_DIRECTORY_ADMIN_EMAIL } from '@rayfin-app/shared';
import {
  filterReportEntries,
  isDirectoryManager,
  normalizeHttpsUrl,
} from './report-directory';

const entries: ReportEntryRecord[] = [
  {
    id: 'report-1',
    reportName: 'Quarterly Revenue',
    orgApp: 'Finance',
    audienceName: 'Finance Leaders',
    audienceUrl: 'https://app.fabric.microsoft.com/audience/finance',
    reportUrl: 'https://app.fabric.microsoft.com/reports/revenue',
    description: 'Revenue trends and regional performance.',
    keywords: 'revenue, sales, quarterly',
  },
  {
    id: 'report-2',
    reportName: 'Service Quality',
    orgApp: 'Operations',
    audienceName: 'Operations Managers',
    audienceUrl: 'https://app.fabric.microsoft.com/audience/operations',
    reportUrl: 'https://app.fabric.microsoft.com/reports/service',
    description: 'Service levels and response times.',
    keywords: 'support, SLA',
  },
];

describe('report directory helpers', () => {
  it('searches report names, descriptions, Org Apps, Audiences, and keywords', () => {
    expect(filterReportEntries(entries, 'QUARTERLY', '', '')).toHaveLength(1);
    expect(filterReportEntries(entries, 'response times', '', '')[0]?.id).toBe(
      'report-2'
    );
    expect(filterReportEntries(entries, 'finance leaders', '', '')[0]?.id).toBe(
      'report-1'
    );
    expect(filterReportEntries(entries, 'sla', '', '')[0]?.id).toBe('report-2');
  });

  it('combines Org App and Audience filters', () => {
    expect(
      filterReportEntries(entries, '', 'Finance', 'Operations Managers')
    ).toEqual([]);
    expect(
      filterReportEntries(entries, '', 'Finance', 'Finance Leaders').map(
        (entry) => entry.id
      )
    ).toEqual(['report-1']);
  });

  it('recognizes only the configured manager email', () => {
    expect(
      isDirectoryManager(` ${REPORT_DIRECTORY_ADMIN_EMAIL.toUpperCase()} `)
    ).toBe(true);
    expect(isDirectoryManager('someone-else@example.com')).toBe(false);
    expect(isDirectoryManager(undefined)).toBe(false);
  });

  it('accepts HTTPS links and rejects invalid or non-HTTPS URLs', () => {
    expect(normalizeHttpsUrl('https://app.fabric.microsoft.com/report')).toBe(
      'https://app.fabric.microsoft.com/report'
    );
    expect(normalizeHttpsUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeHttpsUrl('not a url')).toBeNull();
  });
});
