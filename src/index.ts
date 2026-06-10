import {
  AuthorizationType,
  basekit,
  field,
  FieldCode,
  FieldComponent,
  FieldContext,
  FieldType,
} from '@lark-opdev/block-basekit-server-api';

const { t } = field;

const APIMART_AUTH_ID = 'apimart_api_key';
const APIMART_API_BASE = 'https://api.apimart.ai/v1';
const APIMART_DOCS_URL =
  'https://docs.apimart.ai/cn/api-reference/images/gpt-image-2/generation';

const DEFAULT_POLL_OPTIONS: PollOptions = {
  firstDelayMs: 10_000,
  intervalMs: 5_000,
  maxAttempts: 144,
};

const ratioDimensions: Record<string, Record<string, string>> = {
  '1k': {
    '1:1': '1024x1024',
    '3:2': '1536x1024',
    '2:3': '1024x1536',
    '4:3': '1024x768',
    '3:4': '768x1024',
    '5:4': '1280x1024',
    '4:5': '1024x1280',
    '16:9': '1536x864',
    '9:16': '864x1536',
    '2:1': '2048x1024',
    '1:2': '1024x2048',
    '3:1': '1536x512',
    '1:3': '512x1536',
    '21:9': '2016x864',
    '9:21': '864x2016',
  },
  '2k': {
    '1:1': '2048x2048',
    '3:2': '2048x1360',
    '2:3': '1360x2048',
    '4:3': '2048x1536',
    '3:4': '1536x2048',
    '5:4': '2560x2048',
    '4:5': '2048x2560',
    '16:9': '2048x1152',
    '9:16': '1152x2048',
    '2:1': '2688x1344',
    '1:2': '1344x2688',
    '3:1': '3072x1024',
    '1:3': '1024x3072',
    '21:9': '2688x1152',
    '9:21': '1152x2688',
  },
  '4k': {
    '1:1': '2880x2880',
    '3:2': '3520x2336',
    '2:3': '2336x3520',
    '4:3': '3312x2480',
    '3:4': '2480x3312',
    '5:4': '3216x2576',
    '4:5': '2576x3216',
    '16:9': '3840x2160',
    '9:16': '2160x3840',
    '2:1': '3840x1920',
    '1:2': '1920x3840',
    '3:1': '3840x1280',
    '1:3': '1280x3840',
    '21:9': '3840x1648',
    '9:21': '1648x3840',
  },
};

const ratioOrder = [
  '1:1',
  '16:9',
  '9:16',
  '4:3',
  '3:4',
  '3:2',
  '2:3',
  '5:4',
  '4:5',
  '2:1',
  '1:2',
  '3:1',
  '1:3',
  '21:9',
  '9:21',
];

function createSizeOptions() {
  return ['2k', '1k', '4k'].flatMap((resolution) => [
    {
      label: `${resolution.toUpperCase()} ${t('autoRatio')}`,
      value: `${resolution}|auto`,
    },
    ...ratioOrder.map((ratio) => ({
      label: `${resolution.toUpperCase()} ${ratio} (${ratioDimensions[resolution][ratio]})`,
      value: `${resolution}|${ratio}`,
    })),
  ]);
}

basekit.addDomainList(['api.apimart.ai']);

