export default function PrincipalChartCard({ title, subtitle, type = "bar", data = [] }) {
  return (
    <section className="principal-chart-card">
      <div className="principal-chart-card__header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>

      {type === "line" ? (
        <LineChart data={data} />
      ) : type === "donut" ? (
        <DonutChart data={data} />
      ) : (
        <BarChart data={data} />
      )}
    </section>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="principal-bars" role="img" aria-label="Bar chart">
      {data.map((item) => (
        <div className="principal-bars__item" key={item.label}>
          <span className="principal-bars__label">{item.label}</span>
          <div className="principal-bars__track">
            <span className="principal-bars__fill" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data }) {
  if (!data.length) return null;
  const width = 620;
  const height = 240;
  const padding = 24;
  const max = Math.max(...data.map((item) => item.value), 1);
  const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);
  const points = data.map((item, index) => {
    const x = padding + stepX * index;
    const y = height - padding - ((item.value / max) * (height - padding * 2));
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <svg className="principal-line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart">
      <path className="principal-line-chart__grid" d={`M ${padding} ${height - padding} H ${width - padding}`} />
      {points.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="5" />
          <text x={point.x} y={height - 6} textAnchor="middle">
            {point.label}
          </text>
        </g>
      ))}
      <path className="principal-line-chart__line" d={path} />
    </svg>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="principal-donut" role="img" aria-label="Academic performance summary chart">
      <svg viewBox="0 0 220 220">
        <circle className="principal-donut__track" cx="110" cy="110" r={radius} />
        {data.map((item, index) => {
          const dash = (item.value / total) * circumference;
          const dashOffset = circumference - offset;
          offset += dash;
          return (
            <circle
              key={item.label}
              className={`principal-donut__segment principal-donut__segment--${index + 1}`}
              cx="110"
              cy="110"
              r={radius}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={dashOffset}
            />
          );
        })}
      </svg>
      <div className="principal-donut__legend">
        {data.map((item, index) => (
          <div key={item.label} className="principal-donut__legend-item">
            <span className={`principal-donut__swatch principal-donut__swatch--${index + 1}`} />
            <strong>{item.label}</strong>
            <span>{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
