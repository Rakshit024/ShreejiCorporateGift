import { LogOut, User, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import styles from './Topbar.module.css';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? '');

  const handleSaveName = async () => {
    try {
      await updateProfile(name.trim());
      setProfileOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.topbar} role="banner">
      <button
        type="button"
        className={styles.menuBtn}
        onClick={onMenuClick}
        aria-label="Toggle menu"
        aria-expanded="false"
      >
        <Menu size={22} />
      </button>
      <div className={styles.spacer} />
      <div className={styles.actions}>
        <button type="button" className={styles.iconBtn} aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className={styles.divider} />
        <div className={styles.profile} onClick={() => setProfileOpen(!profileOpen)}>
          <div className={styles.avatar} aria-hidden="true">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          {!window.matchMedia('(max-width: 768px)').matches && (
            <>
              <span className={styles.name}>{user?.name ?? 'Admin'}</span>
              <span className={styles.role}>{user?.role ?? 'admin'}</span>
            </>
          )}
        </div>
      </div>

      <div className={classNames(styles.dropdown, profileOpen && styles.open)}>
        <div className={styles.dropdownHeader}>
          <div className={styles.avatar} style={{ width: 40, height: 40, fontSize: '1.1rem' }} aria-hidden="true">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className={styles.dropdownName}>{user?.name ?? 'Admin'}</p>
            <p className={styles.dropdownEmail}>{user?.email}</p>
          </div>
        </div>
        <hr className={styles.dropdownDivider} />
        <label className={styles.dropdownItem}>
          <User size={16} /> Your Profile
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.dropdownInput}
            placeholder="Your name"
          />
          <Button size="sm" variant="primary" onClick={handleSaveName}>Save</Button>
        </label>
        <hr className={styles.dropdownDivider} />
        <button type="button" className={styles.dropdownItem} onClick={handleLogout}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </header>
  );
}

function classNames(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(' ');
}