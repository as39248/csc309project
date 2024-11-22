import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS);

async function hashPassword(password) {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}


const prisma = new PrismaClient();

let firstName = "John";
let lastName = "Doe";
let password = "1234";
let phoneNumber = "1234567890";
let email = "email@email.com";
let avatar = "avatar";
let role = "admin";

console.log(firstName);

prisma.user.create({
                data: {
                firstName,
                lastName,
                password: await hashPassword(password),
                phoneNumber,
                email,
                avatar,
                role,
                },
                select: {
                firstName: true,
                lastName,
                phoneNumber: true,
                email: true,
                avatar: true,
                role: true,
                },
            });
