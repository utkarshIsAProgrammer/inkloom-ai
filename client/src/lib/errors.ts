/** Turns anything thrown by the API layer into a sentence the UI can print. */
export function messageOf(cause: unknown): string {
  if (cause instanceof Error && cause.message) {
    return cause.message;
  }
  return "Something went wrong. Try again.";
}
