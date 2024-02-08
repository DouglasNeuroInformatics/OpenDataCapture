export type InstrumentOverviewItemProps = {
  afterText?: React.ReactNode;
  heading: string;
  kind?: 'default' | 'link';
  text: string | string[];
};

export const InstrumentOverviewItem = ({ afterText, heading, kind, text }: InstrumentOverviewItemProps) => {
  return (
    <div className="my-5 text-slate-700 dark:text-slate-300">
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
        <div className="flex items-center gap-2">
          {kind === 'link' ? (
            <a
              className="underline underline-offset-1 hover:text-slate-950 hover:dark:text-slate-50"
              href={text}
              rel="noreferrer"
              target="_blank"
            >
              {text}
            </a>
          ) : (
            <p>{text}</p>
          )}
          {afterText}
        </div>
      )}
    </div>
  );
};
