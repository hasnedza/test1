import type { ReactNode } from 'react';

export function LoadingState() {
  return (
    <div
      className="space-y-300"
      role="status"
      aria-busy="true"
      aria-label="Loading reports"
    >
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="h-14 animate-pulse rounded-lg bg-accent"
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  readonly title: string;
  readonly hint?: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-300 rounded-xl border border-dashed border-border bg-card/60 px-600 py-800 text-center">
      <p className="font-heading text-600">{title}</p>
      {hint && (
        <p className="max-w-md text-300 leading-300 text-muted-foreground">
          {hint}
        </p>
      )}
      {action && <div className="mt-200">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-300 rounded-lg border border-destructive/50 bg-destructive/10 px-400 py-300 text-foreground"
    >
      <div className="min-w-0 flex-1">
        <p className="text-300 font-semibold">The directory request failed</p>
        <p className="mt-100 text-200 leading-200 text-muted-foreground">
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md px-300 py-200 text-200 font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function ConfirmDelete({
  label,
  onConfirm,
  onCancel,
  pending,
}: {
  readonly label: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly pending?: boolean;
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={`Delete ${label}`}
      className="flex flex-wrap items-center gap-300 rounded-lg border border-destructive/50 bg-destructive/10 px-400 py-300 text-300"
    >
      <span className="min-w-0 flex-1">
        Delete <strong>{label}</strong>? This can’t be undone.
      </span>
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="h-9 rounded-md border border-border px-300 text-200 font-semibold disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={pending}
        className="h-9 rounded-md bg-destructive px-300 text-200 font-semibold text-destructive-foreground disabled:opacity-50"
      >
        {pending ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  );
}
