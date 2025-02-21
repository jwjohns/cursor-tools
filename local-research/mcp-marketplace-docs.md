Querying Perplexity AI using sonar-pro for: What is the Cline MCP marketplace and how does it work? What is the API format for listing servers?
The Cline MCP Marketplace is a centralized platform for browsing, installing, and managing Model Context Protocol (MCP) servers[1][4]. It functions like an app store for AI capabilities, allowing users to easily add new functionalities to their AI assistants[1].

Key features:
- Browse available MCP servers
- View ratings, downloads, and descriptions
- Install servers with a single click
- Automatic setup and configuration[1]

The process for listing an MCP server in the marketplace:
1. Create a GitHub repository for the MCP server
2. Include a llms-installation.md file with installation instructions
3. Submit an issue to the mcp-marketplace repo with:
   - GitHub repo URL
   - 400x400 PNG logo
   - Brief description[1][6]

API format for listing servers:
```json
{
  "name": "Server Name",
  "description": "Brief description of server functionality",
  "repoUrl": "https://github.com/username/repo",
  "logo": "base64_encoded_png_data",
  "category": "Category Name"
}
```

Developers can submit their MCP servers for inclusion in the marketplace, making them discoverable and easily installable by Cline users[2][6].