import type { ReportEntryRecord } from '@rayfin-app/shared';

import type { CrudApi } from '@/components/useCrud';
import { getRayfinClient } from '@/lib/rayfin-client';

const PAGE_SIZE = 100;
const REPORT_FIELDS = [
  'id',
  'reportName',
  'orgApp',
  'audienceName',
  'audienceUrl',
  'reportUrl',
  'description',
  'keywords',
] as const;

export const reportEntryApi: CrudApi<ReportEntryRecord> = {
  async list() {
    const client = await getRayfinClient();
    const firstPage = await client.data.ReportEntry
      .select(REPORT_FIELDS)
      .orderBy({ reportName: 'asc', id: 'asc' })
      .first(PAGE_SIZE)
      .executePaginated();
    const entries = [...firstPage.items];
    let page = firstPage;

    while (page.hasNextPage) {
      if (!page.endCursor) {
        throw new Error('The report list could not continue to the next page.');
      }
      page = await client.data.ReportEntry
        .select(REPORT_FIELDS)
        .orderBy({ reportName: 'asc', id: 'asc' })
        .first(PAGE_SIZE)
        .after(page.endCursor)
        .executePaginated();
      entries.push(...page.items);
    }

    return entries;
  },

  async create(input) {
    const client = await getRayfinClient();
    return client.data.ReportEntry.create(input);
  },

  async update(id, patch) {
    const client = await getRayfinClient();
    return client.data.ReportEntry.update({ id }, patch);
  },

  async remove(id) {
    const client = await getRayfinClient();
    await client.data.ReportEntry.delete({ id });
  },
};
