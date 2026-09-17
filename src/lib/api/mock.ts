/** Shared flag for local UI mocks when API is unavailable. */
export function useApiMock(): boolean {
  return process.env.NEXT_PUBLIC_USE_AUTH_MOCK === "true";
}
