export function collectionSchedulerId(publishRecordId: string): string {
  return `analytics-collect:${publishRecordId}`
}
