export const InfoBlock: React.FC<{ items: { [key: string]: string }; label: string }> = ({ items, label }) => {
  return (
    <div>
      <h5 className="mb-1 font-semibold">{label}</h5>
      <ul className="text-muted-foreground grid gap-0.5">
        {Object.entries(items).map(([key, value]) => (
          <li key={key}>
            <span>{key}: </span>
            <span>{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
