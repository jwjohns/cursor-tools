## SpecStory

## Searching Latest Version of shadcn-ui (19/02/2025, 17:27:08)

_**User**_

use perplexity to search for the instructions on how to set up a shadcn project

---

_**Assistant**_

I'll help you search for shadcn setup instructions using Perplexity. Let me do that web search for you.

---

_****_

```bash
pnpm dev web "what are the exact steps to set up a new shadcn/ui project from scratch? include all commands needed"
```

```

> cursor-tools@0.5.1-alpha.2 dev /Users/andy/repos/cursor-tools-worktree/pr-25
> node --import=tsx src/index.ts web 'what are the exact steps to set up a new s
hadcn/ui project from scratch? inc
lude all commands needed'
                                  
Querying perplexity using sonar-pro for: what are the exact steps to set up a ne
w shadcn/ui project from scratch? 
include all commands needed
                                  (node:64368) [DEP0040] DeprecationWarning: The
 `punycode` module is deprecated. Please use a userland alternative 
instead.
                                  (Use `node --trace-deprecation ...` to show wh
ere the warning was created)
Here are the exact steps to set up a new shadcn/ui project from scratch:

1. Create a new Next.js project:
```
npx create-next-app@latest my-app
```

2. Navigate to the project directory:
```
cd my-app
```

3. Initialize shadcn/ui:
```
npx shadcn-ui@latest init
```

4. Answer the prompts:
- Which style would you like to use? › Default (recommended)
- Which color would you like to use as base color? › Slate
- Do you want to use CSS variables for colors? › Yes

5. Install dependencies:
```
npm install
```

6. Add components as needed using the shadcn CLI:
```
npx shadcn-ui@latest add button
```

7. Start the development server:
```
npm run dev
```

These steps will set up a new Next.js project with shadcn/ui configured and read
y to use[1][2][3].
Perplexity disconnected without sending a finish_reason, we will close the conne
ction



```

---

_****_



Based on Perplexity's response, here are the complete steps to set up a shadcn/ui project:

1. First, create a new Next.js project:
```bash
npx create-next-app@latest my-app
```

2. Navigate into the project directory:
```bash
cd my-app
```

3. Initialize shadcn/ui:
```bash
npx shadcn-ui@latest init
```

During the initialization, you'll need to answer a few configuration prompts:
- Style: Choose "Default (recommended)"
- Base color: Select "Slate"
- CSS variables for colors: Select "Yes"

4. Install the project dependencies:
```bash
npm install
```

5. Add components as needed using the shadcn CLI. For example, to add a button component:
```bash
npx shadcn-ui@latest add button
```

6. Start the development server:
```bash
npm run dev
```

The project will be available at `http://localhost:3000` by default.

Note that shadcn/ui is not a component library in the traditional sense - it's more of a collection of reusable components that you copy into your project. This means you have full control over the code and can customize it as needed. Each component you add using `npx shadcn-ui add` will be added to your project's component directory, where you can modify it to suit your needs.

Would you like me to search for any specific component implementations or customization options?

---



---

