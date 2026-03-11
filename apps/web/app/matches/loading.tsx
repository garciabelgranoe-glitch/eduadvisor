import { Card } from "@/components/ui/card";

export default function MatchesLoading() {
  return (
    <section className="space-y-6">
      <Card className="space-y-3">
        <div className="ea-skeleton h-4 w-36 rounded-full" />
        <div className="ea-skeleton h-8 w-2/3 rounded-lg" />
      </Card>
      <Card className="space-y-3">
        <div className="ea-skeleton h-5 w-1/2 rounded-lg" />
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="ea-skeleton h-11 rounded-xl" />
          ))}
        </div>
      </Card>
      <Card className="space-y-3">
        <div className="ea-skeleton h-6 w-1/2 rounded-lg" />
        <div className="ea-skeleton h-24 w-full rounded-xl" />
      </Card>
    </section>
  );
}

