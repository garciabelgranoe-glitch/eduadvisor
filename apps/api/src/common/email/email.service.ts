import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: Resend | null;
  private readonly fromDomain: string;
  private readonly enabled: boolean;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    this.fromDomain = process.env.RESEND_FROM_DOMAIN?.trim() || "radareducativo.com";
    this.enabled = Boolean(apiKey);
    this.client = apiKey ? new Resend(apiKey) : null;

    if (!this.enabled) {
      this.logger.warn("RESEND_API_KEY not set — emails disabled");
    }
  }

  // ─── Notificación a colegio: nuevo lead ────────────────────────────────────

  async sendNewLeadNotification(input: {
    schoolEmail: string;
    schoolName: string;
    parentName: string;
    parentEmail: string;
    parentPhone?: string | null;
    message?: string | null;
  }) {
    return this.send({
      to: input.schoolEmail,
      subject: `Nuevo contacto interesado en ${input.schoolName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <div style="background: #0f4c3a; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Nuevo contacto desde Radar Educativo</h1>
          </div>
          <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0 0 16px;">Una familia se interesó en <strong>${input.schoolName}</strong> a través de Radar Educativo.</p>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 16px; color: #6b7280; font-size: 13px; width: 140px;">Nombre</td>
                <td style="padding: 12px 16px; font-weight: 500;">${input.parentName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 16px; color: #6b7280; font-size: 13px;">Email</td>
                <td style="padding: 12px 16px;"><a href="mailto:${input.parentEmail}" style="color: #0f4c3a;">${input.parentEmail}</a></td>
              </tr>
              ${input.parentPhone ? `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 16px; color: #6b7280; font-size: 13px;">Teléfono</td>
                <td style="padding: 12px 16px;">${input.parentPhone}</td>
              </tr>` : ""}
              ${input.message ? `
              <tr>
                <td style="padding: 12px 16px; color: #6b7280; font-size: 13px;">Mensaje</td>
                <td style="padding: 12px 16px;">${input.message}</td>
              </tr>` : ""}
            </table>
            <p style="margin: 24px 0 0; font-size: 13px; color: #9ca3af;">
              Este mensaje fue enviado desde <a href="https://radareducativo.com" style="color: #0f4c3a;">radareducativo.com</a>
            </p>
          </div>
        </div>
      `
    });
  }

  // ─── Notificación a admin: nuevo claim ────────────────────────────────────

  async sendNewClaimNotification(input: {
    schoolName: string;
    schoolSlug: string;
    representativeName: string;
    representativeEmail: string;
    representativePhone?: string | null;
  }) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || `hola@${this.fromDomain}`;
    return this.send({
      to: adminEmail,
      subject: `Nuevo claim: ${input.schoolName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <div style="background: #0f4c3a; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Nuevo claim de colegio</h1>
          </div>
          <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 16px; color: #6b7280; font-size: 13px; width: 160px;">Colegio</td>
                <td style="padding: 12px 16px; font-weight: 500;">${input.schoolName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 16px; color: #6b7280; font-size: 13px;">Representante</td>
                <td style="padding: 12px 16px;">${input.representativeName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 16px; color: #6b7280; font-size: 13px;">Email</td>
                <td style="padding: 12px 16px;"><a href="mailto:${input.representativeEmail}" style="color: #0f4c3a;">${input.representativeEmail}</a></td>
              </tr>
              ${input.representativePhone ? `
              <tr>
                <td style="padding: 12px 16px; color: #6b7280; font-size: 13px;">Teléfono</td>
                <td style="padding: 12px 16px;">${input.representativePhone}</td>
              </tr>` : ""}
            </table>
            <div style="margin-top: 24px;">
              <a href="https://radareducativo.com/admin/schools/${input.schoolSlug}"
                 style="background: #0f4c3a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block;">
                Ver en el admin →
              </a>
            </div>
          </div>
        </div>
      `
    });
  }

  // ─── Confirmación al representante: claim recibido ─────────────────────────

  async sendClaimReceivedConfirmation(input: {
    representativeEmail: string;
    representativeName: string;
    schoolName: string;
  }) {
    return this.send({
      to: input.representativeEmail,
      subject: `Recibimos tu solicitud para ${input.schoolName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <div style="background: #0f4c3a; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Solicitud recibida</h1>
          </div>
          <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Hola ${input.representativeName},</p>
            <p>Recibimos tu solicitud para reclamar el perfil de <strong>${input.schoolName}</strong> en Radar Educativo.</p>
            <p>Vamos a revisar la información y te vamos a contactar en las próximas 48 horas hábiles para confirmar el acceso.</p>
            <p style="margin-top: 32px; font-size: 13px; color: #9ca3af;">
              El equipo de <a href="https://radareducativo.com" style="color: #0f4c3a;">Radar Educativo</a>
            </p>
          </div>
        </div>
      `
    });
  }

  // ─── Notificación al representante: claim aprobado ────────────────────────

  async sendClaimApprovedNotification(input: {
    representativeEmail: string;
    representativeName: string;
    schoolName: string;
    schoolSlug: string;
  }) {
    const loginUrl = input.schoolSlug
      ? `https://radareducativo.com/ingresar?school=${encodeURIComponent(input.schoolSlug)}`
      : `https://radareducativo.com/ingresar`;

    return this.send({
      to: input.representativeEmail,
      subject: `¡Tu perfil de ${input.schoolName} fue aprobado!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <div style="background: #0f4c3a; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">¡Perfil aprobado! 🎉</h1>
          </div>
          <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Hola ${input.representativeName},</p>
            <p>El perfil de <strong>${input.schoolName}</strong> en Radar Educativo fue aprobado. Ya podés acceder al panel del colegio para completar la información y gestionar contactos.</p>
            <div style="margin: 24px 0;">
              <a href="${loginUrl}"
                 style="background: #0f4c3a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block;">
                Ir al panel del colegio →
              </a>
            </div>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 8px;">
              <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #374151;">Para ingresar necesitás:</p>
              <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #6b7280; line-height: 1.8;">
                <li>Tu email institucional: <strong style="color: #1a1a1a;">${input.representativeEmail}</strong></li>
                <li>Seleccionar <strong style="color: #1a1a1a;">${input.schoolName}</strong> en el selector</li>
                <li>Hacer click en <strong style="color: #1a1a1a;">Entrar como colegio</strong></li>
              </ol>
            </div>
            <p style="margin-top: 24px; font-size: 13px; color: #9ca3af;">
              El equipo de <a href="https://radareducativo.com" style="color: #0f4c3a;">Radar Educativo</a>
            </p>
          </div>
        </div>
      `
    });
  }

  // ─── Envío genérico ────────────────────────────────────────────────────────

  private async send(options: { to: string; subject: string; html: string }) {
    if (!this.client) {
      this.logger.debug(`Email skipped (disabled): ${options.subject} → ${options.to}`);
      return { ok: false, reason: "disabled" };
    }

    try {
      const { error } = await this.client.emails.send({
        from: `Radar Educativo <noreply@${this.fromDomain}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      });

      if (error) {
        this.logger.warn(`Email failed: ${options.subject} → ${options.to} — ${error.message}`);
        return { ok: false, reason: error.message };
      }

      this.logger.log(`Email sent: ${options.subject} → ${options.to}`);
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Email error: ${message}`);
      return { ok: false, reason: message };
    }
  }
}
