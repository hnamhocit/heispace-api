import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { verifyToken } from "@clerk/backend";
import type { AuthenticatedRequest } from "../types/authenticated-request.type";

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const authorization = request.headers.authorization;

        if (!authorization?.startsWith("Bearer ")) {
            throw new UnauthorizedException("MISSING_TOKEN");
        }

        const token = authorization.replace("Bearer ", "");

        try {
            const payload = await verifyToken(token, {
                secretKey: this.configService.getOrThrow<string>("CLERK_SECRET_KEY"),
            });

            request.clerkAuth = {
                clerkUserId: payload.sub,
                sessionId: payload.sid as string | undefined,
            };

            return true;
        } catch {
            throw new UnauthorizedException("INVALID_TOKEN");
        }
    }
}