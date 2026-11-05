/** "5 NOV 2026": the date label shown on writing rows and post pages. */
export function postDateLabel(date: Date): string {
  return date
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .toUpperCase();
}
