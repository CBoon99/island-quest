export type HandlerResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

export type HandlerEvent = {
  httpMethod: string;
  body: string | null;
  queryStringParameters: Record<string, string | undefined> | null;
  headers?: Record<string, string | undefined> | null;
};

export type Handler = (event: HandlerEvent) => Promise<HandlerResponse>;

export function json(
  statusCode: number,
  body: unknown,
  extraHeaders?: Record<string, string>,
): HandlerResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

export function errorResponse(
  statusCode: number,
  code: string,
  message: string,
  requestId: string,
): HandlerResponse {
  return json(statusCode, {
    error: { code, message, requestId },
  });
}

export function requestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
