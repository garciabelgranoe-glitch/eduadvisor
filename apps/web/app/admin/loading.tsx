import { Card } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <section className="space-y-4">
      <Card className="space-y-2">
        <div className="ea-skeleton h-4 w-40 rounded-full" />
        <div className="ea-skeleton h-7 w-2/3 rounded-lg" />
        <div className="ea-skeleton h-4 w-full rounded-lg" />
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="ea-skeleton h-24" />
        <Card className="ea-skeleton h-24" />
        <Card className="ea-skeleton h-24" />
      </div>
      <Card className="ea-skeleton h-72" />
    </section>
  );
}
