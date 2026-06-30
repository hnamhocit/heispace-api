import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClerkClient } from "@clerk/backend";

@Injectable()
export class ClerkService {
    private readonly client;

    constructor(private readonly configService: ConfigService) {
        this.client = createClerkClient({
            secretKey: this.configService.getOrThrow<string>("CLERK_SECRET_KEY"),
        });
    }

    async getUser(clerkUserId: string) {
        return this.client.users.getUser(clerkUserId);
    }
}