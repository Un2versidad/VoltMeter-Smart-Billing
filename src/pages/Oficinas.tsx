import { offices, TARIFA_KWH } from "@/data/mockData";
import { Building2, Cpu } from "lucide-react";

const phaseLabels = ["L1", "L2", "L3"] as const;

const Oficinas = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Detalle de Oficinas</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Información técnica completa — 3 medidores PZEM-004T por nodo (uno por fase L1/L2/L3)
        </p>
      </div>

      <div className="space-y-4">
        {offices.map((office) => {
          const loadPercent = (office.power / office.maxPower) * 100;
          const cost = office.energy * TARIFA_KWH;

          return (
            <div key={office.id} className="stat-card">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                  office.status === "online" ? "bg-success/10" :
                  office.status === "alert" ? "bg-warning/10" : "bg-destructive/10"
                }`}>
                  <Building2 className={`w-6 h-6 ${
                    office.status === "online" ? "text-success" :
                    office.status === "alert" ? "text-warning" : "text-destructive"
                  }`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold text-foreground">{office.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase ${
                      office.status === "online" ? "bg-success/10 text-success" :
                      office.status === "alert" ? "bg-warning/10 text-warning" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {office.status === "online" ? "En línea" : office.status === "alert" ? "Alerta" : "Desconectado"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-secondary text-muted-foreground flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {office.espNode} — {office.pzemCount}×PZEM
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{office.tenant}</p>

                  {/* Per-phase table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="text-muted-foreground border-b border-border">
                          <th className="text-left py-1 pr-3">Fase</th>
                          <th className="text-right py-1 pr-3">Voltaje (V)</th>
                          <th className="text-right py-1 pr-3">Corriente (A)</th>
                          <th className="text-right py-1 pr-3">Potencia (W)</th>
                          <th className="text-right py-1 pr-3">FP</th>
                          <th className="text-right py-1">Freq (Hz)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phaseLabels.map((phase) => {
                          const p = office.phases[phase];
                          return (
                            <tr key={phase} className="border-b border-border/50 text-foreground">
                              <td className="py-1.5 pr-3 text-primary font-semibold">{phase}</td>
                              <td className="text-right pr-3">{p.voltage.toFixed(1)}</td>
                              <td className="text-right pr-3">{p.current}</td>
                              <td className="text-right pr-3">{(p.power * 1000).toFixed(0)}</td>
                              <td className="text-right pr-3">{p.powerFactor}</td>
                              <td className="text-right">{p.frequency}</td>
                            </tr>
                          );
                        })}
                        <tr className="text-foreground font-bold bg-secondary/30">
                          <td className="py-1.5 pr-3 text-accent">TOTAL</td>
                          <td className="text-right pr-3">{office.voltage} <span className="text-muted-foreground font-normal">(prom)</span></td>
                          <td className="text-right pr-3">{office.current}</td>
                          <td className="text-right pr-3">{(office.power * 1000).toFixed(0)}</td>
                          <td className="text-right pr-3">{office.powerFactor}</td>
                          <td className="text-right">{office.frequency}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Summary row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-border">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Potencia Total</p>
                      <p className="text-sm font-mono text-foreground">{office.power} <span className="text-[10px] text-muted-foreground">kW</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Energía Mes</p>
                      <p className="text-sm font-mono text-foreground">{office.energy} <span className="text-[10px] text-muted-foreground">kWh</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Carga</p>
                      <p className={`text-sm font-mono ${loadPercent > 90 ? "text-destructive" : loadPercent > 70 ? "text-warning" : "text-foreground"}`}>
                        {loadPercent.toFixed(1)} <span className="text-[10px] text-muted-foreground">%</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Costo</p>
                      <p className="text-sm font-mono text-primary">${cost.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Oficinas;
