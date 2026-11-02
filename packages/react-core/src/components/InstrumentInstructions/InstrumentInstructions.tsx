export type InstrumentInstructionsProps = {
  instructions: string[];
};

/** Renders each instruction in its own paragraph, keeping the line breaks within an entry. */
export const InstrumentInstructions = ({ instructions }: InstrumentInstructionsProps) => {
  return (
    <>
      {instructions.map((instruction, i) => (
        // entries may repeat, so the index is the only stable key
        <p className="text-muted-foreground text-sm whitespace-pre-line" key={i}>
          {instruction}
        </p>
      ))}
    </>
  );
};
