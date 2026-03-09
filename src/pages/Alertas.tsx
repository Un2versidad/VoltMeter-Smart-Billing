import { alerts, offices } from "@/data/mockData";
import AlertsList from "@/components/dashboard/AlertsList";
import { AlertTriangle, CheckCircle2, Shield, Download, FileText } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { exportToCSV } from "@/lib/exportCSV";
import { exportToPDF } from "@/lib/exportPDF";
import { toast } from "@/hooks/use-toast";

const Alertas = () => {
  const unresolved = alerts.filter((a) => !a.resolved);
  const resolved = alerts.filter((a) => a.resolved);
  const critical = alerts.filter((a) => a.severity === "critical");

  const handleExportCSV = () => {
    const headers = ["ID", "Oficina", "Tipo", "Severidad", "Estado", "Mensaje", "Fecha/Hora"];
    const rows = alerts.map((a) => [
      a.id, a.officeName, a.type,
      a.severity === "critical" ? "CRÍTICA" : a.severity === "warning" ? "ADVERTENCIA" : "INFO",
      a.resolved ? "Resuelta" : "Activa",
      a.message,
      new Date(a.timestamp).toLocaleString("es-PA"),
    ]);
    exportToCSV("alertas_sistema", headers, rows, {
      title: "REPORTE DE ALERTAS — VoltMeter Solutions S.A.",
      subtitle: `Total: ${alerts.length} alertas | Activas: ${unresolved.length} | Resueltas: ${resolved.length}`,
    });
    toast({ title: "CSV exportado", description: "alertas_sistema.csv" });
  };

  const handleExportPDF = () => {
    const headers = ["ID", "Oficina", "Tipo", "Severidad", "Estado", "Fecha"];
    const rows = alerts.map((a) => [
      a.id, a.officeName, a.type,
      a.severity === "critical" ? "CRÍTICA" : a.severity === "warning" ? "ADVERTENCIA" : "INFO",
      a.resolved ? "Resuelta" : "Activa",
      new Date(a.timestamp).toLocaleString("es-PA"),
    ]);
    exportToPDF({
      title: "Reporte de Alertas del Sistema",
      subtitle: "Historial de eventos y alertas detectadas por los nodos ESP32",
      headers,
      rows,
      filename: "alertas_sistema",
      summary: [
        { label: "Total Alertas", value: String(alerts.length) },
        { label: "Activas", value: String(unresolved.length) },
        { label: "Críticas", value: String(critical.length) },
        { label: "Resueltas", value: String(resolved.length) },
      ],
    });
    toast({ title: "PDF exportado", description: "alertas_sistema.pdf" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Centro de Alertas</h2>
          <p className="text-xs text-muted-foreground mt-1">Gestión de eventos y alertas del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={handleExportPDF}>
            <FileText className="w-3.5 h-3.5" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Sin Resolver" value={String(unresolved.length)} icon={AlertTriangle} variant="warning" />
        <StatCard label="Críticas" value={String(critical.length)} icon={Shield} variant="destructive" />
        <StatCard label="Resueltas" value={String(resolved.length)} icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Alertas Activas
          </h3>
          {unresolved.length > 0 ? (
            <AlertsList alerts={unresolved} />
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin alertas activas</p>
          )}
        </div>
        <div className="stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            Historial Resuelto
          </h3>
          <AlertsList alerts={resolved} />
        </div>
      </div>
    </div>
  );
};

export default Alertas;
