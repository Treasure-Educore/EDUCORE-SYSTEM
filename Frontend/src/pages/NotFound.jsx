import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function NotFound() {
  return (
    <div className="page-stack">
      <PageHeader title="Page not found" subtitle="This route does not exist in the dashboard shell." />
      <div className="empty-state">
        <strong>Return to dashboard</strong>
        <p>Use the sidebar to navigate back to a valid section.</p>
        <Link className="primary-button" to="/dashboard">Go to Dashboard</Link>
      </div>
    </div>
  );
}
