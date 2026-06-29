export type ApiResponseMeta = {
    timestamp: string;
    path: string;
}

export type ApiSuccessResponse<T = unknown> = {
    ok: true;
    message: string;
    data: T;
    meta: ApiResponseMeta;
};

export type ApiErrorItem = {
    field?: string;
    message: string;
};

export type ApiErrorResponse = {
    ok: false;
    message: string;
    error: string;
    statusCode: number;
    errors?: ApiErrorItem[];
    meta: ApiResponseMeta;
};