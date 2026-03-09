import { OfficeData, TARIFA_KWH, overloadConfigs, otherAreaOverloadConfigs } from "@/data/mockData";
import { Activity, AlertTriangle, ShieldCheck, ShieldOff, ShieldAlert } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OfficeStatusCardProps {
  office: OfficeData;
}

const OfficeStatusCard = ({ office }: OfficeStatusCardProps) => {
  const config = overloadConfigs.find(c => c.officeId === office.id)
    ?? otherAreaOverloadConfigs.find(c => c.officeId === office.id);
  const loadPercent = (office.power / office.maxPower) * 100;
  const monthlyCost = office.energy * TARIFA_KWH;
  const isNearOverload = config && loadPercent >= config.thresholdPercent;

  const statusConfig = {
    online: { icon: Activity, label: "En línea", dotClass: "bg-success" },
    alert: { icon: AlertTriangle, label: "Alerta", dotClass: "bg-warning" },
    offline: { icon: Activity, label: "Desconectado", dotClass: "bg-destructive" },
    disconnected: { icon: ShieldAlert, label: "SSR Trip", dotClass: "bg-destructive" },
  };

  const { icon: StatusIcon, label: statusLabel, dotClass } = statusConfig[office.status];

  return (
    <div className={`stat-card space-y-3 ${isNearOverload ? "ring-1 ring-warning/30" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dotClass}`} />
          <h3 className="text-sm font-semibold text-foreground">{office.name}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {config && (
            config.ssrStatus === "armed" ? (
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
            ) : config.ssrStatus === "tripped" ? (
              <ShieldAlert className="w-3.5 h-3.5 text-destructive" />
            ) : (
              <ShieldOff className="w-3.5 h-3.5 text-muted-foreground" />
            )
          )}
          <StatusIcon className={`w-4 h-4 ${
            office.status === "online" ? "text-success" :
            office.status === "alert" ? "text-warning" : "text-destructive"
          }`} />
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">{office.tenant}</p>

      {/* 3-phase readings */}
      <div className="space-y-1.5">
        {(["L1", "L2", "L3"] as const).map((phase) => {
          const p = office.phases[phase];
          return (
            <div key={phase} className="flex items-center gap-2 text-[10px]">
              <span className="text-muted-foreground font-mono w-5">{phase}</span>
              <span className="font-mono text-foreground">{p.voltage.toFixed(1)}V</span>
              <span className="font-mono text-foreground">{p.current}A</span>
              <span className="font-mono text-primary">{(p.power * 1000).toFixed(0)}W</span>
              <span className="font-mono text-muted-foreground">PF:{p.powerFactor}</span>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="grid grid-cols-3 gap-2 border-t border-border pt-2">
        <div>
          <p className="text-[10px] text-muted-foreground">Total</p>
          <p className="text-sm font-mono text-foreground">{office.power}<span className="text-[10px] text-muted-foreground">kW</span></p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Energía</p>
          <p className="text-sm font-mono text-foreground">{office.energy}<span className="text-[10px] text-muted-foreground">kWh</span></p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Costo</p>
          <p className="text-sm font-mono text-primary">${monthlyCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Load bar */}
      <div>
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">Carga ({office.espNode})</span>
          <span className={`font-mono ${loadPercent > 90 ? "text-destructive" : loadPercent > 70 ? "text-warning" : "text-primary"}`}>
            {loadPercent.toFixed(1)}%
          </span>
        </div>
        <Progress value={loadPercent} className="h-1.5" />
        {isNearOverload && (
          <p className="text-[9px] text-warning mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Cerca del umbral de protección ({config.thresholdPercent}%)
          </p>
        )}
      </div>
    </div>
  );
};

export default OfficeStatusCard;
