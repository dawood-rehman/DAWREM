import AdminSectionShell from "@/components/admin/AdminSectionShell";

export default function AdminSectionsPage() {
  return (
    <AdminSectionShell
      title="Section Manager"
      description="Configure reusable homepage and campaign sections with scheduling and display controls."
      points={["Hero", "Product Grids", "Content Blocks"]}
    />
  );
}
