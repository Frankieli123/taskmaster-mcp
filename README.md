# Task Master AI with PoloAI Support [![GitHub stars](https://img.shields.io/github/stars/Frankieli123/taskmaster-mcp?style=social)](https://github.com/Frankieli123/taskmaster-mcp/stargazers)

[![npm version](https://badge.fury.io/js/task-master-ai-polo.svg)](https://badge.fury.io/js/task-master-ai-polo) [![License: MIT with Commons Clause](https://img.shields.io/badge/license-MIT%20with%20Commons%20Clause-blue.svg)](LICENSE)

[![NPM Downloads](https://img.shields.io/npm/d18m/task-master-ai-polo?style=flat)](https://www.npmjs.com/package/task-master-ai-polo) [![NPM Downloads](https://img.shields.io/npm/dm/task-master-ai-polo?style=flat)](https://www.npmjs.com/package/task-master-ai-polo) [![NPM Downloads](https://img.shields.io/npm/dw/task-master-ai-polo?style=flat)](https://www.npmjs.com/package/task-master-ai-polo)

## Enhanced by [@Frankieli123](https://github.com/Frankieli123) | Original by [@eyaltoledano](https://x.com/eyaltoledano), [@RalphEcom](https://x.com/RalphEcom) & [@jasonzhou1993](https://x.com/jasonzhou1993)

[![Twitter Follow](https://img.shields.io/twitter/follow/eyaltoledano)](https://x.com/eyaltoledano)
[![Twitter Follow](https://img.shields.io/twitter/follow/RalphEcom)](https://x.com/RalphEcom)
[![Twitter Follow](https://img.shields.io/twitter/follow/jasonzhou1993)](https://x.com/jasonzhou1993)

An enhanced version of Task Master AI with integrated **PoloAI support** for Google Gemini models. All the power of the original Task Master with access to cutting-edge Gemini models through PoloAI.

## 🚀 What's New in This Enhanced Version

- **🤖 PoloAI Integration**: Full support for Google Gemini models
- **⚡ 6 Gemini Models**: Including Gemini 2.5 Pro, Gemini 2.5 Flash variants, and specialized models
- **💰 Cost-Effective**: Access powerful Gemini models at competitive rates
- **🔌 OpenAI-Compatible**: Seamless integration using familiar API patterns
- **🎯 All Original Features**: Complete Task Master functionality preserved

## Documentation

For more detailed information, check out the documentation in the `docs` directory:

- [Configuration Guide](docs/configuration.md) - Set up environment variables and customize Task Master
- [Tutorial](docs/tutorial.md) - Step-by-step guide to getting started with Task Master
- [Command Reference](docs/command-reference.md) - Complete list of all available commands
- [Task Structure](docs/task-structure.md) - Understanding the task format and features
- [Example Interactions](docs/examples.md) - Common Cursor AI interaction examples
- [Migration Guide](docs/migration-guide.md) - Guide to migrating to the new project structure

##### Quick Install for Cursor 1.0+ (One-Click)

[<img src="https://cursor.com/deeplink/mcp-install-dark.png" alt="Add Task Master MCP server to Cursor" style="max-height: 26px;">](cursor://anysphere.cursor-deeplink/mcp/install?name=taskmaster-ai&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIi0tcGFja2FnZT10YXNrLW1hc3Rlci1haSIsInRhc2stbWFzdGVyLWFpIl0sImVudiI6eyJBTlRIUk9QSUNfQVBJX0tFWSI6IllPVVJfQU5USFJPUElDX0FQSV9LRVlfSEVSRSIsIlBFUlBMRVhJVFlfQVBJX0tFWSI6IllPVVJfUEVSUExFWElUWV9BUElfS0VZX0hFUkUiLCJPUEVOQUlfQVBJX0tFWSI6IllPVVJfT1BFTkFJX0tFWV9IRVJFIiwiR09PR0xFX0FQSV9LRVkiOiJZT1VSX0dPT0dMRV9LRVlfSEVSRSIsIk1JU1RSQUxfQVBJX0tFWSI6IllPVVJfTUlTVFJBTF9LRVlfSEVSRSIsIk9QRU5ST1VURVJfQVBJX0tFWSI6IllPVVJfT1BFTlJPVVRFUl9LRVlfSEVSRSIsIlhBSV9BUElfS0VZIjoiWU9VUl9YQUlfS0VZX0hFUkUiLCJBWlVSRV9PUEVOQUJFX0FQSV9LRVkiOiJZT1VSX0FaVVJFX0tFWV9IRVJFIiwiT0xMQU1BX0FQSV9LRVkiOiJZT1VSX09MTEFNQV9BUElfS0VZX0hFUkUifX0%3D)

> **Note:** After clicking the install button, you'll still need to add your API keys to the configuration. The button installs the MCP server with placeholder keys that you'll need to replace with your actual API keys.

## Requirements

Taskmaster utilizes AI across several commands, and those require a separate API key. You can use a variety of models from different AI providers provided you add your API keys. For example, if you want to use Claude 3.7, you'll need an Anthropic API key.

You can define 3 types of models to be used: the main model, the research model, and the fallback model (in case either the main or research fail). Whatever model you use, its provider API key must be present in either mcp.json or .env.

At least one (1) of the following is required:

- **PoloAI API key** (for Gemini models - **NEW!**)
- Anthropic API key (Claude API)
- OpenAI API key
- Google Gemini API key
- Perplexity API key (for research model)
- xAI API Key (for research or main model)
- OpenRouter API Key (for research or main model)

Using the research model is optional but highly recommended. You will need at least ONE API key. Adding all API keys enables you to seamlessly switch between model providers at will.

## Quick Start

### Option 1: MCP (Recommended)

MCP (Model Control Protocol) lets you run Task Master directly from your editor.

#### 1. Add your MCP config at the following path depending on your editor

| Editor       | Scope   | Linux/macOS Path                      | Windows Path                                      | Key          |
| ------------ | ------- | ------------------------------------- | ------------------------------------------------- | ------------ |
| **Cursor**   | Global  | `~/.cursor/mcp.json`                  | `%USERPROFILE%\.cursor\mcp.json`                  | `mcpServers` |
|              | Project | `<project_folder>/.cursor/mcp.json`   | `<project_folder>\.cursor\mcp.json`               | `mcpServers` |
| **Windsurf** | Global  | `~/.codeium/windsurf/mcp_config.json` | `%USERPROFILE%\.codeium\windsurf\mcp_config.json` | `mcpServers` |
| **VS Code**  | Project | `<project_folder>/.vscode/mcp.json`   | `<project_folder>\.vscode\mcp.json`               | `servers`    |

##### Manual Configuration

###### Cursor & Windsurf (`mcpServers`)

```json
{
  "mcpServers": {
    "taskmaster-ai": {
      "command": "npx",
      "args": ["-y", "--package=task-master-ai-polo", "task-master-ai"],
      "env": {
        "OPENAI_API_KEY": "YOUR_POLO_API_KEY_HERE",
        "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY_HERE",
        "PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
        "GOOGLE_API_KEY": "YOUR_GOOGLE_KEY_HERE",
        "MISTRAL_API_KEY": "YOUR_MISTRAL_KEY_HERE",
        "OPENROUTER_API_KEY": "YOUR_OPENROUTER_KEY_HERE",
        "XAI_API_KEY": "YOUR_XAI_KEY_HERE",
        "AZURE_OPENAI_API_KEY": "YOUR_AZURE_KEY_HERE",
        "OLLAMA_API_KEY": "YOUR_OLLAMA_API_KEY_HERE"
      }
    }
  }
}
```

> 🔑 **For PoloAI**: Use your PoloAI API key as the `OPENAI_API_KEY` value. PoloAI uses OpenAI-compatible endpoints.

> 🔑 Replace `YOUR_…_KEY_HERE` with your real API keys. You can remove keys you don't use.

###### VS Code (`servers` + `type`)

```json
{
  "servers": {
    "taskmaster-ai": {
      "command": "npx",
      "args": ["-y", "--package=task-master-ai-polo", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY_HERE",
        "PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
        "OPENAI_API_KEY": "YOUR_OPENAI_KEY_HERE",
        "GOOGLE_API_KEY": "YOUR_GOOGLE_KEY_HERE",
        "MISTRAL_API_KEY": "YOUR_MISTRAL_KEY_HERE",
        "OPENROUTER_API_KEY": "YOUR_OPENROUTER_KEY_HERE",
        "XAI_API_KEY": "YOUR_XAI_KEY_HERE",
        "AZURE_OPENAI_API_KEY": "YOUR_AZURE_KEY_HERE"
      },
      "type": "stdio"
    }
  }
}
```

> 🔑 Replace `YOUR_…_KEY_HERE` with your real API keys. You can remove keys you don't use.

#### 2. (Cursor-only) Enable Taskmaster MCP

Open Cursor Settings (Ctrl+Shift+J) ➡ Click on MCP tab on the left ➡ Enable task-master-ai with the toggle

#### 3. (Optional) Configure the models you want to use

**For PoloAI/Gemini models**, in your editor's AI chat pane, say:

```txt
Change the main model to polo/gemini-2.5-flash-preview-05-20-nothinking
```

**Available PoloAI Models:**
- `polo/gemini-2.5-flash-preview-05-20-nothinking` - Fast, no thinking mode (Score: 0.5)
- `polo/gemini-2.5-flash-preview-05-20` - Fast with thinking (Score: 0.5)
- `polo/gemini-2.5-pro-preview-05-06-net` - Pro with network access (Score: 0.638)
- `polo/gemini-2.5-pro-preview-06-05` - Latest Pro model (Score: 0.638)
- `polo/gemini-2.5-pro-preview-05-06-thinking` - Pro with thinking mode (Score: 0.638)
- `polo/gemini-2.5-flash-net` - Flash with network access (Score: 0.5)

**For other models**, in your editor's AI chat pane, say:

```txt
Change the main, research and fallback models to <model_name>, <model_name> and <model_name> respectively.
```

[Table of available models](docs/models.md)

#### 4. Initialize Task Master

In your editor's AI chat pane, say:

```txt
Initialize taskmaster-ai in my project
```

#### 5. Make sure you have a PRD (Recommended)

For **new projects**: Create your PRD at `.taskmaster/docs/prd.txt`  
For **existing projects**: You can use `scripts/prd.txt` or migrate with `task-master migrate`

An example PRD template is available after initialization in `.taskmaster/templates/example_prd.txt`.

> [!NOTE]
> While a PRD is recommended for complex projects, you can always create individual tasks by asking "Can you help me implement [description of what you want to do]?" in chat.

**Always start with a detailed PRD.**

The more detailed your PRD, the better the generated tasks will be.

#### 6. Common Commands

Use your AI assistant to:

- Parse requirements: `Can you parse my PRD at scripts/prd.txt?`
- Plan next step: `What's the next task I should work on?`
- Implement a task: `Can you help me implement task 3?`
- Expand a task: `Can you help me expand task 4?`

[More examples on how to use Task Master in chat](docs/examples.md)

### Option 2: Using Command Line

#### Installation

```bash
# Install globally
npm install -g task-master-ai-polo

# OR install locally within your project
npm install task-master-ai-polo
```

#### Initialize a new project

```bash
# If installed globally
task-master init

# If installed locally or using latest version
npx task-master-ai-polo init
```

This will prompt you for project details and set up a new project with the necessary files and structure.

#### PoloAI-Specific Usage

```bash
# Quick start with PoloAI
npx task-master-ai-polo init
npx task-master-ai-polo models --setup

# Set your preferred Gemini model
npx task-master-ai-polo models --set-main gemini-2.5-flash-preview-05-20-nothinking

# Check current model configuration
npx task-master-ai-polo models

# Parse PRD with PoloAI
npx task-master-ai-polo parse-prd --input=your-prd.txt --research

# Add task with PoloAI
npx task-master-ai-polo add-task --prompt="Create a new feature" --research
```

#### Common Commands

```bash
# Initialize a new project
task-master init
# OR with latest features
npx task-master-ai-polo init

# Configure AI models (interactive setup)
task-master models --setup
# OR
npx task-master-ai-polo models --setup

# Set specific PoloAI model
task-master models --set-main gemini-2.5-flash-preview-05-20-nothinking
# OR
npx task-master-ai-polo models --set-main gemini-2.5-flash-preview-05-20-nothinking

# Parse a PRD and generate tasks
task-master parse-prd your-prd.txt

# List all tasks
task-master list

# Show the next task to work on
task-master next

# Generate task files
task-master generate
```

## Troubleshooting

### If `task-master init` doesn't respond

Try using the enhanced version directly:

```bash
npx task-master-ai-polo init
```

Or if you have issues with MCP:

```bash
# Clear npm cache
npm cache clean --force

# Clear npx cache
npx clear-npx-cache

# Try again
npx task-master-ai-polo init
```

For development, clone the enhanced repository:

```bash
git clone https://github.com/Frankieli123/taskmaster-mcp.git
cd taskmaster-mcp
npm install
node scripts/init.js
```

## Contributors

<a href="https://github.com/eyaltoledano/claude-task-master/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=eyaltoledano/claude-task-master" alt="Task Master project contributors" />
</a>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=eyaltoledano/claude-task-master&type=Timeline)](https://www.star-history.com/#eyaltoledano/claude-task-master&Timeline)

## Licensing

Task Master is licensed under the MIT License with Commons Clause. This means you can:

✅ **Allowed**:

- Use Task Master for any purpose (personal, commercial, academic)
- Modify the code
- Distribute copies
- Create and sell products built using Task Master

❌ **Not Allowed**:

- Sell Task Master itself
- Offer Task Master as a hosted service
- Create competing products based on Task Master

See the [LICENSE](LICENSE) file for the complete license text and [licensing details](docs/licensing.md) for more information.
