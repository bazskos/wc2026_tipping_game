import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("kickoff_at", { ascending: true });

    if (error) {
      console.error("Database error while fetching match data:", error);
      return NextResponse.json(
        { error: "Error while getting the matches." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
