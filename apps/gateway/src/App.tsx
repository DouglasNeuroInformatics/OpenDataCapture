export type AppProps = Record<string, unknown>;

export const App = (props: AppProps) => {
  return (
    <div>
      <h1>Hello World</h1>
      <p>Props: {JSON.stringify(props, null, 2)}</p>
    </div>
  );
};
