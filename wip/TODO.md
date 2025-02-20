# Web Search Capability Implementation TODO

## Overview
Add web search capability checks to ensure web search is only allowed for providers that support it:
- Gemini: All models (via Google direct API)
- Perplexity: Models with -online suffix
- OpenRouter: Perplexity models
- ModelBox: Perplexity models

## Tasks

### 1. Provider Capability System
- [ ] Add `supportsWebSearch(model?: string)` method to `BaseModelProvider` interface in `src/providers/base.ts`
- [ ] Implement method in each provider class:
  ```typescript
  // GeminiProvider
  supportsWebSearch(model?: string): boolean {
    return true; // Gemini always supports web search
  }

  // PerplexityProvider
  supportsWebSearch(model?: string): boolean {
    return model?.endsWith('-online') ?? false; // Only online models support web search
  }

  // OpenRouterProvider
  supportsWebSearch(model?: string): boolean {
    return model?.startsWith('perplexity/') ?? false; // Only Perplexity models via OpenRouter
  }

  // ModelBoxProvider
  supportsWebSearch(model?: string): boolean {
    return model?.startsWith('perplexity/') ?? false; // Only Perplexity models via ModelBox
  }
  ```

### 2. Environment Variable Control
- [ ] Add `ENABLE_WEB_SEARCH_OVERRIDE` environment variable support
- [ ] Implement validation in `WebCommand.execute`:
  ```typescript
  const WEB_SEARCH_OVERRIDE = process.env.ENABLE_WEB_SEARCH_OVERRIDE?.toLowerCase();
  const isOverridden = WEB_SEARCH_OVERRIDE === 'true' || WEB_SEARCH_OVERRIDE === '1';
  ```
- [ ] Add warning message when override is used

### 3. Web Command Updates
- [ ] Update capability check in `WebCommand.execute`:
  ```typescript
  if (!isOverridden && !provider.supportsWebSearch(model)) {
    throw new ProviderError(
      `Web search is not supported by ${providerName} with model ${model}.\n` +
      `Please use one of these providers/models that support web search:\n` +
      `- Gemini (any model)\n` +
      `- Perplexity (models ending with -online)\n` +
      `- OpenRouter (perplexity/* models)\n` +
      `- ModelBox (perplexity/* models)\n\n` +
      `Or set ENABLE_WEB_SEARCH_OVERRIDE=true to bypass this check (not recommended)`
    );
  }
  ```
- [ ] Add override warning message:
  ```typescript
  if (isOverridden) {
    console.warn(
      `Warning: Web search compatibility check bypassed via ENABLE_WEB_SEARCH_OVERRIDE.\n` +
      `This may result in errors or unexpected behavior.`
    );
  }
  ```

### 4. Provider Creation Consolidation
- [ ] Move provider creation to `src/providers/base.ts`:
  ```typescript
  export function createProvider(
    provider: 'gemini' | 'openai' | 'openrouter' | 'perplexity' | 'modelbox'
  ): BaseModelProvider {
    switch (provider) {
      case 'gemini':
        return new GeminiProvider();
      case 'openai':
        return new OpenAIProvider();
      case 'openrouter':
        return new OpenRouterProvider();
      case 'perplexity':
        return new PerplexityProvider();
      case 'modelbox':
        return new ModelBoxProvider();
      default:
        throw new ModelNotFoundError(provider);
    }
  }
  ```
- [ ] Update imports in all command files to use the consolidated provider creation

### 5. Documentation Updates
- [ ] Update cursor rules template with web search provider information
- [ ] Add environment variable documentation
- [ ] Update provider-specific model requirements

### 6. Testing
- [ ] Test each provider with supported and unsupported models
- [ ] Test environment variable override
- [ ] Test error messages and warnings
- [ ] Test provider creation consolidation

## Notes
- Perplexity web search support is determined by the -online suffix in the model name
- Environment variable override should be used with caution
- Clear error messages should guide users to supported providers/models

## Testing Instructions
1. Test each provider with web search:
   ```bash
   # Should work
   pnpm dev web "query" --provider=gemini
   pnpm dev web "query" --provider=perplexity --model=sonar-medium-online
   pnpm dev web "query" --provider=openrouter --model=perplexity/sonar-medium-online
   pnpm dev web "query" --provider=modelbox --model=perplexity/sonar-medium-online

   # Should fail
   pnpm dev web "query" --provider=openai
   pnpm dev web "query" --provider=perplexity --model=sonar-medium
   pnpm dev web "query" --provider=openrouter --model=anthropic/claude-3
   ```

2. Test override:
   ```bash
   ENABLE_WEB_SEARCH_OVERRIDE=true pnpm dev web "query" --provider=openai
   ```

## Implementation Order
1. Add `supportsWebSearch` to `BaseModelProvider`
2. Implement provider-specific checks
3. Add environment variable support
4. Update web command with checks
5. Consolidate provider creation
6. Update documentation
7. Add tests 