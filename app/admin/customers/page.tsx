import AdminSectionShell from "@/components/admin/AdminSectionShell";

export default function AdminCustomersPage() {
  return (
    <AdminSectionShell
      title="Customers"
      description="Review customer profiles, order history, account status, and loyalty activity."
      points={["Profiles", "Segments", "Loyalty"]}
    />
  );
}
