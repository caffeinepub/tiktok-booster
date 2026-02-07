export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return {
      valid: false,
      error: 'Please enter a TikTok video URL',
    };
  }

  try {
    const urlObj = new URL(url);
    if (!urlObj.protocol.startsWith('http')) {
      return {
        valid: false,
        error: 'URL must start with http:// or https://',
      };
    }
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid URL',
    };
  }
}
