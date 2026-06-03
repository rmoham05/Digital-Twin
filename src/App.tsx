import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  Cpu,
  Download,
  Fan,
  Gauge,
  LayoutDashboard,
  Map,
  Pause,
  Play,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Thermometer,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type AssetStatus = "healthy" | "watch" | "critical";
type AssetKind = "HVAC" | "Pump" | "Compressor" | "Meter" | "Chiller" | "AHU";

type Asset = {
  id: string;
  name: string;
  kind: AssetKind;
  zone: string;
  health: number;
  temperature: number;
  vibration: number;
  energyKw: number;
  status: AssetStatus;
  nextServiceDays: number;
};

type Alert = {
  id: string;
  title: string;
  asset: string;
  severity: AssetStatus;
  time: string;
};

type WorkOrder = {
  id: string;
  asset: string;
  task: string;
  owner: string;
  due: string;
  priority: "P1" | "P2" | "P3";
};

const baseAssets: Asset[] = [
  {
    id: "ahu-01",
    name: "AHU-01",
    kind: "AHU",
    zone: "North Office",
    health: 94,
    temperature: 21.3,
    vibration: 1.2,
    energyKw: 18.4,
    status: "healthy",
    nextServiceDays: 38,
  },
  {
    id: "ch-02",
    name: "Chiller-02",
    kind: "Chiller",
    zone: "Plant Room",
    health: 76,
    temperature: 25.8,
    vibration: 2.6,
    energyKw: 61.9,
    status: "watch",
    nextServiceDays: 11,
  },
  {
    id: "pump-03",
    name: "Pump-03",
    kind: "Pump",
    zone: "Basement",
    health: 58,
    temperature: 31.2,
    vibration: 4.9,
    energyKw: 14.6,
    status: "critical",
    nextServiceDays: 2,
  },
  {
    id: "cmp-01",
    name: "Compressor-01",
    kind: "Compressor",
    zone: "West Utility",
    health: 83,
    temperature: 28.1,
    vibration: 2.2,
    energyKw: 24.7,
    status: "watch",
    nextServiceDays: 19,
  },
  {
    id: "mtr-07",
    name: "Meter-07",
    kind: "Meter",
    zone: "Level 2",
    health: 97,
    temperature: 19.6,
    vibration: 0.4,
    energyKw: 8.2,
    status: "healthy",
    nextServiceDays: 54,
  },
  {
    id: "hvac-04",
    name: "HVAC-04",
    kind: "HVAC",
    zone: "Conference Wing",
    health: 88,
    temperature: 22.8,
    vibration: 1.6,
    energyKw: 21.1,
    status: "healthy",
    nextServiceDays: 27,
  },
];

const baseAlerts: Alert[] = [
  {
    id: "al-1028",
    title: "Elevated vibration trend",
    asset: "Pump-03",
    severity: "critical",
    time: "09:42",
  },
  {
    id: "al-1027",
    title: "Cooling efficiency below baseline",
    asset: "Chiller-02",
    severity: "watch",
    time: "09:18",
  },
  {
    id: "al-1026",
    title: "Compressor duty cycle rising",
    asset: "Compressor-01",
    severity: "watch",
    time: "08:56",
  },
];

const workOrders: WorkOrder[] = [
  {
    id: "WO-4182",
    asset: "Pump-03",
    task: "Inspect bearing and coupling alignment",
    owner: "Maintenance",
    due: "Today",
    priority: "P1",
  },
  {
    id: "WO-4183",
    asset: "Chiller-02",
    task: "Clean condenser coil and verify refrigerant pressure",
    owner: "Facilities",
    due: "Tomorrow",
    priority: "P2",
  },
  {
    id: "WO-4184",
    asset: "Compressor-01",
    task: "Review duty-cycle schedule",
    owner: "Operations",
    due: "Fri",
    priority: "P3",
  },
];

const sparkline = [37, 42, 39, 45, 48, 43, 51, 56, 52, 59, 61, 57, 64, 68, 63];

function getStatusFromHealth(health: number): AssetStatus {
  if (health < 64) return "critical";
  if (health < 86) return "watch";
  return "healthy";
}

