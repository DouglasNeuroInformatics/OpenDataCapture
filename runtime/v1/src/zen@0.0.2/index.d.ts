type AnyFunction = (...args: any[]) => any;
export type Zen = {
  elements: {
    [key: string]: HTMLElement | null;
  };
  params: {
    [key: string]: any;
  };
  slides?: HTMLCollectionOf<HTMLElement>;
  timeouts: any[];
};
export type ZenElement = {
  [key: string]: any;
} & HTMLElement;
export declare const getWindowHeight: () => number;
export declare const getWindowWidth: () => number;
export declare function coinFlip(n: number): number;
export declare function range(m: number, n: number): number[];
export declare function polygon(
  n: any,
  r: any,
  offsetX: any,
  offsetY: any
): {
  x: any;
  y: any;
}[];
export declare function cartesianProduct(a: any, b: any): any;
export declare function vector(a: any, b: any, c: any, d: any): number[];
export declare function crossProduct(u: any, v: any): number[];
export declare function magnitude(u: any): number;
export declare function dotProduct(u: any[], v: any[]): number;
/** positions is an array of {x,y} points */
export declare function maximumDeviation(positions: any[]): any;
export declare function areaUnderCurve(positions: any[]): number;
export declare const zen: Zen;
export declare function $$$(id: string): ZenElement | null;
export declare function showSlide(id: string): void;
export declare function degreesToCentimeters(degrees: number, viewingDistance: number): number;
export declare function centimetersToDegrees(centimeters: number, viewingDistance: number): number;
export declare function disableElasticScrolling(): void;
export declare function fixOrientation(orientation: 'landscape' | 'portrait'): void;
export declare function disableTouch(objs: any): void;
export declare function getTouchInput(objs: any, fun: any, state: any, duration: any): boolean;
export declare function disableKeyboard(): void;
export declare function getKeyboardInput(acceptedKeys: any, fun: any, state: any, duration: any): boolean;
export declare function keyValue(code: any): any;
export declare function chain(): number[] | undefined;
export declare function clearChain(a: any[]): void;
export declare function preload(images: any, callback: AnyFunction): void;
export declare function createCookie(name: string, value: any, days: number): void;
export declare function readCookie(name: string): string | null;
export declare function eraseCookie(name: string): void;
export declare function disableSelect(): void;
export declare function disableRightClick(): void;
export declare function disableDrag(): void;
export declare function insertAfter(referenceNode: Node, newNode: Node): void;
export declare function generateForm(survey: any, node: any, action: any, method: any, buttonText: any): void;
export {};
