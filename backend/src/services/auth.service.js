import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

import { validAuthData } from "../utils/validator.util.js";
import { generateToken } from "../utils/token.util.js";
import { hashPassword, comparePassword } from "../utils/hash.util.js";

export const registerUser = async (data) => {
  try {
    validAuthData(data);

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      })
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        name: users.name,
      });

    const { id, email, role, name } = newUser;

    return {
      success: true,
      message: "User registered successfully",
      data: { id, email, role, name },
    };
  } catch (error) {
    throw new Error(error.message || "Registration failed");
  }
};


export const loginUser = async (data) => {
  try {
    validAuthData(data);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await comparePassword(data.password,user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    

    const token = await generateToken(user);

    const { password, ...safeUser } = user;

    return {
      success: true,
      message: "Login successful",
      data: {
        user: safeUser,
        token,
      },
    };
  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
};
