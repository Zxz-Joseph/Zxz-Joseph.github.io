# 张鑫振个人主页

网址：https://zxz-joseph.github.io/

React / TypeScript 个人主页，参考 [sen-3d-resume](https://github.com/dayinji/sen-3d-resume) 的固定人像与滚动正文设计。源代码许可与素材范围见 `LICENSE` 和 `NOTICE`。

## 本地开发

```sh
cd web
npm ci
npm run dev
```

验证：`npm run typecheck`、`npm run lint`、`npm run build`。生产构建输出到 `web/dist/`。

## 更新内容和人像

个人介绍、经历、邮箱及人像路径集中在 `web/src/data/profile.ts`。项目区和当前工作描述按用户要求保留“待更新”。

人像是根据用户授权照片，经 Meshy / Nano Banana Pro 免费积分生成的三维插画风格图稿。按用户选择的免费方案，以透明 WebP 和轻微鼠标/滚动视差呈现；它是二维图稿动效，不支持绕转查看侧脸。系统启用减少动态效果时，人像保持静止。原照片保存在仓库外，未作为网页素材发布。

当前人像素材为 `web/public/portrait-joseph-v2.webp`。素材按 Meshy 免费方案的 CC BY 4.0 归属标注，页脚保留来源；详见 `NOTICE`。首版模型与生成脚本已移除，历史版本可通过 Git 恢复。

## 发布

GitHub Pages 使用 Actions 发布 `web/dist/`。推送到 `main` 的网页变更会先通过类型检查、lint 和生产构建，再部署。`docs/` 中的规划文件不属于发布产物。

旧博客内容可通过 Git 历史恢复；独立的 `hello-agents-8-week` 项目不随此主页构建。
