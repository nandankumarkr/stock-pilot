import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !password || email.length > 255 || password.length > 128) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT
          u.user_id,
          u.email,
          u.password_hash,
          u.is_active,
          r.role_id,
          r.role_name
       FROM users u
       JOIN roles r ON r.role_id = u.role_id
       WHERE u.email = $1
       LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches || !user.is_active) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.user_id,
      email: user.email,
      role: user.role_name,
      roleId: user.role_id,
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        userId: user.user_id,
        email: user.email,
        role: user.role_name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to process login" },
      { status: 500 }
    );
  }
}

