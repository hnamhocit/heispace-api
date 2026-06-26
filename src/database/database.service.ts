import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
    private readonly client: ReturnType<typeof postgres>;
    public readonly db: Database;

    constructor(private readonly configService: ConfigService) {
        const databaseUrl = this.configService.getOrThrow<string>("DATABASE_URL");

        this.client = postgres(databaseUrl, {
            max: 10,
        });

        this.db = drizzle({
            client: this.client,
            schema,
        });
    }

    async onModuleDestroy() {
        await this.client.end();
    }
}