basekit.addField({
  i18n: {
    messages: {
      'zh-CN': {
        prompt: '生图提示词',
        promptPlaceholder: '输入用于生成图像的提示词',
        promptHelp: '支持中英文，可引用多维表格中的其他字段。',
        referenceImages: '参考图片',
        referenceImagesHelp: '可选，选择一个附件字段，最多使用 16 张图片。',
        model: '模型版本',
        imageSize: '图像尺寸',
        imageCount: '生成数量',
        oneImage: '1 张',
        autoRatio: '自动比例',
        officialFallback: '官方渠道兜底',
        disabled: '关闭',
        enabled: '开启',
        authorization: 'APIMart API Key',
      },
      'en-US': {
        prompt: 'Image prompt',
        promptPlaceholder: 'Describe the image to generate',
        promptHelp: 'Chinese and English are supported. Other Base fields can be referenced.',
        referenceImages: 'Reference images',
        referenceImagesHelp: 'Optional. Select an attachment field with up to 16 images.',
        model: 'Model',
        imageSize: 'Image size',
        imageCount: 'Number of images',
        oneImage: '1 image',
        autoRatio: 'Auto ratio',
        officialFallback: 'Official fallback',
        disabled: 'Off',
        enabled: 'On',
        authorization: 'APIMart API Key',
      },
      'ja-JP': {
        prompt: '画像生成プロンプト',
        promptPlaceholder: '生成する画像の説明を入力',
        promptHelp: '中国語と英語に対応し、他のフィールドを参照できます。',
        referenceImages: '参照画像',
        referenceImagesHelp: '任意。最大16枚を含む添付ファイルフィールドを選択します。',
        model: 'モデル',
        imageSize: '画像サイズ',
        imageCount: '生成枚数',
        oneImage: '1枚',
        autoRatio: '自動比率',
        officialFallback: '公式経路フォールバック',
        disabled: 'オフ',
        enabled: 'オン',
        authorization: 'APIMart API Key',
      },
    },
  },
  formItems: [
    {
      key: 'prompt',
      label: t('prompt'),
      component: FieldComponent.Input,
      props: {
        placeholder: t('promptPlaceholder'),
        mode: 'textarea',
      },
      tooltips: [{ type: 'text', content: t('promptHelp') }],
      validator: {
        required: true,
      },
    },
    {
      key: 'referenceImages',
      label: t('referenceImages'),
      component: FieldComponent.FieldSelect,
      props: {
        mode: 'multiple',
        supportType: [FieldType.Attachment],
      },
      tooltips: [{ type: 'text', content: t('referenceImagesHelp') }],
    },
    {
      key: 'model',
      label: t('model'),
      component: FieldComponent.SingleSelect,
      defaultValue: {
        label: 'GPT Image 2',
        value: 'gpt-image-2',
      },
      props: {
        options: [
          {
            label: 'GPT Image 2',
            value: 'gpt-image-2',
          },
        ],
      },
      validator: {
        required: true,
      },
    },
    {
      key: 'sizePreset',
      label: t('imageSize'),
      component: FieldComponent.SingleSelect,
      defaultValue: {
        label: '2K 1:1 (2048x2048)',
        value: '2k|1:1',
      },
      props: {
        options: createSizeOptions(),
      },
      validator: {
        required: true,
      },
    },
    {
      key: 'imageCount',
      label: t('imageCount'),
      component: FieldComponent.SingleSelect,
      defaultValue: {
        label: t('oneImage'),
        value: '1',
      },
      props: {
        options: [
          {
            label: t('oneImage'),
            value: '1',
          },
        ],
      },
      validator: {
        required: true,
      },
    },
    {
      key: 'officialFallback',
      label: t('officialFallback'),
      component: FieldComponent.SingleSelect,
      defaultValue: {
        label: t('disabled'),
        value: 'false',
      },
      props: {
        options: [
          {
            label: t('disabled'),
            value: 'false',
          },
          {
            label: t('enabled'),
            value: 'true',
          },
        ],
      },
      validator: {
        required: true,
      },
    },
  ],
  authorizations: [
    {
      id: APIMART_AUTH_ID,
      platform: 'base',
      type: AuthorizationType.HeaderBearerToken,
      required: true,
      instructionsUrl: APIMART_DOCS_URL,
      label: t('authorization'),
      icon: {
        light: '',
        dark: '',
      },
    },
  ],
  resultType: {
    type: FieldType.Attachment,
  },
  execute: async (formItemParams, context) =>
    executeImageGeneration(formItemParams, context),
});

interface PollOptions {
  firstDelayMs: number;
  intervalMs: number;
  maxAttempts: number;
}

