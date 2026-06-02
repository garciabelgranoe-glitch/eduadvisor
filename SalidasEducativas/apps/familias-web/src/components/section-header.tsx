type SectionHeaderProps = {
  title: string;
  description: string;
};

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <header className="section-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
