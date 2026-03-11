import { Card } from "@/components/ui/card";

export default function RootLoading() {
  return (
    <section className="space-y-4">
      <Card className="h-28 animate-pulse bg-brand-50/60" />
      <Card className="h-52 animate-pulse bg-white" />
      <Card className="h-52 animate-pulse bg-white" />
    </section>
  );
}
