// src/common/filters/global-exception.filter.ts
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import type { ApiErrorItem, ApiErrorResponse } from "../types/api-response.type";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const { statusCode, message, error, errors } =
            this.normalizeException(exception);

        if (statusCode >= 500) {
            this.logger.error(
                `[${request.method}] ${request.url}`,
                exception instanceof Error ? exception.stack : String(exception),
            );
        }

        const body: ApiErrorResponse = {
            ok: false,
            message,
            error,
            statusCode,
            ...(errors.length > 0 ? { errors } : {}),
            meta: {
                timestamp: new Date().toISOString(),
                path: request.url,
            },
        };

        response.status(statusCode).json(body);
    }

    private normalizeException(exception: unknown): {
        statusCode: number;
        message: string;
        error: string;
        errors: ApiErrorItem[];
    } {
        if (exception instanceof HttpException) {
            const statusCode = exception.getStatus();
            const response = exception.getResponse();

            if (typeof response === "string") {
                return {
                    statusCode,
                    message: response,
                    error: this.getDefaultErrorName(statusCode),
                    errors: [],
                };
            }

            if (typeof response === "object" && response !== null) {
                const res = response as {
                    message?: string | string[];
                    error?: string;
                    statusCode?: number;
                };

                const validationErrors = this.extractValidationErrors(res.message);

                return {
                    statusCode,
                    message:
                        validationErrors.length > 0
                            ? "Validation failed"
                            : this.extractMessage(res.message) ||
                            res.error ||
                            this.getDefaultErrorName(statusCode),
                    error: res.error ?? this.getDefaultErrorName(statusCode),
                    errors: validationErrors,
                };
            }

            return {
                statusCode,
                message: this.getDefaultErrorName(statusCode),
                error: this.getDefaultErrorName(statusCode),
                errors: [],
            };
        }

        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Internal server error",
            error: "Internal Server Error",
            errors: [],
        };
    }

    private extractMessage(message?: string | string[]) {
        if (!message) return null;

        if (Array.isArray(message)) {
            return message[0] ?? null;
        }

        return message;
    }

    private extractValidationErrors(message?: string | string[]): ApiErrorItem[] {
        if (!Array.isArray(message)) return [];

        return message.map((item) => {
            const field = item.split(" ")[0];

            return {
                field,
                message: item,
            };
        });
    }

    private getDefaultErrorName(statusCode: number) {
        switch (statusCode) {
            case 400:
                return "Bad Request";
            case 401:
                return "Unauthorized";
            case 403:
                return "Forbidden";
            case 404:
                return "Not Found";
            case 409:
                return "Conflict";
            case 422:
                return "Unprocessable Entity";
            case 429:
                return "Too Many Requests";
            case 500:
                return "Internal Server Error";
            default:
                return "Error";
        }
    }
}