# 高校教师 AI 营销工具箱 · 项目文档

> **版本**：v1.0（2026-07-26）
> **定位**：面向科学家/教授/高校教师的 AI4S（AI for Science）营销获客 + 工具交付系统
> **状态**：已上线运行
> **本文档用途**：项目交接 + 持续迭代指南

---

## 一、项目一句话

把"政策经费钩子 → 能力诊断 → 工具推荐 → 课程内容培育 → 开源技能交付 → 营销话术触达"串成一条完整获客转化漏斗，帮助科学家了解、评估、接入 AI，并提供真实好用的科研工具。

**线上主入口**：https://tzjrkby8rc-sketch.github.io/ai4s-toolbox/
**GitHub 仓库**：https://github.com/tzjrkby8rc-sketch/ai4s-toolbox （GitHub Pages 从 `main` 分支根目录发布）

---

## 二、整体架构

```
                        ┌─────────────────────────────────────┐
                        │   门户 index.html（10 入口导航）      │
                        └─────────────────────────────────────┘
                                          │
        ┌───────────────┬─────────────────┼─────────────────┬────────────────┐
        ▼               ▼                 ▼                 ▼                ▼
   【获客层】       【诊断层】        【内容层】        【工具层】       【话术层】
   6 学科垂直页     通用诊断 home    课程中心 courses   技能包 skills    营销库 playbook
   life/material/   + 政策雷达       10 门课程卡片      120 技能+       6 学科成品话术
   engineering/     + 双轨推荐                         20 中文教程
   earth/math/
   cross
        │               │                 │                 │                │
        └───────────────┴────────┬────────┴─────────────────┘                │
                                 ▼                                          │
                        数据底座（落地页/data/*.js）                            │
   policies(政策) assets(137资产) skills(120技能) courses(10课) tutorials(20教程) verticals(场景)
                                 │
                        数据源：智爱赛思知识库 + 三大开源项目
```

**核心转化漏斗**：
```
政策钩子(4000万/百团百项) → 学科场景诊断 → 工具推荐(平台工具+开源技能双轨) → 留资
                                    ↓
              课程内容培育 + 营销话术触达 + 技能包工具交付
```

---

## 三、功能模块清单（10 个页面 + 6 个引擎）

### 3.1 线上页面（落地页/，全部已部署）

| 页面 | 文件 | 功能 | 数据来源 |
|------|------|------|----------|
| 学科门户 | `index.html` | 10 入口导航，深色科技风，生命科学标主推 | 静态 |
| 生命科学 | `life.html` | 4 场景（蛋白/药物/基因/影像）+ 专属诊断，**主推** | life_scenes.js |
| 物质科学 | `material.html` | 3 场景（计算化学/新材料/结构解析） | verticals.js |
| 工程技术 | `engineering.html` | 3 场景（光学/工业优化/湿实验），4000万钩子 | verticals.js |
| 地球环境 | `earth.html` | 2 场景（气象/海洋地震） | verticals.js |
| 数学量子 | `math.html` | 2 场景（数学推理/高性能计算） | verticals.js |
| 交叉学科 | `cross.html` | 2 场景（社科问卷/语音文本） | verticals.js |
| 通用诊断 | `home.html` | 政策雷达 + 6痛点能力诊断 + **双轨推荐**（平台工具+开源技能） | policies/assets/skills.js |
| 课程学习中心 | `courses.html` | 10 门课程卡片，标签筛选 + 展开详情（md 渲染） | courses.js |
| 科研技能包 | `skills.html` | 120 技能三维筛选 + 6环节分区 + 重型武器库 + 数据库直通车 | skills.js |
| Top20 教程 | `tutorials.html` | 20 个技能中文保姆级教程（安装/上手/例子/避坑） | tutorials.js |
| 营销要点库 | `playbook.html` | 6 学科成品话术，锚点导航 | playbook.js |

### 3.2 本地引擎（工作目录，可复用）

| 引擎 | 路径 | 功能 |
|------|------|------|
| 政策匹配 | `政策雷达/policy_match.py` | 学科+年龄+团队 → 政策清单 |
| 申报日历 | `政策雷达/deadline_calendar.py` | 申报窗口倒计时 |
| 工具导航 | `工具导航/tool_nav.py` | 137 资产按痛点/学科双视图检索 |
| 能力诊断 | `工具导航/diagnose.py` | 4维问卷 → 落地路径报告（CLI 版） |
| 课程转录 | `课程转录/`（见第六节） | 视频→视觉+语音→课程卡片 |
| 技能包构建 | `技能包/`（见第七节） | 三repo→精选→打标→翻译→教程 |

---

## 四、数据资产明细（落地页/data/）

