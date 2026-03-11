import type { Metadata } from "next";
import Link from "next/link";
import { SchoolClaimStatusChecker } from "@/components/auth/school-claim-status-checker";
import { SchoolLoginSelector } from "@/components/auth/school-login-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getAdminSchools } from "@/lib/api";
import { resolveLaunchMode } from "@/lib/beta/launch-mode";
import { SESSION_ROLE_PARENT, SESSION_ROLE_SCHOOL } from "@/lib/auth/session";
import { pickParam, type RawSearchParams } from "@/lib/query-params";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Ingresar",
  description: "Selecciona el tipo de cuenta para continuar en EduAdvisor.",
  canonicalPath: "/ingresar"
});

interface SignInPageProps {
  searchParams?: RawSearchParams;
}

function sanitizeNextPath(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  return value;
}

function isAllowedParentNextPath(value: string | undefined) {
  if (!value) {
    return false;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return false;
  }

  if (
    value.startsWith("/api") ||
    value.startsWith("/admin") ||
    value.startsWith("/ingresar") ||
    value.startsWith("/school-dashboard")
  ) {
    return false;
  }

  return true;
}

function resolveErrorMessage(code: string | undefined) {
  if (!code) {
    return null;
  }

  if (code === "role") {
    return "Selecciona un tipo de cuenta válido.";
  }

  if (code === "email") {
    return "Ingresá un email válido para iniciar sesión.";
  }

  if (code === "school") {
    return "Seleccioná un colegio para acceder como cuenta institucional.";
  }

  if (code === "code") {
    return "El código de acceso no es válido.";
  }

  if (code === "credentials") {
    return "No se pudo validar tus credenciales para ese rol.";
  }

  if (code === "session") {
    return "No se pudo crear tu sesión. Intenta nuevamente.";
  }

  if (code === "google_unavailable") {
    return "El acceso con Google no está configurado en este entorno.";
  }

  if (code === "google_denied") {
    return "Cancelaste la autorización con Google.";
  }

  if (code === "google_state") {
    return "No pudimos validar tu sesión de Google. Intenta nuevamente.";
  }

  if (code === "google_token" || code === "google_profile" || code === "google_email") {
    return "No pudimos validar tu cuenta de Google. Intenta nuevamente.";
  }

  if (code === "school_not_verified") {
    return "El colegio todavía no tiene verificación activa para ingresar al dashboard.";
  }

  if (code === "claim_required") {
    return "Esta cuenta no tiene un claim aprobado para ese colegio.";
  }

  if (code === "claim_pending") {
    return "Tu claim está pendiente o en revisión. Te notificaremos por email.";
  }

  if (code === "claim_rejected") {
    return "El claim fue rechazado. Puedes iniciar una nueva solicitud.";
  }

  if (code === "admin_code") {
    return "No pudimos validar tus credenciales de acceso admin.";
  }

  if (code === "admin_email") {
    return "Ingresa un email admin válido para continuar.";
  }

  if (code === "admin_unavailable") {
    return "No hay configuración de acceso admin para este entorno.";
  }

  if (code === "admin_not_allowed") {
    return "Tu cuenta de Google no está autorizada para ingresar al panel admin.";
  }

  if (code === "admin_use_google") {
    return "El acceso admin ahora requiere verificación de identidad con Google.";
  }

  if (code === "rate_limit") {
    return "Detectamos demasiados intentos. Espera unos minutos antes de volver a intentarlo.";
  }

  return "No se pudo iniciar sesión.";
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const requestedNext = sanitizeNextPath(pickParam(searchParams?.next));
  const adminModeParam = pickParam(searchParams?.admin);
  const errorCode = pickParam(searchParams?.error);
  const errorMessage = resolveErrorMessage(errorCode);
  const showAdminAccess = requestedNext?.startsWith("/admin") || adminModeParam === "1";
  const launchMode = resolveLaunchMode();
  const googleAuthEnabled = Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() && process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim()
  );
  const isLocalRuntime = ["development", "test"].includes(process.env.NODE_ENV ?? "development");
  const parentNextPath = isAllowedParentNextPath(requestedNext) ? requestedNext! : "/parent-dashboard";
  const parentGoogleStartPath = `/api/session/google/start?next=${encodeURIComponent(parentNextPath)}`;
  const adminNextPath = requestedNext?.startsWith("/admin") ? requestedNext : "/admin";
  const adminGoogleStartPath = `/api/session/google/start?intent=admin&next=${encodeURIComponent(adminNextPath)}`;
  const adminSharedCodeEnabled = isLocalRuntime && Boolean(process.env.ADMIN_CONSOLE_TOKEN?.trim());

  const schoolsResponse = await getAdminSchools({
    status: "active",
    page: "1",
    limit: "100",
    sortBy: "name",
    sortOrder: "asc"
  });
  const schoolOptions = schoolsResponse.items.map((school) => ({
    id: school.id,
    slug: school.slug,
    name: school.name,
    city: school.city,
    province: school.province
  }));

  return (
    <section className="space-y-5">
      <Card className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Acceso</p>
        <h1 className="font-display text-4xl text-ink">Ingresar a tu espacio</h1>
        <p className="max-w-2xl text-slate-600">
          Acceso segmentado por rol para familias y colegios. El acceso admin permanece privado para el equipo
          interno.
        </p>
        <p className="text-xs text-slate-500">Modo de lanzamiento actual: {launchMode}</p>
        {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-ink">Familias</h2>
          <p className="text-sm text-slate-600">
            Acceso simple con Google para guardar favoritos, comparaciones y alertas en una sola cuenta.
          </p>
          {launchMode === "PRIVATE" ? (
            <p className="text-xs text-amber-700">Durante beta privada, el acceso de familias es por invitación.</p>
          ) : null}
          {googleAuthEnabled ? (
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href={parentGoogleStartPath as never}>Entrar con Google</Link>
              </Button>
              <p className="text-xs text-slate-500">
                Si no redirige automáticamente, usa este acceso directo:
                {" "}
                <a href={parentGoogleStartPath} className="font-medium text-brand-700 underline underline-offset-2">
                  abrir login de Google
                </a>
              </p>
            </div>
          ) : (
            <Button disabled>Google no configurado</Button>
          )}
          {!googleAuthEnabled ? (
            <p className="text-xs text-slate-500">
              Configura `GOOGLE_OAUTH_CLIENT_ID` y `GOOGLE_OAUTH_CLIENT_SECRET` para habilitar este acceso.
            </p>
          ) : null}
          <div className="space-y-3 rounded-xl border border-brand-100 bg-brand-50/30 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-700">Alternativa por email</p>
            <form action="/api/session/role" method="post" className="space-y-3">
              <input type="hidden" name="role" value={SESSION_ROLE_PARENT} />
              <input type="hidden" name="next" value={parentNextPath} />
              <FormField label="Tu email">
                <Input type="email" name="email" required placeholder="tuemail@gmail.com" />
              </FormField>
              <Button type="submit" variant="ghost">
                Continuar con email
              </Button>
            </form>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-ink">Colegios</h2>
          <p className="text-sm text-slate-600">
            Acceso exclusivo para cuentas verificadas con claim aprobado por EduAdvisor.
          </p>
          {launchMode !== "OPEN" ? (
            <p className="text-xs text-amber-700">
              Durante esta etapa, el dashboard de colegios se habilita solo para cuentas invitadas.
            </p>
          ) : null}
          <form action="/api/session/role" method="post" className="space-y-3">
            <input type="hidden" name="role" value={SESSION_ROLE_SCHOOL} />
            <input
              type="hidden"
              name="next"
              value={requestedNext?.startsWith("/school-dashboard") ? requestedNext : "/school-dashboard"}
            />

            <FormField label="Email institucional">
              <Input type="email" name="email" required placeholder="direccion@colegio.edu.ar" />
            </FormField>

            <SchoolLoginSelector schools={schoolOptions} />

            <FormField label="Código de acceso">
              <Input type="password" name="accessCode" placeholder="Opcional según configuración" />
            </FormField>

            <Button type="submit" disabled={schoolOptions.length === 0}>
              Entrar como colegio
            </Button>
          </form>
          <div className="rounded-xl border border-brand-100 bg-brand-50/30 p-3 text-sm text-slate-700">
            ¿Aún no tienes cuenta verificada?
            <div className="mt-2">
              <Button asChild variant="secondary">
                <Link href="/para-colegios?flow=claim">Iniciar claim de colegio</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <SchoolClaimStatusChecker schools={schoolOptions} />

      {showAdminAccess ? (
        <Card className="space-y-4 border-amber-200 bg-amber-50/60">
          <h2 className="text-xl font-semibold text-ink">Acceso Admin</h2>
          <p className="text-sm text-slate-700">
            Acceso interno para equipo de plataforma. En producción se valida identidad con Google y allowlist de
            emails admin.
          </p>
          {googleAuthEnabled ? (
            <Button asChild>
              <Link href={adminGoogleStartPath as never}>Ingresar con Google (Admin)</Link>
            </Button>
          ) : (
            <Button disabled>Google no configurado para admin</Button>
          )}
          {!googleAuthEnabled ? (
            <p className="text-xs text-slate-600">
              Configura `GOOGLE_OAUTH_CLIENT_ID` y `GOOGLE_OAUTH_CLIENT_SECRET` para habilitar acceso admin por
              identidad.
            </p>
          ) : null}
          {adminSharedCodeEnabled ? (
            <div className="space-y-3 rounded-xl border border-amber-200 bg-white/70 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-amber-700">Fallback local (dev/test)</p>
              <form action="/api/session/admin" method="post" className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input type="hidden" name="next" value={adminNextPath} />
                <div className="space-y-3">
                  <FormField label="Email admin">
                    <Input type="email" name="email" required placeholder="admin@eduadvisor.com" />
                  </FormField>
                  <FormField label="Código de acceso admin">
                    <Input type="password" name="accessCode" required placeholder="Solo local" />
                  </FormField>
                </div>
                <div className="flex items-end md:pb-0.5">
                  <Button type="submit" variant="ghost">Entrar con fallback local</Button>
                </div>
              </form>
            </div>
          ) : null}
        </Card>
      ) : null}
    </section>
  );
}
