export default function LoadingSkeleton({ rows = 3, columns = 4 }) {
  return (
    <div className="skeleton-table" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div className="skeleton-table__row" key={rowIndex}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <span className="skeleton-table__cell" key={colIndex} />
          ))}
        </div>
      ))}
    </div>
  );
}
