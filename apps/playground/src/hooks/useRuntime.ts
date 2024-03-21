import { useEffect, useState } from 'react';

import axios from 'axios';
import _ from 'lodash';

type RuntimeManifest = {
  declarations: string[];
  sources: string[];
};

export function useRuntime(version: string) {
  const [declarations, setDeclarations] = useState<{ [key: string]: string }>({});
  const [manifest, setManifest] = useState<RuntimeManifest>({
    declarations: [],
    sources: []
  });

  const loadDeclaration = async (filename: string) => {
    const response = await axios.get<string>(`/runtime/${version}/${filename}`);
    setDeclarations((prevDeclarations) => ({ ...prevDeclarations, [filename]: response.data }));
  };

  useEffect(() => {
    axios
      .get<RuntimeManifest>(`/runtime/${version}/runtime.json`)
      .then((response) => setManifest(response.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    _.difference(manifest.declarations, Object.keys(declarations)).forEach((filename) => {
      void loadDeclaration(filename);
    });
  }, [manifest]);

  return {
    libs: _.mapKeys(declarations, (_, key) => `/runtime/${version}/${key}`)
  };
}
