Querying Perplexity AI using sonar-pro for: How to write an esbuild plugin to handle require() calls and module resolution? Specifically, I need to handle a case where a module is using require('punycode') but we want to provide our own implementation or redirect the require. Please provide detailed examples of onResolve and onLoad handlers, and explain how namespace and path resolution work in esbuild plugins.
To handle require() calls and custom module resolution in an esbuild plugin, you can use the onResolve and onLoad hooks. Here's an example plugin that intercepts require('punycode') calls and provides a custom implementation:

```javascript
const punycode = {
  name: 'punycode-redirect',
  setup(build) {
    // Intercept require('punycode')
    build.onResolve({ filter: /^punycode$/ }, args => {
      return {
        path: args.path,
        namespace: 'punycode-ns'
      };
    });

    // Provide custom implementation
    build.onLoad({ filter: /.*/, namespace: 'punycode-ns' }, () => {
      return {
        contents: `
          module.exports = {
            // Custom punycode implementation
            encode: function(input) { /* ... */ },
            decode: function(input) { /* ... */ }
          };
        `,
        loader: 'js'
      };
    });
  }
};
```

This plugin works as follows:

1. The onResolve hook intercepts any import/require of 'punycode' and assigns it a custom namespace.

2. The onLoad hook provides the actual implementation for the intercepted module.

Namespace and path resolution:
- Namespaces isolate plugin-handled modules from regular file system resolution.
- The path returned by onResolve is used as the module identifier in the bundle.
- onLoad receives the path and namespace from onResolve to load the correct content[1][5].

To use this plugin:

```javascript
await esbuild.build({
  entryPoints: ['app.js'],
  bundle: true,
  outfile: 'out.js',
  plugins: [punycode]
});
```

This approach allows you to intercept and redirect any module import or require call, providing custom implementations or redirecting to different modules as needed[1][5][6].