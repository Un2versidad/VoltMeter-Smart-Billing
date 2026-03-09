import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "accent" | "warning" | "destructive";
}

const variantStyles = {
  default: "text-primary",
  accent: "text-accent",
  warning: "text-warning",
  destructive: "text-destructive",
};

const StatCard = ({ label, value, unit, icon: Icon, trend, variant = "default" }: StatCardProps) => {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${variantStyles[variant]} opacity-60`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold font-mono ${variantStyles[variant]}`}>{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {trend && (
        <p className="text-[11px] text-muted-foreground mt-2">{trend}</p>
      )}
    </div>
  );
};

export default StatCard;
