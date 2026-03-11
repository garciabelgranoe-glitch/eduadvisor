import { Card } from "@/components/ui/card";

export default function SchoolDashboardLoading() {
  return (
    <section className="space-y-6">
      <Card className="space-y-3">
        <div className="ea-skeleton h-4 w-40 rounded-full" />
        <div className="ea-skeleton h-7 w-2/3 rounded-lg" />
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="ea-skeleton h-24" />
        ))}
      </div>
      <Card className="ea-skeleton h-80" />
      <Card className="ea-skeleton h-80" />
    </section>
  );
}

