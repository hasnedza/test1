import { useState, type FormEvent } from 'react';
import type { ReportEntryRecord } from '@rayfin-app/shared';
import { X } from 'lucide-react';

import { normalizeHttpsUrl } from '@/lib/report-directory';

type ReportEntryInput = Omit<ReportEntryRecord, 'id'>;

const EMPTY_ENTRY: ReportEntryInput = {
  reportName: '',
  orgApp: '',
  audienceName: '',
  audienceUrl: '',
  reportUrl: '',
  description: '',
  keywords: '',
};

export function ReportEntryForm({
  entry,
  pending,
  operationError,
  onSave,
  onCancel,
}: {
  readonly entry?: ReportEntryRecord;
  readonly pending: boolean;
  readonly operationError: string | null;
  readonly onSave: (input: ReportEntryInput) => Promise<boolean>;
  readonly onCancel: () => void;
}) {
  const [values, setValues] = useState<ReportEntryInput>(() =>
    entry
      ? {
          reportName: entry.reportName,
          orgApp: entry.orgApp,
          audienceName: entry.audienceName,
          audienceUrl: entry.audienceUrl,
          reportUrl: entry.reportUrl,
          description: entry.description,
          keywords: entry.keywords,
        }
      : EMPTY_ENTRY
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  function updateField(field: keyof ReportEntryInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const audienceUrl = normalizeHttpsUrl(values.audienceUrl);
    const reportUrl = normalizeHttpsUrl(values.reportUrl);
    if (!audienceUrl || !reportUrl) {
      setValidationError('Enter a valid HTTPS URL for both Fabric links.');
      return;
    }

    const input: ReportEntryInput = {
      reportName: values.reportName.trim(),
      orgApp: values.orgApp.trim(),
      audienceName: values.audienceName.trim(),
      audienceUrl,
      reportUrl,
      description: values.description.trim(),
      keywords: values.keywords.trim(),
    };
    if (
      !input.reportName ||
      !input.orgApp ||
      !input.audienceName ||
      !input.description
    ) {
      setValidationError('Complete the required fields before saving.');
      return;
    }

    setValidationError(null);
    await onSave(input);
  }

  return (
    <section
      aria-labelledby="entry-form-title"
      className="rounded-xl border border-border bg-card p-500 shadow-4"
    >
      <div className="mb-500 flex items-start justify-between gap-400">
        <div>
          <p className="text-200 font-semibold uppercase tracking-[0.12em] text-primary">
            Directory management
          </p>
          <h2
            id="entry-form-title"
            className="mt-100 font-heading text-600 leading-600"
          >
            {entry ? 'Edit report entry' : 'Add a report'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          aria-label="Close form"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <X className="icon-size-200" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={submit} className="space-y-400">
        <div className="grid gap-400 md:grid-cols-2">
          <label className="space-y-100 text-200 font-medium">
            Report name
            <input
              autoFocus
              required
              maxLength={200}
              value={values.reportName}
              onChange={(event) => updateField('reportName', event.target.value)}
              className="mt-100 h-10 w-full rounded-lg border border-input bg-background px-300 text-300 font-normal text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="space-y-100 text-200 font-medium">
            Org App
            <input
              required
              maxLength={120}
              value={values.orgApp}
              onChange={(event) => updateField('orgApp', event.target.value)}
              className="mt-100 h-10 w-full rounded-lg border border-input bg-background px-300 text-300 font-normal text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="space-y-100 text-200 font-medium">
            Audience name
            <input
              required
              maxLength={200}
              value={values.audienceName}
              onChange={(event) => updateField('audienceName', event.target.value)}
              className="mt-100 h-10 w-full rounded-lg border border-input bg-background px-300 text-300 font-normal text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="space-y-100 text-200 font-medium">
            Audience URL
            <input
              required
              type="url"
              maxLength={2048}
              value={values.audienceUrl}
              onChange={(event) => updateField('audienceUrl', event.target.value)}
              placeholder="https://app.fabric.microsoft.com/..."
              className="mt-100 h-10 w-full rounded-lg border border-input bg-background px-300 text-300 font-normal text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="space-y-100 text-200 font-medium md:col-span-2">
            Report URL
            <input
              required
              type="url"
              maxLength={2048}
              value={values.reportUrl}
              onChange={(event) => updateField('reportUrl', event.target.value)}
              placeholder="https://app.fabric.microsoft.com/..."
              className="mt-100 h-10 w-full rounded-lg border border-input bg-background px-300 text-300 font-normal text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="space-y-100 text-200 font-medium md:col-span-2">
            Description
            <textarea
              required
              maxLength={2000}
              rows={3}
              value={values.description}
              onChange={(event) => updateField('description', event.target.value)}
              className="mt-100 w-full resize-y rounded-lg border border-input bg-background px-300 py-200 text-300 font-normal text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="space-y-100 text-200 font-medium md:col-span-2">
            Keywords
            <input
              maxLength={800}
              value={values.keywords}
              onChange={(event) => updateField('keywords', event.target.value)}
              placeholder="Separate keywords with commas"
              className="mt-100 h-10 w-full rounded-lg border border-input bg-background px-300 text-300 font-normal text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>

        {(validationError || operationError) && (
          <p role="alert" className="text-200 text-destructive">
            {validationError ?? operationError}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-300 border-t border-border pt-400">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="h-10 rounded-lg border border-border px-400 text-300 font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-lg bg-primary px-500 text-300 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {pending ? 'Saving…' : entry ? 'Save changes' : 'Add report'}
          </button>
        </div>
      </form>
    </section>
  );
}
