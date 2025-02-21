// Base error class for all cursor-tools errors
export class CursorToolsError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'CursorToolsError';
  }

  // Format error message for user display
  public formatUserMessage(debug = false): string {
    let message = `${this.message}`;

    if (debug && this.details) {
      message += `\nDetails: ${JSON.stringify(this.details, null, 2)}`;
    }

    return message;
  }
}

// Provider-related errors
export class ProviderError extends CursorToolsError {
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'ProviderError';
    if (details instanceof Error) {
      this.cause = details;
    } else if (details) {
      console.error(message, details);
    }
  }
}

export class ApiKeyMissingError extends ProviderError {
  constructor(provider: string) {
    super(
      `API key for ${provider} is not set. Please set the ${provider.toUpperCase()}_API_KEY environment variable.`,
      { provider }
    );
    this.name = 'ApiKeyMissingError';
  }
}

export class ModelNotFoundError extends ProviderError {
  constructor(provider: string) {
    let message = `No model specified for ${provider}.`;
    
    // Add model suggestions based on provider
    switch (provider) {
      case 'openai':
        message += '\nSuggested models:\n- gpt-4-turbo-preview\n- gpt-3.5-turbo';
        break;
      case 'anthropic':
        message += '\nSuggested models:\n- claude-3-opus-20240229\n- claude-3-sonnet-20240229';
        break;
      case 'gemini':
        message += '\nSuggested models:\n- gemini-2.0-pro-exp\n- gemini-2.0-pro';
        break;
      case 'perplexity':
        message += '\nSuggested models:\n- sonar-pro\n- sonar-small-online';
        break;
      case 'openrouter':
        message += '\nSuggested models:\n- anthropic/claude-3-sonnet\n- google/gemini-pro\n- openai/gpt-4-turbo';
        break;
      case 'modelbox':
        message += '\nSuggested models:\n- perplexity/sonar-pro\n- anthropic/claude-3-sonnet';
        break;
    }
    
    message += '\nUse --model to specify a model.';
    
    super(message, { provider, model: undefined });
    this.name = 'ModelNotFoundError';
  }
}

export class NetworkError extends ProviderError {
  constructor(message: string, details?: unknown) {
    super(`Network error: ${message}`, details);
    this.name = 'NetworkError';
  }
}

export class GeminiRecitationError extends ProviderError {
  constructor(message?: string) {
    super(
      message || 'Gemini was unable to provide an original response and may be reciting the prompt. Please rephrase your query.',
      { finishReason: 'RECITATION' }
    );
    this.name = 'GeminiRecitationError';
  }
}

// File-related errors
export class FileError extends CursorToolsError {
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'FileError';
  }
}
