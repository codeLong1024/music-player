---
trigger: always_on
---

# Git 推送规则

## 用户账号信息
- **GitHub/Gitee 用户名**: codeLong1024
- **SSH 密钥已配置**，无需每次输入密码

## 远程仓库配置（必须使用 SSH 协议）
- **GitHub**: `git@github.com:codeLong1024/{仓库名}.git`
- **Gitee**: `git@gitee.com:codeLong1024/{仓库名}.git`

## 推送规范（强制执行）

### 1. 双平台同步
- ✅ **必须同时推送到 GitHub 和 Gitee**
- ❌ **禁止只推送一个平台**
- 推荐命令：`git push github master && git push gitee master`

### 2. SSH 协议优先
- ✅ **必须使用 SSH 格式**（git@github.com:用户名/仓库.git）
- ❌ **禁止使用 HTTPS 格式**（https://github.com/用户名/仓库.git）
- 原因：HTTPS 在某些网络环境下会触发 SSL 证书验证错误

### 3. 首次配置检查
添加远程仓库时，必须先确认用户是否已配置 SSH：
```bash
# 正确做法
git remote add github git@github.com:codeLong1024/仓库名.git
git remote add gitee git@gitee.com:codeLong1024/仓库名.git

# 如果误加了 HTTPS，立即修改
git remote set-url github git@github.com:codeLong1024/仓库名.git
git remote set-url gitee git@gitee.com:codeLong1024/仓库名.git
```

## 执行检查清单
每次执行 `git push` 前，必须确认：
1. [ ] 远程仓库使用 SSH 协议
2. [ ] 同时推送 GitHub 和 Gitee
3. [ ] 无遗漏任何一个平台
