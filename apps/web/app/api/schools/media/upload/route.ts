import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { ensureSchoolOwnership, requireSchoolAdminSession } from "@/lib/auth/api-access";
import { canManageSchoolByProfileStatus } from "@/lib/school-permissions";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_GALLERY_UPLOAD = 12;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

type UploadKind = "logo" | "gallery";

function sanitizeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function extensionFromFile(file: File) {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/avif") return "avif";

  const candidate = file.name.split(".").at(-1)?.toLowerCase();
  if (!candidate) return "bin";
  return sanitizeFilename(candidate) || "bin";
}

async function uploadFileToSupabaseStorage(options: {
  file: File;
  schoolId: string;
  kind: UploadKind;
  publicBaseUrl: string;
}) {
  const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "eduadvisor-school-media";

  const ext = extensionFromFile(options.file);
  const baseName = sanitizeFilename(options.file.name.replace(/\.[^.]+$/, "")) || options.kind;
  const objectPath = `${options.schoolId}/${options.kind}/${Date.now()}-${randomUUID()}-${baseName}.${ext}`;
  const localFallbackRaw = process.env.MEDIA_UPLOAD_LOCAL_FALLBACK?.trim().toLowerCase();
  const localFallbackEnabled = localFallbackRaw !== "0" && localFallbackRaw !== "false";

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    if (!localFallbackEnabled) {
      return {
        ok: false as const,
        status: 500,
        message:
          "Storage no configurado. Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (y fallback local desactivado)."
      };
    }

    const cwd = process.cwd();
    const directWebPublicDir = path.resolve(cwd, "public");
    const monorepoWebPublicDir = path.resolve(cwd, "apps", "web", "public");
    const webPublicDir = existsSync(path.resolve(cwd, "app")) ? directWebPublicDir : monorepoWebPublicDir;
    const localFolder = path.join(webPublicDir, "uploads", "schools", options.schoolId, options.kind);
    const localFilename = `${Date.now()}-${randomUUID()}-${baseName}.${ext}`;
    const localPath = path.join(localFolder, localFilename);
    const fileBuffer = Buffer.from(await options.file.arrayBuffer());

    await mkdir(localFolder, { recursive: true });
    await writeFile(localPath, fileBuffer);

    return {
      ok: true as const,
      publicUrl: `${options.publicBaseUrl}/uploads/schools/${options.schoolId}/${options.kind}/${localFilename}`
    };
  }

  const endpoint = `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`;

  const fileBuffer = Buffer.from(await options.file.arrayBuffer());

  const uploadResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${supabaseServiceRoleKey}`,
      apikey: supabaseServiceRoleKey,
      "content-type": options.file.type || "application/octet-stream",
      "x-upsert": "true"
    },
    body: fileBuffer,
    cache: "no-store"
  });

  if (!uploadResponse.ok) {
    const details = await uploadResponse.text().catch(() => "");
    const normalizedDetails = details.slice(0, 300);
    return {
      ok: false as const,
      status: 502,
      message: normalizedDetails
        ? `No se pudo subir el archivo a Storage: ${normalizedDetails}`
        : "No se pudo subir el archivo a Storage."
    };
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
  return {
    ok: true as const,
    publicUrl
  };
}

function validateImageFile(file: File) {
  if (!allowedMimeTypes.has(file.type)) {
    return {
      ok: false as const,
      message: "Formato no permitido. Usá JPG, PNG, WEBP o AVIF."
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false as const,
      message: "El archivo supera el máximo de 8MB."
    };
  }

  return { ok: true as const };
}

export async function POST(request: NextRequest) {
  const auth = await requireSchoolAdminSession(request);
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const formData = await request.formData();
    const schoolId = String(formData.get("schoolId") ?? "").trim();
    const kindRaw = String(formData.get("kind") ?? "").trim().toLowerCase();
    const kind: UploadKind | null = kindRaw === "logo" || kindRaw === "gallery" ? (kindRaw as UploadKind) : null;

    if (!schoolId) {
      return NextResponse.json({ message: "schoolId es requerido." }, { status: 400 });
    }

    if (!kind) {
      return NextResponse.json({ message: "kind inválido. Debe ser logo o gallery." }, { status: 400 });
    }

    const ownership = ensureSchoolOwnership(auth.session, schoolId);
    if (!ownership.ok) {
      return ownership.response;
    }

    const dashboardResponse = await fetch(`${API_BASE}/v1/schools/id/${schoolId}/dashboard`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    const dashboardPayload = (await dashboardResponse.json().catch(() => null)) as
      | {
          school?: {
            profile?: {
              status?: "BASIC" | "CURATED" | "VERIFIED" | "PREMIUM";
            };
            billing?: {
              entitlements?: {
                canAccessPriorityPlacement?: boolean;
              };
            };
          };
        }
      | null;

    const profileStatus = dashboardPayload?.school?.profile?.status ?? null;
    const canAccessPriorityPlacement = Boolean(dashboardPayload?.school?.billing?.entitlements?.canAccessPriorityPlacement);
    if (!dashboardResponse.ok || !canManageSchoolByProfileStatus(profileStatus)) {
      return NextResponse.json(
        {
          message: "El perfil debe estar verificado para gestionar contenidos."
        },
        { status: 403 }
      );
    }

    if (!canAccessPriorityPlacement) {
      return NextResponse.json(
        {
          message: "La carga de logo e imágenes está disponible solo para colegios con Premium activo."
        },
        { status: 403 }
      );
    }

    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ message: "Debes seleccionar al menos un archivo." }, { status: 400 });
    }

    const publicBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ||
      process.env.APP_URL?.trim().replace(/\/+$/, "") ||
      request.nextUrl.origin;

    if (kind === "logo" && files.length !== 1) {
      return NextResponse.json({ message: "Para logo debes subir exactamente 1 archivo." }, { status: 400 });
    }

    if (kind === "gallery" && files.length > MAX_GALLERY_UPLOAD) {
      return NextResponse.json(
        { message: `Puedes subir hasta ${MAX_GALLERY_UPLOAD} imágenes por operación.` },
        { status: 400 }
      );
    }

    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.ok) {
        return NextResponse.json({ message: `${file.name}: ${validation.message}` }, { status: 400 });
      }
    }

    const uploadedUrls: string[] = [];
    for (const file of files) {
      const uploaded = await uploadFileToSupabaseStorage({ file, schoolId, kind, publicBaseUrl });
      if (!uploaded.ok) {
        return NextResponse.json({ message: uploaded.message }, { status: uploaded.status });
      }
      uploadedUrls.push(uploaded.publicUrl);
    }

    return NextResponse.json(
      {
        message:
          kind === "logo" ? "Logo subido correctamente. Guarda el perfil para publicarlo." : "Imágenes subidas correctamente.",
        urls: uploadedUrls
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        message: "No se pudo procesar la carga de archivos."
      },
      { status: 503 }
    );
  }
}
