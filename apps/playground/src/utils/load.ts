async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        return reject(
          new Error(`Failed to load blob: unexpected type of FileReader result '${typeof result}', expected 'string'`)
        );
      }
      resolve(result.replace('data:', '').replace(/^.+,/, ''));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function loadAssetAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return blobToBase64(blob);
}

export async function loadNativeFileContent(file: File): Promise<string> {
  let content: string;
  if (file.type.startsWith('image')) {
    content = await blobToBase64(file);
  } else if (file.type.startsWith('text')) {
    content = await file.text();
  } else {
    throw new Error(`Unexpected MIME type for file '${file.name}': '${file.type}'`);
  }
  return content;
}
