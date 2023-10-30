export type FormOverviewItemProps = {
  heading: string;
  text: string | string[];
};

export const FormOverviewItem = ({ heading, text }: FormOverviewItemProps) => {
  return (
    <div className="my-5">
      <h5 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{heading}</h5>
      {Array.isArray(text) ? (
        <ul>
          {text.map((s, i) => (
            <li className="my-3" key={i}>
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-600 dark:text-slate-300">{text}</p>
      )}
    </div>
  );
};
