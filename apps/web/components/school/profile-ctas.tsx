"use client";

import Link from "next/link";
import { SaveSchoolButton } from "@/components/parent/save-school-button";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

interface SchoolProfileCtasProps {
  schoolId: string;
  schoolSlug: string;
  canClaimProfile: boolean;
}

export function SchoolProfileCtas({ schoolId, schoolSlug, canClaimProfile }: SchoolProfileCtasProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        asChild
        onClick={() => {
          trackEvent("school_compare_clicked", {
            source: "school_profile",
            schoolSlug
          });
        }}
      >
        <Link href={`/compare?schools=${encodeURIComponent(schoolSlug)}`}>Agregar a comparador</Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        onClick={() => {
          trackEvent("review_cta_clicked", {
            source: "school_profile",
            schoolSlug
          });
        }}
      >
        <Link href={`/review?school=${schoolSlug}`}>Escribir reseña</Link>
      </Button>
      <SaveSchoolButton schoolId={schoolId} schoolSlug={schoolSlug} />
      {canClaimProfile ? (
        <Button
          asChild
          variant="ghost"
          onClick={() => {
            trackEvent("school_claim_cta_clicked", {
              source: "school_profile",
              schoolSlug
            });
          }}
        >
          <Link href={`/para-colegios?flow=claim&school=${schoolSlug}`}>Reclamar perfil</Link>
        </Button>
      ) : null}
    </div>
  );
}
