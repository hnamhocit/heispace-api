import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthenticatedRequest } from "../types/authenticated-request.type";

export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        return request.currentUser;
    },
);