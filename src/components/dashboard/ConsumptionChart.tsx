import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { hourlyData } from "@/data/mockData";

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

const ConsumptionChart = () => {
  return (
    <div className="stat-card">
      <h3 className="text-sm font-semibold text-foreground mb-4">Consumo por hora — Hoy (kW)</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {Object.entries(officeColors).map(([key, color]) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 15%)" />
            <XAxis 
              dataKey="hour" 
              tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 11 }} 
              tickFormatter={(h) => `${h}:00`}
              stroke="hsl(220, 15%, 18%)"
            />
            <YAxis 
              tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 11 }} 
              stroke="hsl(220, 15%, 18%)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 12%)",
                border: "1px solid hsl(220, 15%, 18%)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(210, 20%, 90%)",
              }}
              labelFormatter={(h) => `${h}:00 hrs`}
            />
            <Legend 
              wrapperStyle={{ fontSize: "11px", color: "hsl(215, 15%, 50%)" }}
              formatter={(value) => officeLabels[value] || value}
            />
            {Object.entries(officeColors).map(([key, color]) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                fill={`url(#grad-${key})`}
                strokeWidth={1.5}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConsumptionChart;
