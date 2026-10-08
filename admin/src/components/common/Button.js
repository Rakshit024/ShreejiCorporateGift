import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import styles from './Button.module.css';
function classNames(...parts) {
    return parts.filter(Boolean).join(' ');
}
export function Button({ variant = 'primary', size = 'md', fullWidth, iconOnly, loading, className, disabled, children, ...rest }) {
    return (_jsxs("button", { type: "button", className: classNames(styles.btn, styles[variant], styles[size], fullWidth && styles.full, iconOnly && styles.iconOnly, className), disabled: disabled || loading, ...rest, children: [loading && _jsx("span", { className: styles.spinner, "aria-hidden": "true" }), children] }));
}
export function ButtonLink({ variant = 'primary', size = 'md', fullWidth, className, children, ...rest }) {
    return (_jsx(Link, { className: classNames(styles.btn, styles[variant], styles[size], fullWidth && styles.full, className), ...rest, children: children }));
}
