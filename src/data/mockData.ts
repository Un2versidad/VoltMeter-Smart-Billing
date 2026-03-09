// Tarifas eléctricas de Panamá (BTS - Tarifa Comercial)
export const TARIFA_KWH = 0.1278; // USD/kWh tarifa comercial Panamá
export const TARIFA_NOMBRE = "BTS Comercial";

export interface PhaseData {
  voltage: number;
  current: number;
  power: number;
  powerFactor: number;
  frequency: number;
}

export interface OfficeData {
  id: string;
  name: string;
  tenant: string;
  phases: {
    L1: PhaseData;
    L2: PhaseData;
    L3: PhaseData;
  };
  voltage: number;
  current: number;
  power: number;
  energy: number;
  powerFactor: number;
  frequency: number;
  maxPower: number;
  status: "online" | "offline" | "alert" | "disconnected";
  lastUpdate: string;
  pzemCount: 3;
  espNode: string;
}

// Overload protection config per office
export interface OverloadConfig {
  officeId: string;
  maxPowerKw: number;        // Potencia máxima contratada
  thresholdPercent: number;  // Umbral de alerta (% del max)
  tripDelayMs: number;       // Retardo antes de desconexión (ms)
  autoDisconnect: boolean;   // Si el SSR se activa automáticamente
  ssrStatus: "armed" | "tripped" | "disabled" | "manual_override";
  ssrModel: string;          // Modelo del SSR
  lastTrip: string | null;   // Timestamp último disparo
  tripCount: number;         // Total de disparos acumulados
}

