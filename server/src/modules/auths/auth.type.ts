import { JwtPayload } from "jsonwebtoken";

export interface AccessTokenPayload extends JwtPayload {
    id: number;
    userName: string;
    rol: string;
}

export interface ResetPasswordPayload extends JwtPayload {
    id_user: number;
    userName: string;
}