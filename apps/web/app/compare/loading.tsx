import { Card } from "@/components/ui/card";

export default function CompareLoading() {
  return (
    <section className="space-y-6">
      <Card className="space-y-2">
        <div className="ea-skeleton h-4 w-24 rounded-full" />
        <div className="ea-skeleton h-8 w-2/3 rounded-lg" />
      </Card>
      <Card className="space-y-3">
        <div className="ea-skeleton h-6 w-1/3 rounded-lg" />
        <div className="ea-skeleton h-12 w-full rounded-xl" />
        <div className="ea-skeleton h-12 w-full rounded-xl" />
        <div className="ea-skeleton h-12 w-2/3 rounded-xl" />
      </Card>
    </section>
  );
}

