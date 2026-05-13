import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { AuditResult, ToolEntry, UseCase } from '@/lib/types';

interface AuditSaveRequest {
  tools_data: ToolEntry[];
  results_data: AuditResult;
  team_size: number;
  use_case: UseCase;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AuditSaveRequest;

    if (!body.tools_data || !body.results_data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!supabase) {
      // Supabase not configured — return a mock slug for local dev
      const slug = generateSlug();
      console.warn('[audit/save] Supabase not configured, returning mock slug');
      return NextResponse.json({ slug, saved: false });
    }

    const slug = generateSlug();

    const { error } = await supabase.from('audits').insert({
      slug,
      tools_data: body.tools_data,
      results_data: body.results_data,
      team_size: body.team_size,
      use_case: body.use_case,
      total_monthly_savings: body.results_data.totalMonthlySavings,
      total_annual_savings: body.results_data.totalAnnualSavings,
      summary: body.results_data.summary ?? null,
    });

    if (error) {
      console.error('[audit/save] Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save audit' }, { status: 500 });
    }

    return NextResponse.json({ slug, saved: true });
  } catch (err) {
    console.error('[audit/save] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
