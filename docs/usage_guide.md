# GPT Image 2 生图字段捷径使用说明

## 功能简介

GPT Image 2 生图字段捷径用于在飞书多维表格字段中调用 APIMart GPT Image 2 API，根据提示词和可选参考图片生成图片，并将生成结果返回为附件。

## 适用场景

- 商品图、场景图和营销素材生成
- 创意草图、设计参考图生成
- 需要在多维表格中批量管理提示词和生成结果的图片工作流

## 使用方法

1. 在多维表格中新增字段捷径字段。
2. 选择「GPT Image 2 生图」。
3. 配置生图提示词，可直接输入文本，也可以引用其他字段。
4. 可选配置参考图片字段，字段类型需为附件，最多使用 16 张图片。
5. 选择模型版本、图片尺寸和官方渠道兜底开关。
6. 填写 APIMart API Key 授权。
7. 执行字段后，插件会提交异步生图任务并轮询任务状态，完成后返回图片附件。

## 授权说明

插件使用 Header Bearer Token 方式接入 APIMart API Key。API Key 仅用于调用 APIMart 图像生成接口。

## 外部服务

- 域名白名单：`api.apimart.ai`
- API 文档：`https://docs.apimart.ai/cn/api-reference/images/gpt-image-2/generation`

