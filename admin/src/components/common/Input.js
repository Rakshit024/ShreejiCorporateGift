import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './Input.module.css';
export const Input = (props) => {
    const { label, error, helperText, leftIcon, rightIcon, className, id, ...rest } = props;
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    return (_jsxs("div", { className: styles.wrapper, children: [label && _jsx("label", { htmlFor: inputId, className: styles.label, children: label }), _jsxs("div", { className: styles.inputWrap, children: [leftIcon && _jsx("span", { className: styles.icon, "aria-hidden": "true", children: leftIcon }), _jsx("input", { id: inputId, className: classNames(styles.input, error && styles.error, rightIcon && styles.hasRightIcon, className ?? ''), "aria-invalid": error ? 'true' : 'false', "aria-describedby": classNames(errorId, helperId), ...rest }), rightIcon && _jsx("span", { className: styles.icon, "aria-hidden": "true", children: rightIcon })] }), error && _jsx("p", { id: errorId, className: styles.errorText, role: "alert", children: error }), helperText && !error && _jsx("p", { id: helperId, className: styles.helperText, children: helperText })] }));
};
function classNames(...parts) {
    return parts.filter((p) => typeof p === 'string' && p.length > 0).join(' ');
}
