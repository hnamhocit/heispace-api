import type { Request } from "express";
import type { User } from "src/database/schema";

export type ClerkAuth = {
    clerkUserId: string;
    sessionId?: string;
};

export type AuthenticatedRequest = Request & {
    clerkAuth: ClerkAuth;
    currentUser?: User;
}