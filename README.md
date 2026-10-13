# 张鑫振个人主页

网址：https://zxz-joseph.github.io/

React / TypeScript / React Three Fiber 个人主页，参考 [sen-3d-resume](https://github.com/dayinji/sen-3d-resume) 的滚动 3D 场景设计。源代码许可与素材范围见 `LICENSE` 和 `NOTICE`。

## 本地开发

```sh
cd web
npm ci
npm run dev
```

验证：`npm run typecheck`、`npm run lint`、`npm run build`。生产构建输出到 `web/dist/`。

## 更新内容和人像

个人介绍、经历、邮箱及模型路径集中在 `web/src/data/profile.ts`。项目区和当前工作描述按用户要求保留“待更新”。

人像为根据照片特征设计的风格化三维手办，采用本地原创几何与材质，未使用照片贴图。它是艺术化形象，并非扫描复原。模型加载失败或 WebGL 不可用时，显示同一角色的静态渲染图，正文和联系链接保持可用。人物模型及其渲染图不属于代码的 MIT 许可范围。

运行 `node scripts/generate-portrait.mjs` 可重新导出模型；原始参考照片保存在仓库外。

## 发布

GitHub Pages 使用 Actions 发布 `web/dist/`。推送到 `main` 的网页变更会先通过类型检查、lint 和生产构建，再部署。`docs/` 中的规划文件不属于发布产物。

旧博客内容可通过 Git 历史恢复；独立的 `hello-agents-8-week` 项目不随此主页构建。
