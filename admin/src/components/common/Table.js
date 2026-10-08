import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './Table.module.css';
export function Table({ columns, data, keyExtractor, sortBy, sortDir, onSort, onRowClick, loading, emptyMessage = 'No data', striped = true, hoverable = true, }) {
    const handleSort = (key) => {
        if (onSort)
            onSort(key);
    };
    if (loading) {
        return (_jsx("div", { className: styles.tableWrap, children: _jsxs("table", { className: styles.table, role: "grid", children: [_jsx("thead", { children: _jsx("tr", { children: columns.map((col) => (_jsx("th", { style: { width: col.width }, className: styles.th, children: _jsx("div", { className: styles.thContent, children: col.header }) }, col.key))) }) }), _jsx("tbody", { children: _jsx("tr", { children: _jsx("td", { colSpan: columns.length, className: styles.loadingCell, children: _jsx("div", { className: styles.spinner }) }) }) })] }) }));
    }
    if (data.length === 0) {
        return (_jsx("div", { className: styles.tableWrap, children: _jsxs("table", { className: styles.table, role: "grid", children: [_jsx("thead", { children: _jsx("tr", { children: columns.map((col) => (_jsx("th", { style: { width: col.width }, className: styles.th, children: _jsx("div", { className: styles.thContent, children: col.header }) }, col.key))) }) }), _jsx("tbody", { children: _jsx("tr", { children: _jsx("td", { colSpan: columns.length, className: styles.emptyCell, children: emptyMessage }) }) })] }) }));
    }
    return (_jsx("div", { className: styles.tableWrap, children: _jsxs("table", { className: styles.table, role: "grid", children: [_jsx("thead", { children: _jsx("tr", { children: columns.map((col) => (_jsx("th", { style: { width: col.width }, className: classNames(styles.th, col.sortable && styles.sortable, col.align && styles[col.align]), onClick: () => col.sortable && handleSort(col.key), children: _jsxs("div", { className: styles.thContent, children: [_jsx("span", { children: col.header }), col.sortable && sortBy === col.key && (_jsx("span", { className: styles.sortIcon, "aria-hidden": "true", children: sortDir === 'asc' ? _jsx(ChevronUp, { size: 14 }) : _jsx(ChevronDown, { size: 14 }) }))] }) }, col.key))) }) }), _jsx("tbody", { children: data.map((row, index) => (_jsx("tr", { className: classNames(styles.tr, striped && index % 2 === 1 && styles.striped, hoverable && onRowClick && styles.hoverable, onRowClick && styles.clickable), onClick: () => onRowClick?.(row), children: columns.map((col) => (_jsx("td", { className: classNames(styles.td, col.align && styles[col.align]), children: col.render ? col.render(row, index) : String(row[col.key] ?? '') }, col.key))) }, keyExtractor(row)))) })] }) }));
}
function classNames(...parts) {
    return parts.filter(Boolean).join(' ');
}