| 文件 | 大小 | 内容 | 生成方式 |
|------|------|------|----------|
| `policies.js` | 5KB | 9 主政策 + 4 标杆（含申报窗口/资助强度/匹配标签） | 手工结构化（知识库） |
| `assets.js` | 20KB | **137 项平台资产**：12 智能体 + 33 工具链 + 92 模型 | `工具导航/build_assets.py` |
| `skills.js` | 69KB | **120 个开源技能**（三维标签 + 中文一句话） | `技能包/build_skills_db.py` + `translate_cn.py` |
| `courses.js` | 27KB | 10 门课程卡片（标题/讲师/一句话/正文 md） | `课程转录/build_courses_js.py` |
| `tutorials.js` | 32KB | 20 个技能中文教程 md | `技能包/gen_tutorials.py` |
| `verticals.js` | 8KB | 5 学科场景配置（主题色/Hero/场景/卡点） | 手工编写 |
| `life_scenes.js` | 3KB | 生命科学 4 场景 | 手工编写 |
| `playbook.js` | 8KB | 6 学科营销话术 md | `课程转录/gen_marketing.py` |

**关键设计**：页面 = 模板 + 数据 JS。改内容只动数据文件，不动 HTML。

---

## 五、三大内容来源

| 来源 | 提供了什么 | 许可 |
|------|-----------|------|
| **智爱赛思知识库**（`~/WorkBuddy/aisaisi知识库/`） | 政策 9+4、课程 14 门、智能体 12、模型 92、工具链 42 | 公开内容 |
| **K-Dense-AI/claude-scientific-skills** | 150 个执行层技能（精选 86）+ database-lookup 78 库 | MIT |
| **PKU-YuanGroup/OpenAI4S** | 34 个重型武器（精选 27：alphafold2/蛋白设计/对接） | MIT |
| **ai4s-research/open-science** | 7 个基础设施技能 + 10 个 MCP 连接器 | MIT |

三个开源 repo 克隆在 `技能包/repos/`（约 290M）。

---

## 六、课程转录流水线（方案 B：视觉+语音双路）

`课程转录/` 目录，把 10 门课程视频变成结构化营销卡片。

```
视频(CDN) ──► extract_assets.py ──► 音频(wav) + 关键帧(48张/课)
                │
                ├─► vision_understand.py ──► kimi-k3 视觉理解 PPT ──► vision/*_vision.md
                │
                └─► asr_transcribe.py / asr_parallel.py ──► whisper small ──► transcripts/*_asr.txt
                                │
                                ▼
                    gen_cards.py ──► kimi 融合(视觉+语音) ──► cards/*_课程卡片.md
                                │
                                ▼
                    build_courses_js.py ──► 落地页/data/courses.js
```

**关键技术点**：
- kimi-k3 走 **Anthropic 兼容端点** `https://api.kimi.com/coding/v1/messages`（`x-api-key` + `anthropic-version` 头，非 OpenAI 协议）
- whisper 装到**系统 python** `/usr/bin/python3`（非 pyenv）；HF 模型用 `HF_ENDPOINT=https://hf-mirror.com` 镜像（huggingface.co 直连不通）
- 10 门课：视觉 10/10、语音 10/10、卡片 10/10（含 06 气象、07 DrClaw）
- 注意：03 和 10 共用同一视频源（vol3AI629.mp4）

---

## 七、技能包构建流水线

`技能包/` 目录，把三大开源项目的技能重组为本项目的技能包。

```
repos/(3个repo) ──► parse_skills.py ──► raw_skills.json (191个元数据)
                        │
                        ▼
              build_skills_db.py ──► 精选120 + 三维打标(环节×学科×类型) ──► skills_db.json
                        │
                        ├─► translate_cn.py ──► 120个中文一句话(kimi批量)
                        │
                        └─► gen_tutorials.py ──► top20中文教程(kimi) ──► tutorials.json
                                │
                                ▼
                    落地页/data/skills.js + tutorials.js
```

**精选逻辑**（`build_skills_db.py`）：
- `DROP` 黑名单：砍玄学/医疗合规风险/需 SaaS 账号/太通用/重复（共 71 个）
- 同 id 去重：diffdock、literature-review 等两 repo 重复的合并来源标注
- 三维标签：环节（文献/假设/实验计算/分析/写作/诚信）× 学科（6）× 类型（即装即用/需GPU/数据连接器）
- `OVERRIDES` 手动修正误分

**更新技能包流程**：上游 repo 更新 → 重新 clone → 依次跑 parse → build → translate → gen_tutorials → 重新生成 js → 部署。

---

## 八、部署与运维

### 8.1 部署方式（GitHub Pages）

```bash
cd 落地页
# 1. 改内容（数据 js 或 html）
# 2. 提交
git add -A && git commit -m "feat: xxx"
# 3. 用 repo token 登录并推送
export PATH="$HOME/.local/bin:$PATH"
echo "<repo_token>" | gh auth login --hostname github.com --git-protocol https --with-token
gh auth setup-git
git push origin main
# 4. Pages 自动重建（约1分钟），验证
```

