import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AdminSectionShellProps {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  points?: string[];
}

export default function AdminSectionShell({
  title,
  description,
  primaryHref = "/admin/dashboard",
  primaryLabel = "Back To Dashboard",
  points = [],
}: AdminSectionShellProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-cormorant font-medium text-velour-black">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">{description}</p>
        </div>
        <Link href={primaryHref} className="btn-outline inline-flex items-center justify-center gap-2">
          {primaryLabel}
          <ArrowRight size={13} />
        </Link>
      </div>

      <section className="admin-card">
        <div className="grid gap-4 md:grid-cols-3">
          {(points.length ? points : ["Overview", "Controls", "Reporting"]).map((point) => (
            <div key={point} className="border border-gray-100 bg-gray-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Area</p>
              <p className="mt-2 font-cormorant text-xl font-medium text-velour-black">{point}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
