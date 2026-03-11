import { expect, test } from "@playwright/test";

test("leads endpoint silently drops honeypot submissions", async ({ request }) => {
  const response = await request.fetch("/api/leads", {
    method: "POST",
    headers: {
      "x-forwarded-for": "203.0.113.70"
    },
    data: {
      schoolId: "school-1",
      parentName: "Test Parent",
      childAge: 8,
      educationLevel: "PRIMARIA",
      phone: "+54 9 11 1234 5678",
      email: "parent@example.com",
      _startedAt: Date.now() - 10_000,
      _hpWebsite: "https://spam.example"
    }
  });

  expect(response.status()).toBe(202);
  const payload = (await response.json()) as { message?: string };
  expect(payload.message).toContain("Consulta enviada");
});

test("leads endpoint blocks disposable email domains", async ({ request }) => {
  const response = await request.fetch("/api/leads", {
    method: "POST",
    headers: {
      "x-forwarded-for": "203.0.113.80"
    },
    data: {
      schoolId: "school-1",
      parentName: "Disposable Parent",
      childAge: 8,
      educationLevel: "PRIMARIA",
      phone: "+54 9 11 1234 5678",
      email: "parent@mailinator.com",
      _startedAt: Date.now() - 10_000,
      _hpWebsite: ""
    }
  });

  expect(response.status()).toBe(429);
  const payload = (await response.json()) as { message?: string };
  expect(payload.message).toContain("emails temporales");
});

test("reviews endpoint silently drops too-fast submissions", async ({ request }) => {
  const response = await request.fetch("/api/reviews", {
    method: "POST",
    headers: {
      "x-forwarded-for": "203.0.113.71"
    },
    data: {
      schoolId: "school-1",
      rating: 5,
      comment: "Excelente colegio, gran nivel académico y contención para las familias.",
      _startedAt: Date.now(),
      _hpCompany: ""
    }
  });

  expect(response.status()).toBe(202);
  const payload = (await response.json()) as { message?: string };
  expect(payload.message).toContain("pendiente de moderación");
});

test("reviews endpoint blocks duplicate payload fingerprint submissions", async ({ request }) => {
  const headers = {
    "x-forwarded-for": "203.0.113.81"
  };

  const basePayload = {
    schoolId: "school-1",
    rating: 4,
    comment: "Comentario de prueba para verificar bloqueo por duplicados.",
    _startedAt: Date.now(),
    _hpCompany: ""
  };

  const first = await request.fetch("/api/reviews", {
    method: "POST",
    headers,
    data: basePayload
  });

  expect(first.status()).toBe(202);

  const second = await request.fetch("/api/reviews", {
    method: "POST",
    headers,
    data: basePayload
  });

  expect(second.status()).toBe(429);
  const payload = (await second.json()) as { message?: string };
  expect(payload.message).toContain("envíos repetidos");
});

test("claim/publish endpoint blocks automated user-agent signatures", async ({ request }) => {
  const response = await request.fetch("/api/schools/publish", {
    method: "POST",
    headers: {
      "x-forwarded-for": "203.0.113.82",
      "user-agent": "curl/8.7.1"
    },
    data: {
      flow: "claim",
      schoolSlug: "colegio-demo-antiabuse",
      schoolName: "Colegio Demo",
      city: "Córdoba",
      province: "Córdoba",
      contactName: "Persona Demo",
      contactRole: "Admisiones",
      email: "admisiones@demo.edu.ar",
      phone: "+54 9 351 123 4567",
      _startedAt: Date.now() - 5_000,
      _hpWebsite: ""
    }
  });

  expect(response.status()).toBe(429);
  const payload = (await response.json()) as { message?: string };
  expect(payload.message).toContain("actividad automatizada");
});

