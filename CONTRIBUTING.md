# 贡献指南

感谢你对 **25音乐播放器** 的兴趣！我们欢迎任何形式的贡献，无论是报告 Bug、提出新功能建议，还是提交代码改进。

## 🤝 如何贡献

### 1. 报告问题 (Issues)
如果你发现了 Bug 或有好的功能建议：
- 请先在 [Issues](../../issues) 中搜索是否已有类似的问题。
- 如果没有，请创建一个新的 Issue，并尽量提供以下信息：
  - **操作系统版本**（如 Windows 10/11）
  - **应用版本号**
  - **详细的复现步骤**
  - **预期的行为与实际的行为**
  - **相关的截图或日志**

### 2. 提交代码 (Pull Requests)
如果你想直接修复 Bug 或开发新功能：

#### 准备工作
1. **Fork** 本仓库到你的 GitHub 账号下。
2. **克隆** 你的 Fork 到本地：
   ```bash
   git clone https://github.com/<你的用户名>/music-player.git
   cd music-player
   ```
3. **添加上游仓库**（以便同步最新代码）：
   ```bash
   git remote add upstream https://github.com/<原仓库所有者>/music-player.git
   ```

#### 开发流程
1. **创建分支**：为你的修改创建一个独立的分支。
   ```bash
   git checkout -b feature/your-feature-name
   # 或者
   git checkout -b fix/issue-description
   ```
2. **进行修改**：编写代码并确保遵循项目的代码风格。
3. **测试**：确保你的修改不会破坏现有的功能。
   ```bash
   go test ./...
   wails dev
   ```
4. **提交更改**：使用清晰的提交信息。
   ```bash
   git commit -m "feat: 添加歌词滚动动画优化"
   # 或
   git commit -m "fix: 修复搜索结果为空时的页面崩溃问题"
   ```
5. **推送分支**：
   ```bash
   git push origin feature/your-feature-name
   ```
6. **发起 PR**：在 GitHub 上向主仓库发起 Pull Request。

### 3. 代码规范
- **Go 代码**：遵循 [Effective Go](https://go.dev/doc/effective_go) 和 [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)。
- **前端代码**：保持 JavaScript 和 CSS 的简洁性，避免引入不必要的第三方库。
- **注释**：为复杂的逻辑添加必要的注释，特别是涉及 API 交互的部分。

### 4. 提交信息规范
我们建议使用以下格式编写提交信息：
- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式调整（不影响逻辑）
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 增加或修改测试

## 🚀 开发环境设置
详见 [README.md](README.md) 中的“快速开始”章节。

## 💬 交流
如果你有任何问题，欢迎在 Issues 中讨论。

再次感谢你的支持！🎉
