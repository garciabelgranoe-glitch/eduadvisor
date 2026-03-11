import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildNoIndexMetadata } from "@/lib/seo";
import { pickParam, type RawSearchParams } from "@/lib/query-params";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Acceso beta",
  description: "Acceso restringido para participantes de beta privada en EduAdvisor.",
  canonicalPath: "/beta-acceso"
});

interface BetaAccessPageProps {
  searchParams?: RawSearchParams;
}

function sanitizeNextPath(value: string | undefined) {
  if (!value) {
    return "/ingresar";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/ingresar";
  }

  return value;
}

function resolveReasonMessage(reason: string | undefined) {
  const normalized = (reason ?? "").trim().toLowerCase();

  if (normalized === "parent_not_invited") {
    return "Tu cuenta de familia aún no está habilitada para esta etapa privada.";
  }

  if (normalized === "school_not_invited") {
    return "Tu cuenta institucional todavía no está habilitada para la beta privada.";
  }

  if (normalized === "role_not_eligible") {
    return "Este rol no está habilitado para la beta privada en este momento.";
  }

  return "El acceso está temporalmente restringido a participantes invitados.";
}

export default function BetaAccessPage({ searchParams }: BetaAccessPageProps) {
  const nextPath = sanitizeNextPath(pickParam(searchParams?.next));
  const reasonMessage = resolveReasonMessage(pickParam(searchParams?.reason));

  return (
    <section className="space-y-5">
      <Card className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Beta Privada</p>
        <h1 className="font-display text-4xl text-ink">Acceso por invitación</h1>
        <p className="max-w-2xl text-sm text-slate-600">{reasonMessage}</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">Si eres familia</h2>
          <p className="text-sm text-slate-600">
            Mantén tu registro en EduAdvisor y te avisaremos cuando abramos más cupos para la beta.
          </p>
          <Button asChild>
            <Link href="/ingresar">Volver a ingresar</Link>
          </Button>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">Si representas un colegio</h2>
          <p className="text-sm text-slate-600">
            Puedes iniciar o actualizar tu claim para priorizar la habilitación de cuenta institucional.
          </p>
          <Button asChild variant="secondary">
            <Link href="/para-colegios?flow=claim">Gestionar claim</Link>
          </Button>
        </Card>
      </div>

      <Card className="space-y-2 text-sm text-slate-600">
        <p>
          Ruta solicitada: <span className="font-medium text-ink">{nextPath}</span>
        </p>
        <p>
          Si necesitas acceso inmediato, comparte esta ruta con el equipo de operaciones para incluir tu cuenta en la
          lista de invitaciones.
        </p>
      </Card>
    </section>
  );
}
