import { z } from "zod";
import { username, password, email, EnumRol, isActive, url } from "@/utils/fields.js";

export const createUserSchema = z.object({
    username: username,
    email: email,
    password: password,
}).strict();

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const modifyUserSchema = z.object({
    userName: username.optional(),
    email: email.optional(),
    urlPicture: url.optional(),
    rol: EnumRol.optional(),
    validationStatus: isActive.optional(),
}).strict();

export type ModifyUserDto = z.infer<typeof modifyUserSchema>;