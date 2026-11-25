import {
  ArrowUpRight,
  BookOpen,
  LayoutGrid,
  Moon,
  Plus,
  Search,
  Sun,
  UsersRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import type { ReportEntryRecord } from '@rayfin-app/shared';
import { ConfirmDelete, EmptyState, ErrorState, LoadingState } from '@/components/states';
import { useCrud } from '@/components/useCrud';
import { ReportEntryForm } from '@/ReportEntryForm';
import { useAuth } from '@/hooks/auth.context';
import { useTheme } from '@/hooks/theme.context';
import {
  filterReportEntries,
  isDirectoryManager,
  normalizeHttpsUrl,
} from '@/lib/report-directory';
import { reportEntryApi } from '@/lib/report-entry-api';

type ReportEntryInput = Omit<ReportEntryRecord, 'id'>;

export function ReportDirectory() {
  const { session } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const canManage = isDirectoryManager(session?.user?.email);
  const crud = useCrud(reportEntryApi);
  const [search, setSearch] = useState('');
  const [selectedOrgApp, setSelectedOrgApp] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [formMode, setFormMode] = useState<
    { kind: 'create' } | { kind: 'edit'; entry: ReportEntryRecord } | null
  >(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const orgApps = useMemo(
    () =>
      [...new Set(crud.items.map((entry) => entry.orgApp))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [crud.items]
  );
  const audiences = useMemo(
    () =>
      [
        ...new Set(
          crud.items
            .filter(
              (entry) => !selectedOrgApp || entry.orgApp === selectedOrgApp
            )
            .map((entry) => entry.audienceName)
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [crud.items, selectedOrgApp]
  );
  const visibleEntries = useMemo(
    () =>
      filterReportEntries(
        crud.items,
        search,
        selectedOrgApp,
        selectedAudience
      ),
    [crud.items, search, selectedOrgApp, selectedAudience]
  );

  async function saveEntry(input: ReportEntryInput): Promise<boolean> {
    const saved =
      formMode?.kind === 'edit'
        ? await crud.update(formMode.entry.id, input)
        : await crud.create(input);
    if (saved) setFormMode(null);
    return saved;
  }

  async function deleteEntry(id: string) {
    if (await crud.remove(id)) setConfirmingDelete(null);
  }

  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border bg-card/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-400 px-400 py-300 md:px-700">
          <a
            href="#directory"
            className="flex items-center gap-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Report Directory home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <LayoutGrid className="icon-size-200" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-200 font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Fabric
              </span>
              <span className="block font-heading text-400 leading-400">
                Report Directory
              </span>
            </span>
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? (
              <Sun className="icon-size-200" aria-hidden="true" />
            ) : (
              <Moon className="icon-size-200" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      <main
        id="directory"
        className="mx-auto max-w-7xl px-400 py-700 md:px-700 md:py-800"
      >
        <section className="mb-700 grid gap-500 border-b border-border pb-700 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-300 flex items-center gap-200 text-200 font-semibold uppercase tracking-[0.16em] text-primary">
              <BookOpen className="icon-size-100" aria-hidden="true" />
              A shared index for your team
            </p>
            <h1 className="font-heading text-hero-900 leading-hero-900 tracking-tight">
              Find the report.
            </h1>
            <p className="mt-300 max-w-2xl text-400 leading-500 text-muted-foreground">
              Search reports by name, Org App, Audience, description, or
              keyword. Open the Fabric report or its connected Audience
              directly.
            </p>
          </div>
          {canManage && (
            <button
              type="button"
              onClick={() => setFormMode({ kind: 'create' })}
              disabled={crud.pending}
              className="inline-flex h-10 items-center justify-center gap-200 self-start rounded-lg bg-primary px-400 text-300 font-semibold text-primary-foreground shadow-4 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 lg:self-end"
            >
              <Plus className="icon-size-200" aria-hidden="true" />
              Add report
            </button>
          )}
        </section>

        <div className="mb-500 flex flex-col gap-300 lg:flex-row lg:items-end">
          <label className="min-w-0 flex-1 text-200 font-semibold">
            Search directory
            <span className="relative mt-100 block">
              <Search
                className="pointer-events-none absolute left-300 top-1/2 icon-size-200 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Try a report name, topic, or keyword"
                aria-label="Search reports"
                className="h-11 w-full rounded-lg border border-input bg-card pl-800 pr-300 text-300 font-normal text-foreground shadow-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </span>
          </label>
          <label className="w-full text-200 font-semibold lg:max-w-64">
            Audience
            <select
              value={selectedAudience}
              onChange={(event) => setSelectedAudience(event.target.value)}
              className="mt-100 h-11 w-full rounded-lg border border-input bg-card px-300 text-300 font-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Audiences</option>
              {audiences.map((audience) => (
                <option key={audience} value={audience}>
                  {audience}
                </option>
              ))}
            </select>
          </label>
        </div>

        {formMode && canManage && (
          <div className="mb-600">
            <ReportEntryForm
              key={
                formMode.kind === 'edit' ? formMode.entry.id : 'new-report'
              }
              entry={formMode.kind === 'edit' ? formMode.entry : undefined}
              pending={crud.pending}
              operationError={crud.error}
              onSave={saveEntry}
              onCancel={() => {
                crud.clearError();
                setFormMode(null);
              }}
            />
          </div>
        )}

        {crud.error && crud.status !== 'error' && !formMode && (
          <div className="mb-400">
            <ErrorState message={crud.error} onRetry={crud.clearError} />
          </div>
        )}

        <div className="grid gap-500 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside
            aria-label="Org App categories"
            className="rounded-xl border border-border bg-card p-400"
          >
            <h2 className="mb-300 text-200 font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Org Apps
            </h2>
            <nav className="flex gap-200 overflow-x-auto lg:flex-col">
              <button
                type="button"
                onClick={() => setSelectedOrgApp('')}
                aria-pressed={!selectedOrgApp}
                className={`shrink-0 rounded-lg px-300 py-200 text-left text-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  !selectedOrgApp
                    ? 'bg-accent font-semibold text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                All Org Apps
                <span className="ml-200 text-200 text-muted-foreground">
                  {crud.status === 'ready' ? crud.items.length : '…'}
                </span>
              </button>
              {orgApps.map((orgApp) => {
                const count = crud.items.filter(
                  (entry) => entry.orgApp === orgApp
                ).length;
                const active = selectedOrgApp === orgApp;
                return (
                  <button
                    key={orgApp}
                    type="button"
                    onClick={() => setSelectedOrgApp(orgApp)}
                    aria-pressed={active}
                    className={`shrink-0 rounded-lg px-300 py-200 text-left text-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? 'bg-accent font-semibold text-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {orgApp}
                    <span className="ml-200 text-200 text-muted-foreground">
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <section aria-labelledby="results-heading" className="min-w-0">
            <div className="mb-300 flex flex-wrap items-center justify-between gap-200">
              <h2
                id="results-heading"
                className="font-heading text-500 leading-500"
              >
                {selectedOrgApp || 'All reports'}
              </h2>
              <p className="text-200 text-muted-foreground" aria-live="polite">
                {crud.status === 'ready'
                  ? `${visibleEntries.length} ${
                      visibleEntries.length === 1 ? 'report' : 'reports'
                    }`
                  : 'Loading directory'}
              </p>
            </div>

            {crud.status === 'loading' ? (
              <LoadingState />
            ) : crud.status === 'error' ? (
              <ErrorState message={crud.error ?? 'The directory could not be loaded.'} onRetry={crud.refresh} />
            ) : visibleEntries.length === 0 ? (
              <EmptyState
                title={
                  crud.items.length === 0
                    ? 'The directory is ready for its first report'
                    : 'No reports match those filters'
                }
                hint={
                  crud.items.length === 0
                    ? 'Add a report with its Org App category, Audience link, description, and keywords.'
                    : 'Try a different search, Org App, or Audience.'
                }
                action={
                  crud.items.length === 0 && canManage ? (
                    <button
                      type="button"
                      onClick={() => setFormMode({ kind: 'create' })}
                      className="inline-flex h-10 items-center gap-200 rounded-lg bg-primary px-400 text-300 font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Plus className="icon-size-200" aria-hidden="true" />
                      Add the first report
                    </button>
                  ) : crud.items.length === 0 ? (
                    <span className="text-200 text-muted-foreground">
                      A directory maintainer can add the first report.
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setSelectedOrgApp('');
                        setSelectedAudience('');
                      }}
                      className="rounded-md px-300 py-200 text-200 font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Clear filters
                    </button>
                  )
                }
              />
            ) : (
              <ul className="grid gap-300 xl:grid-cols-2">
                {visibleEntries.map((entry) => {
                  const audienceHref = normalizeHttpsUrl(entry.audienceUrl);
                  const reportHref = normalizeHttpsUrl(entry.reportUrl);
                  return (
                    <li key={entry.id}>
                      <article className="flex h-full flex-col rounded-xl border border-border bg-card p-500 shadow-2 transition-shadow hover:shadow-8">
                        <div className="mb-300 flex items-start justify-between gap-300">
                          <span className="inline-flex max-w-full items-center rounded-full bg-accent px-300 py-100 text-200 font-semibold text-accent-foreground">
                            <span className="truncate">{entry.orgApp}</span>
                          </span>
                          {canManage && (
                            <div className="flex shrink-0 gap-100">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormMode({ kind: 'edit', entry })
                                }
                                disabled={crud.pending}
                                className="rounded-md px-200 py-100 text-200 font-semibold text-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmingDelete(entry.id)
                                }
                                disabled={crud.pending}
                                className="rounded-md px-200 py-100 text-200 font-semibold text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        <h3 className="font-heading text-500 leading-500">
                          {entry.reportName}
                        </h3>
                        <p className="mt-200 line-clamp-3 text-300 leading-300 text-muted-foreground">
                          {entry.description}
                        </p>

                        <div className="mt-400 flex flex-wrap items-center gap-200 border-t border-border pt-300 text-200">
                          <UsersRound
                            className="icon-size-100 text-primary"
                            aria-hidden="true"
                          />
                          <span className="font-semibold">Audience</span>
                          {audienceHref ? (
                            <a
                              href={audienceHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-100 text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {entry.audienceName}
                              <ArrowUpRight
                                className="icon-size-100"
                                aria-hidden="true"
                              />
                            </a>
                          ) : (
                            <span className="text-destructive">
                              Invalid Audience URL
                            </span>
                          )}
                        </div>

                        {entry.keywords.trim() && (
                          <ul
                            aria-label="Keywords"
                            className="mt-300 flex flex-wrap gap-100"
                          >
                            {entry.keywords
                              .split(',')
                              .map((keyword) => keyword.trim())
                              .filter(Boolean)
                              .map((keyword) => (
                                <li
                                  key={keyword}
                                  className="rounded-md bg-muted px-200 py-100 text-200 text-muted-foreground"
                                >
                                  {keyword}
                                </li>
                              ))}
                          </ul>
                        )}

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-300 pt-500">
                          {reportHref ? (
                            <a
                              href={reportHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-10 items-center gap-200 rounded-lg bg-primary px-400 text-300 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              Open report
                              <ArrowUpRight
                                className="icon-size-200"
                                aria-hidden="true"
                              />
                            </a>
                          ) : (
                            <span className="text-200 text-destructive">
                              Invalid Report URL
                            </span>
                          )}
                        </div>

                        {confirmingDelete === entry.id && (
                          <div className="mt-300">
                            <ConfirmDelete
                              label={entry.reportName}
                              pending={crud.pending}
                              onCancel={() => setConfirmingDelete(null)}
                              onConfirm={() => {
                                void deleteEntry(entry.id);
                              }}
                            />
                          </div>
                        )}
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