export interface OverloadEvent {
  id: string;
  officeId: string;
  officeName: string;
  timestamp: string;
  peakPowerKw: number;
  maxPowerKw: number;
  overloadPercent: number;
  durationMs: number;
  action: "alert_only" | "ssr_tripped" | "manual_reset";
  phase: "L1" | "L2" | "L3" | "TOTAL";
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface AlertItem {
  id: string;
  officeId: string;
  officeName: string;
  type: "overload" | "disconnect" | "voltage" | "power_factor" | "ssr_trip" | "ssr_reset";
  message: string;
  timestamp: string;
  severity: "warning" | "critical" | "info";
  resolved: boolean;
}

export interface EnergyReading {
  timestamp: string;
  hour: number;
  officeA: number;
  officeB: number;
  officeC: number;
  officeD: number;
  officeE: number;
  areaF: number;  // Baños
  areaG: number;  // Cocineta
  areaH: number;  // Recepción
}

// Helper: genera datos de 3 fases realistas para un sistema trifásico 120/208V
function makePhases(basePowerKw: number): { L1: PhaseData; L2: PhaseData; L3: PhaseData } {
  const split = [0.35, 0.33, 0.32];
  const freq = 60.0 + (Math.random() * 0.04 - 0.02);
  return {
    L1: {
      voltage: 120.5 + Math.random() * 1.5,
      current: +((basePowerKw * split[0] * 1000) / 121).toFixed(1),
      power: +(basePowerKw * split[0]).toFixed(3),
      powerFactor: +(0.95 + Math.random() * 0.04).toFixed(2),
      frequency: +freq.toFixed(2),
    },
    L2: {
      voltage: 120.2 + Math.random() * 1.8,
      current: +((basePowerKw * split[1] * 1000) / 120.8).toFixed(1),
      power: +(basePowerKw * split[1]).toFixed(3),
      powerFactor: +(0.95 + Math.random() * 0.04).toFixed(2),
      frequency: +freq.toFixed(2),
    },
    L3: {
      voltage: 120.8 + Math.random() * 1.2,
      current: +((basePowerKw * split[2] * 1000) / 121.2).toFixed(1),
      power: +(basePowerKw * split[2]).toFixed(3),
      powerFactor: +(0.94 + Math.random() * 0.05).toFixed(2),
      frequency: +freq.toFixed(2),
    },
  };
}

function avgVoltage(p: { L1: PhaseData; L2: PhaseData; L3: PhaseData }) {
  return +((p.L1.voltage + p.L2.voltage + p.L3.voltage) / 3).toFixed(1);
}
function sumCurrent(p: { L1: PhaseData; L2: PhaseData; L3: PhaseData }) {
  return +(p.L1.current + p.L2.current + p.L3.current).toFixed(1);
}
function avgPF(p: { L1: PhaseData; L2: PhaseData; L3: PhaseData }) {
  return +((p.L1.powerFactor + p.L2.powerFactor + p.L3.powerFactor) / 3).toFixed(2);
}
function avgFreq(p: { L1: PhaseData; L2: PhaseData; L3: PhaseData }) {
  return +((p.L1.frequency + p.L2.frequency + p.L3.frequency) / 3).toFixed(2);
}

const phasesA = makePhases(1.02);
const phasesB = makePhases(1.45);
const phasesC = makePhases(2.85); // Near overload for demo
const phasesD = makePhases(0.61);
const phasesE = makePhases(0.78);

// Otras áreas comunes
const phasesF = makePhases(0.42); // Baños
const phasesG = makePhases(1.10); // Cocineta
const phasesH = makePhases(0.55); // Recepción

export const offices: OfficeData[] = [
  {
    id: "1", name: "Oficina #1", tenant: "Tech Solutions PTY",
    phases: phasesA,
    voltage: avgVoltage(phasesA), current: sumCurrent(phasesA),
    power: 1.02, energy: 312.4,
    powerFactor: avgPF(phasesA), frequency: avgFreq(phasesA),
    maxPower: 3.0, status: "online",
    lastUpdate: "2026-02-26T14:32:05",
    pzemCount: 3, espNode: "ESP32-N1",
  },
  {
    id: "2", name: "Oficina #2", tenant: "Abogados Méndez & Asoc.",
    phases: phasesB,
    voltage: avgVoltage(phasesB), current: sumCurrent(phasesB),
    power: 1.45, energy: 487.6,
    powerFactor: avgPF(phasesB), frequency: avgFreq(phasesB),
    maxPower: 3.0, status: "online",
    lastUpdate: "2026-02-26T14:32:05",
    pzemCount: 3, espNode: "ESP32-N2",
  },
  {
    id: "3", name: "Oficina #3", tenant: "Creativa Digital",
    phases: phasesC,
    voltage: avgVoltage(phasesC), current: sumCurrent(phasesC),
    power: 2.85, energy: 542.1,
    powerFactor: avgPF(phasesC), frequency: avgFreq(phasesC),
    maxPower: 3.0, status: "alert",
    lastUpdate: "2026-02-26T14:32:05",
    pzemCount: 3, espNode: "ESP32-N3",
  },
  {
    id: "4", name: "Oficina #4", tenant: "Consultoría Pacífico",
    phases: phasesD,
    voltage: avgVoltage(phasesD), current: sumCurrent(phasesD),
    power: 0.61, energy: 198.3,
    powerFactor: avgPF(phasesD), frequency: avgFreq(phasesD),
    maxPower: 4.0, status: "online",
    lastUpdate: "2026-02-26T14:32:05",
    pzemCount: 3, espNode: "ESP32-N4",
  },
  {
    id: "5", name: "Oficina #5", tenant: "StartUp Hub PTY",
    phases: phasesE,
    voltage: avgVoltage(phasesE), current: sumCurrent(phasesE),
    power: 0.78, energy: 245.7,
    powerFactor: avgPF(phasesE), frequency: avgFreq(phasesE),
    maxPower: 3.0, status: "online",
    lastUpdate: "2026-02-26T14:32:05",
    pzemCount: 3, espNode: "ESP32-N5",
  },
];

// Otras áreas comunes medibles (baños, cocineta, recepción)
export const otherAreas: OfficeData[] = [
  {
    id: "A1", name: "Baños", tenant: "Área Común",
    phases: phasesF,
    voltage: avgVoltage(phasesF), current: sumCurrent(phasesF),
    power: 0.42, energy: 98.5,
    powerFactor: avgPF(phasesF), frequency: avgFreq(phasesF),
    maxPower: 1.5, status: "online",
    lastUpdate: "2026-02-26T14:32:05",
    pzemCount: 3, espNode: "ESP32-N6",
  },
  {
    id: "A2", name: "Cocineta", tenant: "Área Común",
    phases: phasesG,
    voltage: avgVoltage(phasesG), current: sumCurrent(phasesG),
    power: 1.10, energy: 231.8,
    powerFactor: avgPF(phasesG), frequency: avgFreq(phasesG),
    maxPower: 2.0, status: "online",
    lastUpdate: "2026-02-26T14:32:05",
    pzemCount: 3, espNode: "ESP32-N7",
  },
  {
    id: "A3", name: "Recepción", tenant: "Área Común",
    phases: phasesH,
    voltage: avgVoltage(phasesH), current: sumCurrent(phasesH),
    power: 0.55, energy: 112.3,
    powerFactor: avgPF(phasesH), frequency: avgFreq(phasesH),
    maxPower: 1.5, status: "online",
    lastUpdate: "2026-02-26T14:32:05",
    pzemCount: 3, espNode: "ESP32-N8",
  },
];

// Overload protection configurations
export const overloadConfigs: OverloadConfig[] = [
  {
    officeId: "1", maxPowerKw: 3.0, thresholdPercent: 80, tripDelayMs: 3000,
    autoDisconnect: true, ssrStatus: "armed", ssrModel: "SSR-40DA (40A)",
    lastTrip: null, tripCount: 0,
  },
  {
    officeId: "2", maxPowerKw: 3.0, thresholdPercent: 80, tripDelayMs: 3000,
    autoDisconnect: true, ssrStatus: "armed", ssrModel: "SSR-40DA (40A)",
    lastTrip: "2026-02-25T16:42:18", tripCount: 1,
  },
  {
    officeId: "3", maxPowerKw: 3.0, thresholdPercent: 80, tripDelayMs: 3000,
    autoDisconnect: true, ssrStatus: "armed", ssrModel: "SSR-40DA (40A)",
    lastTrip: "2026-02-26T13:55:00", tripCount: 3,
  },
  {
    officeId: "4", maxPowerKw: 4.0, thresholdPercent: 85, tripDelayMs: 5000,
    autoDisconnect: false, ssrStatus: "disabled", ssrModel: "SSR-25DA (25A)",
    lastTrip: null, tripCount: 0,
  },
  {
    officeId: "5", maxPowerKw: 3.0, thresholdPercent: 80, tripDelayMs: 3000,
    autoDisconnect: true, ssrStatus: "armed", ssrModel: "SSR-40DA (40A)",
    lastTrip: null, tripCount: 0,
  },
];

// Overload protection configurations — Otras áreas comunes
export const otherAreaOverloadConfigs: OverloadConfig[] = [
  {
    officeId: "A1", maxPowerKw: 1.5, thresholdPercent: 80, tripDelayMs: 3000,
    autoDisconnect: true, ssrStatus: "armed", ssrModel: "SSR-25DA (25A)",
    lastTrip: null, tripCount: 0,
  },
  {
    officeId: "A2", maxPowerKw: 2.0, thresholdPercent: 85, tripDelayMs: 3000,
    autoDisconnect: true, ssrStatus: "armed", ssrModel: "SSR-40DA (40A)",
    lastTrip: null, tripCount: 0,
  },
  {
    officeId: "A3", maxPowerKw: 1.5, thresholdPercent: 80, tripDelayMs: 3000,
    autoDisconnect: true, ssrStatus: "armed", ssrModel: "SSR-25DA (25A)",
    lastTrip: null, tripCount: 0,
  },
];

// Overload event history
export const overloadEvents: OverloadEvent[] = [
  {
    id: "OVL-001", officeId: "3", officeName: "Oficina #3",
    timestamp: "2026-02-26T13:55:00", peakPowerKw: 3.21, maxPowerKw: 3.0,
    overloadPercent: 107, durationMs: 4200, action: "ssr_tripped",
    phase: "TOTAL", resolved: true,
    resolvedBy: "ESP32-Maestro (auto-reset)", resolvedAt: "2026-02-26T13:56:30",
  },
  {
    id: "OVL-002", officeId: "3", officeName: "Oficina #3",
    timestamp: "2026-02-26T10:12:00", peakPowerKw: 2.94, maxPowerKw: 3.0,
    overloadPercent: 98, durationMs: 1800, action: "alert_only",
    phase: "L1", resolved: true,
    resolvedBy: "Auto (potencia normalizada)", resolvedAt: "2026-02-26T10:12:45",
  },
  {
    id: "OVL-003", officeId: "2", officeName: "Oficina #2",
    timestamp: "2026-02-25T16:42:18", peakPowerKw: 3.45, maxPowerKw: 3.0,
    overloadPercent: 115, durationMs: 5100, action: "ssr_tripped",
    phase: "TOTAL", resolved: true,
    resolvedBy: "Operador: Juan R.", resolvedAt: "2026-02-25T16:50:00",
  },
  {
    id: "OVL-004", officeId: "3", officeName: "Oficina #3",
    timestamp: "2026-02-24T15:30:00", peakPowerKw: 3.12, maxPowerKw: 3.0,
    overloadPercent: 104, durationMs: 3500, action: "ssr_tripped",
    phase: "L2", resolved: true,
    resolvedBy: "ESP32-Maestro (auto-reset)", resolvedAt: "2026-02-24T15:31:15",
  },
  {
    id: "OVL-005", officeId: "1", officeName: "Oficina #1",
    timestamp: "2026-02-20T09:05:00", peakPowerKw: 2.55, maxPowerKw: 3.0,
    overloadPercent: 85, durationMs: 2100, action: "alert_only",
    phase: "TOTAL", resolved: true,
    resolvedBy: "Auto (potencia normalizada)", resolvedAt: "2026-02-20T09:06:00",
  },
];

export const alerts: AlertItem[] = [
  {
    id: "ALR-001", officeId: "3", officeName: "Oficina #3",
    type: "overload", message: "SOBRECARGA: Potencia total 2.85 kW — 95% del límite contratado (3.0 kW). SSR armado.",
    timestamp: "2026-02-26T14:28:00", severity: "critical", resolved: false,
  },
  {
    id: "ALR-006", officeId: "3", officeName: "Oficina #3",
    type: "ssr_trip", message: "SSR ACTIVADO: Potencia 3.21 kW excedió 100% por 4.2s. Oficina desconectada automáticamente.",
    timestamp: "2026-02-26T13:55:00", severity: "critical", resolved: true,
  },
  {
    id: "ALR-007", officeId: "3", officeName: "Oficina #3",
    type: "ssr_reset", message: "SSR RESTAURADO: Oficina #3 reconectada tras verificación. Operación normal.",
    timestamp: "2026-02-26T13:56:30", severity: "info", resolved: true,
  },
  {
    id: "ALR-002", officeId: "3", officeName: "Oficina #3",
    type: "overload", message: "Potencia trifásica total alcanzó 98% del contratado (2.94 kW / 3.0 kW) en L1",
    timestamp: "2026-02-26T10:12:00", severity: "warning", resolved: true,
  },
  {
    id: "ALR-003", officeId: "2", officeName: "Oficina #2",
    type: "ssr_trip", message: "SSR ACTIVADO: Sobrecarga 3.45 kW (115%) durante 5.1s. Relé SSR-40DA desconectó Oficina #2.",
    timestamp: "2026-02-25T16:42:18", severity: "critical", resolved: true,
  },
  {
    id: "ALR-004", officeId: "1", officeName: "Oficina #1",
    type: "voltage", message: "Voltaje fuera de rango en L3: 128.3V (máximo 126V)",
    timestamp: "2026-02-24T09:11:33", severity: "warning", resolved: true,
  },
  {
    id: "ALR-005", officeId: "4", officeName: "Oficina #4",
    type: "power_factor", message: "Factor de potencia bajo en L1: 0.72 (mínimo recomendado: 0.85)",
    timestamp: "2026-02-23T11:05:00", severity: "info", resolved: true,
  },
  {
    id: "ALR-008", officeId: "A2", officeName: "Cocineta",
    type: "overload", message: "ADVERTENCIA: Cocineta alcanzó 88% de potencia contratada (1.76 kW / 2.0 kW). Revisar equipos.",
    timestamp: "2026-02-26T12:35:00", severity: "warning", resolved: false,
  },
  {
    id: "ALR-009", officeId: "A1", officeName: "Baños",
    type: "voltage", message: "Voltaje irregular en L2 de Baños: 117.2V (mínimo 118V). Verificar alimentación.",
    timestamp: "2026-02-25T09:48:00", severity: "warning", resolved: true,
  },
  {
    id: "ALR-010", officeId: "A3", officeName: "Recepción",
    type: "disconnect", message: "Nodo ESP32-N8 (Recepción) sin respuesta por 45 segundos. Reconexión automática exitosa.",
    timestamp: "2026-02-24T16:20:00", severity: "info", resolved: true,
  },
];

// Datos de consumo por hora (últimas 24 horas)
export const hourlyData: EnergyReading[] = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const isWorkHour = hour >= 8 && hour <= 18;
  const factor = isWorkHour ? 1 : 0.15;
  const peakFactor = (hour >= 10 && hour <= 14) ? 1.3 : 1;
  // Common areas have different usage patterns:
  // Baños (F): consistent during work hours, very low off-hours
  // Cocineta (G): peaks at lunch (12-14) and breakfast (8-9)
  // Recepción (H): active all work hours, minimal off-hours
  const lunchFactor = (hour >= 11 && hour <= 14) ? 1.8 : 1;
  const isWorkHourArea = hour >= 7 && hour <= 19;
  const areaFactor = isWorkHourArea ? 1 : 0.05;
  return {
    timestamp: `2026-02-26T${String(hour).padStart(2, "0")}:00:00`,
    hour,
    officeA: +(0.3 + Math.random() * 0.8 * factor * peakFactor).toFixed(2),
    officeB: +(0.4 + Math.random() * 1.1 * factor * peakFactor).toFixed(2),
    officeC: +(0.5 + Math.random() * 1.4 * factor * peakFactor).toFixed(2),
    officeD: +(0.2 + Math.random() * 0.5 * factor * peakFactor).toFixed(2),
    officeE: +(0.25 + Math.random() * 0.6 * factor * peakFactor).toFixed(2),
    areaF: +(0.05 + Math.random() * 0.25 * areaFactor).toFixed(2),
    areaG: +(0.08 + Math.random() * 0.55 * areaFactor * lunchFactor).toFixed(2),
    areaH: +(0.06 + Math.random() * 0.30 * areaFactor).toFixed(2),
  };
});

