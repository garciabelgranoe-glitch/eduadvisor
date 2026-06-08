import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";
import { ALL_POSTS } from "@/lib/blog";

export const metadata: Metadata = buildPageMetadata({
  title: "Blog de Radar Educativo — Guías para elegir colegio privado en Argentina",
  description: "Guías, comparativas y consejos para ayudarte a elegir el mejor colegio privado en tu ciudad. Información actualizada por ciudad y provincia.",
  canonicalPath: "/blog"
});

const categoryLabels: Record<string, string> = {
  ciudad: "Guía por ciudad",
  guia: "Guía general",
  comparativa: "Comparativa"
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-12">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-brand-700">Blog</p>
        <h1 className="font-display text-4xl text-ink">Guías para elegir colegio privado</h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          Información actualizada por ciudad para ayudarte a tomar la mejor decisión educativa para tu familia.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {ALL_POSTS.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}` as never} className="group block">
            <Card className="h-full space-y-3 border-brand-100 p-6 transition-shadow group-hover:shadow-md">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-brand-700">
                  {categoryLabels[post.category] ?? post.category}
                </span>
                {post.city && (
                  <span className="text-xs text-slate-400">{post.city}</span>
                )}
              </div>
              <h2 className="font-display text-xl text-ink leading-snug group-hover:text-brand-700 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                {post.description}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(post.publishedAt).toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
