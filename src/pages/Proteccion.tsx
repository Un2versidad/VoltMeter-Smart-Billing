import { useState } from "react";
import { offices, otherAreas, overloadConfigs, otherAreaOverloadConfigs, overloadEvents, OverloadConfig, OverloadEvent } from "@/data/mockData";
import { Shield, ShieldAlert, ShieldCheck, ShieldOff, Zap, ZapOff, Clock, Activity, AlertTriangle, RotateCcw, Building2, UtensilsCrossed } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";

type AreaView = "oficinas" | "otras_areas";

const Proteccion = () => {
  const [areaView, setAreaView] = useState<AreaView>("oficinas");
  const [configs, setConfigs] = useState<OverloadConfig[]>(overloadConfigs);
  const [otherConfigs, setOtherConfigs] = useState<OverloadConfig[]>(otherAreaOverloadConfigs);
  const [events] = useState<OverloadEvent[]>(overloadEvents);
  const [simulatingOffice, setSimulatingOffice] = useState<string | null>(null);
  const [simProgress, setSimProgress] = useState(0);

  const currentLocations = areaView === "oficinas" ? offices : otherAreas;
  const currentConfigs = areaView === "oficinas" ? configs : otherConfigs;
  const setCurrentConfigs = areaView === "oficinas" ? setConfigs : setOtherConfigs;

  const armedCount = currentConfigs.filter(c => c.ssrStatus === "armed").length;
  const trippedCount = currentConfigs.filter(c => c.ssrStatus === "tripped").length;
  const totalTrips = events.filter(e => e.action === "ssr_tripped").length;

  const toggleAutoDisconnect = (officeId: string) => {
    setCurrentConfigs(prev => prev.map(c => {
      if (c.officeId !== officeId) return c;
      const newAuto = !c.autoDisconnect;
      toast({
        title: newAuto ? "SSR Habilitado" : "SSR Deshabilitado",
        description: `Desconexión automática ${newAuto ? "activada" : "desactivada"} para ${currentLocations.find(o => o.id === officeId)?.name}`,
      });
      return {
        ...c,
        autoDisconnect: newAuto,
        ssrStatus: newAuto ? "armed" : "disabled",
      };
    }));
  };

  const simulateOverload = (officeId: string) => {
    const config = currentConfigs.find(c => c.officeId === officeId);
    const location = currentLocations.find(o => o.id === officeId);
    if (!config || !location) return;

    setSimulatingOffice(officeId);
    setSimProgress(0);

    toast({
      title: "Prueba iniciada",
      description: `Probando sobrecarga en ${location.name}...`,
    });

    // Simulate 3-second countdown
    const steps = 30;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSimProgress((step / steps) * 100);

      if (step >= steps) {
        clearInterval(interval);
        setSimulatingOffice(null);
        setSimProgress(0);

        if (config.autoDisconnect) {
          setCurrentConfigs(prev => prev.map(c =>
            c.officeId === officeId ? { ...c, ssrStatus: "tripped" as const, tripCount: c.tripCount + 1, lastTrip: new Date().toISOString() } : c
          ));
          toast({
            title: "SSR ACTIVADO",
            description: `${location.name} desconectada por sobrecarga. Potencia: ${(location.maxPower * 1.12).toFixed(2)} kW (${112}%)`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "ALERTA DE SOBRECARGA",
            description: `${location.name}: ${(location.maxPower * 1.12).toFixed(2)} kW excede límite. SSR deshabilitado — solo alerta.`,
          });
        }
      }
    }, 100);
  };

  const resetSSR = (officeId: string) => {
    const location = currentLocations.find(o => o.id === officeId);
    setCurrentConfigs(prev => prev.map(c =>
      c.officeId === officeId ? { ...c, ssrStatus: "armed" as const } : c
    ));
    toast({
      title: "SSR Restaurado",
      description: `${location?.name} reconectada. Relé armado nuevamente.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Protección de Sobrecarga</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Control de relés SSR — Desconexión automática ante sobrecarga (&gt;100% por 3s)
          </p>
        </div>
        {/* Area toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary border border-border">
          <Button
            size="sm"
            variant={areaView === "oficinas" ? "default" : "ghost"}
            className="gap-1.5 text-xs h-7"
            onClick={() => { setAreaView("oficinas"); setSimulatingOffice(null); }}
          >
            <Building2 className="w-3.5 h-3.5" />
            Oficinas
          </Button>
          <Button
            size="sm"
            variant={areaView === "otras_areas" ? "default" : "ghost"}
            className="gap-1.5 text-xs h-7"
            onClick={() => { setAreaView("otras_areas"); setSimulatingOffice(null); }}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Otras Áreas
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="SSR Armados" value={`${armedCount}/${currentConfigs.length}`} icon={ShieldCheck} trend="Listos para proteger" />
        <StatCard label="SSR Disparados" value={String(trippedCount)} icon={ShieldAlert} variant={trippedCount > 0 ? "destructive" : "default"} trend="Actualmente desconectados" />
        <StatCard label="Disparos Totales" value={String(totalTrips)} icon={ZapOff} trend="Histórico acumulado" />
        <StatCard label="Vida Útil SSR" value=">100K" unit="ciclos" icon={Shield} trend="Sin desgaste mecánico" />
      </div>

      {/* How it works */}
      <div className="stat-card">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Arquitectura de Protección
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "1", title: "Monitoreo Continuo", desc: "PZEM-004T mide potencia activa cada 500ms en las 3 fases.", icon: Activity },
            { step: "2", title: "Detección de Umbral", desc: "ESP32 maestro compara potencia total vs límite contratado por oficina.", icon: AlertTriangle },
            { step: "3", title: "Retardo de Seguridad", desc: "Si excede 100% por más de 3 segundos consecutivos, activa el protocolo.", icon: Clock },
            { step: "4", title: "Acción del SSR", desc: "Relé de estado sólido desconecta la oficina. Sin chispas ni desgaste.", icon: ZapOff },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="relative p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">{step}</span>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs font-semibold text-foreground">{title}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Office/Area SSR Cards */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Estado de Relés SSR — {areaView === "oficinas" ? "Oficinas" : "Otras Áreas"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentLocations.map((location) => {
            const config = currentConfigs.find(c => c.officeId === location.id)!;
            const loadPercent = (location.power / config.maxPowerKw) * 100;
            const isSimulating = simulatingOffice === location.id;
            const isTripped = config.ssrStatus === "tripped";
            const isNearOverload = loadPercent >= config.thresholdPercent;

            return (
              <div key={location.id} className={`stat-card space-y-3 transition-all duration-300 ${
                isTripped ? "ring-2 ring-destructive/50" :
                isNearOverload ? "ring-2 ring-warning/30" : ""
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isTripped ? (
                      <ShieldAlert className="w-5 h-5 text-destructive" />
                    ) : config.ssrStatus === "armed" ? (
                      <ShieldCheck className="w-5 h-5 text-success" />
                    ) : (
                      <ShieldOff className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{location.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{location.tenant}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase ${
                    isTripped ? "bg-destructive/10 text-destructive" :
                    config.ssrStatus === "armed" ? "bg-success/10 text-success" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {isTripped ? "DESCONECTADA" : config.ssrStatus === "armed" ? "PROTEGIDA" : "SIN SSR"}
                  </span>
                </div>

                {/* Load gauge */}
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">
                      Carga: {location.power} / {config.maxPowerKw} kW
                    </span>
                    <span className={`font-mono font-bold ${
                      loadPercent > 100 ? "text-destructive" :
                      loadPercent >= config.thresholdPercent ? "text-warning" :
                      "text-primary"
                    }`}>
                      {loadPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={Math.min(loadPercent, 100)} className="h-2" />
                    {/* Threshold marker */}
                    <div
                      className="absolute top-0 h-2 w-0.5 bg-warning"
                      style={{ left: `${config.thresholdPercent}%` }}
                      title={`Umbral: ${config.thresholdPercent}%`}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                    <span>0%</span>
                    <span className="text-warning">Umbral {config.thresholdPercent}%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Config details */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded bg-secondary/30">
                    <p className="text-muted-foreground">Modelo SSR</p>
                    <p className="font-mono text-foreground">{config.ssrModel}</p>
                  </div>
                  <div className="p-2 rounded bg-secondary/30">
                    <p className="text-muted-foreground">Retardo Trip</p>
                    <p className="font-mono text-foreground">{config.tripDelayMs / 1000}s</p>
                  </div>
                  <div className="p-2 rounded bg-secondary/30">
                    <p className="text-muted-foreground">Disparos</p>
                    <p className="font-mono text-foreground">{config.tripCount} veces</p>
                  </div>
                  <div className="p-2 rounded bg-secondary/30">
                    <p className="text-muted-foreground">Último Trip</p>
                    <p className="font-mono text-foreground text-[9px]">
                      {config.lastTrip ? new Date(config.lastTrip).toLocaleString("es-PA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.autoDisconnect}
                      onCheckedChange={() => toggleAutoDisconnect(location.id)}
                      disabled={isSimulating}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      Auto-desconexión
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {isTripped ? (
                      <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1" onClick={() => resetSSR(location.id)}>
                        <RotateCcw className="w-3 h-3" /> Restaurar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] h-7 gap-1"
                        onClick={() => simulateOverload(location.id)}
                        disabled={isSimulating}
                      >
                        <Zap className="w-3 h-3" />
                        {isSimulating ? "Probando..." : "Probar"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Simulation progress */}
                {isSimulating && (
                  <div className="p-2 rounded bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      <span className="text-[10px] text-destructive font-semibold">Sobrecarga detectada — Conteo: {(simProgress / 100 * 3).toFixed(1)}s / 3.0s</span>
                    </div>
                    <Progress value={simProgress} className="h-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Log */}
      <div className="stat-card">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Registro de Eventos de Sobrecarga
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-3">ID</th>
                <th className="text-left py-2 pr-3">Oficina</th>
                <th className="text-left py-2 pr-3">Fase</th>
                <th className="text-right py-2 pr-3">Potencia Pico</th>
                <th className="text-right py-2 pr-3">% Sobrecarga</th>
                <th className="text-right py-2 pr-3">Duración</th>
                <th className="text-left py-2 pr-3">Acción</th>
                <th className="text-left py-2 pr-3">Resuelto por</th>
                <th className="text-left py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-border/50 text-foreground">
                  <td className="py-2 pr-3 text-muted-foreground">{event.id}</td>
                  <td className="py-2 pr-3">{event.officeName}</td>
                  <td className="py-2 pr-3">
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">{event.phase}</span>
                  </td>
                  <td className="text-right py-2 pr-3 text-destructive font-semibold">{event.peakPowerKw} kW</td>
                  <td className="text-right py-2 pr-3">
                    <span className={`${event.overloadPercent > 100 ? "text-destructive" : "text-warning"}`}>
                      {event.overloadPercent}%
                    </span>
                  </td>
                  <td className="text-right py-2 pr-3">{(event.durationMs / 1000).toFixed(1)}s</td>
                  <td className="py-2 pr-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      event.action === "ssr_tripped" ? "bg-destructive/10 text-destructive" :
                      "bg-warning/10 text-warning"
                    }`}>
                      {event.action === "ssr_tripped" ? "SSR Disparado" : event.action === "alert_only" ? "Solo Alerta" : "Reset Manual"}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-[10px] text-muted-foreground">{event.resolvedBy || "—"}</td>
                  <td className="py-2 text-[10px] text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString("es-PA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Proteccion;
