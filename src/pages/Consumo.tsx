import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { dailyData, hourlyData, EnergyReading, offices, TARIFA_KWH } from "@/data/mockData";
import ConsumptionChart from "@/components/dashboard/ConsumptionChart";
import { Button } from "@/components/ui/button";
import { Download, FileText, Zap, TrendingDown, TrendingUp, Clock } from "lucide-react";
import { exportToCSV } from "@/lib/exportCSV";
import { exportToPDF } from "@/lib/exportPDF";
import { toast } from "@/hooks/use-toast";
import { useMemo } from "react";

const sumAllAreas = (r: EnergyReading) =>
  r.officeA + r.officeB + r.officeC + r.officeD + r.officeE + r.areaF + r.areaG + r.areaH;

const officeColors: Record<string, string> = {
  officeA: "hsl(160, 70%, 45%)",
  officeB: "hsl(190, 80%, 45%)",
  officeC: "hsl(38, 92%, 50%)",
  officeD: "hsl(280, 65%, 55%)",
  officeE: "hsl(0, 70%, 50%)",
  areaF: "hsl(200, 60%, 55%)",
  areaG: "hsl(30, 80%, 55%)",
  areaH: "hsl(120, 50%, 50%)",
};

const officeLabels: Record<string, string> = {
  officeA: "Oficina #1",
  officeB: "Oficina #2",
  officeC: "Oficina #3",
  officeD: "Oficina #4",
  officeE: "Oficina #5",
  areaF: "Baños",
  areaG: "Cocineta",
  areaH: "Recepción",
};

