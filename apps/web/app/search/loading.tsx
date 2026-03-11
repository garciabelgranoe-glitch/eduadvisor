import { Card } from "@/components/ui/card";

export default function SearchLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <Card className="space-y-3">
          <div className="ea-skeleton h-5 w-1/2 rounded-lg" />
          <div className="ea-skeleton h-11 w-full rounded-xl" />
          <div className="ea-skeleton h-11 w-full rounded-xl" />
          <div className="ea-skeleton h-11 w-full rounded-xl" />
          <div className="ea-skeleton h-11 w-full rounded-xl" />
        </Card>
      </aside>
      <section className="space-y-4">
        <div className="ea-skeleton h-8 w-64 rounded-lg" />
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="space-y-3">
              <div className="ea-skeleton h-6 w-1/2 rounded-lg" />
              <div className="ea-skeleton h-4 w-1/3 rounded-lg" />
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="ea-skeleton h-16 w-full rounded-xl" />
                <div className="ea-skeleton h-16 w-full rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

