import {
  ClaimRequestType,
  ClaimStatus,
  ImportRunStatus,
  ImportSource,
  LeadStatus,
  ParentAlertType,
  ProductEventType,
  PrismaClient,
  ReviewStatus,
  ScheduleType,
  SchoolCharacteristic,
  SchoolLevel,
  SchoolOrientation,
  SchoolProfileStatus,
  SubscriptionStatus,
  VerificationMethod
} from "@prisma/client";

const prisma = new PrismaClient();

type CitySeed = {
  provinceSlug: string;
  provinceName: string;
  citySlug: string;
  cityName: string;
  latitude: number;
  longitude: number;
};

const citySeeds: CitySeed[] = [
  { provinceSlug: "buenos-aires", provinceName: "Buenos Aires", citySlug: "longchamps", cityName: "Longchamps", latitude: -34.857, longitude: -58.393 },
  { provinceSlug: "buenos-aires", provinceName: "Buenos Aires", citySlug: "lomas-de-zamora", cityName: "Lomas de Zamora", latitude: -34.7609, longitude: -58.4044 },
  { provinceSlug: "buenos-aires", provinceName: "Buenos Aires", citySlug: "adrogue", cityName: "Adrogue", latitude: -34.7999, longitude: -58.3893 },
  { provinceSlug: "buenos-aires", provinceName: "Buenos Aires", citySlug: "temperley", cityName: "Temperley", latitude: -34.7685, longitude: -58.3938 },
  { provinceSlug: "buenos-aires", provinceName: "Buenos Aires", citySlug: "banfield", cityName: "Banfield", latitude: -34.7442, longitude: -58.3927 },
  { provinceSlug: "buenos-aires", provinceName: "Buenos Aires", citySlug: "lanus", cityName: "Lanús", latitude: -34.7068, longitude: -58.3928 },
  { provinceSlug: "cordoba", provinceName: "Córdoba", citySlug: "cordoba", cityName: "Córdoba", latitude: -31.4173, longitude: -64.1833 },
  { provinceSlug: "cordoba", provinceName: "Córdoba", citySlug: "villa-carlos-paz", cityName: "Villa Carlos Paz", latitude: -31.4241, longitude: -64.4978 },
  { provinceSlug: "cordoba", provinceName: "Córdoba", citySlug: "rio-cuarto", cityName: "Río Cuarto", latitude: -33.1307, longitude: -64.3499 },
  { provinceSlug: "mendoza", provinceName: "Mendoza", citySlug: "mendoza", cityName: "Mendoza", latitude: -32.8895, longitude: -68.8458 },
  { provinceSlug: "mendoza", provinceName: "Mendoza", citySlug: "godoy-cruz", cityName: "Godoy Cruz", latitude: -32.9286, longitude: -68.8508 },
  { provinceSlug: "mendoza", provinceName: "Mendoza", citySlug: "maipu", cityName: "Maipú", latitude: -32.9776, longitude: -68.7801 },
  { provinceSlug: "mendoza", provinceName: "Mendoza", citySlug: "san-rafael", cityName: "San Rafael", latitude: -34.6177, longitude: -68.3301 }
];

const namePartsA = ["Nueva", "Horizonte", "San", "Instituto", "Colegio", "Academia", "Escuela", "Liceo"];
const namePartsB = ["Andes", "Federal", "Norte", "Sur", "Integral", "Futuro", "Bilingüe", "STEM", "Arte"];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pickProfileStatus(index: number): SchoolProfileStatus {
  const cycle = index % 8;
  if (cycle === 0) {
    return SchoolProfileStatus.PREMIUM;
  }

  if (cycle <= 2) {
    return SchoolProfileStatus.VERIFIED;
  }

  if (cycle <= 4) {
    return SchoolProfileStatus.CURATED;
  }

  return SchoolProfileStatus.BASIC;
}

function pickLevels(index: number): SchoolLevel[] {
  if (index % 5 === 0) {
    return [SchoolLevel.INICIAL, SchoolLevel.PRIMARIA, SchoolLevel.SECUNDARIA];
  }

  if (index % 3 === 0) {
    return [SchoolLevel.PRIMARIA, SchoolLevel.SECUNDARIA];
  }

  return [SchoolLevel.INICIAL, SchoolLevel.PRIMARIA];
}

