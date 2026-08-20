<p align="center">
  <a href="https://github.com/ice-deep-dream/dsh-plugin-design-center">
    <img alt="design-center" width="120" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%2360A5FA'/><stop offset='1' stop-color='%232563EB'/></linearGradient></defs><rect x='12' y='12' width='104' height='104' rx='24' fill='url(%23g)'/><rect x='28' y='34' width='28' height='20' rx='6' fill='none' stroke='white' stroke-width='3.5'/><rect x='72' y='34' width='28' height='20' rx='6' fill='white' fill-opacity='0.25' stroke='white' stroke-width='3.5'/><rect x='50' y='74' width='28' height='20' rx='6' fill='white'/><path d='M42 54 V64 a6 6 0 0 0 6 6 H56' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/><path d='M86 54 V64 a6 6 0 0 1 -6 6 H72' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/></svg>" />
  </a>
</p>
# @cryodream/dsh-client-ui-design-center

<p align="center">
  <img alt="npm" src="https://img.shields.io/badge/npm-%40cryodream%2Fdsh--client--ui--design--center-CB3837?logo=npm&style=flat-square">
  <img alt="React" src="https://img.shields.io/badge/React-%3E%3D18-61DAFB?logo=react&logoColor=white&style=flat-square">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square">
  <img alt="Platform" src="https://img.shields.io/badge/platform-web-4A90D9?style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-28A745?style=flat-square">
</p>

<p align="center"><b>简体中文</b> · <a href="./README.en.md">English</a></p>

> 为 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 打造的设计中心会话标签插件：把架构 / 模块 / 流程 / 计划看板原生渲染进对话面板，支持就地编辑与重新渲染。

## 特性

| 能力 | 说明 |
| --- | --- |
| 四合一看板 | 在一个专属会话标签内组织**架构**、**模块**、**流程**、**计划**四个子页签 |
| 原生对话集成 | 以 dsh 客户端插件形式注入，不弹窗、不跳页，与会话体验无缝衔接 |
| 手绘风 SVG | 渲染 paper 手绘风格图表，提供 Codex 纯白简约主题，干净克制 |
| 动画流程 | 流程图按步骤动画播放，连线使用实心箭头并自动裁切，避免重叠 |
| 就地编辑 | 直接在面板内编辑计划卡片（标题、版本、更新时间、正文） |
| 重新渲染 | 编辑后调用宿主端 Python 渲染器，一键重绘架构与流程图 |
| 技能协同 | 读取 `dev-plan-assistant` 技能生成的四份设计产物，开箱即用 |

## 工作方式

插件读取 `dev-plan-assistant` 技能在项目中生成的四份设计文件：

| 文件 | 形态 | 渲染 |
| --- | --- | --- |
| 架构图 | SVG | 架构子页签 |
| 模块图 | SVG | 模块子页签 |
| 流程图 | SVG（动画） | 流程子页签 |
| 开发计划 | JSON | 计划卡片，可编辑 |

安装后，打开任意会话即可在对话面板看到「设计中心」标签。

## 安装

通过 dsh 插件管理器以 web profile 安装：

```bash
dsh plugin --profile web add git+https://github.com/ice-deep-dream/dsh-plugin-design-center.git
```

随后重启 dsh（或重载 web profile），进入会话即可看到设计中心标签。

## 开发

本仓库为独立发布仓库，产物位于 `lib/`。从 harness 源码构建后，将编译产物同步到此处的 `lib/` 目录即可。

目录结构：

```text
dsh-plugin-design-center/
├── lib/                     # 编译产物（随包发布）
│   ├── index.js             # 插件入口
│   ├── client.js            # 客户端注入（设计中心标签）
│   ├── invariant.js         # 运行时常量（PACKAGE_NAME 等）
│   └── types/               # TypeScript 类型声明
├── package.json
├── .gitignore
├── README.md
└── README.en.md
```

运行时依赖宿主注入以下客户端模块：`@deepseek-ai/dsh-client-locale`、`@deepseek-ai/dsh-client-runtime`、`@deepseek-ai/dsh-client-ui-conversation`，并要求 React >= 18。

## 许可证

[MIT](./LICENSE)