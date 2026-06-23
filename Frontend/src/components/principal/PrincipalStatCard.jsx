import { cx } from "../../utils/formatters";

export default function PrincipalStatCard({ title, value, delta, note, accent = "blue" }) {
  return (
    <article className={cx("principal-stat-card", `is-${accent}`)}>
      <span className="principal-stat-card__eyebrow">{title}</span>
      <strong className="principal-stat-card__value">{value}</strong>
      <div className="principal-stat-card__meta">
        <span>{delta}</span>
        <small>{note}</small>
      </div>
    </article>
  );
}
