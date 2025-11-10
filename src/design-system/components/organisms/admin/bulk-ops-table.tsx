'use client';
export function BulkOpsTable({ operations }: { operations: any[] }) {
  return <div>{operations.length} operations</div>;
}
