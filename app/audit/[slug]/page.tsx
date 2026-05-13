import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { AuditResult, ToolEntry, UseCase } from '@/lib/types';
import SharedAuditView from '@/components/SharedAuditView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface AuditRow {
  id: string;
  slug: string;
  tools_data: ToolEntry[];
  results_data: AuditResult;
  team_size: number;
  use_case: UseCase;
  total_monthly_savings: number;
  total_annual_savings: number;
  summary: string | null;
  created_at: string;
}

async function getAudit(slug: string): Promise<AuditRow | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as AuditRow;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const audit = await getAudit(slug);

  if (!audit) {
    return { title: 'Audit Not Found — StackAudit' };
  }

  const savings = audit.total_monthly_savings;
  const title = savings > 0
    ? `This team saves $${savings}/mo on AI tools — StackAudit`
    : `AI Stack Audit Results — StackAudit`;
  const description = savings > 0
    ? `StackAudit found $${savings}/mo ($${audit.total_annual_savings}/yr) in AI tool savings across ${audit.tools_data.length} tools.`
    : `This team's AI stack is already optimized. Run your own free audit.`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SharedAuditPage({ params }: PageProps) {
  const { slug } = await params;
  const audit = await getAudit(slug);

  if (!audit) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Audit Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This audit link may have expired or doesn&apos;t exist.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-colors"
          >
            Run Your Own Audit →
          </a>
        </div>
      </main>
    );
  }

  // Strip PII — no company name, no email on public page
  return (
    <SharedAuditView
      results={audit.results_data}
      toolsData={audit.tools_data}
      teamSize={audit.team_size}
      useCase={audit.use_case}
      summary={audit.summary}
      createdAt={audit.created_at}
    />
  );
}