const Consumo = () => {
  // Compute peak hours analysis
  const peakAnalysis = useMemo(() => {
    const hourlyTotals = hourlyData.map((h) => ({
      hour: h.hour,
      total: sumAllAreas(h),
    }));
    const peakHour = hourlyTotals.reduce((max, h) => (h.total > max.total ? h : max), hourlyTotals[0]);
    const offPeakHour = hourlyTotals.reduce((min, h) => (h.total < min.total ? h : min), hourlyTotals[0]);
    const avgTotal = hourlyTotals.reduce((s, h) => s + h.total, 0) / hourlyTotals.length;
    
    // Work hours vs off hours
    const workHours = hourlyTotals.filter(h => h.hour >= 8 && h.hour <= 18);
    const offHours = hourlyTotals.filter(h => h.hour < 8 || h.hour > 18);
    const workAvg = workHours.reduce((s, h) => s + h.total, 0) / workHours.length;
    const offAvg = offHours.reduce((s, h) => s + h.total, 0) / offHours.length;

    return { peakHour, offPeakHour, avgTotal, workAvg, offAvg };
  }, []);

  // Daily cost trend
  const dailyCostData = useMemo(() => {
    return dailyData.map((d) => {
      const total = sumAllAreas(d);
      return {
        ...d,
        totalKwh: +total.toFixed(1),
        cost: +(total * TARIFA_KWH).toFixed(2),
      };
    });
  }, []);

  const handleExportHourlyCSV = () => {
    const headers = ["Hora", ...Object.values(officeLabels).map(l => `${l} (kW)`), "Total (kW)"];
    const rows = hourlyData.map((r) => {
      const total = sumAllAreas(r);
      return [`${r.hour}:00`, r.officeA, r.officeB, r.officeC, r.officeD, r.officeE, r.areaF, r.areaG, r.areaH, total.toFixed(2)];
    });
    exportToCSV("consumo_horario_hoy", headers, rows, {
      title: "REPORTE DE CONSUMO HORARIO — VoltMeter Solutions S.A.",
      subtitle: "Fecha: 26/02/2026 | Medición trifásica (L1+L2+L3) por oficina y área común",
    });
    toast({ title: "CSV exportado", description: "consumo_horario_hoy.csv" });
  };

  const handleExportDailyCSV = () => {
    const headers = ["Fecha", ...Object.values(officeLabels).map(l => `${l} (kWh)`), "Total (kWh)", "Costo (USD)"];
    const rows = dailyCostData.map((r) => [
      r.date, r.officeA, r.officeB, r.officeC, r.officeD, r.officeE, r.areaF, r.areaG, r.areaH, r.totalKwh, "$" + r.cost.toFixed(2),
    ]);
    exportToCSV("consumo_diario_30dias", headers, rows, {
      title: "REPORTE DE CONSUMO DIARIO — VoltMeter Solutions S.A.",
      subtitle: "Periodo: Últimos 30 días | Tarifa BTS Comercial ($0.1278/kWh)",
    });
    toast({ title: "CSV exportado", description: "consumo_diario_30dias.csv" });
  };

  const handleExportPDF = () => {
    const headers = ["Fecha", "Of.#1", "Of.#2", "Of.#3", "Of.#4", "Of.#5", "Baños", "Cocineta", "Recepción", "Total", "Costo"];
    const rows = dailyCostData.map((r) => [
      r.date, r.officeA, r.officeB, r.officeC, r.officeD, r.officeE, r.areaF, r.areaG, r.areaH, r.totalKwh, "$" + r.cost.toFixed(2),
    ]);
    const totalKwh = dailyCostData.reduce((s, d) => s + d.totalKwh, 0);
    const totalCost = dailyCostData.reduce((s, d) => s + d.cost, 0);

    exportToPDF({
      title: "Reporte de Consumo Diario — 30 Días",
      subtitle: "Medición trifásica (3×PZEM-004T por nodo) — Tarifa BTS Comercial",
      headers,
      rows,
      filename: "consumo_30dias",
      summary: [
        { label: "Consumo Total", value: `${totalKwh.toFixed(1)} kWh` },
        { label: "Costo Total", value: `$${totalCost.toFixed(2)}` },
        { label: "Hora Pico", value: `${peakAnalysis.peakHour.hour}:00 (${peakAnalysis.peakHour.total.toFixed(1)} kW)` },
        { label: "Promedio/Día", value: `${(totalKwh / 30).toFixed(1)} kWh` },
      ],
    });
    toast({ title: "PDF exportado", description: "consumo_30dias.pdf" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Análisis de Consumo</h2>
          <p className="text-xs text-muted-foreground mt-1">Histórico de consumo eléctrico por oficina — medición trifásica</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={handleExportHourlyCSV}>
            <Download className="w-3.5 h-3.5" /> Horario CSV
          </Button>
          <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={handleExportDailyCSV}>
            <Download className="w-3.5 h-3.5" /> Diario CSV
          </Button>
          <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={handleExportPDF}>
            <FileText className="w-3.5 h-3.5" /> PDF
          </Button>
        </div>
      </div>

      {/* Peak Analysis KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Hora Pico
          </p>
          <p className="text-xl font-bold font-mono text-warning">{peakAnalysis.peakHour.hour}:00</p>
          <p className="text-[10px] text-muted-foreground mt-1">{peakAnalysis.peakHour.total.toFixed(2)} kW demanda máx.</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Hora Valle
          </p>
          <p className="text-xl font-bold font-mono text-success">{peakAnalysis.offPeakHour.hour}:00</p>
          <p className="text-[10px] text-muted-foreground mt-1">{peakAnalysis.offPeakHour.total.toFixed(2)} kW demanda mín.</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Horario Laboral
          </p>
          <p className="text-xl font-bold font-mono text-foreground">{peakAnalysis.workAvg.toFixed(2)} kW</p>
          <p className="text-[10px] text-muted-foreground mt-1">promedio 08:00–18:00</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Consumo Fantasma
          </p>
          <p className="text-xl font-bold font-mono text-destructive">{peakAnalysis.offAvg.toFixed(2)} kW</p>
          <p className="text-[10px] text-muted-foreground mt-1">promedio fuera de horario</p>
        </div>
      </div>

      <ConsumptionChart />

      {/* Daily cost trend */}
      <div className="stat-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Costo diario — Últimos 30 días (USD)</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyCostData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 15%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 10 }} stroke="hsl(220, 15%, 18%)" />
              <YAxis tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 11 }} stroke="hsl(220, 15%, 18%)" tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 12%)",
                  border: "1px solid hsl(220, 15%, 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(210, 20%, 90%)",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Costo"]}
              />
              <Line type="monotone" dataKey="cost" stroke="hsl(160, 70%, 45%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily bar chart */}
      <div className="stat-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Consumo diario — Últimos 30 días (kWh)</h3>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 15%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 10 }} stroke="hsl(220, 15%, 18%)" />
              <YAxis tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 11 }} stroke="hsl(220, 15%, 18%)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 12%)",
                  border: "1px solid hsl(220, 15%, 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(210, 20%, 90%)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} formatter={(value) => officeLabels[value] || value} />
              {Object.entries(officeColors).map(([key, color]) => (
                <Bar key={key} dataKey={key} stackId="a" fill={color} radius={[0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Consumo;
