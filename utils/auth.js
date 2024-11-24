import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const BCRYPT_SALT_ROUNDS = 10;
const JWT_SECRET = "sfrb098j24t";
const JWT_EXPIRES_IN = "1h";

const JWT_SECRET_REFRESH = "qpegnqepg9qp";
const JWT_EXPIRES_IN_REFRESH = "7d";

export async function hashPassword(password) {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export function generateToken(obj) {
  return jwt.sign(obj, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token) {
  if (!token?.startsWith("Bearer ")) {
    return null;
  }

  token = token.split(" ")[1];

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function generateRefreshToken(obj){
  return jwt.sign(obj, JWT_SECRET_REFRESH, {
    expiresIn: JWT_EXPIRES_IN_REFRESH,
  });
}