**注意**：
- `gh` 在 `~/.local/bin/gh`（brew 装太慢，从 gh-proxy.com 镜像下的 v2.62.0 预编译包）
- token 用后建议撤销（https://github.com/settings/tokens），再部署重新要
- 仓库曾有遗留 CNAME 文件导致 301 重定向事故，已删除——**不要再加 CNAME**，除非真绑域名

### 8.2 本地预览

```bash
cd 落地页 && python3 -m http.server 8899
# 打开 http://localhost:8899
```

### 8.3 验证（playwright）

本地有 playwright CLI + node 模块（`NODE_PATH=/Users/lirong/.npm-global/lib/node_modules`）。改动后用无头浏览器截图 + 模拟点击验证，再交付。

---

## 九、交接内容清单

### 9.1 线上（已部署，可访问）
- 10 个页面全部在线，域名 https://tzjrkby8rc-sketch.github.io/ai4s-toolbox/

### 9.2 本地工作目录（`~/WorkBuddy/科研营销工具箱/`）
| 目录 | 内容 | 大小 |
|------|------|------|
| `落地页/` | 网站源码 + git 仓库（可推送） | ~700K |
| `政策雷达/` | 政策匹配/日历引擎 + policies.json | 36K |
| `工具导航/` | 137 资产 + 诊断/导航引擎 | 72K |
| `课程转录/` | 转录流水线 + 10 课全部产物（含 19G 视频音频中间产物） | 19G |
| `技能包/` | 技能包流水线 + 3 个开源 repo 克隆 | 290M+ |

### 9.3 成果归档（`~/Desktop/高校教师ai营销工具箱/`）
- 7 个子目录的干净成果（无 19G 中间产物），README 是总导航

### 9.4 凭证（需重新获取）
| 凭证 | 用途 | 状态 |
|------|------|------|
| GitHub repo token | 推送部署 | 用后已撤销，再部署重新要 |
| kimi-k3 key | 视觉理解/翻译/教程/卡片生成 | `sk-kimi-Yf2...`（Anthropic 端点） |

---

## 十、持续迭代指南

### 10.1 常见迭代任务

| 任务 | 怎么做 |
|------|--------|
| **加/改政策** | 编辑 `落地页/data/policies.js`（或改 `政策雷达/policies.json` 后重新导出）→ 部署 |
| **加学科垂直页** | 在 `落地页/data/verticals.js` 加一科配置 → 跑 `node gen_verticals.js` → 部署 |
| **加课程** | 新课程卡片 md → 跑 `build_courses_js.py` → 部署 |
| **更新技能包** | 重新 clone 三 repo → 跑技能包流水线 4 脚本 → 部署 |
| **加技能教程** | 在 `gen_tutorials.py` 的 TOP20 加 id → 重跑 → 部署 |
| **改营销话术** | 改 `落地页/data/playbook.js`（或重跑 `gen_marketing.py`）→ 部署 |

### 10.2 待办/优化方向（Backlog）

- [ ] **留资表单接后端**：当前存 localStorage，需接邮件服务/CRM（可复用邮箱 agent 项目）
- [ ] **绑定自定义域名**：配 CNAME + DNS（如 ai4s.example.com）
- [ ] **top 教程扩充**：从 20 → 按需增加（依据诊断数据看哪些技能被推荐最多）
- [ ] **技能包版本锁定**：三 repo 当前是 main 快照，建议记录 commit hash 便于追溯
- [ ] **地球环境技能偏少**（仅 1 个）：三个开源项目都不偏地球科学，可补充其他来源
- [ ] **移动端体验细化**：页面已响应式，但技能包侧栏在移动端可优化为抽屉

### 10.3 迭代原则

1. **数据驱动**：页面=模板+数据，改内容只动 data/*.js
2. **诚实不编造**：所有数据来自真实知识库/开源项目，课程转录不伪造讲稿
3. **验证再交付**：改动后 playwright 实测渲染 + 交互，再推送
4. **token 即用即撤**：部署凭证不留存

---

## 十一、关键联系点速查

| 事项 | 位置/方式 |
|------|----------|
| 线上站点 | https://tzjrkby8rc-sketch.github.io/ai4s-toolbox/ |
| GitHub 仓库 | https://github.com/tzjrkby8rc-sketch/ai4s-toolbox |
| 工作目录 | `~/WorkBuddy/科研营销工具箱/` |
| 成果归档 | `~/Desktop/高校教师ai营销工具箱/` |
| 数据源知识库 | `~/WorkBuddy/aisaisi知识库/aisaisi知识库.md` |
| gh CLI | `~/.local/bin/gh` |
| kimi 端点 | `https://api.kimi.com/coding/v1/messages`（Anthropic 协议） |
| whisper | 系统 python `/usr/bin/python3` + hf-mirror 镜像 |

---

*文档版本 v1.0 · 2026-07-26 · 随项目迭代更新*
