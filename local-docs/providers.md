
--- Repository Documentation ---

## Supported Model Providers

cursor‑tools is built with a flexible provider system that lets you choose which AI “model provider” to use for each command. Under the hood, cursor‑tools supports the following providers:

• **gemini**  
 • Implements the GeminiProvider class.  
 • Primarily used for deep repository analysis and planning tasks.  
 • Automatically adjusts the model based on repository context size—for example, if the token count is very large, it switches to a pro‑grade model (typically “gemini‑2.0‑pro‑exp”).  
 • Usage requires a Gemini API key in the environment (e.g., `GEMINI_API_KEY=your_key_here`) and specify “gemini” as the provider (either via the `--provider` flag on the CLI or in your configuration file).  
 • You can also override the default model by providing the `--model` option (for example, `--model=gemini-2.0-flash-thinking-exp`).

• **openai**  
 • Implements the OpenAIProvider class built on OpenAI’s official client.  
 • Often used for tasks like browser command responses, chat completions, and content generation.  
 • Requires your OpenAI API key (set as `OPENAI_API_KEY`) and supports the standard OpenAI chat completion interface.  
 • The default model is `o3‑mini` unless overridden via the `--model` option or in your config.

• **openrouter**  
 • Implements the OpenRouterProvider class, which extends the OpenAI base functionality.  
 • Uses a dedicated endpoint (`https://openrouter.ai/api/v1`) along with additional headers (for example, setting an HTTP referer).  
 • Requires an API key specified as `OPENROUTER_API_KEY` and is ideal for tasks where alternative routing or additional model experimentation is desired.  
 • Like other providers, you can override the default model by using the `--model` flag; OpenRouter is commonly used with models such as `google/gemini-2.0-pro-exp-02-05:free`.

• **perplexity**  
 • Implements the PerplexityProvider class, designed for web search and research tasks.  
 • Uses the Perplexity API endpoint (`https://api.perplexity.ai/chat/completions`) and requires the `PERPLEXITY_API_KEY`.  
 • Particularly effective for querying current web information and performing deep research, it supports models typically prefixed with “sonar” (for example, `sonar-pro`) to indicate their web search capability.  
 • If an unsupported model is selected, the provider automatically suggests using a compatible one (e.g. switching to `sonar-pro`).

• **modelbox**  
 • Implements the ModelBoxProvider class, which offers an OpenAI-compatible API hosted at `https://api.model.box/v1`.  
 • Requires the `MODELBOX_API_KEY` to function.  
 • Suitable for scenarios where a unified API interface is preferred while leveraging ModelBox’s capabilities.  
 • By default, ModelBox uses a model such as `anthropic/claude-3-5-sonnet` and will automatically adjust to a Perplexity‑style model (e.g. `perplexity/sonar`) if web search is needed and the current model does not support it.

### How to Choose and Use a Provider

– **Selecting a Provider:**  
 You can specify the desired provider by using the `--provider` flag when running a command, or by setting it in your configuration file (e.g. in the “repo”, “doc”, “web” or “stagehand” sections of `cursor-tools.config.json`).  
 For example, to run the repository analysis command with OpenRouter, you can do:  
  `cursor-tools repo "explain authentication" --provider=openrouter`  

– **Overriding the Model:**  
 Each provider comes with a default model, but you can override it using the `--model` flag. This allows you to experiment with different models for different tasks. For instance:  
  `cursor-tools browser act "Click login" --url=https://example.com --provider=openai --model=gpt-4o`  

– **Configuration:**  
 Provider defaults and token limits can be defined in your configuration file (`cursor-tools.config.json`). Under the provider-specific configuration (e.g. “gemini”, “openai”, “openrouter”, “perplexity”, “modelbox”), you can set:  
  • the default model  
  • maximum token limits  
  • additional provider-specific settings  
 This allows consistent behavior across different commands without needing to specify options every time.

– **API Key Setup:**  
 Before using any provider, ensure that the corresponding API key is set in your environment (or via a .env file). For example:  
  • For Gemini: `GEMINI_API_KEY=your_key_here`  
  • For OpenAI: `OPENAI_API_KEY=your_key_here`  
  • For OpenRouter: `OPENROUTER_API_KEY=your_key_here`  
  • For Perplexity: `PERPLEXITY_API_KEY=your_key_here`  
  • For ModelBox: `MODELBOX_API_KEY=your_key_here`

– **Automatic Handling:**  
 Some providers include built‑in logic such as automatic model switching (e.g. GeminiProvider will switch to a “pro” model if the token count exceeds a threshold). Errors such as missing API keys, network issues, or empty responses are handled with meaningful messages so you can diagnose configuration or connectivity issues quickly.

By leveraging this provider system, cursor‑tools enables you to choose the right tool for the right task—whether you need cutting‑edge web research with Perplexity, expansive codebase analysis with Gemini, or secure browser operations via Stagehand backed by OpenAI or Anthropic.

This design allows you to mix and match providers at runtime, offering maximum flexibility for any AI‑assisted development workflow.

--- End of Documentation ---
