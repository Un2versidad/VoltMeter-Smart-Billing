import { useState, useEffect } from "react";
import { offices, otherAreas } from "@/data/mockData";
import { Activity, Cpu } from "lucide-react";

interface SimOffice {
  id: string;
  name: string;
  power: number;
  maxPower: number;
  status: "normal" | "warning" | "critical";
  isCommonArea?: boolean;
}

const allAreas = [...offices, ...otherAreas];

const Plano = () => {
  const [simData, setSimData] = useState<SimOffice[]>(
    allAreas.map((o) => ({
      id: o.id,
      name: o.name,
      power: o.power,
      maxPower: o.maxPower,
      status: "normal",
      isCommonArea: otherAreas.some((a) => a.id === o.id),
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSimData((prev) =>
        prev.map((o) => {
          const base = allAreas.find((x) => x.id === o.id)!;
          const variation = Math.sin(Date.now() * 0.001) * 0.15;
          const power = Math.max(0.05, base.power + variation + (Math.random() * 0.2 - 0.1));
          const pct = (power / base.maxPower) * 100;
          return {
            ...o,
            power: +power.toFixed(2),
            status: pct > 85 ? "critical" : pct > 70 ? "warning" : "normal",
          };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const officeSim = simData.filter((o) => !o.isCommonArea);
  const commonSim = simData.filter((o) => o.isCommonArea);
  const totalPower = simData.reduce((s, o) => s + o.power, 0);
  const totalMax = simData.reduce((s, o) => s + o.maxPower, 0);
  const totalPct = (totalPower / totalMax) * 100;

  const getOverlayColor = (status: string) => {
    if (status === "critical") return "hsl(0, 70%, 50%)";
    if (status === "warning") return "hsl(38, 92%, 50%)";
    return "hsl(160, 70%, 45%)";
  };

  const getOverlayOpacity = (status: string) => {
    if (status === "critical") return 0.35;
    if (status === "warning") return 0.25;
    return 0.15;
  };

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const timeStr = now.toLocaleTimeString("es-PA");

  // RS-485 bus path: master is at (442, 587). The bus runs through the corridor (x≈440)
  // then branches to each office node through doorways.
  // Corridor runs vertically from y=391 to y=1291 at x=410-470

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-foreground">Plano de Monitoreo</h2>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            Planta arquitectónica — 8.00m × 12.41m | 99.3 m² | 8 nodos ESP32 + 24 PZEM-004T
          </p>
          <p className="text-xs text-muted-foreground mt-1 sm:hidden">
            8.00m × 12.41m | 8 nodos ESP32
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-success font-mono">
            <span className="pulse-dot" />
            CONECTADO
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{timeStr}</p>
        </div>
      </div>

      <div className="flex gap-4 flex-col xl:flex-row">
        {/* Floor Plan SVG */}
        <div className="xl:flex-[0_0_68%] stat-card p-3">
          <h3 className="text-sm font-semibold text-foreground mb-2 font-mono">
            Plano Arquitectónico — 99.3 m²
          </h3>
          <div className="relative overflow-x-auto">
            <svg viewBox="0 0 800 1300" className="w-full h-auto min-w-[320px]">
              {/* Background */}
              <rect x="0" y="0" width="800" height="1300" fill="hsl(220, 18%, 10%)" />

              {/* Outer walls */}
              <rect x="80" y="50" width="700" height="1200" fill="none" stroke="hsl(220, 15%, 25%)" strokeWidth="8" />

              {/* ===== BATHROOMS (top-left) ===== */}
              <rect x="80" y="50" width="330" height="341" fill="hsl(220, 18%, 13%)" stroke="hsl(220, 15%, 25%)" strokeWidth="4" />
              <rect x="80" y="50" width="330" height="341" fill={getOverlayColor(commonSim[0]?.status)} fillOpacity={getOverlayOpacity(commonSim[0]?.status)} />
              <text x="200" y="185" fill="hsl(210, 20%, 95%)" fontSize="16" textAnchor="middle" className="font-mono" fontWeight="bold">BAÑOS</text>
              <text x="200" y="210" fill="hsl(215, 15%, 70%)" fontSize="14" textAnchor="middle" className="font-mono">{commonSim[0]?.power.toFixed(2)} kW</text>
              <rect x="86" y="370" width="22" height="12" fill="hsl(220, 60%, 50%)" rx="2" />
              <text x="97" y="379" fill="hsl(210, 20%, 95%)" fontSize="6" textAnchor="middle" className="font-mono">N6</text>
              {/* Fixtures */}
              <rect x="100" y="80" width="40" height="50" fill="hsl(220, 20%, 8%)" stroke="hsl(220, 15%, 20%)" strokeWidth="2" rx="3" />
              <rect x="160" y="80" width="40" height="50" fill="hsl(220, 20%, 8%)" stroke="hsl(220, 15%, 20%)" strokeWidth="2" rx="3" />
              <rect x="100" y="260" width="40" height="50" fill="hsl(220, 20%, 8%)" stroke="hsl(220, 15%, 20%)" strokeWidth="2" rx="3" />
              <rect x="160" y="260" width="40" height="50" fill="hsl(220, 20%, 8%)" stroke="hsl(220, 15%, 20%)" strokeWidth="2" rx="3" />

              {/* ===== KITCHENETTE (top-center) ===== */}
              <rect x="410" y="50" width="170" height="130" fill="hsl(220, 18%, 13%)" stroke="hsl(220, 15%, 25%)" strokeWidth="4" />
              <rect x="410" y="50" width="170" height="130" fill={getOverlayColor(commonSim[1]?.status)} fillOpacity={getOverlayOpacity(commonSim[1]?.status)} />
              <text x="495" y="105" fill="hsl(210, 20%, 95%)" fontSize="13" textAnchor="middle" className="font-mono" fontWeight="bold">COCINETA</text>
              <text x="495" y="126" fill="hsl(215, 15%, 70%)" fontSize="12" textAnchor="middle" className="font-mono">{commonSim[1]?.power.toFixed(2)} kW</text>
              <rect x="416" y="163" width="22" height="12" fill="hsl(220, 60%, 50%)" rx="2" />
              <text x="427" y="172" fill="hsl(210, 20%, 95%)" fontSize="6" textAnchor="middle" className="font-mono">N7</text>

              {/* ===== OFFICE #4 (executive, top-right) ===== */}
              <rect x="580" y="50" width="200" height="341" fill="hsl(220, 18%, 13%)" stroke="hsl(220, 15%, 25%)" strokeWidth="4" />
              <rect x="580" y="50" width="200" height="341" fill={getOverlayColor(officeSim[3]?.status)} fillOpacity={getOverlayOpacity(officeSim[3]?.status)} />
              <text x="680" y="200" fill="hsl(210, 20%, 95%)" fontSize="16" textAnchor="middle" fontWeight="bold" className="font-mono">OFICINA #4</text>
              <text x="680" y="225" fill="hsl(215, 15%, 70%)" fontSize="14" textAnchor="middle" className="font-mono">{officeSim[3]?.power.toFixed(2)} kW</text>
              <text x="680" y="245" fill="hsl(38, 92%, 50%)" fontSize="10" textAnchor="middle" className="font-mono">EJECUTIVA</text>
              <rect x="586" y="380" width="22" height="12" fill="hsl(220, 60%, 50%)" rx="2" />
              <text x="597" y="389" fill="hsl(210, 20%, 95%)" fontSize="6" textAnchor="middle" className="font-mono">N4</text>

              {/* ===== OFFICE #5 (left) ===== */}
              <rect x="80" y="391" width="330" height="300" fill="hsl(220, 18%, 13%)" stroke="hsl(220, 15%, 25%)" strokeWidth="4" />
              <rect x="80" y="391" width="330" height="300" fill={getOverlayColor(officeSim[4]?.status)} fillOpacity={getOverlayOpacity(officeSim[4]?.status)} />
              <text x="245" y="530" fill="hsl(210, 20%, 95%)" fontSize="16" textAnchor="middle" fontWeight="bold" className="font-mono">OFICINA #5</text>
              <text x="245" y="555" fill="hsl(215, 15%, 70%)" fontSize="14" textAnchor="middle" className="font-mono">{officeSim[4]?.power.toFixed(2)} kW</text>
              <rect x="400" y="520" width="12" height="22" fill="hsl(220, 60%, 50%)" rx="2" />
              <text x="406" y="534" fill="hsl(210, 20%, 95%)" fontSize="5" textAnchor="middle" className="font-mono">N5</text>

              {/* ===== CENTRAL CORRIDOR ===== */}
              <rect x="410" y="180" width="170" height="1070" fill="hsl(220, 18%, 11%)" stroke="hsl(220, 15%, 25%)" strokeWidth="3" />

              {/* ===== OFFICE #3 (right-middle-top) ===== */}
              <rect x="580" y="391" width="200" height="300" fill="hsl(220, 18%, 13%)" stroke="hsl(220, 15%, 25%)" strokeWidth="4" />
              <rect x="580" y="391" width="200" height="300" fill={getOverlayColor(officeSim[2]?.status)} fillOpacity={getOverlayOpacity(officeSim[2]?.status)} />
              <text x="680" y="530" fill="hsl(210, 20%, 95%)" fontSize="16" textAnchor="middle" fontWeight="bold" className="font-mono">OFICINA #3</text>
              <text x="680" y="555" fill="hsl(215, 15%, 70%)" fontSize="14" textAnchor="middle" className="font-mono">{officeSim[2]?.power.toFixed(2)} kW</text>
              <rect x="586" y="680" width="22" height="12" fill="hsl(220, 60%, 50%)" rx="2" />
              <text x="597" y="689" fill="hsl(210, 20%, 95%)" fontSize="6" textAnchor="middle" className="font-mono">N3</text>

              {/* ===== OFFICE #2 (right-middle-bottom) ===== */}
              <rect x="580" y="691" width="200" height="300" fill="hsl(220, 18%, 13%)" stroke="hsl(220, 15%, 25%)" strokeWidth="4" />
              <rect x="580" y="691" width="200" height="300" fill={getOverlayColor(officeSim[1]?.status)} fillOpacity={getOverlayOpacity(officeSim[1]?.status)} />
              <text x="680" y="830" fill="hsl(210, 20%, 95%)" fontSize="16" textAnchor="middle" fontWeight="bold" className="font-mono">OFICINA #2</text>
              <text x="680" y="855" fill="hsl(215, 15%, 70%)" fontSize="14" textAnchor="middle" className="font-mono">{officeSim[1]?.power.toFixed(2)} kW</text>
              <rect x="586" y="980" width="22" height="12" fill="hsl(220, 60%, 50%)" rx="2" />
              <text x="597" y="989" fill="hsl(210, 20%, 95%)" fontSize="6" textAnchor="middle" className="font-mono">N2</text>

              {/* ===== OFFICE #1 (bottom-right) ===== */}
              <rect x="580" y="991" width="200" height="259" fill="hsl(220, 18%, 13%)" stroke="hsl(220, 15%, 25%)" strokeWidth="4" />
              <rect x="580" y="991" width="200" height="259" fill={getOverlayColor(officeSim[0]?.status)} fillOpacity={getOverlayOpacity(officeSim[0]?.status)} />
              <text x="680" y="1110" fill="hsl(210, 20%, 95%)" fontSize="16" textAnchor="middle" fontWeight="bold" className="font-mono">OFICINA #1</text>
              <text x="680" y="1135" fill="hsl(215, 15%, 70%)" fontSize="14" textAnchor="middle" className="font-mono">{officeSim[0]?.power.toFixed(2)} kW</text>
              <rect x="586" y="1238" width="22" height="12" fill="hsl(220, 60%, 50%)" rx="2" />
              <text x="597" y="1247" fill="hsl(210, 20%, 95%)" fontSize="6" textAnchor="middle" className="font-mono">N1</text>

              {/* ===== RECEPTION (bottom-left) ===== */}
              <rect x="80" y="691" width="330" height="559" fill="hsl(220, 18%, 13%)" stroke="hsl(220, 15%, 25%)" strokeWidth="4" />
              <rect x="80" y="691" width="330" height="559" fill={getOverlayColor(commonSim[2]?.status)} fillOpacity={getOverlayOpacity(commonSim[2]?.status)} />
              <text x="245" y="940" fill="hsl(210, 20%, 95%)" fontSize="18" textAnchor="middle" className="font-mono" fontWeight="bold">RECEPCIÓN</text>
              <text x="245" y="968" fill="hsl(215, 15%, 70%)" fontSize="14" textAnchor="middle" className="font-mono">{commonSim[2]?.power.toFixed(2)} kW</text>
              <rect x="86" y="1225" width="22" height="12" fill="hsl(220, 60%, 50%)" rx="2" />
              <text x="97" y="1234" fill="hsl(210, 20%, 95%)" fontSize="6" textAnchor="middle" className="font-mono">N8</text>
              {/* Furniture */}
              <rect x="120" y="770" width="100" height="50" fill="hsl(220, 15%, 18%)" rx="4" />
              <rect x="270" y="1100" width="100" height="40" fill="hsl(220, 15%, 18%)" rx="4" />
              <rect x="130" y="1160" width="70" height="35" fill="hsl(220, 15%, 18%)" rx="4" />
              <text x="245" y="1080" fill="hsl(215, 15%, 35%)" fontSize="11" textAnchor="middle" className="font-mono">AREA = 99.3 M²</text>

              {/* ===== ENTRANCE ===== */}
              <rect x="470" y="1245" width="50" height="12" fill="hsl(220, 18%, 15%)" stroke="hsl(160, 70%, 45%)" strokeWidth="2" rx="2" />
              <text x="495" y="1275" fill="hsl(215, 15%, 40%)" fontSize="9" textAnchor="middle" className="font-mono">ENTRADA</text>

              {/* ===== MASTER ESP32 PANEL (in corridor) ===== */}
              <rect x="478" y="620" width="40" height="60" fill="hsl(220, 60%, 35%)" stroke="hsl(220, 70%, 55%)" strokeWidth="2" rx="4" />
              <text x="498" y="645" fill="hsl(210, 20%, 95%)" fontSize="8" textAnchor="middle" className="font-mono" fontWeight="bold">ESP32</text>
              <text x="498" y="657" fill="hsl(160, 70%, 60%)" fontSize="7" textAnchor="middle" className="font-mono">MASTER</text>
              {/* Small antenna icon */}
              <line x1="498" y1="620" x2="498" y2="610" stroke="hsl(160, 70%, 45%)" strokeWidth="1.5" />
              <circle cx="498" cy="607" r="3" fill="none" stroke="hsl(160, 70%, 45%)" strokeWidth="1" />

              {/* ===== RS-485 BUS (green dashed, through corridor) ===== */}
              {/* Main vertical bus line in corridor */}
              <line x1="498" y1="680" x2="498" y2="1240" stroke="hsl(160, 70%, 45%)" strokeWidth="2" strokeDasharray="8,4" opacity="0.5">
                <animate attributeName="strokeDashoffset" values="12;0" dur="1.5s" repeatCount="indefinite" />
              </line>
              <line x1="498" y1="620" x2="498" y2="168" stroke="hsl(160, 70%, 45%)" strokeWidth="2" strokeDasharray="8,4" opacity="0.5">
                <animate attributeName="strokeDashoffset" values="12;0" dur="1.5s" repeatCount="indefinite" />
              </line>

              {/* Branch to N1 (corridor -> right at y=1244) */}
              <line x1="498" y1="1244" x2="586" y2="1244" stroke="hsl(160, 70%, 45%)" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.5">
                <animate attributeName="strokeDashoffset" values="9;0" dur="1.2s" repeatCount="indefinite" />
              </line>
              {/* Branch to N2 (corridor -> right at y=986) */}
              <line x1="498" y1="986" x2="586" y2="986" stroke="hsl(160, 70%, 45%)" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.5">
                <animate attributeName="strokeDashoffset" values="9;0" dur="1.2s" repeatCount="indefinite" />
              </line>
              {/* Branch to N3 (corridor -> right at y=686) */}
              <line x1="498" y1="686" x2="586" y2="686" stroke="hsl(160, 70%, 45%)" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.5">
                <animate attributeName="strokeDashoffset" values="9;0" dur="1.2s" repeatCount="indefinite" />
              </line>
              {/* Branch to N4 (corridor up -> right at y=386) */}
              <line x1="498" y1="386" x2="586" y2="386" stroke="hsl(160, 70%, 45%)" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.5">
                <animate attributeName="strokeDashoffset" values="9;0" dur="1.2s" repeatCount="indefinite" />
              </line>
              {/* Branch to N5 (corridor -> left at y=531) */}
              <line x1="498" y1="531" x2="412" y2="531" stroke="hsl(160, 70%, 45%)" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.5">
                <animate attributeName="strokeDashoffset" values="9;0" dur="1.2s" repeatCount="indefinite" />
              </line>
              {/* Branch to N6 Baños (bus -> left at y=375) */}
              <line x1="498" y1="375" x2="108" y2="375" stroke="hsl(160, 70%, 45%)" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.5">
                <animate attributeName="strokeDashoffset" values="9;0" dur="1.2s" repeatCount="indefinite" />
              </line>
              {/* Branch to N7 Cocineta (bus -> left at y=168) */}
              <line x1="498" y1="168" x2="438" y2="168" stroke="hsl(160, 70%, 45%)" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.5">
                <animate attributeName="strokeDashoffset" values="9;0" dur="1.2s" repeatCount="indefinite" />
              </line>
              {/* Branch to N8 Recepción (bus -> left at y=1231) */}
              <line x1="498" y1="1231" x2="108" y2="1231" stroke="hsl(160, 70%, 45%)" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.5">
                <animate attributeName="strokeDashoffset" values="9;0" dur="1.2s" repeatCount="indefinite" />
              </line>

              {/* ===== POWER FEED (orange, main vertical in corridor, split around ESP32 master) ===== */}
              <line x1="488" y1="1245" x2="488" y2="685" stroke="hsl(38, 80%, 50%)" strokeWidth="2" strokeDasharray="10,5" opacity="0.3" />
              <line x1="488" y1="615" x2="488" y2="168" stroke="hsl(38, 80%, 50%)" strokeWidth="2" strokeDasharray="10,5" opacity="0.3" />

              {/* ===== DIMENSIONS ===== */}
              {/* Top */}
              <line x1="80" y1="35" x2="780" y2="35" stroke="hsl(215, 15%, 30%)" strokeWidth="1" />
              <text x="430" y="30" fill="hsl(215, 15%, 40%)" fontSize="11" textAnchor="middle" className="font-mono">8.00 m</text>
              {/* Right */}
              <line x1="795" y1="50" x2="795" y2="1250" stroke="hsl(215, 15%, 30%)" strokeWidth="1" />
              <text x="790" y="650" fill="hsl(215, 15%, 40%)" fontSize="11" textAnchor="middle" className="font-mono" transform="rotate(90, 790, 650)">12.41 m</text>

              {/* ===== LEGEND ===== */}
              <rect x="85" y="1260" width="300" height="35" fill="hsl(220, 18%, 10%)" fillOpacity="0.8" rx="4" />
              <rect x="92" y="1268" width="10" height="7" fill="hsl(220, 60%, 50%)" rx="1" />
              <text x="107" y="1275" fill="hsl(215, 15%, 50%)" fontSize="8" className="font-mono">Nodo ESP32 + 3×PZEM</text>
              <line x1="92" y1="1282" x2="112" y2="1282" stroke="hsl(160, 70%, 45%)" strokeWidth="2" strokeDasharray="4,2" />
              <text x="117" y="1286" fill="hsl(215, 15%, 50%)" fontSize="8" className="font-mono">RS-485 Modbus RTU</text>
              <line x1="230" y1="1282" x2="250" y2="1282" stroke="hsl(38, 80%, 50%)" strokeWidth="2" strokeDasharray="4,2" />
              <text x="255" y="1286" fill="hsl(215, 15%, 50%)" fontSize="8" className="font-mono">Acometida 3Φ</text>
            </svg>
          </div>
        </div>

        {/* Meters Panel */}
        <div className="flex-1 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            Medidores en Tiempo Real
          </h3>

          {officeSim.map((o) => {
            const pct = (o.power / o.maxPower) * 100;
            const borderClass =
              o.status === "critical" ? "border-destructive" :
              o.status === "warning" ? "border-warning" :
              "border-success";
            const textClass =
              o.status === "critical" ? "text-destructive" :
              o.status === "warning" ? "text-warning" :
              "text-success";
            const barColor =
              o.status === "critical" ? "bg-destructive" :
              o.status === "warning" ? "bg-warning" :
              "bg-success";
            const statusLabel =
              o.status === "critical" ? "SOBRECARGA" :
              o.status === "warning" ? "ALTO" : "NORMAL";

            return (
              <div key={o.id} className={`stat-card border-2 ${borderClass}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-foreground font-mono">{o.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                    o.status === "critical" ? "bg-destructive/20 text-destructive" :
                    o.status === "warning" ? "bg-warning/20 text-warning" :
                    "bg-success/20 text-success"
                  }`}>
                    {statusLabel}
                  </span>
                </div>
                <div className="flex items-baseline mb-2">
                  <span className={`text-2xl font-bold font-mono ${textClass}`}>
                    {o.power.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1 font-mono">kW</span>
                </div>
                <div className="bg-secondary rounded h-2 overflow-hidden">
                  <div
                    className={`h-full rounded transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground font-mono">3×PZEM / RS-485</span>
                  <span className={`text-xs font-bold font-mono ${textClass}`}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}

          {/* Common Areas separator */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Áreas Comunes</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {commonSim.map((o) => {
            const pct = (o.power / o.maxPower) * 100;
            const borderClass =
              o.status === "critical" ? "border-destructive" :
              o.status === "warning" ? "border-warning" :
              "border-primary/50";
            const textClass =
              o.status === "critical" ? "text-destructive" :
              o.status === "warning" ? "text-warning" :
              "text-primary";
            const barColor =
              o.status === "critical" ? "bg-destructive" :
              o.status === "warning" ? "bg-warning" :
              "bg-primary";
            const statusLabel =
              o.status === "critical" ? "SOBRECARGA" :
              o.status === "warning" ? "ALTO" : "NORMAL";

            return (
              <div key={o.id} className={`stat-card border-2 ${borderClass}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-foreground font-mono">{o.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                    o.status === "critical" ? "bg-destructive/20 text-destructive" :
                    o.status === "warning" ? "bg-warning/20 text-warning" :
                    "bg-primary/20 text-primary"
                  }`}>
                    {statusLabel}
                  </span>
                </div>
                <div className="flex items-baseline mb-2">
                  <span className={`text-2xl font-bold font-mono ${textClass}`}>
                    {o.power.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1 font-mono">kW</span>
                </div>
                <div className="bg-secondary rounded h-2 overflow-hidden">
                  <div
                    className={`h-full rounded transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground font-mono">3×PZEM / RS-485</span>
                  <span className={`text-xs font-bold font-mono ${textClass}`}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="stat-card border-2 border-accent">
            <div className="text-xs text-muted-foreground font-mono mb-1">CONSUMO TOTAL</div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold font-mono text-accent">{totalPower.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground ml-1 font-mono">kW</span>
            </div>
            <div className="bg-secondary rounded h-2 mt-2 overflow-hidden">
              <div
                className="h-full rounded bg-accent transition-all duration-500"
                style={{ width: `${totalPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground font-mono">Capacidad total:</span>
              <span className="text-xs text-accent font-mono">{totalMax} kW ({totalPct.toFixed(1)}%)</span>
            </div>
          </div>

          {/* System info */}
          <div className="stat-card text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-primary" />
              <span className="font-mono">8 nodos ESP32 — 24 PZEM-004T</span>
            </div>
            <p className="font-mono">Protocolo: Modbus RTU @ 9600 baud</p>
            <p className="font-mono">Bus: RS-485 half-duplex</p>
            <p className="font-mono">Actualización: cada 2 segundos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plano;
