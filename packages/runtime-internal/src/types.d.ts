/**
 * Evaluates an instrument bundle stored as a string. This function does not
 * perform any output validation.
 *
 * **IMPORTANT: ONLY INPUT FROM TRUSTED USERS MUST BE PASSED TO THIS FUNCTION. THE ONLY EXCEPTION
 * TO THIS IS ON A COMPLETELY STATIC WEBSITE THAT NEVER INTERACTS WITH OUR SERVERS (I.E., THE INSTRUMENT
 * PLAYGROUND).**
 */
export declare function evaluateInstrument(bundle: string): Promise<any>;

/** Encodes a Unicode string into a Base64 string */
export declare function encodeUnicodeToBase64(s: string): string;

/** Decodes a Base64 string back into a Unicode string. */
export declare function decodeBase64ToUnicode(s: string): string;

/** Remove the scope from a subject ID (e.g., root$123 -> 123) */
export declare function removeSubjectIdScope(id: string): string;
