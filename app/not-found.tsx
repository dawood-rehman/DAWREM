import Link from "next/link";
import DawremLogo from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: "linear-gradient(135deg, #6B2737 0%, #1A1A1A 100%)" }}
    >
      <DawremLogo variant="light" size="md" />

      <div className="mt-16 mb-8">
        <p className="font-cormorant text-[140px] lg:text-[200px] text-ivory-50/10 font-light leading-none select-none">
          404
        </p>
        <div className="-mt-12 lg:-mt-16 relative z-10">
          <h1 className="font-cormorant text-3xl lg:text-5xl text-ivory-50 font-light mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-400 font-inter text-sm max-w-xs mx-auto">
            The page you&apos;re looking for has moved, or it never existed. Let&apos;s get you back to something beautiful.
          </p>
        </div>
      </div>

      <div className="w-12 h-px bg-gold-500 mb-10" />

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="bg-gold-500 text-velour-black px-8 py-3 text-xs tracking-widest uppercase font-inter font-medium hover:bg-gold-400 transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/shop"
          className="border border-ivory-50/30 text-ivory-50 px-8 py-3 text-xs tracking-widest uppercase font-inter hover:border-gold-400 hover:text-gold-400 transition-colors"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  );
}