test("claim/publish endpoint blocks suspicious URL spam content", async ({ request }) => {
  const response = await request.fetch("/api/schools/publish", {
    method: "POST",
    headers: {
      "x-forwarded-for": "203.0.113.72"
    },
    data: {
      flow: "publish",
      schoolName: "Colegio Demo",
      city: "Córdoba",
      province: "Córdoba",
      contactName: "Persona Demo",
      contactRole: "Admisiones",
      email: "admisiones@demo.edu.ar",
      phone: "+54 9 351 123 4567",
      website: "https://demo.edu.ar",
      message: "visit https://a.example https://b.example https://c.example",
      _startedAt: Date.now() - 5000,
      _hpWebsite: ""
    }
  });

  expect(response.status()).toBe(429);
  const payload = (await response.json()) as { message?: string };
  expect(payload.message).toContain("contenido no válido");
});

test("leads endpoint applies rate-limit for repeated abuse attempts", async ({ request }) => {
  const headers = {
    "x-forwarded-for": "203.0.113.73"
  };

  let blockedStatus: number | null = null;

  for (let index = 0; index < 8; index += 1) {
    const response = await request.fetch("/api/leads", {
      method: "POST",
      headers,
      data: {
        schoolId: "school-1",
        parentName: `Parent ${index}`,
        childAge: 8,
        educationLevel: "PRIMARIA",
        phone: "+54 9 11 1234 5678",
        email: `parent${index}@example.com`,
        _startedAt: Date.now(),
        _hpWebsite: ""
      }
    });

    if (response.status() === 429) {
      blockedStatus = response.status();
      break;
    }

    expect(response.status()).toBe(202);
  }

  const blocked =
    blockedStatus === 429
      ? null
      : await request.fetch("/api/leads", {
          method: "POST",
          headers,
          data: {
            schoolId: "school-1",
            parentName: "Parent blocked",
            childAge: 8,
            educationLevel: "PRIMARIA",
            phone: "+54 9 11 1234 5678",
            email: "parent-blocked@example.com",
            _startedAt: Date.now(),
            _hpWebsite: ""
          }
        });

  if (blockedStatus === 429) {
    expect(blockedStatus).toBe(429);
    return;
  }

  expect(blocked).toBeTruthy();
  expect(blocked?.status()).toBe(429);
  expect(blocked?.headers()["retry-after"]).toBeTruthy();
  const payload = (await blocked?.json()) as { message?: string };
  expect(payload.message).toContain("Demasiados intentos");
});

test("public forms block missing challenge token when challenge is required", async ({ request }) => {
  const response = await request.fetch("/api/leads", {
    method: "POST",
    headers: {
      "x-forwarded-for": "203.0.113.140"
    },
    data: {
      schoolId: "school-1",
      parentName: "Challenge Missing",
      childAge: 9,
      educationLevel: "PRIMARIA",
      phone: "+54 9 11 0000 0001",
      email: "challenge-missing@example.com",
      _startedAt: Date.now() - 10_000,
      _hpWebsite: ""
    }
  });

  expect(response.status()).toBe(429);
  const payload = (await response.json()) as { message?: string };
  expect(payload.message).toContain("verificación de seguridad");
});

test("public forms reject invalid challenge token when challenge is required", async ({ request }) => {
  const response = await request.fetch("/api/schools/publish", {
    method: "POST",
    headers: {
      "x-forwarded-for": "203.0.113.141"
    },
    data: {
      flow: "claim",
      schoolSlug: "colegio-challenge-invalido",
      schoolName: "Colegio Challenge Inválido",
      city: "Mendoza",
      province: "Mendoza",
      contactName: "Contacto Demo",
      contactRole: "Dirección",
      email: "challenge-invalid@example.com",
      phone: "+54 9 261 000 0000",
      _challengeToken: "test-turnstile-fail",
      _startedAt: Date.now() - 8_000,
      _hpWebsite: ""
    }
  });

  expect(response.status()).toBe(429);
  const payload = (await response.json()) as { message?: string };
  expect(payload.message).toContain("no fue válida");
});
