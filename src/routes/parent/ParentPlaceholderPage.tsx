import { Link } from 'react-router-dom';

export function ParentPlaceholderPage({ title }: { title: string }) {
  return (
    <div className="app-screen app-screen--parent">
      <h1>{title}</h1>
      <p className="muted">Full parent controls arrive in the parent slice.</p>
      <Link className="btn btn-primary" to="/parent/dashboard">
        Back to overview
      </Link>
    </div>
  );
}
