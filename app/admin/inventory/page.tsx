import AdminSectionShell from "@/components/admin/AdminSectionShell";

export default function AdminInventoryPage() {
  return (
    <AdminSectionShell
      title="Inventory"
      description="Monitor stock levels, low stock thresholds, product variants, and reorder priorities."
      points={["Low Stock", "Variants", "Replenishment"]}
    />
  );
}
