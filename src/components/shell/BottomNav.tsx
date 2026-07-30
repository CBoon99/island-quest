import { NavLink } from 'react-router-dom';
import { SvgIcon } from '@/components/ui/SvgIcon';
import styles from './BottomNav.module.css';

type Props = {
  playerId: string;
};

export function BottomNav({ playerId }: Props) {
  const items = [
    { to: `/player/${playerId}/home`, label: 'Home', icon: 'home' as const },
    { to: `/player/${playerId}/worlds`, label: 'Play', icon: 'play' as const },
    { to: '/leaderboard', label: 'Board', icon: 'trophy' as const },
    { to: '/rewards', label: 'Rewards', icon: 'gift' as const },
    { to: `/player/${playerId}/characters`, label: 'Guide', icon: 'profile' as const },
  ];

  return (
    <nav className={styles.nav} aria-label="Main">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `${styles.item} ${isActive ? styles.active : ''}`
          }
        >
          <SvgIcon name={item.icon} size={22} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
