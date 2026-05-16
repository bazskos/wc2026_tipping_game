import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const inOneHour = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const { data: matches, error: matchError } = await supabaseAdmin
      .from("matches")
      .select("id, home_team, away_team, kickoff_at")
      .eq("status", "scheduled")
      .gte("kickoff_at", inOneHour)
      .lte("kickoff_at", inTwoHours);

    if (matchError || !matches || matches.length === 0) {
      return NextResponse.json({
        message: "No upcoming match, no need to send reminder.",
      });
    }

    const {
      data: { users },
      error: usersError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError || !users) {
      return NextResponse.json(
        { error: "Cannot fetch users." },
        { status: 500 },
      );
    }

    let emailsSent = 0;

    for (const match of matches) {
      const { data: predictions } = await supabaseAdmin
        .from("predictions")
        .select("user_id")
        .eq("match_id", match.id);

      const predictedUserIds = predictions?.map((p) => p.user_id) || [];

      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, wants_reminders");

      const missingUsers = users.filter(
        (user) => !predictedUserIds.includes(user.id),
      );

      for (const user of missingUsers) {
        if (!user.email) continue;

        const userProfile = profiles?.find((p) => p.id === user.id);
        if (userProfile && userProfile.wants_reminders === false) {
          continue;
        }

        await resend.emails.send({
          from: "World Cup 2026 <onboarding@resend.dev>",
          to: user.email,
          subject: `⏳ Reminder: ${match.home_team} vs ${match.away_team} is starting soon!`,
          html: `
            <div style="font-family: sans-serif; padding: 30px; background: #020817; color: #ffffff; border-radius: 12px; border: 1px solid #1e293b;">
              <h2 style="color: #3b82f6; text-transform: uppercase; letter-spacing: 2px; font-size: 18px;">Soon starting! ⚽</h2>
              <p style="font-size: 16px;">Heyy!</p>
              <p style="font-size: 16px; color: #94a3b8;">
                You have not tipped yet on the <strong>${match.home_team} vs ${match.away_team}</strong> match! 
                Don't let others get ahead of you on the top list!
              </p>
              <a href="${appUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">Predict now!</a>
            </div>
          `,
        });

        emailsSent++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${emailsSent} reminder email is successfully sent!`,
    });
  } catch (error) {
    console.error("E-mail error while sending:", error);
    return NextResponse.json(
      { error: "Error while sending e-mail." },
      { status: 500 },
    );
  }
}
