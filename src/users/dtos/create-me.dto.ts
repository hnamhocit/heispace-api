import {
    IsEmail,
    IsIn,
    IsOptional,
    IsString,
    IsUrl,
    Length,
    Matches,
} from "class-validator";

export class CreateMeDto {
    @IsEmail()
    email: string

    @IsString()
    @Length(2, 120)
    fullName: string;

    @IsString()
    @Length(3, 24)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: "username can only contain letters, numbers and underscore",
    })
    username: string;

    @IsOptional()
    @IsUrl()
    avatar?: string;

    @IsOptional()
    @IsString()
    @Length(0, 20)
    phoneNumber?: string;

    @IsOptional()
    @IsIn(["male", "female", "other", "prefer_not_to_say"])
    gender?: "male" | "female" | "other" | "prefer_not_to_say";

    @IsOptional()
    @IsString()
    birthDay?: string;
}