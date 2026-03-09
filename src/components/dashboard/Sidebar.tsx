import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Receipt, AlertTriangle, 
  Building2, Map, Activity, ShieldCheck, X
} from "lucide-react";
import voltmeterLogo from "@/assets/voltmeter-logo.png";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Panel General" },
  { to: "/plano", icon: Map, label: "Plano" },
  { to: "/consumo", icon: Activity, label: "Consumo" },
  { to: "/facturacion", icon: Receipt, label: "Facturación" },
  { to: "/alertas", icon: AlertTriangle, label: "Alertas" },
  { to: "/oficinas", icon: Building2, label: "Oficinas" },
  { to: "/proteccion", icon: ShieldCheck, label: "Protección SSR" },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const DashboardSidebar = ({ isOpen = false, onClose }: DashboardSidebarProps) => {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar flex flex-col transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
    >
      {/* Logo */}
      <div className="flex flex-col gap-3 px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={voltmeterLogo} alt="VoltMeter Logo" className="w-10 h-10" />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-foreground tracking-wide">VoltMeter</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Solutions S.A.</p>
          </div>
          {/* Close button — mobile only */}
          <button
            className="md:hidden flex-shrink-0 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground italic leading-tight">Medimos cada vatio, valoramos cada decisión</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* System status */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="pulse-dot" />
          <span>Sistema operativo</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
          ESP32 Maestro — Wi-Fi Local
        </p>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
