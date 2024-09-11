import { useState } from 'react';

import { FileDropzone } from '@douglasneuroinformatics/libui/components';
import { Button } from '@douglasneuroinformatics/libui/components';

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="align-center justify-center">
      <FileDropzone file={file} setFile={setFile} />
      <Button>Submit</Button>
    </div>
  );
};