interface AttachmentInput {
  name?: string;
  size?: number;
  type?: string;
  tmp_url?: string;
}

interface ApiEnvelope<T> {
  code?: number;
  data?: T;
  error?: {
    message?: string;
  };
  message?: string;
}

interface SubmitTask {
  status?: string;
  task_id?: string;
}

interface TaskImage {
  url?: string | string[];
  expires_at?: number;
}

interface TaskResult {
  id?: string;
  status?: 'submitted' | 'processing' | 'completed' | 'failed' | string;
  progress?: number;
  result?: {
    images?: TaskImage[];
  };
  error?: {
    message?: string;
  };
}

interface FetchResult<T> {
  status: number;
  data: T | null;
  text: string;
}

export async function executeImageGeneration(
  formItemParams: Record<string, unknown>,
  context: FieldContext,
  pollOptions: PollOptions = DEFAULT_POLL_OPTIONS,
) {
  const debugLog = (label: string, details?: Record<string, unknown>) => {
    console.log(
      JSON.stringify({
        label,
        logID: context.logID,
        packID: context.packID,
        ...details,
      }),
    );
  };

  try {
    const prompt = normalizePrompt(formItemParams.prompt);
    if (!prompt) {
      debugLog('invalid prompt');
      return { code: FieldCode.InvalidArgument };
    }

    const attachments = collectAttachments(formItemParams.referenceImages);
    if (attachments.length > 16) {
      debugLog('too many reference images', { count: attachments.length });
      return { code: FieldCode.InvalidArgument };
    }

    const imageUrls = attachments
      .map((attachment) => attachment.tmp_url)
      .filter((url): url is string => Boolean(url));

    const model = getSelectValue(formItemParams.model, 'gpt-image-2');
    const sizePreset = getSelectValue(formItemParams.sizePreset, '2k|1:1');
    const [resolution, size] = parseSizePreset(sizePreset);
    const officialFallback =
      getSelectValue(formItemParams.officialFallback, 'false') === 'true';

    const body: Record<string, unknown> = {
      model,
      prompt,
      n: 1,
      size,
      resolution,
      official_fallback: officialFallback,
    };

    if (imageUrls.length > 0) {
      body.image_urls = imageUrls;
    }

    debugLog('submit task', {
      model,
      size,
      resolution,
      referenceImageCount: imageUrls.length,
      officialFallback,
    });

    const submitResponse = await requestJson<ApiEnvelope<SubmitTask[]>>(
      context,
      `${APIMART_API_BASE}/images/generations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
      APIMART_AUTH_ID,
    );

    if (submitResponse.status < 200 || submitResponse.status >= 300) {
      debugLog('submit request failed', {
        status: submitResponse.status,
        response: truncate(submitResponse.text),
      });
      return { code: mapHttpStatusToFieldCode(submitResponse.status) };
    }

    const taskId = submitResponse.data?.data?.[0]?.task_id;
    if (!taskId) {
      debugLog('missing task id', {
        status: submitResponse.status,
        response: truncate(submitResponse.text),
      });
      return { code: FieldCode.Error };
    }

    await delay(pollOptions.firstDelayMs);

    for (let attempt = 1; attempt <= pollOptions.maxAttempts; attempt += 1) {
      const taskResponse = await requestJson<ApiEnvelope<TaskResult>>(
        context,
        `${APIMART_API_BASE}/tasks/${encodeURIComponent(taskId)}`,
        { method: 'GET' },
        APIMART_AUTH_ID,
      );

      if (taskResponse.status < 200 || taskResponse.status >= 300) {
        debugLog('task query failed', {
          attempt,
          status: taskResponse.status,
          response: truncate(taskResponse.text),
        });
        return { code: mapHttpStatusToFieldCode(taskResponse.status) };
      }

      const task = taskResponse.data?.data;
      debugLog('task status', {
        attempt,
        status: task?.status || 'unknown',
        progress: task?.progress,
      });

      if (task?.status === 'completed') {
        const urls = collectResultUrls(task.result?.images);
        if (urls.length === 0) {
          debugLog('completed task has no images');
          return { code: FieldCode.Error };
        }

        return {
          code: FieldCode.Success,
          data: urls.slice(0, 5).map((url, index) => ({
            name: createFileName(url, index),
            content: url,
            contentType: 'attachment/url',
          })),
        };
      }

      if (task?.status === 'failed') {
        debugLog('task failed', {
          error: task.error?.message || taskResponse.data?.error?.message || 'unknown',
        });
        return { code: FieldCode.Error };
      }

      if (attempt < pollOptions.maxAttempts) {
        await delay(pollOptions.intervalMs);
      }
    }

    debugLog('task polling timed out', { taskId });
    return { code: FieldCode.Error };
  } catch (error) {
    debugLog('unexpected error', { error: String(error) });
    return { code: FieldCode.Error };
  }
}

async function requestJson<T>(
  context: FieldContext,
  url: string,
  init: Parameters<FieldContext['fetch']>[1],
  authorizationId: string,
): Promise<FetchResult<T>> {
  const response = await context.fetch(url, init, authorizationId);
  const text = await response.text();

  try {
    return {
      status: response.status,
      data: JSON.parse(text) as T,
      text,
    };
  } catch {
    return {
      status: response.status,
      data: null,
      text,
    };
  }
}

function normalizePrompt(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        if (item && typeof item === 'object') {
          const candidate = item as Record<string, unknown>;
          return typeof candidate.text === 'string'
            ? candidate.text
            : typeof candidate.value === 'string'
              ? candidate.value
              : '';
        }
        return '';
      })
      .join('')
      .trim();
  }

  return value == null ? '' : String(value).trim();
}

function getSelectValue(value: unknown, fallback: string): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    const selected = value as Record<string, unknown>;
    if (typeof selected.value === 'string') {
      return selected.value;
    }
  }

  return fallback;
}

function parseSizePreset(value: string): [string, string] {
  const [resolution, size] = value.split('|');
  if (
    !['1k', '2k', '4k'].includes(resolution) ||
    !['auto', ...ratioOrder].includes(size)
  ) {
    return ['2k', '1:1'];
  }
  return [resolution, size];
}

function collectAttachments(value: unknown): AttachmentInput[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectAttachments(item));
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.tmp_url === 'string') {
    return [candidate as AttachmentInput];
  }

  if ('value' in candidate) {
    return collectAttachments(candidate.value);
  }

  if ('attachments' in candidate) {
    return collectAttachments(candidate.attachments);
  }

  return [];
}

function collectResultUrls(images: TaskImage[] | undefined): string[] {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.flatMap((image) => {
    if (Array.isArray(image.url)) {
      return image.url.filter((url): url is string => typeof url === 'string');
    }
    return typeof image.url === 'string' ? [image.url] : [];
  });
}

function createFileName(url: string, index: number): string {
  try {
    const pathname = new URL(url).pathname;
    const name = decodeURIComponent(pathname.split('/').filter(Boolean).pop() || '');
    if (name && /\.[a-z0-9]{2,5}$/i.test(name)) {
      return name;
    }
  } catch {
    // Fall through to a stable generated file name.
  }

  return `gpt-image-2-${index + 1}.png`;
}

function mapHttpStatusToFieldCode(status: number): FieldCode {
  if (status === 400) {
    return FieldCode.InvalidArgument;
  }
  if (status === 401 || status === 403) {
    return FieldCode.AuthorizationError;
  }
  if (status === 402) {
    return FieldCode.PayError;
  }
  if (status === 429) {
    return FieldCode.RateLimit;
  }
  return FieldCode.Error;
}

function truncate(value: string, maxLength = 1_000): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function delay(milliseconds: number): Promise<void> {
  if (milliseconds <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export default basekit;
