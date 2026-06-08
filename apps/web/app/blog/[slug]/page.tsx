import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { buildPageMetadata, buildBlogPostSchema, buildBreadcrumbSchema, buildFaqSchema } from "@/lib/seo";
import { getPostBySlug, getAllSlugs } from "@/lib/blog";

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return buildPageMetadata({ title: "Artículo no encontrado", description: "", canonicalPath: "/blog", index: false });
  return buildPageMetadata({
    title: post.title,
    description: post.description,
    canonicalPath: `/blog/${post.slug}`
  });
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Inicio", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` }
  ]);

  const articleSchema = buildBlogPostSchema({
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    path: `/blog/${post.slug}`
  });

  const faqSchema = post.faqs && post.faqs.length > 0
    ? buildFaqSchema(post.faqs)
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* Breadcrumb */}
      <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
        <Link href="/" className="hover:text-brand-700">Inicio</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-brand-700">Blog</Link>
        <span>/</span>
        <span className="text-slate-600 line-clamp-1">{post.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-10 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {post.city && post.citySlug && post.provinceSlug && (
            <Link
              href={`/ar/${post.provinceSlug}/${post.citySlug}/colegios`}
              className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-brand-700 hover:bg-brand-100 transition-colors"
            >
              {post.city}
            </Link>
          )}
          <span className="text-xs text-slate-400">
            {new Date(post.publishedAt).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </span>
        </div>
        <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
          {post.title}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          {post.description}
        </p>
      </header>

      {/* Content */}
      <article
        className="prose prose-slate max-w-none
          prose-headings:font-display prose-headings:text-ink
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
          prose-p:leading-relaxed prose-p:text-slate-700
          prose-a:text-brand-700 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-ink
          prose-ol:text-slate-700 prose-ul:text-slate-700
          prose-li:leading-relaxed
          [&_.lead]:text-lg [&_.lead]:text-slate-600 [&_.lead]:leading-relaxed
          [&_.school-highlight]:rounded-2xl [&_.school-highlight]:border [&_.school-highlight]:border-brand-100 [&_.school-highlight]:bg-brand-50/40 [&_.school-highlight]:p-5 [&_.school-highlight]:my-4
          [&_.school-highlight_h3]:mt-0 [&_.school-highlight_h3]:mb-2 [&_.school-highlight_h3]:text-lg
          [&_.school-highlight_p]:mb-0 [&_.school-highlight_p]:text-sm [&_.school-highlight_p]:text-slate-600"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* FAQ section */}
      {post.faqs && post.faqs.length > 0 && (
        <section className="mt-12 space-y-4">
          <h2 className="font-display text-2xl text-ink">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {post.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-brand-100 bg-white px-5 py-4"
              >
                <summary className="cursor-pointer font-semibold text-ink list-none flex items-center justify-between gap-2">
                  {faq.question}
                  <span className="shrink-0 text-brand-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="mt-12 rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-8 space-y-4 text-center">
        <p className="font-display text-2xl text-ink">¿Buscás colegio en {post.city ?? "tu ciudad"}?</p>
        <p className="text-slate-600">Comparé perfiles, cuotas y reseñas de familias en Radar Educativo.</p>
        {post.citySlug && post.provinceSlug ? (
          <Link
            href={`/ar/${post.provinceSlug}/${post.citySlug}/colegios`}
            className="inline-block rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800 transition-colors"
          >
            Ver colegios en {post.city} →
          </Link>
        ) : (
          <Link
            href="/search"
            className="inline-block rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800 transition-colors"
          >
            Buscar colegios →
          </Link>
        )}
      </div>

      {/* Back to blog */}
      <div className="mt-8 text-center">
        <Link href="/blog" className="text-sm text-slate-400 hover:text-brand-700 transition-colors">
          ← Volver al blog
        </Link>
      </div>
    </div>
  );
}
