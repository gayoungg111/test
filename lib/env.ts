export function getEnv(name: string, alt?: string): string {
  return process.env[name] || (alt ? process.env[alt] : "") || "";
}

export const env = {
  geminiApiKey: () => getEnv("GEMINI_API_KEY", "gemini_api_key"),
  geminiModel: () => getEnv("GEMINI_MODEL", "gemini_model") || "gemini-2.0-flash",
  resendApiKey: () => getEnv("RESEND_API_KEY", "resend_api_key"),
  resendFrom: () => getEnv("RESEND_FROM_EMAIL", "resend_from_email"),
};
