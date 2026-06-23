import { useMemo, useState } from "react";
import { EditIcon, EyeIcon, SearchIcon, TrashIcon } from "./icons";
import EmptyState from "./EmptyState";
import LoadingSkeleton from "./LoadingSkeleton";
import { cx } from "../utils/formatters";

export default function DataTable({
  title,
  description,
  columns,
  data,
  searchPlaceholder = "Search records...",
  onView,
  onEdit,
  onDelete,
  extraActions = [],
  loading = false,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters.",
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(columns.find((column) => column.sortable)?.key || columns[0]?.key);
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const hasActions = Boolean(onView || onEdit || onDelete || extraActions.length > 0);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const searchableRows = normalizedQuery
      ? data.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(normalizedQuery)))
      : data;

    const sortedRows = [...searchableRows].sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];

      if (leftValue === rightValue) return 0;
      if (leftValue == null) return 1;
      if (rightValue == null) return -1;

      const leftNumber = Number(leftValue);
      const rightNumber = Number(rightValue);
      if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber) && String(leftValue).trim() !== "" && String(rightValue).trim() !== "") {
        return sortDirection === "asc" ? leftNumber - rightNumber : rightNumber - leftNumber;
      }

      const leftString = String(leftValue).toLowerCase();
      const rightString = String(rightValue).toLowerCase();

      if (leftString < rightString) return sortDirection === "asc" ? -1 : 1;
      if (leftString > rightString) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sortedRows;
  }, [query, data, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  function handleSort(column) {
    if (!column.sortable) return;
    if (sortKey === column.key) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column.key);
      setSortDirection("asc");
    }
  }

  return (
    <section className="data-card">
      <div className="data-card__header">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>

        <label className="table-search">
          <SearchIcon />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={searchPlaceholder} />
        </label>
      </div>

      {loading ? <LoadingSkeleton rows={4} columns={columns.length + (hasActions ? 1 : 0)} /> : null}

      {!loading && filteredRows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : null}

      {!loading && filteredRows.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>
                    <button type="button" className={cx("th-button", column.sortable && "is-sortable")} onClick={() => handleSort(column)}>
                      {column.label}
                      {sortKey === column.key ? <span className="sort-indicator">{sortDirection === "asc" ? "^" : "v"}</span> : null}
                    </button>
                  </th>
                ))}
                {hasActions ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column.key} data-label={column.label}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  {hasActions ? (
                    <td className="table-actions">
                      {onView ? (
                        <button type="button" className="action-btn" onClick={() => onView(row)}>
                          <EyeIcon />
                          View
                        </button>
                      ) : null}
                      {onEdit ? (
                        <button type="button" className="action-btn" onClick={() => onEdit(row)}>
                          <EditIcon />
                          Edit
                        </button>
                      ) : null}
                      {extraActions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          className={action.className || "action-btn"}
                          onClick={() => action.onClick(row)}
                        >
                          {action.icon ? <action.icon /> : null}
                          {action.label}
                        </button>
                      ))}
                      {onDelete ? (
                        <button type="button" className="action-btn action-btn--danger" onClick={() => onDelete(row)}>
                          <TrashIcon />
                          Delete
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && filteredRows.length > 0 ? (
        <div className="table-footer">
          <span>
            Showing {Math.min(filteredRows.length, (page - 1) * pageSize + 1)}-{Math.min(filteredRows.length, page * pageSize)} of {filteredRows.length}
          </span>
          <div className="table-pagination">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
