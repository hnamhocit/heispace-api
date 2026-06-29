import { SetMetadata } from "@nestjs/common";

export const API_MESSAGE_KEY = "api_message";

export const ApiMessage = (message: string) =>
    SetMetadata(API_MESSAGE_KEY, message);