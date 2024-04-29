export async function loadAssetAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        return reject(
          new Error(
            `Failed to load url '${url}': unexpected type of FileReader result '${typeof result}', expected 'string'`
          )
        );
      }
      resolve(result.replace('data:', '').replace(/^.+,/, ''));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
