
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const registerUser = async (data) => {
  try {
    if (!data.email || !data.password) {
      throw new Error("Email and password are required");
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || "volunteer",
      })
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
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
    if (!data.email || !data.password) {
      throw new Error("Email and password are required");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role   
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
