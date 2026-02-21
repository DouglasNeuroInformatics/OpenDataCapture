import { cn } from '@douglasneuroinformatics/libui/utils';
import type { BundlerInput, ESBuildFailure } from '@opendatacapture/instrument-bundler';
import { range } from 'lodash-es';

export type CodeErrorBlockProps = {
  context: {
    files: BundlerInput[];
    indexFilename: null | string;
  };
  error: { cause: ESBuildFailure };
};

export const CodeErrorBlock = ({ context, error }: CodeErrorBlockProps) => {
  const location = error.cause.errors[0]?.location;

  const indexFile = context.files.find((file) => file.name === context.indexFilename);

  if (!(typeof indexFile?.content === 'string' && location)) {
    return null;
  }

  const lines = indexFile.content.split('\n');
  const indexOfError = lines.indexOf(location.lineText);

  if (indexOfError === -1) {
    console.error(`Could not find index of error: ${location.lineText}`);
    return null;
  }

  const startIndex = Math.max(0, indexOfError - 3);

  const endIndex = Math.min(lines.length, indexOfError + 4);

  return (
    <code className="bg-card mt-2 flex flex-col rounded-md border p-3 text-xs">
      {range(startIndex, endIndex).map((index) => {
        let textContent = lines[index]!.trimStart();
        const leftPadding = ' '.repeat(lines[index]!.length - textContent.length);
        textContent = textContent.trimEnd();
        return (
          <div className="text-muted-foreground flex" key={index}>
            <div className="w-8 shrink-0 border-r text-right">
              <span className="pr-2">{index + 1}</span>
            </div>
            <div className="whitespace-pre-wrap px-4">
              <span>{leftPadding}</span>
              <span
                className={cn(
                  'text-muted-foreground',
                  index === indexOfError && 'text-destructive underline decoration-wavy'
                )}
              >
                {textContent}
              </span>
            </div>
          </div>
        );
      })}
    </code>
  );
};
