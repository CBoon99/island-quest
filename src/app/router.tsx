import { Navigate, createBrowserRouter } from 'react-router-dom';
import { ChildShell } from '@/components/shell/ChildShell';
import { SplashPage } from '@/routes/SplashPage';
import { SelectPlayerPage } from '@/routes/SelectPlayerPage';
import { HomePage } from '@/routes/HomePage';
import { CharactersPage } from '@/routes/CharactersPage';
import { WorldsPage } from '@/routes/WorldsPage';
import { PlayPage } from '@/routes/PlayPage';
import { ResultsPage } from '@/routes/ResultsPage';
import { LeaderboardPage } from '@/routes/LeaderboardPage';
import { RewardsPage } from '@/routes/RewardsPage';
import { AchievementsPage } from '@/routes/AchievementsPage';
import { ParentGatePage } from '@/routes/parent/ParentGatePage';
import { ParentDashboardPage } from '@/routes/parent/ParentDashboardPage';
import { ParentPlayersPage } from '@/routes/parent/ParentPlayersPage';
import { ParentRewardsPage } from '@/routes/parent/ParentRewardsPage';
import { ParentSettingsPage } from '@/routes/parent/ParentSettingsPage';

export const router = createBrowserRouter([
  { path: '/', element: <SplashPage /> },
  { path: '/select-player', element: <SelectPlayerPage /> },
  {
    path: '/player/:playerId',
    element: <ChildShell />,
    children: [
      { path: 'home', element: <HomePage /> },
      { path: 'characters', element: <CharactersPage /> },
      { path: 'worlds', element: <WorldsPage /> },
      { path: 'achievements', element: <AchievementsPage /> },
    ],
  },
  { path: '/player/:playerId/play/:mode', element: <PlayPage /> },
  { path: '/player/:playerId/results', element: <ResultsPage /> },
  { path: '/leaderboard', element: <LeaderboardPage /> },
  { path: '/rewards', element: <RewardsPage /> },
  { path: '/achievements', element: <AchievementsPage /> },
  { path: '/parent', element: <ParentGatePage /> },
  { path: '/parent/dashboard', element: <ParentDashboardPage /> },
  { path: '/parent/players', element: <ParentPlayersPage /> },
  { path: '/parent/questions', element: <ParentSettingsPage /> },
  { path: '/parent/rewards', element: <ParentRewardsPage /> },
  { path: '/parent/settings', element: <ParentSettingsPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);
