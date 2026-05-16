import { Shield, Truck, RefreshCw, Phone } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Premium Quality",
    desc: "Finest fabrics, meticulous stitching",
  },
  {
    icon: Truck,
    title: "Free Delivery",
    desc: "On orders over PKR 5,000",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    desc: "14-day hassle-free returns",
  },
  {
    icon: Phone,
    title: "24/7 Support",
    desc: "Always here to help you",
  },
];

export default function BrandValues() {
  return (
    <section className="bg-velour-black py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="group flex min-w-0 items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center border border-gold-500/30 group-hover:border-gold-500 transition-colors flex-shrink-0">
                <v.icon size={18} className="text-gold-400" />
              </div>
              <div className="min-w-0">
                <p className="text-ivory-50 text-xs tracking-wider uppercase font-inter font-medium">
                  {v.title}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
