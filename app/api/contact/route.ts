import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, message } = body as {
      fullName?: string;
      email?: string;
      message?: string;
    };

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.STRAPI_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : undefined);
    if (!baseUrl) {
      return NextResponse.json({ error: "Strapi URL is not configured" }, { status: 500 });
    }

    const token = process.env.STRAPI_TOKEN ?? process.env.NEXT_PUBLIC_API_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Strapi token is not configured" }, { status: 500 });
    }

    const payload = {
      data: {
        fullName,
        email,
        message: [
          {
            type: "paragraph",
            children: [{ type: "text", text: message }],
          },
        ],
      },
    };

    const res = await fetch(new URL("api/submissions", baseUrl.replace(/\/$/, "")).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Strapi error: ${text}` }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
