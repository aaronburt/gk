import { PrismaClient } from '@prisma/client';

export default class SessionService {

    private static prisma: PrismaClient = new PrismaClient();

    public static async create(userId: string) {
        return this.prisma.session.create({
            data: {
                userId: userId
            }
        })
    }

    public static async get(sessionId: string) {
        return this.prisma.session.findUnique({
            where: {
                id: sessionId
            }
        })
    }
}