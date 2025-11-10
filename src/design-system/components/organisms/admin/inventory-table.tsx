'use client';
export function InventoryTable({ inventory }: { inventory: any[] }) {
  return <div>{inventory.length} items</div>;
}
