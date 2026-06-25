/**
 * Tracks which assignments have cleared the proof-of-work human-verification gate.
 *
 * The subject solves the Cap challenge once (before beginning the instrument) and the
 * server records the assignment id here. Subsequent submissions are authorized against
 * this set rather than the Cap token, which would otherwise expire 20 minutes after
 * being redeemed — too short for a long form.
 *
 * State is held in memory, consistent with the in-memory Cap token store (`noFSState`).
 * A server restart simply requires the subject to re-verify.
 */
const verifiedAssignments = new Set<string>();

export function clearAssignmentVerification(assignmentId: string): void {
  verifiedAssignments.delete(assignmentId);
}

export function isAssignmentVerified(assignmentId: string): boolean {
  return verifiedAssignments.has(assignmentId);
}

export function markAssignmentVerified(assignmentId: string): void {
  verifiedAssignments.add(assignmentId);
}
