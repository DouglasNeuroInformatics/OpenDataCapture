export type InstrumentOverviewItemProps = {
  heading: string;
  text: string | string[];
};

export const InstrumentOverviewItem = ({ heading, text }: InstrumentOverviewItemProps) => {
  return (
    <div className="my-5 text-slate-600 dark:text-slate-300">
      <h5 className="mb-1 text-lg font-medium text-slate-900 dark:text-slate-100">{heading}</h5>
      {Array.isArray(text) ? (
        <ul>
          {text.map((s, i) => (
            <li className="my-3" key={i}>
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p>{text}</p>
      )}
    </div>
  );
};
