import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";

export default function ModulePage({ meta }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="principal-page">
      <PageHeader title={meta.title} subtitle={meta.subtitle} />

      {loading ? (
        <section className="principal-card">
          <div className="principal-card__header">
            <div>
              <h3>{meta.title} workspace</h3>
              <p>{meta.description}</p>
            </div>
          </div>
          <LoadingSkeleton rows={4} columns={4} />
        </section>
      ) : meta.rows?.length ? (
        <DataTable
          title={meta.tableTitle || meta.title}
          description={meta.tableDescription || meta.description}
          columns={meta.columns}
          data={meta.rows}
          searchPlaceholder={meta.searchPlaceholder}
          emptyTitle={meta.emptyTitle}
          emptyDescription={meta.emptyDescription}
        />
      ) : (
        <EmptyState title={meta.emptyTitle || `${meta.title} is ready`} description={meta.emptyDescription || "This section is prepared for live data, filters, and school-wide operations."} />
      )}
    </div>
  );
}
