import { Zap, TrendingUp, AlertTriangle, DollarSign, Gauge, Server, Cpu, ShieldCheck } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import OfficeStatusCard from "@/components/dashboard/OfficeStatusCard";
import ConsumptionChart from "@/components/dashboard/ConsumptionChart";
import AlertsList from "@/components/dashboard/AlertsList";
import { offices, otherAreas, alerts, systemStats, TARIFA_KWH, TARIFA_NOMBRE } from "@/data/mockData";

const Index = () => {
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Panel General</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Monitoreo en tiempo real — Tarifa: {TARIFA_NOMBRE} (${TARIFA_KWH}/kWh)
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <StatCard
          label="Consumo Total"
          value={(systemStats.totalEnergy + systemStats.commonAreaEnergy).toFixed(1)}
          unit="kWh"
          icon={Zap}
          trend="Febrero 2026"
        />
        <StatCard
          label="Costo Acumulado"
          value={`$${(systemStats.totalCost + systemStats.commonAreaCost).toFixed(2)}`}
          icon={DollarSign}
          variant="accent"
          trend="Tarifa BTS"
        />
        <StatCard
          label="Demanda Pico"
          value={systemStats.peakDemand.toFixed(2)}
          unit="kW"
          icon={TrendingUp}
          trend="Máx. simultáneo"
        />
        <StatCard
          label="FP Promedio"
          value={systemStats.avgPowerFactor.toFixed(2)}
          icon={Gauge}
          trend="Factor de potencia"
        />
        <StatCard
          label="Nodos / PZEMs"
          value={`${systemStats.nodesOnline}/${systemStats.pzemsTotal}`}
          icon={Cpu}
          trend="8 ESP32 — 24 PZEM"
        />
        <StatCard
          label="Alertas Activas"
          value={String(unresolvedAlerts.length)}
          icon={AlertTriangle}
          variant={unresolvedAlerts.length > 0 ? "warning" : "default"}
          trend="Sin resolver"
        />
        <StatCard
          label="SSR Protección"
          value={`${systemStats.ssrArmed}/${systemStats.ssrTotal}`}
          icon={ShieldCheck}
          trend={`${systemStats.totalTrips} disparos`}
        />
      </div>

      {/* Offices grid */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Estado de Oficinas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {offices.map((office) => (
            <OfficeStatusCard key={office.id} office={office} />
          ))}
        </div>
      </div>

      {/* Other Areas grid */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Otras Áreas Comunes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {otherAreas.map((area) => (
            <OfficeStatusCard key={area.id} office={area} />
          ))}
        </div>
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ConsumptionChart />
        </div>
        <div className="stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-3">Alertas Recientes</h3>
          <AlertsList alerts={alerts} limit={5} />
        </div>
      </div>
    </div>
  );
};

export default Index;
