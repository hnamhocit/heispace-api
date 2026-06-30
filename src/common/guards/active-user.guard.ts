// src/auth/guards/active-user.guard.ts
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import type { AuthenticatedRequest } from "../types/authenticated-request.type";
import { UsersService } from "src/users/users.service";

@Injectable()
export class ActiveUserGuard implements CanActivate {
    constructor(private readonly usersService: UsersService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const clerkUserId = request.clerkAuth?.clerkUserId;

        if (!clerkUserId) {
            throw new ForbiddenException("AUTH_CONTEXT_MISSING");
        }

        const user = await this.usersService.findByClerkUserId(clerkUserId);

        if (!user) {
            throw new NotFoundException("PROFILE_NOT_FOUND");
        }

        if (!user.isActive) {
            throw new ForbiddenException("ACCOUNT_INACTIVE");
        }

        request.currentUser = user;

        return true;
    }
}