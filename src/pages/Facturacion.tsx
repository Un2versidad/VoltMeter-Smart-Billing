import { offices, otherAreas, TARIFA_KWH, TARIFA_NOMBRE, dailyData } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Download, FileText, TrendingUp, CalendarDays } from "lucide-react";
import { exportToCSV } from "@/lib/exportCSV";
import { exportToPDF } from "@/lib/exportPDF";
import { toast } from "@/hooks/use-toast";

const officeColors = ["hsl(160,70%,45%)", "hsl(190,80%,45%)", "hsl(38,92%,50%)", "hsl(280,65%,55%)", "hsl(0,70%,50%)"];
const commonAreaColors = ["hsl(200,60%,55%)", "hsl(30,80%,55%)", "hsl(120,50%,50%)"];

const Facturacion = () => {
  const billingData = offices.map((o, i) => ({
    ...o,
    cost: o.energy * TARIFA_KWH,
    color: officeColors[i],
  }));

  const commonBillingData = otherAreas.map((o, i) => ({
    ...o,
    cost: o.energy * TARIFA_KWH,
    color: commonAreaColors[i],
  }));

  const totalEnergy = billingData.reduce((s, o) => s + o.energy, 0);
  const totalCost = billingData.reduce((s, o) => s + o.cost, 0);
  const commonEnergy = commonBillingData.reduce((s, o) => s + o.energy, 0);
  const commonCost = commonBillingData.reduce((s, o) => s + o.cost, 0);
  const grandTotalEnergy = totalEnergy + commonEnergy;
  const grandTotalCost = totalCost + commonCost;

  const pieData = [
    ...billingData.map((o) => ({
      name: o.name,
      value: +o.cost.toFixed(2),
      color: o.color,
    })),
    ...commonBillingData.map((o) => ({
      name: o.name,
      value: +o.cost.toFixed(2),
      color: o.color,
    })),
  ];

  // Cost projection for end of month (26 days elapsed, 28 total for Feb)
  const daysElapsed = 26;
  const daysInMonth = 28;
  const projectedCost = (grandTotalCost / daysElapsed) * daysInMonth;
  const projectedEnergy = (grandTotalEnergy / daysElapsed) * daysInMonth;

  // Daily cost average
  const avgDailyCost = grandTotalCost / daysElapsed;

  // Comparison with previous days
  const last7 = dailyData.slice(-7);
  const prev7 = dailyData.slice(-14, -7);
  const last7Total = last7.reduce((s, d) => s + d.officeA + d.officeB + d.officeC + d.officeD + d.officeE + d.areaF + d.areaG + d.areaH, 0);
  const prev7Total = prev7.reduce((s, d) => s + d.officeA + d.officeB + d.officeC + d.officeD + d.officeE + d.areaF + d.areaG + d.areaH, 0);
  const weekTrend = prev7Total > 0 ? ((last7Total - prev7Total) / prev7Total * 100) : 0;

  const handleExportCSV = () => {
    const headers = ["Área", "Inquilino / Tipo", "Nodo ESP32", "Consumo (kWh)", "% del Total", "Costo (USD)"];
    const allRows = [
      ...billingData.map((o) => [
        o.name, o.tenant, o.espNode, o.energy.toFixed(1),
        ((o.energy / grandTotalEnergy) * 100).toFixed(1) + "%",
        "$" + o.cost.toFixed(2),
      ]),
      ...commonBillingData.map((o) => [
        o.name, o.tenant, o.espNode, o.energy.toFixed(1),
        ((o.energy / grandTotalEnergy) * 100).toFixed(1) + "%",
        "$" + o.cost.toFixed(2),
      ]),
    ];
    allRows.push(["", "", "", "", "", ""]);
    allRows.push(["TOTAL", "", "8 nodos", grandTotalEnergy.toFixed(1), "100%", "$" + grandTotalCost.toFixed(2)]);
    allRows.push(["PROYECCIÓN MES", "", "", projectedEnergy.toFixed(1), "", "$" + projectedCost.toFixed(2)]);
    exportToCSV("facturacion_feb_2026", headers, allRows, {
      title: "REPORTE DE FACTURACIÓN — VoltMeter Solutions S.A.",
      subtitle: `Periodo: 01/02/2026 – 26/02/2026 | Tarifa: ${TARIFA_NOMBRE} ($${TARIFA_KWH}/kWh)`,
    });
    toast({ title: "CSV exportado", description: "facturacion_feb_2026.csv descargado" });
  };

  const handleExportPDF = () => {
    const headers = ["Área", "Inquilino / Tipo", "Nodo", "Consumo (kWh)", "% Total", "Costo (USD)"];
    const allRows = [
      ...billingData.map((o) => [
        o.name, o.tenant, o.espNode, o.energy.toFixed(1),
        ((o.energy / grandTotalEnergy) * 100).toFixed(1) + "%",
        "$" + o.cost.toFixed(2),
      ]),
      ...commonBillingData.map((o) => [
        o.name, o.tenant, o.espNode, o.energy.toFixed(1),
        ((o.energy / grandTotalEnergy) * 100).toFixed(1) + "%",
        "$" + o.cost.toFixed(2),
      ]),
      ["TOTAL", "", "8 nodos", grandTotalEnergy.toFixed(1), "100%", "$" + grandTotalCost.toFixed(2)],
    ];

    exportToPDF({
      title: "Reporte de Facturación — Febrero 2026",
      subtitle: `Tarifa: ${TARIFA_NOMBRE} — $${TARIFA_KWH}/kWh | Periodo: 01/02/2026 – 26/02/2026`,
      headers,
      rows: allRows,
      filename: "facturacion_feb_2026",
      summary: [
        { label: "Consumo Total", value: `${grandTotalEnergy.toFixed(1)} kWh` },
        { label: "Costo Acumulado", value: `$${grandTotalCost.toFixed(2)}` },
        { label: "Proyección Mes", value: `$${projectedCost.toFixed(2)}` },
        { label: "Costo/Día Prom.", value: `$${avgDailyCost.toFixed(2)}` },
      ],
      footer: `Tarifa ${TARIFA_NOMBRE} ($${TARIFA_KWH}/kWh) — VoltMeter Solutions S.A. — SmartBilling`,
    });
    toast({ title: "PDF exportado", description: "facturacion_feb_2026.pdf descargado" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Facturación — Febrero 2026</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Tarifa aplicada: {TARIFA_NOMBRE} — ${TARIFA_KWH}/kWh | Periodo: 01/02/2026 – 26/02/2026
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5" />
            CSV
          </Button>
          <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={handleExportPDF}>
            <FileText className="w-3.5 h-3.5" />
            PDF
          </Button>
        </div>
      </div>

      {/* Projection KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Costo Acumulado</p>
          <p className="text-xl font-bold font-mono text-primary">${grandTotalCost.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{daysElapsed} días facturados</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Proyección Mensual
          </p>
          <p className="text-xl font-bold font-mono text-accent">${projectedCost.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{projectedEnergy.toFixed(0)} kWh estimados</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> Costo/Día Prom.
          </p>
          <p className="text-xl font-bold font-mono text-foreground">${avgDailyCost.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{(grandTotalEnergy / daysElapsed).toFixed(1)} kWh/día</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tendencia Semanal</p>
          <p className={`text-xl font-bold font-mono ${weekTrend > 0 ? "text-warning" : "text-success"}`}>
            {weekTrend > 0 ? "+" : ""}{weekTrend.toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">vs semana anterior</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Table */}
        <div className="xl:col-span-2 stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-3">Desglose por Oficina</h3>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground text-xs">Área</TableHead>
                <TableHead className="text-muted-foreground text-xs">Inquilino / Tipo</TableHead>
                <TableHead className="text-muted-foreground text-xs text-right">Consumo (kWh)</TableHead>
                <TableHead className="text-muted-foreground text-xs text-right">% del Total</TableHead>
                <TableHead className="text-muted-foreground text-xs text-right">Costo (USD)</TableHead>
                <TableHead className="text-muted-foreground text-xs text-right">$/día</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingData.map((o) => (
                <TableRow key={o.id} className="border-border">
                  <TableCell className="font-mono text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: o.color }} />
                      {o.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.tenant}</TableCell>
                  <TableCell className="font-mono text-sm text-right text-foreground">{o.energy.toFixed(1)}</TableCell>
                  <TableCell className="font-mono text-sm text-right text-muted-foreground">
                    {((o.energy / grandTotalEnergy) * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="font-mono text-sm text-right text-primary font-semibold">
                    ${o.cost.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-right text-muted-foreground">
                    ${(o.cost / daysElapsed).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {/* Common Areas Section */}
              <TableRow className="border-border">
                <TableCell colSpan={6} className="text-[10px] text-muted-foreground uppercase tracking-wider pt-3 pb-1">
                  Áreas Comunes
                </TableCell>
              </TableRow>
              {commonBillingData.map((o) => (
                <TableRow key={o.id} className="border-border">
                  <TableCell className="font-mono text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: o.color }} />
                      {o.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.tenant}</TableCell>
                  <TableCell className="font-mono text-sm text-right text-foreground">{o.energy.toFixed(1)}</TableCell>
                  <TableCell className="font-mono text-sm text-right text-muted-foreground">
                    {((o.energy / grandTotalEnergy) * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="font-mono text-sm text-right text-primary font-semibold">
                    ${o.cost.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-right text-muted-foreground">
                    ${(o.cost / daysElapsed).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-border bg-secondary/30">
                <TableCell className="font-semibold text-sm text-foreground" colSpan={2}>TOTAL</TableCell>
                <TableCell className="font-mono text-sm text-right font-bold text-foreground">{grandTotalEnergy.toFixed(1)}</TableCell>
                <TableCell className="font-mono text-sm text-right text-muted-foreground">100%</TableCell>
                <TableCell className="font-mono text-sm text-right font-bold text-primary">${grandTotalCost.toFixed(2)}</TableCell>
                <TableCell className="font-mono text-sm text-right font-bold text-muted-foreground">${avgDailyCost.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Pie Chart */}
        <div className="stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-3">Distribución de Costos</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220, 18%, 12%)",
                    border: "1px solid hsl(220, 15%, 25%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#f1f5f9",
                  }}
                  itemStyle={{ color: "#f1f5f9" }}
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Costo"]}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "11px" }}
                  formatter={(value) => <span style={{ color: "hsl(215, 15%, 50%)" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center border-t border-border pt-3 mt-2">
            <p className="text-xs text-muted-foreground">Costo total del periodo</p>
            <p className="text-2xl font-bold font-mono text-primary">${grandTotalCost.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Facturacion;
