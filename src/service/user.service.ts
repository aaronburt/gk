import { PrismaClient } from '@prisma/client';
import ValidatorService from "./validator.service.js";

export default class UserService {

    private static prisma: PrismaClient = new PrismaClient();

    public static async create(email: string, password: string): Promise<{ id: string; email: string; password: string } | null > {
        const isEmail: boolean = ValidatorService.isEmail(email);
        const isPassword: boolean = ValidatorService.isPassword(password);

        if(!isEmail || !isPassword) {
            return null;
        }

        const user: { id: string; email: string; password: string } | null = await this.prisma.user.create({
            data: {
                email: email,
                password: password
            }
        })

        this.prisma.$disconnect();
        return user;
    }

    public static async authenticate(email: string, password: string): Promise<{ id: string; email: string; password: string } | null > {
        const user = this.prisma.user.findUnique({
            where: {
                email: email,
                password: password
            }
        })

        this.prisma.$disconnect();
        return user;
    }
}