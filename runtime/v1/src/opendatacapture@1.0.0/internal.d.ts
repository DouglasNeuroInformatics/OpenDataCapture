/**
 * Evaluates an instrument bundle stored as a string. This function does not
 * perform any output validation.
 *
 * **IMPORTANT: ONLY INPUT FROM TRUSTED USERS MUST BE PASSED TO THIS FUNCTION. THE ONLY EXCEPTION
 * TO THIS IS ON A COMPLETELY STATIC WEBSITE THAT NEVER INTERACTS WITH OUR SERVERS (I.E., THE INSTRUMENT
 * PLAYGROUND).**
 */
export declare function evaluateInstrument(bundle: string): Promise<any>;
