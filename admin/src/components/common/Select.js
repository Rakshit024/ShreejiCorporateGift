import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './Select.module.css';
export function Select({ label, error, helperText, options, placeholder, className, id, ...rest }) {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;
    return (_jsxs("div", { className: styles.wrapper, children: [label && _jsx("label", { htmlFor: selectId, className: styles.label, children: label }), _jsx("div", { className: styles.selectWrap, children: _jsxs("select", { id: selectId, className: classNames(styles.select, error && styles.error, className), "aria-invalid": error ? 'true' : 'false', "aria-describedby": classNames(errorId, helperId), ...rest, children: [placeholder && _jsx("option", { value: "", disabled: true, children: placeholder }), options.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value)))] }) }), error && _jsx("p", { id: errorId, className: styles.errorText, role: "alert", children: error }), helperText && !error && _jsx("p", { id: helperId, className: styles.helperText, children: helperText })] }));
}
function classNames(...parts) {
    return parts.filter(Boolean).join(' ');
}
