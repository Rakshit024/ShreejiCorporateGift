import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email.trim(), password);
            navigate('/');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: styles.container, children: _jsxs("div", { className: styles.card, children: [_jsxs("div", { className: styles.header, children: [_jsx("div", { className: styles.logo, "aria-hidden": "true", children: "SCG" }), _jsx("h1", { className: styles.title, children: "Shreeji Corporate Gift" }), _jsx("p", { className: styles.subtitle, children: "Admin Dashboard \u2014 Sign in to continue" })] }), _jsxs("form", { onSubmit: handleSubmit, className: styles.form, noValidate: true, children: [error && _jsxs("div", { className: styles.error, role: "alert", children: [_jsx(AlertCircle, { size: 16 }), " ", error] }), _jsx(Input, { label: "Email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "admin@shreeji.com", required: true, autoComplete: "email", leftIcon: _jsx(Mail, { size: 18 }) }), _jsx(Input, { label: "Password", type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, autoComplete: "current-password", leftIcon: _jsx(Lock, { size: 18 }), rightIcon: _jsx("button", { type: "button", className: styles.toggle, onClick: () => setShowPassword(!showPassword), "aria-label": showPassword ? 'Hide password' : 'Show password', children: showPassword ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) }) }), _jsx(Button, { type: "submit", variant: "gold", fullWidth: true, size: "lg", loading: loading, children: "Sign in" })] }), _jsx("p", { className: styles.footer, children: _jsx("a", { href: "http://localhost:5173", target: "_blank", rel: "noopener noreferrer", children: "\u2190 Back to storefront" }) })] }) }));
}
