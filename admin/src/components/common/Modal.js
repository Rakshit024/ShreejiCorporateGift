import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import styles from './Modal.module.css';
const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
export function Modal({ open, onClose, title, children, size = 'md' }) {
    const titleId = useId();
    const dialogRef = useRef(null);
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);
    useEffect(() => {
        if (!open)
            return;
        const previousActiveElement = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        const dialog = dialogRef.current;
        const focusable = dialog?.querySelectorAll(focusableSelector);
        const firstFocusable = focusable?.[0] ?? dialog;
        firstFocusable?.focus();
        const onKey = (event) => {
            if (event.key === 'Escape') {
                onCloseRef.current();
                return;
            }
            if (event.key !== 'Tab' || !dialog)
                return;
            const elements = [...dialog.querySelectorAll(focusableSelector)];
            if (!elements.length) {
                event.preventDefault();
                dialog.focus();
                return;
            }
            const first = elements[0], last = elements[elements.length - 1];
            if (!first || !last)
                return;
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKey);
            if (previousActiveElement?.isConnected)
                previousActiveElement.focus();
        };
    }, [open]);
    const sizeClass = { sm: styles.sm, md: styles.md, lg: styles.lg, xl: styles.xl, full: styles.full }[size];
    return (_jsx(AnimatePresence, { children: open && (_jsx(motion.div, { className: styles.overlay, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose, role: "presentation", children: _jsxs(motion.div, { ref: dialogRef, role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, tabIndex: -1, className: classNames(styles.dialog, sizeClass), initial: { opacity: 0, y: 12, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 8, scale: 0.98 }, transition: { duration: 0.2 }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: styles.header, children: [_jsx("h2", { id: titleId, className: styles.title, children: title }), _jsx("button", { type: "button", className: styles.close, onClick: onClose, "aria-label": "Close", children: _jsx(X, { size: 20 }) })] }), _jsx("div", { className: styles.body, children: children })] }) })) }));
}
function classNames(...parts) {
    return parts.filter(Boolean).join(' ');
}
