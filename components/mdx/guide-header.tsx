"use client";

interface GuideHeaderProps {
  time: string;
  steps: number;
  level?: "beginner" | "intermediate" | "advanced";
}

const levelLabels = {
  beginner: { label: "Beginner", color: "text-primary bg-primary/10 border-primary/20" },
  intermediate: { label: "Intermediate", color: "text-secondary bg-secondary/10 border-secondary/20" },
  advanced: { label: "Advanced", color: "text-destructive bg-destructive/10 border-destructive/20" },
};

export function GuideHeader({ time, steps, level = "beginner" }: GuideHeaderProps) {
  const levelInfo = levelLabels[level];

  return (
    <div className="not-prose flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 mb-6 text-sm">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>{time}</span>
      </div>
      <span className="text-border">|</span>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
        <span>{steps} steps</span>
      </div>
      <span className="text-border">|</span>
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${levelInfo.color}`}>
        {levelInfo.label}
      </span>
    </div>
  );
}
