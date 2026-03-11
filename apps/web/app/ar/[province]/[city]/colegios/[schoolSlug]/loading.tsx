import { Card } from "@/components/ui/card";

export default function SchoolProfileLoading() {
  return (
    <section className="space-y-6">
      <Card className="space-y-3">
        <div className="ea-skeleton h-4 w-28 rounded-full" />
        <div className="ea-skeleton h-9 w-2/3 rounded-lg" />
        <div className="ea-skeleton h-16 w-full rounded-xl" />
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <div className="ea-skeleton h-6 w-1/2 rounded-lg" />
          <div className="ea-skeleton h-24 w-full rounded-xl" />
        </Card>
        <Card className="space-y-3">
          <div className="ea-skeleton h-6 w-1/2 rounded-lg" />
          <div className="ea-skeleton h-24 w-full rounded-xl" />
        </Card>
      </div>
      <Card className="ea-skeleton h-72 w-full rounded-2xl" />
    </section>
  );
}

