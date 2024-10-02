import { TimeValue } from './TimeValue';

export type InfoBlockProps = {
  items: {
    [key: string]: string;
  };
  label: string;
};

export const InfoBlock = ({ items, label }: InfoBlockProps) => {
  return (
    <div>
      <h5 className="mb-1 font-semibold">{label}</h5>
      <ul className="text-muted-foreground grid gap-0.5">
        {Object.entries(items).map(([key, value]) => (
          <li key={key}>
            <span>{key}: </span>
            {value.startsWith('Uptime=') ? <TimeValue value={parseInt(value.slice(7))} /> : <span>{value}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};
