// src/common/interceptors/success-response.interceptor.ts
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { map, type Observable } from "rxjs";
import { API_MESSAGE_KEY } from "../decorators";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    constructor(private readonly reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<Request>();

        const message =
            this.reflector.get<string>(
                API_MESSAGE_KEY,
                context.getHandler(),
            ) ?? "Success";

        return next.handle().pipe(
            map((data) => {
                // Nếu endpoint trả undefined/null thì vẫn format đều.
                return {
                    ok: true,
                    message,
                    data: data ?? null,
                    meta: {
                        timestamp: new Date().toISOString(),
                        path: request.url,
                    },
                };
            }),
        );
    }
}