// Datos de consumo diario (últimos 30 días)
export const dailyData = Array.from({ length: 30 }, (_, i) => {
  const day = 30 - i;
  const date = new Date(2026, 1, day);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const factor = isWeekend ? 0.3 : 1;
  return {
    date: `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`,
    officeA: +(8 + Math.random() * 6 * factor).toFixed(1),
    officeB: +(12 + Math.random() * 8 * factor).toFixed(1),
    officeC: +(14 + Math.random() * 10 * factor).toFixed(1),
    officeD: +(5 + Math.random() * 4 * factor).toFixed(1),
    officeE: +(4 + Math.random() * 5 * factor).toFixed(1),
    areaF: +(2 + Math.random() * 2 * factor).toFixed(1),
    areaG: +(4 + Math.random() * 4 * factor).toFixed(1),
    areaH: +(2.5 + Math.random() * 2.5 * factor).toFixed(1),
  };
});

export const systemStats = {
  uptime: 99.7,
  totalEnergy: offices.reduce((s, o) => s + o.energy, 0),
  totalCost: offices.reduce((s, o) => s + o.energy, 0) * TARIFA_KWH,
  commonAreaEnergy: otherAreas.reduce((s, o) => s + o.energy, 0),
  commonAreaCost: otherAreas.reduce((s, o) => s + o.energy, 0) * TARIFA_KWH,
  nodesOnline: 8,
  nodesTotal: 8,
  pzemsTotal: 24,
  activeAlerts: alerts.filter(a => !a.resolved).length,
  avgPowerFactor: +(offices.reduce((s, o) => s + o.powerFactor, 0) / offices.length).toFixed(2),
  peakDemand: 5.82,
  ssrArmed: overloadConfigs.filter(c => c.ssrStatus === "armed").length,
  ssrTotal: overloadConfigs.length + otherAreaOverloadConfigs.length,
  totalTrips: overloadEvents.filter(e => e.action === "ssr_tripped").length,
};
