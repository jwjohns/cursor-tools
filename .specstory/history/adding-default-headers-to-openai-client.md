## SpecStory

## Adding Default Headers to OpenAI Client (20/02/2025, 10:00:04)

_**User**_

For openrouter we want to add defaultHeaders to the OpenAI client instance constructor with 'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
        'X-Title': '<YOUR_SITE_NAME>', //

---

_**Assistant**_

I'll help you modify the OpenRouter provider to include the default headers in the OpenAI client instance. I'll first read the relevant code to understand the current implementation.

Looking at the code, I can see that the OpenRouterProvider extends OpenAIBase and initializes the OpenAI client in its constructor. I'll modify this to include the default headers.

I'll edit the file to add these headers:

---

_****_

```diff
    protected client: OpenAI;
  
-   constructor(apiKey: string, baseURL?: string) {
+   constructor(apiKey: string, baseURL?: string, defaultHeaders?: Record<string, string>) {
      super();
      this.client = new OpenAI({
        apiKey,
        ...(baseURL ? { baseURL } : {}),
+       defaultHeaders,
      });
    }
        throw new ApiKeyMissingError('OpenRouter');
      }
-     super(apiKey, 'https://openrouter.ai/api/v1');
+     super(apiKey, 'https://openrouter.ai/api/v1', {
+       defaultHeaders: {
+         'HTTP-Referer': 'https://cursor.sh',
+         'X-Title': 'Cursor Tools'
+       }
+     });
    }
  
```

---

_****_



I see there's a type error because I need to update the OpenAIBase constructor to properly handle the defaultHeaders parameter. Let me fix that:

---

_****_

```diff
    protected client: OpenAI;
  
-   constructor(apiKey: string, baseURL?: string, defaultHeaders?: Record<string, string>) {
+   constructor(apiKey: string, baseURL?: string, options?: { defaultHeaders?: Record<string, string> }) {
      super();
      this.client = new OpenAI({
        apiKey,
        ...(baseURL ? { baseURL } : {}),
-       defaultHeaders,
+       defaultHeaders: options?.defaultHeaders,
      });
    }
```

---

_****_



Now I'll update the OpenRouterProvider constructor to match the new parameter structure:

---

_****_



---

_****_



The changes look good now! I've made the following updates:

1. Added proper typing for the OpenAI client configuration in the OpenAIBase constructor by introducing an `options` parameter that can contain `defaultHeaders`
2. Updated the OpenRouterProvider to use these headers with:
   - 'HTTP-Referer': 'https://cursor.sh' (using Cursor's website)
   - 'X-Title': 'Cursor Tools' (using the project name)

The changes ensure that OpenRouter will properly identify and rank requests coming from Cursor Tools in their analytics. The headers are now properly typed and integrated into the OpenAI client configuration.

Is there anything else you'd like me to modify with these headers?

---



---

