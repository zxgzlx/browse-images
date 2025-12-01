# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

-   [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

# 运行

pnpm install
pnpm tauri dev

# 相关问题解决

## 问题 1

vscode 种 react 中 Property 'div' does not exist on type 'JSX.IntrinsicElements'

```bash
npm install --save-dev @types/react @types/react-dom
```

## 核心点

这里的核心点是如何加载本地资源，重要的地方在 tauri.config.json 文件中配置：

```json
    "security": {
      "csp": null,
      "assetProtocol": {
        "enable": true,
        "scope": ["**"]
      }
    }
```

然后再 js 中通过这个 api 加载

```ts
import { convertFileSrc } from '@tauri-apps/api/core';
url: convertFileSrc(imagePath);
```
