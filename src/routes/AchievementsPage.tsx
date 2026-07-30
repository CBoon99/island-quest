import { Link, useParams } from 'react-router-dom';

export function AchievementsPage() {
  const { playerId } = useParams();
  return (
    <div className="app-screen">
      <h1>Achievements</h1>
      <p className="muted">Badges appear as you quest. Keep exploring!</p>
      <div className="card" style={{ marginTop: 16 }}>
        <p>No badges yet — your first is one quest away.</p>
      </div>
      {playerId ? (
        <Link
          className="btn btn-primary btn-block"
          style={{ marginTop: 24 }}
          to={`/player/${playerId}/home`}
        >
          Home
        </Link>
      ) : null}
    </div>
  );
}
