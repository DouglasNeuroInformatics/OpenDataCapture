/// <reference types="./global.d.ts" />

declare module '*.html' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.json' {
  const src: any;
  export default src;
}

declare module 'react/jsx-runtime' {
  export * from '/runtime/v1/react@18.x/jsx-runtime';
}
