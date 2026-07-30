import { Outlet, useParams } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function ChildShell() {
  const { playerId = '' } = useParams();
  return (
    <>
      <Outlet />
      {playerId ? <BottomNav playerId={playerId} /> : null}
    </>
  );
}