function pickOrientations(index: number): SchoolOrientation[] {
  const options = [
    SchoolOrientation.BILINGUAL,
    SchoolOrientation.TECHNICAL,
    SchoolOrientation.ARTISTIC,
    SchoolOrientation.INTERNATIONAL
  ];

  if (index % 4 === 0) {
    return [options[index % options.length], SchoolOrientation.BILINGUAL];
  }

  return [options[index % options.length]];
}

function pickCharacteristics(index: number): SchoolCharacteristic[] {
  return index % 3 === 0 ? [SchoolCharacteristic.RELIGIOUS] : [SchoolCharacteristic.SECULAR];
}

async function main() {
  const country = await prisma.country.upsert({
    where: { isoCode: "AR" },
    update: { name: "Argentina" },
    create: {
      name: "Argentina",
      isoCode: "AR"
    }
  });

  const provinceMap = new Map<string, string>();
  const cityMap = new Map<string, { id: string; latitude: number; longitude: number; provinceId: string }>();

  for (const citySeed of citySeeds) {
    let provinceId = provinceMap.get(citySeed.provinceSlug);

    if (!provinceId) {
      const province = await prisma.province.upsert({
        where: {
          countryId_slug: {
            countryId: country.id,
            slug: citySeed.provinceSlug
          }
        },
        update: {
          name: citySeed.provinceName
        },
        create: {
          countryId: country.id,
          name: citySeed.provinceName,
          slug: citySeed.provinceSlug
        }
      });
      provinceId = province.id;
      provinceMap.set(citySeed.provinceSlug, province.id);
    }

    const city = await prisma.city.upsert({
      where: {
        provinceId_slug: {
          provinceId,
          slug: citySeed.citySlug
        }
      },
      update: {
        name: citySeed.cityName,
        latitude: citySeed.latitude,
        longitude: citySeed.longitude
      },
      create: {
        provinceId,
        name: citySeed.cityName,
        slug: citySeed.citySlug,
        latitude: citySeed.latitude,
        longitude: citySeed.longitude
      }
    });

    cityMap.set(citySeed.citySlug, {
      id: city.id,
      latitude: citySeed.latitude,
      longitude: citySeed.longitude,
      provinceId
    });
  }

  const generatedSchools: Array<{
    name: string;
    slug: string;
    citySlug: string;
    latitude: number;
    longitude: number;
    monthlyFeeEstimate: number;
    studentsCount: number;
    description: string;
    website: string;
    phone: string;
    email: string;
    levels: SchoolLevel[];
    score: number;
    profileStatus: SchoolProfileStatus;
    scheduleType: ScheduleType;
    orientations: SchoolOrientation[];
    characteristics: SchoolCharacteristic[];
  }> = [];

  for (const citySeed of citySeeds) {
    for (let index = 0; index < 7; index += 1) {
      const rank = index + 1;
      const name = `${namePartsA[(index + citySeed.citySlug.length) % namePartsA.length]} ${namePartsB[(index * 2) % namePartsB.length]} ${citySeed.cityName}`;
      const slug = `colegio-${citySeed.citySlug}-${rank}`;
      const score = 72 + ((index * 4 + citySeed.citySlug.length) % 24);

      generatedSchools.push({
        name,
        slug,
        citySlug: citySeed.citySlug,
        latitude: Number((citySeed.latitude + index * 0.0019).toFixed(6)),
        longitude: Number((citySeed.longitude + index * 0.0017).toFixed(6)),
        monthlyFeeEstimate: 145000 + index * 22000 + citySeed.citySlug.length * 800,
        studentsCount: 420 + index * 85,
        description: `Proyecto educativo ${index % 2 === 0 ? "con enfoque bilingüe" : "centrado en innovación pedagógica"} para familias de ${citySeed.cityName}.`,
        website: `https://${slug}.eduadvisor.example`,
        phone: `+54 11 5${String(1000 + index * 37).slice(-4)}-${String(3000 + citySeed.citySlug.length * 9).slice(-4)}`,
        email: `admision@${slug}.eduadvisor.example`,
        levels: pickLevels(index),
        score,
        profileStatus: pickProfileStatus(index + citySeed.citySlug.length),
        scheduleType: index % 2 === 0 ? ScheduleType.FULL_DAY : ScheduleType.HALF_DAY,
        orientations: pickOrientations(index + citySeed.citySlug.length),
        characteristics: pickCharacteristics(index + citySeed.citySlug.length)
      });
    }
  }

  const anchors = [
    {
      name: "North Hills College",
      slug: "north-hills-college",
      citySlug: "longchamps",
      latitude: -34.858,
      longitude: -58.391,
      monthlyFeeEstimate: 285000,
      studentsCount: 1140,
      description: "Colegio bilingüe con foco en inglés intensivo y desarrollo STEM.",
      website: "https://northhills.example",
      phone: "+54 11 4000-1001",
      email: "admisiones@northhills.example",
      levels: [SchoolLevel.INICIAL, SchoolLevel.PRIMARIA, SchoolLevel.SECUNDARIA],
      score: 91,
      profileStatus: SchoolProfileStatus.PREMIUM,
      scheduleType: ScheduleType.FULL_DAY,
      orientations: [SchoolOrientation.BILINGUAL, SchoolOrientation.INTERNATIONAL],
      characteristics: [SchoolCharacteristic.SECULAR]
    },
    {
      name: "Colegio San Lucas",
      slug: "colegio-san-lucas",
      citySlug: "lomas-de-zamora",
      latitude: -34.7602,
      longitude: -58.405,
      monthlyFeeEstimate: 210000,
      studentsCount: 980,
      description: "Proyecto educativo tradicional con fuerte propuesta deportiva y pastoral.",
      website: "https://sanlucas.example",
      phone: "+54 11 4000-1002",
      email: "info@sanlucas.example",
      levels: [SchoolLevel.PRIMARIA, SchoolLevel.SECUNDARIA],
      score: 86,
      profileStatus: SchoolProfileStatus.VERIFIED,
      scheduleType: ScheduleType.FULL_DAY,
      orientations: [SchoolOrientation.BILINGUAL],
      characteristics: [SchoolCharacteristic.RELIGIOUS]
    },
    {
      name: "Instituto Rio Verde",
      slug: "instituto-rio-verde",
      citySlug: "adrogue",
      latitude: -34.8008,
      longitude: -58.387,
      monthlyFeeEstimate: 245000,
      studentsCount: 760,
      description: "Aprendizaje por proyectos, enfoque artístico y desarrollo socioemocional.",
      website: "https://rioverde.example",
      phone: "+54 11 4000-1003",
      email: "contacto@rioverde.example",
      levels: [SchoolLevel.INICIAL, SchoolLevel.PRIMARIA],
      score: 88,
      profileStatus: SchoolProfileStatus.CURATED,
      scheduleType: ScheduleType.HALF_DAY,
      orientations: [SchoolOrientation.ARTISTIC],
      characteristics: [SchoolCharacteristic.SECULAR]
    }
  ];

  const schools = [...anchors, ...generatedSchools];
  const schoolIds: string[] = [];

  for (let index = 0; index < schools.length; index += 1) {
    const item = schools[index];
    const city = cityMap.get(item.citySlug);

    if (!city) {
      continue;
    }

    const profileStatus = item.profileStatus;
    const now = new Date();
    const curatedAt =
      profileStatus === SchoolProfileStatus.CURATED ||
      profileStatus === SchoolProfileStatus.VERIFIED ||
      profileStatus === SchoolProfileStatus.PREMIUM
        ? now
        : null;
    const verifiedAt =
      profileStatus === SchoolProfileStatus.VERIFIED || profileStatus === SchoolProfileStatus.PREMIUM ? now : null;
    const premiumSince = profileStatus === SchoolProfileStatus.PREMIUM ? now : null;

    const school = await prisma.school.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        cityId: city.id,
        provinceId: city.provinceId,
        countryId: country.id,
        profileStatus,
        curatedAt,
        verifiedAt,
        premiumSince,
        premiumUntil: profileStatus === SchoolProfileStatus.PREMIUM ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) : null,
        latitude: item.latitude,
        longitude: item.longitude,
        addressLine: `Av. ${item.citySlug.replace(/-/g, " ")} ${100 + index}`,
        postalCode: String(1800 + (index % 200)),
        googlePlaceId: `seed-${item.slug}`,
        googleRating: Number((3.8 + (index % 11) * 0.11).toFixed(1)),
        googleReviewCount: 15 + index * 2,
        googlePhotos: [`https://images.eduadvisor.example/${item.slug}/cover.jpg`],
        educationOrientations: item.orientations,
        schoolCharacteristics: item.characteristics,
        scheduleType: item.scheduleType,
        modality: index % 3 === 0 ? "Presencial" : "Mixta",
        tags: [item.citySlug, ...item.orientations.map((entry) => slugify(entry))],
        hasLaboratory: index % 2 === 0,
        hasLibrary: true,
        hasSportsFacilities: index % 3 !== 0,
        hasCafeteria: index % 4 !== 0,
        hasTransportation: index % 5 === 0,
        monthlyFeeEstimate: item.monthlyFeeEstimate,
        enrollmentFee: Math.floor(item.monthlyFeeEstimate * 0.45),
        scholarshipsAvailable: index % 4 === 0,
        studentsCount: item.studentsCount,
        profileCompleteness: profileStatus === SchoolProfileStatus.BASIC ? 52 : profileStatus === SchoolProfileStatus.CURATED ? 76 : 92,
        dataFreshnessAt: now,
        description: item.description,
        website: item.website,
        phone: item.phone,
        email: item.email,
        active: true
      },
      create: {
        name: item.name,
        slug: item.slug,
        cityId: city.id,
        provinceId: city.provinceId,
        countryId: country.id,
        profileStatus,
        curatedAt,
        verifiedAt,
        premiumSince,
        premiumUntil: profileStatus === SchoolProfileStatus.PREMIUM ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) : null,
        latitude: item.latitude,
        longitude: item.longitude,
        addressLine: `Av. ${item.citySlug.replace(/-/g, " ")} ${100 + index}`,
        postalCode: String(1800 + (index % 200)),
        googlePlaceId: `seed-${item.slug}`,
        googleRating: Number((3.8 + (index % 11) * 0.11).toFixed(1)),
        googleReviewCount: 15 + index * 2,
        googlePhotos: [`https://images.eduadvisor.example/${item.slug}/cover.jpg`],
        educationOrientations: item.orientations,
        schoolCharacteristics: item.characteristics,
        scheduleType: item.scheduleType,
        modality: index % 3 === 0 ? "Presencial" : "Mixta",
        tags: [item.citySlug, ...item.orientations.map((entry) => slugify(entry))],
        hasLaboratory: index % 2 === 0,
        hasLibrary: true,
        hasSportsFacilities: index % 3 !== 0,
        hasCafeteria: index % 4 !== 0,
        hasTransportation: index % 5 === 0,
        monthlyFeeEstimate: item.monthlyFeeEstimate,
        enrollmentFee: Math.floor(item.monthlyFeeEstimate * 0.45),
        scholarshipsAvailable: index % 4 === 0,
        studentsCount: item.studentsCount,
        profileCompleteness: profileStatus === SchoolProfileStatus.BASIC ? 52 : profileStatus === SchoolProfileStatus.CURATED ? 76 : 92,
        dataFreshnessAt: now,
        description: item.description,
        website: item.website,
        phone: item.phone,
        email: item.email,
        active: true
      }
    });

    schoolIds.push(school.id);

    await prisma.schoolToLevel.deleteMany({
      where: { schoolId: school.id }
    });

    await prisma.schoolToLevel.createMany({
      data: item.levels.map((level) => ({ schoolId: school.id, level }))
    });

    await prisma.eduAdvisorScore.deleteMany({
      where: { schoolId: school.id }
    });

    await prisma.eduAdvisorScore.create({
      data: {
        schoolId: school.id,
        score: item.score,
        reviewsComponent: 0.35,
        engagementComponent: 0.25,
        consistencyComponent: 0.2,
        dataQualityComponent: 0.2
      }
    });

    await prisma.schoolSourceRecord.upsert({
      where: {
        source_externalId: {
          source: ImportSource.GOOGLE_PLACES,
          externalId: `seed-${item.slug}`
        }
      },
      update: {
        payloadHash: `seed-hash-${item.slug}`,
        payload: {
          name: item.name,
          city: item.citySlug,
          fee: item.monthlyFeeEstimate
        },
        fetchedAt: new Date()
      },
      create: {
        schoolId: school.id,
        source: ImportSource.GOOGLE_PLACES,
        externalId: `seed-${item.slug}`,
        payloadHash: `seed-hash-${item.slug}`,
        payload: {
          name: item.name,
          city: item.citySlug,
          fee: item.monthlyFeeEstimate
        }
      }
    });

    if (profileStatus === SchoolProfileStatus.PREMIUM) {
      await prisma.schoolSubscription.upsert({
        where: {
          id: `sub-${school.id}`
        },
        update: {
          status: SubscriptionStatus.ACTIVE,
          startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
          endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 330)
        },
        create: {
          id: `sub-${school.id}`,
          schoolId: school.id,
          status: SubscriptionStatus.ACTIVE,
          planCode: "premium",
          priceMonthly: 99000,
          startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
          endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 330)
        }
      });
    }
  }

  await prisma.review.deleteMany({
    where: {
      schoolId: {
        in: schoolIds
      }
    }
  });

  const reviewsToCreate = schoolIds.slice(0, 60).flatMap((schoolId, index) => {
    const ratingA = 3 + (index % 3);
    const ratingB = 4 + (index % 2);

    return [
      {
        schoolId,
        rating: Math.min(5, ratingA),
        comment: "Muy buena propuesta académica y comunicación con familias.",
        status: ReviewStatus.APPROVED
      },
      {
        schoolId,
        rating: Math.min(5, ratingB),
        comment: "Buen clima escolar y actividades extracurriculares.",
        status: ReviewStatus.APPROVED
      }
    ];
  });

  if (reviewsToCreate.length > 0) {
    await prisma.review.createMany({
      data: reviewsToCreate
    });
  }

  const sampleSchoolId = schoolIds[0];
  if (sampleSchoolId) {
    const representative = await prisma.schoolRepresentative.create({
      data: {
        schoolId: sampleSchoolId,
        fullName: "María Torres",
        role: "Directora",
        email: "maria.torres@example.eduadvisor",
        phone: "+54 11 5555-1234"
      }
    });

    await prisma.schoolClaimRequest.create({
      data: {
        schoolId: sampleSchoolId,
        representativeId: representative.id,
        requestType: ClaimRequestType.CLAIM,
        status: ClaimStatus.APPROVED,
        verificationMethod: VerificationMethod.MANUAL,
        verifiedAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: "seed-admin",
        requestedSchoolName: "North Hills College",
        requestedCity: "Longchamps",
        requestedProvince: "Buenos Aires",
        requestedWebsite: "https://northhills.example",
        notes: "Solicitud validada por equipo de operaciones."
      }
    });

    await prisma.schoolBillingCustomer.upsert({
      where: {
        schoolId_provider: {
          schoolId: sampleSchoolId,
          provider: "MANUAL"
        }
      },
      update: {
        email: "billing@northhills.example"
      },
      create: {
        schoolId: sampleSchoolId,
        provider: "MANUAL",
        externalCustomerId: "manual-seed-north-hills",
        email: "billing@northhills.example"
      }
    });

    const seedSubscription = await prisma.schoolSubscription.upsert({
      where: {
        provider_sourceExternalId: {
          provider: "MANUAL",
          sourceExternalId: "seed-invoice-paid-001"
        }
      },
      update: {
        status: SubscriptionStatus.ACTIVE,
        planCode: "premium",
        priceMonthly: 99000,
        currency: "ARS",
        sourceEventId: "seed-webhook-evt-001",
        startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 355)
      },
      create: {
        schoolId: sampleSchoolId,
        status: SubscriptionStatus.ACTIVE,
        planCode: "premium",
        priceMonthly: 99000,
        currency: "ARS",
        provider: "MANUAL",
        sourceExternalId: "seed-invoice-paid-001",
        sourceEventId: "seed-webhook-evt-001",
        startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 355)
      }
    });

    await prisma.billingCheckoutSession.upsert({
      where: {
        provider_externalSessionId: {
          provider: "MANUAL",
          externalSessionId: "seed-checkout-session-001"
        }
      },
      update: {
        schoolId: sampleSchoolId,
        subscriptionId: seedSubscription.id,
        status: "COMPLETED",
        planCode: "premium",
        amountMonthly: 99000,
        currency: "ARS",
        intervalMonths: 1,
        checkoutUrl: "http://localhost:3000/checkout/seed-checkout-session-001",
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
        expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9)
      },
      create: {
        schoolId: sampleSchoolId,
        subscriptionId: seedSubscription.id,
        provider: "MANUAL",
        status: "COMPLETED",
        planCode: "premium",
        amountMonthly: 99000,
        currency: "ARS",
        intervalMonths: 1,
        externalSessionId: "seed-checkout-session-001",
        checkoutUrl: "http://localhost:3000/checkout/seed-checkout-session-001",
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
        expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9)
      }
    });

    await prisma.billingInvoice.upsert({
      where: {
        provider_externalInvoiceId: {
          provider: "MANUAL",
          externalInvoiceId: "seed-invoice-paid-001"
        }
      },
      update: {
        schoolId: sampleSchoolId,
        subscriptionId: seedSubscription.id,
        status: "PAID",
        amountSubtotal: 99000,
        amountTax: 0,
        amountTotal: 99000,
        currency: "ARS",
        paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
        issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        externalEventId: "seed-webhook-evt-001"
      },
      create: {
        schoolId: sampleSchoolId,
        subscriptionId: seedSubscription.id,
        provider: "MANUAL",
        status: "PAID",
        externalInvoiceId: "seed-invoice-paid-001",
        externalEventId: "seed-webhook-evt-001",
        amountSubtotal: 99000,
        amountTax: 0,
        amountTotal: 99000,
        currency: "ARS",
        issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
        rawPayload: {
          source: "seed"
        }
      }
    });

    await prisma.billingWebhookEvent.upsert({
      where: {
        provider_externalEventId: {
          provider: "MANUAL",
          externalEventId: "seed-webhook-evt-001"
        }
      },
      update: {
        schoolId: sampleSchoolId,
        eventType: "invoice.paid",
        status: "PROCESSED",
        signatureValid: true,
        processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
        payload: {
          source: "seed",
          type: "invoice.paid"
        }
      },
      create: {
        provider: "MANUAL",
        externalEventId: "seed-webhook-evt-001",
        eventType: "invoice.paid",
        status: "PROCESSED",
        signatureValid: true,
        schoolId: sampleSchoolId,
        payload: {
          source: "seed",
          type: "invoice.paid"
        },
        processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9)
      }
    });
  }

  await prisma.schoolImportRun.create({
    data: {
      source: ImportSource.GOOGLE_PLACES,
      status: ImportRunStatus.COMPLETED,
      countryCode: "AR",
      province: "Buenos Aires",
      city: "Longchamps",
      query: "colegios privados",
      startedAt: new Date(Date.now() - 1000 * 60 * 15),
      finishedAt: new Date(Date.now() - 1000 * 60 * 10),
      totalFetched: 32,
      createdCount: 18,
      updatedCount: 10,
      duplicateCount: 4,
      errorCount: 0,
      notes: "Seed import run snapshot"
    }
  });

  const demoParent = await prisma.user.upsert({
    where: { email: "familia.demo@example.eduadvisor" },
    update: {
      role: "PARENT"
    },
    create: {
      email: "familia.demo@example.eduadvisor",
      role: "PARENT"
    }
  });

  await prisma.savedSchool.deleteMany({
    where: { userId: demoParent.id }
  });

  const favoriteSchoolIds = schoolIds.slice(0, 6);
  if (favoriteSchoolIds.length > 0) {
    await prisma.savedSchool.createMany({
      data: favoriteSchoolIds.map((schoolId) => ({
        userId: demoParent.id,
        schoolId
      }))
    });
  }

  await prisma.savedComparison.deleteMany({
    where: { userId: demoParent.id }
  });

  await prisma.parentAlert.deleteMany({
    where: { userId: demoParent.id }
  });

  await prisma.productEvent.deleteMany({});

  const favoriteSchoolSlugs = schools.slice(0, 6).map((school) => school.slug);
  const comparisonCandidates = [
    favoriteSchoolSlugs.slice(0, 3),
    favoriteSchoolSlugs.slice(2, 5)
  ].filter((entry) => entry.length >= 2);

  if (comparisonCandidates.length > 0) {
    await prisma.savedComparison.createMany({
      data: comparisonCandidates.map((schoolSlugs) => ({
        userId: demoParent.id,
        schoolSlugs
      }))
    });
  }

  await prisma.lead.deleteMany({
    where: { userId: demoParent.id }
  });

  if (favoriteSchoolIds.length > 0) {
    await prisma.lead.createMany({
      data: [
        {
          schoolId: favoriteSchoolIds[0]!,
          userId: demoParent.id,
          parentName: "Familia Demo",
          childAge: 7,
          educationLevel: SchoolLevel.PRIMARIA,
          phone: "+54 11 5555-1001",
          email: "familia.demo@example.eduadvisor",
          status: LeadStatus.NEW,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4)
        },
        {
          schoolId: favoriteSchoolIds[1] ?? favoriteSchoolIds[0]!,
          userId: demoParent.id,
          parentName: "Familia Demo",
          childAge: 10,
          educationLevel: SchoolLevel.SECUNDARIA,
          phone: "+54 11 5555-1001",
          email: "familia.demo@example.eduadvisor",
          status: LeadStatus.CONTACTED,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9)
        },
        {
          schoolId: favoriteSchoolIds[2] ?? favoriteSchoolIds[0]!,
          userId: demoParent.id,
          parentName: "Familia Demo",
          childAge: 5,
          educationLevel: SchoolLevel.INICIAL,
          phone: "+54 11 5555-1001",
          email: "familia.demo@example.eduadvisor",
          status: LeadStatus.CLOSED,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16)
        }
      ]
    });
  }

  if (favoriteSchoolIds.length > 0) {
    await prisma.parentAlert.createMany({
      data: [
        {
          userId: demoParent.id,
          schoolId: favoriteSchoolIds[0] ?? null,
          type: ParentAlertType.SAVED_SCHOOL_ADDED,
          title: "Colegio guardado",
          message: `Guardaste ${schools[0]?.name ?? "un colegio"} en tu shortlist.`,
          linkPath: schools[0] ? `/school/${schools[0].slug}` : null,
          isRead: false
        },
        {
          userId: demoParent.id,
          schoolId: favoriteSchoolIds[1] ?? null,
          type: ParentAlertType.SCHOOL_UPDATE,
          title: "Perfil actualizado",
          message: `${schools[1]?.name ?? "Un colegio guardado"} actualizó datos de su perfil.`,
          linkPath: schools[1] ? `/school/${schools[1].slug}` : null,
          isRead: false
        },
        {
          userId: demoParent.id,
          schoolId: favoriteSchoolIds[2] ?? null,
          type: ParentAlertType.COMPARISON_SAVED,
          title: "Comparación guardada",
          message: "Tu comparación está lista para revisitar cuando quieras.",
          linkPath: comparisonCandidates[0] ? `/compare/${comparisonCandidates[0].join(",")}` : null,
          isRead: true,
          readAt: new Date()
        }
      ]
    });
  }

  if (schools.length > 1) {
    await prisma.productEvent.createMany({
      data: [
        {
          type: ProductEventType.REVIEW_APPROVED,
          schoolId: schoolIds[0],
          dedupeKey: "seed:review-approved:north-hills-college",
          title: "Nueva reseña aprobada",
          message: `${schools[0]?.name ?? "Un colegio"} recibió una nueva reseña aprobada.`,
          alertsCreated: 1
        },
        {
          type: ProductEventType.SCHOOL_PROFILE_UPDATED,
          schoolId: schoolIds[1],
          dedupeKey: "seed:school-profile-updated:colegio-san-lucas",
          title: "Perfil de colegio actualizado",
          message: `${schools[1]?.name ?? "Un colegio"} actualizó su perfil institucional.`,
          alertsCreated: 1
        }
      ]
    });
  }

  await prisma.growthFunnelSnapshot.deleteMany({});
  for (let day = 6; day >= 0; day -= 1) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - day);

    const parentsTotal = 1;
    const parentsWithSavedSchools = 1;
    const parentsWithComparisons = day <= 5 ? 1 : 0;
    const parentsWithLeads = day <= 4 ? 1 : 0;
    const parentsWithClosedLeads = day <= 2 ? 1 : 0;

    await prisma.growthFunnelSnapshot.create({
      data: {
        date,
        windowDays: 30,
        parentsTotal,
        parentsWithSavedSchools,
        parentsWithComparisons,
        parentsWithLeads,
        parentsWithClosedLeads,
        conversionToSaved: parentsTotal > 0 ? Number(((parentsWithSavedSchools / parentsTotal) * 100).toFixed(2)) : 0,
        conversionToCompared:
          parentsWithSavedSchools > 0 ? Number(((parentsWithComparisons / parentsWithSavedSchools) * 100).toFixed(2)) : 0,
        conversionToLead: parentsWithComparisons > 0 ? Number(((parentsWithLeads / parentsWithComparisons) * 100).toFixed(2)) : 0,
        conversionToClosedLead: parentsWithLeads > 0 ? Number(((parentsWithClosedLeads / parentsWithLeads) * 100).toFixed(2)) : 0
      }
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seed completed with ${schoolIds.length} schools.`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
