# GPT Image 2 飞书字段捷径

基于飞书多维表格 FaaS 字段捷径和 APIMart GPT Image 2 API 实现。

## 配置项

- 生图提示词：支持手动输入和引用其他字段
- 参考图片：可选附件字段，最多 16 张
- 模型版本：`gpt-image-2`
- 图像尺寸：1K / 2K / 4K，支持自动比例和 15 种固定比例
- 生成数量：当前 API 仅支持 1 张
- 官方渠道兜底：可选
- 授权：APIMart Bearer API Key

字段执行后会提交异步任务，轮询任务状态，并将最终图片 URL 返回为飞书附件字段。

## 本地运行

1. 安装依赖：

   ```bash
   npm install
   ```

2. 将 `config.json` 中的 `YOUR_APIMART_API_KEY` 替换为本地调试用 API Key。不要提交真实密钥。

3. 启动字段配置调试服务：

   ```bash
   npm start
   ```

4. 运行不访问真实 API 的模拟测试：

   ```bash
   npm run test
   ```

5. 构建或打包：

   ```bash
   npm run build
   npm run pack
   ```

## 发布配置

在字段捷径发布表单中使用 FaaS 版，添加域名白名单 `api.apimart.ai`。授权类型为 Header Bearer Token，平台值为 `base`。

API 文档：[GPT-Image-2 图像生成](https://docs.apimart.ai/cn/api-reference/images/gpt-image-2/generation)
