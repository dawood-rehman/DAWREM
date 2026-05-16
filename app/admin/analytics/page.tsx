import AdminSectionShell from "@/components/admin/AdminSectionShell";

export default function AdminAnalyticsPage() {
  return (
    <AdminSectionShell
      title="Analytics"
      description="Review sales, customer, product, and conversion performance from the admin dashboard."
      points={["Revenue", "Orders", "Customers"]}
    />
  );
}
