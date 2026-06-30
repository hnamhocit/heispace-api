import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiMessage, CurrentClerkAuth, CurrentUser } from "src/common/decorators";
import { ActiveUserGuard, ClerkAuthGuard } from "src/common/guards";
import type { ClerkAuth } from "src/common/types";
import type { User } from "src/database/schema";
import { CreateMeDto } from "./dtos";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get("me")
  @UseGuards(ClerkAuthGuard, ActiveUserGuard)
  @ApiMessage("Get current user")
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Post("me")
  @UseGuards(ClerkAuthGuard)
  @ApiMessage("Create current user profile")
  createMe(
    @CurrentClerkAuth() auth: ClerkAuth,
    @Body() body: CreateMeDto,
  ) {
    return this.usersService.createMe(auth.clerkUserId, body);
  }
}