export function getEnv(name: string, alt?: string): string {
  return process.env[name] || (alt ? process.env[alt] : "") || "";
}

const DEFAULT_MODEL = "gemini-2.5-flash";

const DEPRECATED_MODEL_MAP: Record<string, string> = {
  "gemini-2.0-flash": "gemini-2.5-flash",
  "gemini-2.0-flash-001": "gemini-2.5-flash",
  "gemini-2.0-flash-lite": "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite-001": "gemini-2.5-flash-lite",
};

function resolveGeminiModel(): string {
  const configured = getEnv("GEMINI_MODEL", "gemini_model") || DEFAULT_MODEL;
  return DEPRECATED_MODEL_MAP[configured] || configured;
}

export const env = {
  geminiApiKey: () => getEnv("GEMINI_API_KEY", "gemini_api_key"),
  geminiModel: resolveGeminiModel,
  resendApiKey: () => getEnv("RESEND_API_KEY", "resend_api_key"),
  resendFrom: () => getEnv("RESEND_FROM_EMAIL", "resend_from_email"),
};
