import {
  REPORT_DIRECTORY_ADMIN_EMAIL,
  type ReportEntryRecord,
} from '@rayfin-app/shared';

export function isDirectoryManager(email: string | null | undefined): boolean {
  return email?.trim().toLowerCase() === REPORT_DIRECTORY_ADMIN_EMAIL;
}

export function normalizeHttpsUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function filterReportEntries(
  entries: readonly ReportEntryRecord[],
  search: string,
  orgApp: string,
  audienceName: string
): ReportEntryRecord[] {
  const normalizedSearch = search.trim().toLowerCase();

  return entries
    .filter((entry) => {
      const matchesOrgApp = !orgApp || entry.orgApp === orgApp;
      const matchesAudience =
        !audienceName || entry.audienceName === audienceName;
      const searchableText = [
        entry.reportName,
        entry.orgApp,
        entry.audienceName,
        entry.description,
        entry.keywords,
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesOrgApp && matchesAudience && matchesSearch;
    })
    .sort(
      (left, right) =>
        left.orgApp.localeCompare(right.orgApp) ||
        left.reportName.localeCompare(right.reportName)
    );
}
