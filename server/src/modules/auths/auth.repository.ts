import { BaseRepository } from "@/shared/base.repository.js";
import { User } from "@/modules/users/user.entity.js";
import type { CreateAuthDto } from "./auth.schema.js";
import prisma from "@/database/prisma.js";

export class AuthRepository extends BaseRepository<User, CreateAuthDto> {

}