import { AlertItem } from "@/data/mockData";
import { AlertTriangle, WifiOff, Zap, Gauge, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";

interface AlertsListProps {
  alerts: AlertItem[];
  limit?: number;
}

const iconMap = {
  overload: Zap,
  disconnect: WifiOff,
  voltage: AlertTriangle,
  power_factor: Gauge,
  ssr_trip: ShieldAlert,
  ssr_reset: ShieldCheck,
};

const severityStyles = {
  critical: "border-l-destructive bg-destructive/5",
  warning: "border-l-warning bg-warning/5",
  info: "border-l-accent bg-accent/5",
};

const AlertsList = ({ alerts, limit }: AlertsListProps) => {
  const displayed = limit ? alerts.slice(0, limit) : alerts;

  return (
    <div className="space-y-2">
      {displayed.map((alert) => {
        const Icon = iconMap[alert.type];
        return (
          <div
            key={alert.id}
            className={`border-l-2 rounded-r-md px-3 py-2.5 ${severityStyles[alert.severity]} ${
              alert.resolved ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start gap-2">
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${
                alert.severity === "critical" ? "text-destructive" :
                alert.severity === "warning" ? "text-warning" : "text-accent"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-foreground">{alert.officeName}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{alert.id}</span>
                  {alert.resolved && (
                    <CheckCircle2 className="w-3 h-3 text-success ml-auto shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  {new Date(alert.timestamp).toLocaleString("es-PA")}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertsList;
