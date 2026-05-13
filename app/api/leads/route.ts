import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isValidEmail, checkRateLimit } from '@/lib/utils';

interface LeadRequest {
  email: string;
  company_name?: string;
  role?: string;
  team_size?: number;
  audit_slug?: string;
  high_savings: boolean;
  // honeypot field — must be empty
  website?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
    }

    const body = (await request.json()) as LeadRequest;

    // Honeypot check — bots fill hidden fields
    if (body.website) {
      // Silently accept to not alert the bot, but don't save
      return NextResponse.json({ success: true });
    }

    // Validate email
    if (!body.email || !isValidEmail(body.email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!supabase) {
      console.warn('[leads] Supabase not configured, lead not saved');
      return NextResponse.json({ success: true, saved: false });
    }

    // Look up audit ID from slug if provided
    let auditId: string | null = null;
    if (body.audit_slug) {
      const { data } = await supabase
        .from('audits')
        .select('id')
        .eq('slug', body.audit_slug)
        .single();
      auditId = data?.id ?? null;
    }

    const { error } = await supabase.from('leads').insert({
      email: body.email,
      company_name: body.company_name ?? null,
      role: body.role ?? null,
      team_size: body.team_size ?? null,
      audit_id: auditId,
      high_savings: body.high_savings,
    });

    if (error) {
      console.error('[leads] Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }

    // Send confirmation email via Resend
    await sendConfirmationEmail(body.email);

    return NextResponse.json({ success: true, saved: true });
  } catch (err) {
    console.error('[leads] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendConfirmationEmail(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[leads] Resend not configured, skipping email');
    return;
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'StackAudit <onboarding@resend.dev>',
        to: email,
        subject: 'Your StackAudit report is ready',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #6366f1;">StackAudit</h2>
            <p>Thanks for running your AI spend audit!</p>
            <p>We've saved your results. If you'd like to explore deeper savings through
            Credex's discounted AI infrastructure credits, reply to this email or visit
            <a href="https://credex.rocks" style="color: #6366f1;">credex.rocks</a>.</p>
            <p style="color: #71717a; font-size: 14px;">— The StackAudit Team</p>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error('[leads] Resend email failed:', err);
    // Non-blocking — don't fail the request because email failed
  }
}
