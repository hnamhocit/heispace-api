import {
    ConflictException,
    Injectable,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "src/database/database.service";
import { users } from "src/database/schema";
import { CreateMeDto } from "./dtos";

@Injectable()
export class UsersService {
    constructor(private readonly database: DatabaseService) { }

    async findByClerkUserId(clerkUserId: string) {
        const [user] = await this.database.db
            .select()
            .from(users)
            .where(eq(users.clerkUserId, clerkUserId))
            .limit(1);

        return user ?? null;
    }

    async findByUsername(username: string) {
        const [user] = await this.database.db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        return user ?? null;
    }

    async createMe(clerkUserId: string, input: CreateMeDto) {
        const existing = await this.findByClerkUserId(clerkUserId);

        if (existing) {
            throw new ConflictException("PROFILE_ALREADY_EXISTS");
        }

        const usernameTaken = await this.findByUsername(input.username);

        if (usernameTaken) {
            throw new ConflictException("USERNAME_ALREADY_EXISTS");
        }

        const [created] = await this.database.db
            .insert(users)
            .values({
                clerkUserId,
                fullName: input.fullName,
                username: input.username,
                avatar: input.avatar,
                phoneNumber: input.phoneNumber,
                gender: input.gender ?? "prefer_not_to_say",
                birthDay: input.birthDay,
                email: input.email
            })
            .returning();

        return created
    }
}