import { FieldCode, FieldContext } from '@lark-opdev/block-basekit-server-api';
import { executeImageGeneration } from '../src';

interface MockResponse {
  status: number;
  body: unknown;
}

async function run() {
  const responses: MockResponse[] = [
    {
      status: 200,
      body: {
        code: 200,
        data: [{ status: 'submitted', task_id: 'task_test_123' }],
      },
    },
    {
      status: 200,
      body: {
        code: 200,
        data: {
          id: 'task_test_123',
          status: 'processing',
          progress: 50,
        },
      },
    },
    {
      status: 200,
      body: {
        code: 200,
        data: {
          id: 'task_test_123',
          status: 'completed',
          progress: 100,
          result: {
            images: [
              {
                url: ['https://upload.apimart.ai/f/image/test-result.png'],
              },
            ],
          },
        },
      },
    },
  ];

  const calls: Array<{ url: string; authorizationId?: string }> = [];
  const context = {
    logID: 'test-log',
    packID: 'test-pack',
    fetch: async (url: string, _init: unknown, authorizationId?: string) => {
      calls.push({ url, authorizationId });
      const response = responses.shift();
      if (!response) {
        throw new Error('Unexpected request');
      }
      return {
        status: response.status,
        text: async () => JSON.stringify(response.body),
      };
    },
  } as unknown as FieldContext;

  const result = await executeImageGeneration(
    {
      prompt: '一只橘猫坐在窗台上看夕阳，水彩画风格',
      referenceImages: [
        {
          name: 'reference.png',
          tmp_url: 'https://example.feishu.cn/reference.png',
        },
      ],
      model: { label: 'GPT Image 2', value: 'gpt-image-2' },
      sizePreset: { label: '2K 1:1', value: '2k|1:1' },
      officialFallback: { label: '关闭', value: 'false' },
    },
    context,
    {
      firstDelayMs: 0,
      intervalMs: 0,
      maxAttempts: 3,
    },
  );

  if (result.code !== FieldCode.Success) {
    throw new Error(`Expected success, received ${result.code}`);
  }

  const data = result.data as Array<{
    name: string;
    content: string;
    contentType: string;
  }>;

  if (
    data.length !== 1 ||
    data[0].name !== 'test-result.png' ||
    data[0].contentType !== 'attachment/url'
  ) {
    throw new Error(`Unexpected attachment result: ${JSON.stringify(data)}`);
  }

  if (
    calls.length !== 3 ||
    calls.some((call) => call.authorizationId !== 'apimart_api_key')
  ) {
    throw new Error(`Authorization was not applied: ${JSON.stringify(calls)}`);
  }

  console.log('Mock generation test passed.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
