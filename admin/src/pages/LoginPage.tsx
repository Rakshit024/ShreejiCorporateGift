import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo} aria-hidden="true">SCG</div>
          <h1 className={styles.title}>Shreeji Corporate Gift</h1>
          <p className={styles.subtitle}>Admin Dashboard — Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && <div className={styles.error} role="alert"><AlertCircle size={16} /> {error}</div>}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@shreeji.com"
            required
            autoComplete="email"
            leftIcon={<Mail size={18} />}
          />
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            leftIcon={<Lock size={18} />}
            rightIcon={
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          <Button type="submit" variant="gold" fullWidth size="lg" loading={loading}>
            Sign in
          </Button>
        </form>
        <p className={styles.footer}>
          <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer">← Back to storefront</a>
        </p>
      </div>
    </div>
  );
}