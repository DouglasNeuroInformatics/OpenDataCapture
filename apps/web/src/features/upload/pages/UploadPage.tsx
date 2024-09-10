import { useState } from 'react';

import { FileDropzone } from '@douglasneuroinformatics/libui/components';

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div>
      <FileDropzone file={file} setFile={setFile} />
    </div>
  );
};
