<p align="center">
  <img width="200" height="200" alt="VoltMeter Logo" src="https://github.com/user-attachments/assets/61bc5838-1eec-416d-936f-b5e6751e9386">
</p>

<h1 align="center">VoltMeter Solutions S.A.</h1>

<p align="center">
  <b>Smart Billing Multitenant Dashboard</b><br>
  Monitoreo y facturación energética inteligente para edificios comerciales
</p>

<p align="center">
  ⚡ Submedición energética &nbsp;&nbsp;|&nbsp;&nbsp;
  📊 Dashboard en tiempo real &nbsp;&nbsp;|&nbsp;&nbsp;
  🧾 Facturación automática
</p>

---

# 📖 Descripción

**VoltMeter Solutions S.A.** desarrolla una solución de **submedición eléctrica inteligente** para edificios con múltiples oficinas que comparten un único medidor principal.

El sistema permite medir el consumo energético de cada oficina de forma individual utilizando medidores industriales conectados mediante **Modbus**, enviando los datos a una base de datos central y mostrándolos en un **dashboard web en tiempo real**.

Esto permite realizar **facturación energética justa y transparente**, eliminando estimaciones manuales y mejorando la gestión energética del edificio.

---

# ⚠️ Problema

En muchos edificios de **co-working o espacios comerciales pequeños**, existe un único medidor eléctrico para todo el edificio.

Esto genera problemas como:

- Cobros estimados o **"a ojo"**
- Conflictos entre arrendatarios
- Falta de transparencia
- Pérdidas económicas para la administración

---

# 💡 Solución

VoltMeter implementa un sistema de **submedición energética inteligente** que permite:

- ⚡ Medir el consumo eléctrico por oficina y áreas comunes  
- 📊 Monitorear datos eléctricos en tiempo real  
- 📑 Generar reportes de consumo detallados  
- 💰 Calcular automáticamente el costo energético  
- 🚨 Detectar sobrecargas eléctricas  

---

# 🏗️ Diagrama del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     EDIFICIO COMERCIAL — 99.3 m²                            │
│                                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐   │
│  │ OFICINA#1 │  │ OFICINA#2 │  │ OFICINA#3 │  │ OFICINA#4 │  │OFICINA#5 │   │
│  │ ESP32-N1  │  │ ESP32-N2  │  │ ESP32-N3  │  │ ESP32-N4  │  │ ESP32-N5 │   │
│  │ 3×PZEM    │  │ 3×PZEM    │  │ 3×PZEM    │  │ 3×PZEM    │  │ 3×PZEM   │   │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬────┘   │
│        │              │              │              │              │        │
│  ┌─────┴──────────────┴──────────────┴──────────────┴──────────────┴────┐   │
│  │               BUS RS-485 Modbus RTU @ 9600 baud                      │   │
│  └──────────────────────────────────┬───────────────────────────────────┘   │
│                                     │                                       │
│  ┌──────────────────────────────┐   │   ┌──────────────────────────────┐    │
│  │     OTRAS ÁREAS COMUNES      │   │   │  ESP32-MASTER (Controlador)  │    │
│  └──────────────┬───────────────┘   │   │  WiFi / MQTT / HTTP API      │    │
│     ┌──────────┐ ┌──────────┐   │   │   └──────────────┬───────────────┘    │
│     │  BAÑOS   │ │COCINETA  │   │   └──────────────────┤                    │
│     │ ESP32-N6 │ │ ESP32-N7 │   │                      │                    │
│     │ 3×PZEM   │ │ 3×PZEM   │───┘                      ▼                    │
│     └──────────┘ └──────────┘                ┌──────────────────┐           │
│     ┌──────────┐                             │  BASE DE DATOS   │           │
│     │RECEPCIÓN │                             │  (Tiempo Real)   │           │
│     │ ESP32-N8 │                             └────────┬─────────┘           │
│     │ 3×PZEM   │                                      │                     │
│     └──────────┘                                      ▼                     │
│                                            ┌──────────────────┐             │
│                                            │  DASHBOARD WEB   │             │
│     MEDIDOR PRINCIPAL (ETESA)              │  VoltMeter S.A.  │             │
│     ┌─────────────┐                        │  Panel General   │             │
│     │Red Eléctrica│─► Acometida 3Φ         │  Plano           │             │
│     │   120/208V  │   60 Hz                │  Consumo         │             │
│     └─────────────┘                        │  Alertas         │             │
│                                            │  Facturación     │             │
│                                            └──────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘

Leyenda:
  PZEM-004T  — Medidor trifásico de energía (L1, L2, L3)
  ESP32      — Nodo de adquisición y transmisión de datos
  RS-485     — Bus de comunicación Modbus RTU
  SSR        — Relé de estado sólido (protección contra sobrecarga)
```

---

# 📊 Características del Dashboard

## ⚡ Monitoreo en Tiempo Real

Visualización en vivo de parámetros eléctricos por oficina y área común:

- Voltaje (V)
- Corriente (A)
- Potencia (W)
- Consumo energético (kWh)
- Factor de potencia
- Frecuencia (Hz)

---

## 🏢 Submedición por Área

El sistema monitorea **5 oficinas** y **3 áreas comunes** dentro del edificio:

| Área | Nodo | PZEM | Potencia Máx. |
|------|------|------|--------------|
| Oficina #1 | ESP32-N1 | 3× PZEM-004T | 3.0 kW |
| Oficina #2 | ESP32-N2 | 3× PZEM-004T | 3.0 kW |
| Oficina #3 | ESP32-N3 | 3× PZEM-004T | 3.0 kW |
| Oficina #4 | ESP32-N4 | 3× PZEM-004T | 4.0 kW |
| Oficina #5 | ESP32-N5 | 3× PZEM-004T | 3.0 kW |
| Baños | ESP32-N6 | 3× PZEM-004T | 1.5 kW |
| Cocineta | ESP32-N7 | 3× PZEM-004T | 2.0 kW |
| Recepción | ESP32-N8 | 3× PZEM-004T | 1.5 kW |

Cada área cuenta con:

- Nodo de medición propio (ESP32 + 3× PZEM-004T)
- Registro histórico de consumo
- Límite de potencia configurado
- Identificación dentro del sistema
- Protección SSR (solenoid state relay) contra sobrecarga

---

## 🧾 Facturación Automática

El sistema calcula automáticamente el costo energético utilizando la tarifa configurada.

- Tarifa aplicada: **BTS Comercial** (Panamá) — $0.1278/kWh
- Desglose individual por oficina e incluyendo áreas comunes (Baños, Cocineta, Recepción)
- Proyección mensual de costos
- Exportación a CSV y PDF
