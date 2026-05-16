import Image from "next/image";
import { Instagram } from "lucide-react";

const posts = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=400&q=80",
  "https://images.unsplash.com/photo-1562572159-4efd90d578ff?w=400&q=80",
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
  "https://images.unsplash.com/photo-1546940901-2fd24c0c6c9e?w=400&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
];

interface InstagramGridProps {
  instagramUrl?: string;
}

function getInstagramHandle(url: string) {
  try {
    const username = new URL(url).pathname.split("/").filter(Boolean)[0];
    return username ? `@${username}` : "@dawrem.studio";
  } catch {
    return "@dawrem.studio";
  }
}

export default function InstagramGrid({ instagramUrl = "https://instagram.com" }: InstagramGridProps) {
  const handle = getInstagramHandle(instagramUrl);

  return (
    <section className="bg-ivory-50 py-14 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-12">
          <p className="section-subtitle">Follow Along</p>
          <h2 className="section-title mb-2">{handle}</h2>
          <p className="text-gray-400 text-sm font-inter">Share your look using #WearDawrem</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {posts.map((src, i) => (
            <a
              key={i}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden group block"
            >
              <Image src={src} alt={`Instagram post ${i + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" />
              <div className="absolute inset-0 bg-velour-black/0 group-hover:bg-velour-black/40 transition-all duration-300 flex items-center justify-center">
                <Instagram size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-velour-black hover:text-burgundy-900 transition-colors font-inter border-b border-velour-black/30 pb-0.5"
          >
            <Instagram size={14} />
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
