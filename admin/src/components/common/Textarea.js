import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './Textarea.module.css';
export const Textarea = (props) => {
    const { label, error, helperText, className, id, ...rest } = props;
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    return (_jsxs("div", { className: styles.wrapper, children: [label && _jsx("label", { htmlFor: textareaId, className: styles.label, children: label }), _jsx("textarea", { id: textareaId, className: classNames(styles.textarea, error && styles.error, className), "aria-invalid": error ? 'true' : 'false', "aria-describedby": classNames(errorId, helperId), ...rest }), error && _jsx("p", { id: errorId, className: styles.errorText, role: "alert", children: error }), helperText && !error && _jsx("p", { id: helperId, className: styles.helperText, children: helperText })] }));
};
function classNames(...parts) {
    return parts.filter(Boolean).join(' ');
}
