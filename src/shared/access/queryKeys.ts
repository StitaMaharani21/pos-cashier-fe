// Split out of useCapabilities.ts so shared/api/client.ts's response
// interceptor can reference the same key without importing that hook's
// module (which itself imports the api client — avoids a cycle).
export const CAPABILITIES_QUERY_KEY = ["capabilities"] as const