function statusLabel(status: AssetStatus) {
  return status === "healthy" ? "Healthy" : status === "watch" ? "Watch" : "Critical";
}

function statusIcon(status: AssetStatus) {
  if (status === "healthy") return <CheckCircle2 size={16} />;
  if (status === "watch") return <AlertTriangle size={16} />;
  return <AlertTriangle size={16} />;
}

function App() {
  const [assets, setAssets] = useState<Asset[]>(baseAssets);
  const [isLive, setIsLive] = useState(true);
  const [loadFactor, setLoadFactor] = useState(72);
  const [activeZone, setActiveZone] = useState("All zones");
  const [selectedAssetId, setSelectedAssetId] = useState("pump-03");

  useEffect(() => {
    if (!isLive) return;

    const interval = window.setInterval(() => {
      setAssets((current) =>
        current.map((asset, index) => {
          const wave = Math.sin(Date.now() / 5200 + index) * 1.3;
          const loadPressure = (loadFactor - 70) / 18;
          const health = Math.max(41, Math.min(99, asset.health + wave * 0.24 - loadPressure * 0.38));
          const status = getStatusFromHealth(health);

          return {
            ...asset,
            health,
            status,
            temperature: asset.temperature + wave * 0.08 + loadPressure * 0.11,
            vibration: Math.max(0.1, asset.vibration + wave * 0.018 + loadPressure * 0.02),
            energyKw: Math.max(2, asset.energyKw + wave * 0.09 + loadPressure * 0.2),
          };
        }),
      );
    }, 1800);

    return () => window.clearInterval(interval);
  }, [isLive, loadFactor]);

  const zones = useMemo(() => ["All zones", ...Array.from(new Set(baseAssets.map((asset) => asset.zone)))], []);
  const visibleAssets = activeZone === "All zones" ? assets : assets.filter((asset) => asset.zone === activeZone);
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) ?? assets[0];

  const metrics = useMemo(() => {
    const averageHealth = Math.round(assets.reduce((sum, asset) => sum + asset.health, 0) / assets.length);
    const energy = assets.reduce((sum, asset) => sum + asset.energyKw, 0);
    const critical = assets.filter((asset) => asset.status === "critical").length;
    const watch = assets.filter((asset) => asset.status === "watch").length;
    const savings = Math.max(8, Math.round((100 - loadFactor) * 0.56 + 12));

    return {
      averageHealth,
      energy,
      critical,
      watch,
      savings,
    };
  }, [assets, loadFactor]);

  const scenarioImpact = useMemo(() => {
    const energyDelta = Math.round((loadFactor - 72) * 1.8);
    const riskDelta = Math.round((loadFactor - 72) * 0.9);
    const maintenanceShift = loadFactor > 82 ? -5 : loadFactor < 62 ? 4 : 0;

    return { energyDelta, riskDelta, maintenanceShift };
  }, [loadFactor]);

  return (
    <div className="appShell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brandMark">
          <Building2 size={22} />
        </div>
        <button className="navButton active" title="Dashboard" aria-label="Dashboard">
          <LayoutDashboard size={21} />
        </button>
        <button className="navButton" title="Asset map" aria-label="Asset map">
          <Map size={21} />
        </button>
        <button className="navButton" title="Telemetry" aria-label="Telemetry">
          <Activity size={21} />
        </button>
        <button className="navButton" title="Work orders" aria-label="Work orders">
          <ClipboardList size={21} />
        </button>
        <button className="navButton" title="Settings" aria-label="Settings">
          <Settings size={21} />
        </button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Bluemouse AI</p>
            <h1>TwinOps Command Center</h1>
          </div>

          <div className="topActions">
            <label className="searchBox">
              <Search size={17} />
              <input aria-label="Search assets" placeholder="Search assets" />
            </label>

            <select
              aria-label="Zone filter"
              value={activeZone}
              onChange={(event) => setActiveZone(event.target.value)}
            >
              {zones.map((zone) => (
                <option key={zone}>{zone}</option>
              ))}
            </select>

            <button className="iconButton" title="Notifications" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button className="iconButton" title="Export report" aria-label="Export report">
              <Download size={18} />
            </button>
          </div>
        </header>

        <section className="statusStrip" aria-label="Operations summary">
          <Metric icon={<ShieldCheck size={21} />} label="Fleet Health" value={`${metrics.averageHealth}%`} tone="green" />
          <Metric icon={<Zap size={21} />} label="Live Load" value={`${metrics.energy.toFixed(1)} kW`} tone="yellow" />
          <Metric icon={<AlertTriangle size={21} />} label="Open Risk" value={`${metrics.critical} critical`} tone="red" />
          <Metric icon={<TrendingUp size={21} />} label="Optimization" value={`${metrics.savings}%`} tone="blue" />
        </section>

        <section className="controlBand" aria-label="Twin controls">
          <div className="segmented">
            <button className="segment active">Operations</button>
            <button className="segment">Maintenance</button>
            <button className="segment">Energy</button>
            <button className="segment">Simulation</button>
          </div>

          <div className="liveControls">
            <button
              className="primaryButton"
              onClick={() => setIsLive((value) => !value)}
              title={isLive ? "Pause live telemetry" : "Resume live telemetry"}
            >
              {isLive ? <Pause size={17} /> : <Play size={17} />}
              {isLive ? "Live" : "Paused"}
            </button>
            <button className="iconButton" title="Refresh telemetry" aria-label="Refresh telemetry">
              <RefreshCw size={18} />
            </button>
          </div>
        </section>

        <div className="dashboardGrid">
          <section className="twinCanvas" aria-label="Digital twin map">
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">Facility Twin</p>
                <h2>West Campus Building A</h2>
              </div>
              <span className="syncBadge">
                <Server size={15} />
                synced 4s ago
              </span>
            </div>

            <div className="facilityMap">
              {assets.map((asset, index) => (
                <button
                  key={asset.id}
                  className={`assetNode ${asset.status} ${selectedAsset.id === asset.id ? "selected" : ""}`}
                  style={{ gridArea: `node${index + 1}` }}
                  onClick={() => setSelectedAssetId(asset.id)}
                >
                  <span className="nodeIcon">{asset.kind === "Pump" ? <Gauge size={18} /> : asset.kind === "AHU" ? <Fan size={18} /> : <Cpu size={18} />}</span>
                  <span>
                    <strong>{asset.name}</strong>
                    <small>{asset.zone}</small>
                  </span>
                  <b>{Math.round(asset.health)}%</b>
                </button>
              ))}
              <span className="mapLine lineA" />
              <span className="mapLine lineB" />
              <span className="mapLine lineC" />
            </div>
          </section>

          <section className="assetInspector" aria-label="Selected asset">
            <div className="sectionHeader compact">
              <div>
                <p className="eyebrow">Selected Asset</p>
                <h2>{selectedAsset.name}</h2>
              </div>
              <span className={`statusPill ${selectedAsset.status}`}>
                {statusIcon(selectedAsset.status)}
                {statusLabel(selectedAsset.status)}
              </span>
            </div>

            <div className="healthDial" style={{ "--health": selectedAsset.health } as React.CSSProperties}>
              <span>{Math.round(selectedAsset.health)}%</span>
              <small>Health</small>
            </div>

            <div className="inspectorStats">
              <SmallStat icon={<Thermometer size={18} />} label="Temp" value={`${selectedAsset.temperature.toFixed(1)} C`} />
              <SmallStat icon={<Activity size={18} />} label="Vibration" value={`${selectedAsset.vibration.toFixed(1)} mm/s`} />
              <SmallStat icon={<Zap size={18} />} label="Energy" value={`${selectedAsset.energyKw.toFixed(1)} kW`} />
            </div>

            <div className="recommendation">
              <Wrench size={18} />
              <p>
                Inspect within <strong>{selectedAsset.nextServiceDays} days</strong>. Failure probability is highest in
                bearing wear and abnormal load cycling.
              </p>
            </div>
          </section>

          <section className="chartPanel" aria-label="Energy trend">
            <div className="sectionHeader compact">
              <div>
                <p className="eyebrow">Energy</p>
                <h2>24-hour demand</h2>
              </div>
              <span className="deltaBadge">+4.8%</span>
            </div>
            <Sparkline values={sparkline} />
          </section>

          <section className="simulatorPanel" aria-label="Scenario simulator">
            <div className="sectionHeader compact">
              <div>
                <p className="eyebrow">Scenario</p>
                <h2>Operating load</h2>
              </div>
              <SlidersHorizontal size={20} />
            </div>

            <label className="sliderRow">
              <span>{loadFactor}%</span>
              <input
                type="range"
                min="45"
                max="95"
                value={loadFactor}
                onChange={(event) => setLoadFactor(Number(event.target.value))}
              />
            </label>

            <div className="impactGrid">
              <SmallStat label="Energy" value={`${scenarioImpact.energyDelta >= 0 ? "+" : ""}${scenarioImpact.energyDelta}%`} />
              <SmallStat label="Risk" value={`${scenarioImpact.riskDelta >= 0 ? "+" : ""}${scenarioImpact.riskDelta}%`} />
              <SmallStat label="Service" value={`${scenarioImpact.maintenanceShift >= 0 ? "+" : ""}${scenarioImpact.maintenanceShift} days`} />
            </div>
          </section>
        </div>

        <section className="lowerGrid">
          <div className="assetTableWrap">
            <div className="sectionHeader compact">
              <div>
                <p className="eyebrow">Asset Fleet</p>
                <h2>{visibleAssets.length} monitored assets</h2>
              </div>
              <span className="mutedCount">{metrics.watch} watchlist</span>
            </div>

            <table className="assetTable">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Zone</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th>Energy</th>
                  <th>Service</th>
                </tr>
              </thead>
              <tbody>
                {visibleAssets.map((asset) => (
                  <tr key={asset.id} onClick={() => setSelectedAssetId(asset.id)}>
                    <td>
                      <strong>{asset.name}</strong>
                      <span>{asset.kind}</span>
                    </td>
                    <td>{asset.zone}</td>
                    <td>
                      <span className={`statusPill ${asset.status}`}>{statusLabel(asset.status)}</span>
                    </td>
                    <td>
                      <div className="healthBar">
                        <span style={{ width: `${asset.health}%` }} />
                      </div>
                    </td>
                    <td>{asset.energyKw.toFixed(1)} kW</td>
                    <td>{asset.nextServiceDays}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sideStack">
            <section className="alertsPanel" aria-label="Active alerts">
              <div className="sectionHeader compact">
                <div>
                  <p className="eyebrow">Alerts</p>
                  <h2>Active events</h2>
                </div>
                <span className="mutedCount">{baseAlerts.length}</span>
              </div>
              {baseAlerts.map((alert) => (
                <article key={alert.id} className={`eventItem ${alert.severity}`}>
                  <span>{statusIcon(alert.severity)}</span>
                  <div>
                    <strong>{alert.title}</strong>
                    <small>
                      {alert.asset} · {alert.time}
                    </small>
                  </div>
                </article>
              ))}
            </section>

            <section className="workPanel" aria-label="Work orders">
              <div className="sectionHeader compact">
                <div>
                  <p className="eyebrow">Maintenance</p>
                  <h2>Work queue</h2>
                </div>
                <Wrench size={19} />
              </div>
              {workOrders.map((order) => (
                <article key={order.id} className="workItem">
                  <span className={`priority ${order.priority}`}>{order.priority}</span>
                  <div>
                    <strong>{order.task}</strong>
                    <small>
                      {order.id} · {order.asset} · {order.owner} · {order.due}
                    </small>
                  </div>
                </article>
              ))}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

type MetricProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "green" | "yellow" | "red" | "blue";
};

function Metric({ icon, label, value, tone }: MetricProps) {
  return (
    <article className={`metric ${tone}`}>
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

type SmallStatProps = {
  icon?: React.ReactNode;
  label: string;
  value: string;
};

function SmallStat({ icon, label, value }: SmallStatProps) {
  return (
    <div className="smallStat">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const width = 560;
  const height = 180;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / (max - min)) * (height - 28) - 14;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Energy demand trend">
      <defs>
        <linearGradient id="sparkGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1e7d68" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#1e7d68" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline points={`0,${height} ${points} ${width},${height}`} fill="url(#sparkGradient)" stroke="none" />
      <polyline points={points} fill="none" stroke="#1e7d68" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default App;

