/**
 * FileSaver.js implements the saveAs() FileSaver interface in browsers that do not natively support it.
 * @param data - The actual file data blob.
 * @param filename - The optional name of the file to be downloaded. If omitted, the name used in the file data will be used. If none is provided "download" will be used.
 * @param disableAutoBOM - Optional & defaults to `false`. Set to `true` if you don't want FileSaver.js to automatically provide Unicode text encoding hints
 */
export declare function saveAs(data: Blob, filename?: string, disableAutoBOM?: boolean): void;

/**
 * This additional function was copy-pasted into the ManyBrains "library" and appears to be from this fork:
 * https://github.com/ChenWenBrian/FileSaver.js
 */

export declare function saveTextAs(textContent: string, fileName: string, charset: string): any;
