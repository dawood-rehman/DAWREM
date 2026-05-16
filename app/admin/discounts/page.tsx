import AdminSectionShell from "@/components/admin/AdminSectionShell";

export default function AdminDiscountsPage() {
  return (
    <AdminSectionShell
      title="Discounts"
      description="Manage coupon codes, minimum order values, usage limits, and active promotional rules."
      points={["Coupons", "Limits", "Eligibility"]}
    />
  );
}
