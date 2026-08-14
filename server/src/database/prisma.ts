import { PrismaClient, $Enums} from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export { $Enums };

export default prisma;