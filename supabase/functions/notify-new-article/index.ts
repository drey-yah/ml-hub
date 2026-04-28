import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Configure your email provider here (e.g., Resend, SendGrid)
// For this example, we use Resend.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  try {
    // Only accept POST requests from Supabase Webhooks
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const payload = await req.json();
    
    // The webhook payload contains the new article in payload.record
    const newArticle = payload.record;
    if (!newArticle || !newArticle.title) {
      return new Response("Invalid payload", { status: 400 });
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all users who should receive notifications (role = 'user')
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("role", "user");

    if (usersError) throw usersError;
    if (!users || users.length === 0) {
      return new Response("No users to notify", { status: 200 });
    }

    // Extract emails
    const emails = users.map(u => u.email).filter(Boolean);

    // Example using Resend API to send emails
    if (RESEND_API_KEY && emails.length > 0) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "ML Hub <notifications@your-domain.com>",
          to: emails,
          subject: `New ML Article: ${newArticle.title}`,
          html: `
            <h2>A new article has been published on ML Hub!</h2>
            <h3>${newArticle.title}</h3>
            <p><strong>Category:</strong> ${newArticle.category}</p>
            <p>${newArticle.description}</p>
            <a href="https://your-domain.com/dashboard/articles/${newArticle.id}" style="padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
              Read on ML Hub
            </a>
          `,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Failed to send email:", errText);
      }
    }

    return new Response(JSON.stringify({ message: "Notifications processed successfully." }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
