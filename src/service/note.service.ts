import { PrismaClient } from '@prisma/client';
import validator from "email-validator";

export default class NoteService {

    private static prisma: PrismaClient = new PrismaClient();


    public static async create(userId: string, title: string, content: string) {
        return this.prisma.note.create({
            data: {
                title: title,
                content: content,
                createdTimestamp: Date.now().toString(),
                updatedTimestamp: Date.now().toString(),
                userId: userId,
            }
        })
    }

    public static async get(noteId: string){
        return this.prisma.note.findUnique({
            where: {
                id: noteId
            }
        })
    }

    public static async delete(noteId: string) {
        return this.prisma.note.delete({
            where: {
                id: noteId
            }
        })
    }

    public static async list(userId: string){
        return this.prisma.note.findMany({
            where: {
                userId: userId
            }
        });
    }



}