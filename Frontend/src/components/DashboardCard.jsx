import {
  AttendanceIcon,
  ChartIcon,
  ClassesIcon,
  StudentsIcon,
  TeachersIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "./icons";
import { cx } from "../utils/formatters";

const accentMap = {
  blue: "card--blue",
  emerald: "card--emerald",
  gold: "card--gold",
  violet: "card--violet",
};

export default function DashboardCard({ title, value, trend, trendDirection, subtitle, accent, icon }) {
  const TrendIcon = trendDirection === "down" ? TrendDownIcon : TrendUpIcon;
  const iconMap = {
    students: StudentsIcon,
    teachers: TeachersIcon,
    revenue: ChartIcon,
    attendance: AttendanceIcon,
    classes: ClassesIcon,
  };
  const StatIcon = iconMap[icon] || StudentsIcon;

  return (
    <article className={cx("stat-card", accentMap[accent])}>
      <div className="stat-card__header">
        <span className="stat-card__icon">
          <StatIcon />
        </span>
        <span className={cx("stat-card__trend", trendDirection === "down" && "is-down")}>
          <TrendIcon />
          {trend}
        </span>
      </div>
      <strong className="stat-card__value">{value}</strong>
      <p className="stat-card__title">{title}</p>
      <span className="stat-card__subtitle">{subtitle}</span>
    </article>
  );
}
