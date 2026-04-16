import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

/**
 * DataTable
 * Sortable, striped, hover-highlighted table with sticky header.
 *
 * @param {Array<{key:string, label:string, render?:Function, sortable?:boolean, width?:string}>} columns
 * @param {Array<Object>} rows      - Data rows; each object should have a unique `id`
 * @param {Function}      [onRowClick]
 * @param {boolean}       [loading]
 * @param {ReactNode}     [emptyState] - Rendered when rows is empty
 */
const DataTable = ({ columns = [], rows = [], onRowClick, loading = false, emptyState }) => {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState("asc");

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const sortedRows = [...rows].sort((a, b) => {
        if (!sortKey) return 0;
        const aVal = a[sortKey] ?? "";
        const bVal = b[sortKey] ?? "";
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
    });

    return (
        <div
            className="rounded-[10px] overflow-hidden"
            style={{
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-card)",
            }}
        >
            <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                    {/* Sticky header */}
                    <thead>
                        <tr
                            style={{
                                background: "var(--color-card-bg)",
                                borderBottom: "1px solid var(--color-border)",
                            }}
                        >
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-left font-semibold select-none"
                                    style={{
                                        color: "var(--color-text-muted)",
                                        fontSize: "11px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        width: col.width,
                                        cursor: col.sortable ? "pointer" : "default",
                                    }}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                >
                                    <span className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && sortKey === col.key && (
                                            sortDir === "asc"
                                                ? <ChevronUp size={11} />
                                                : <ChevronDown size={11} />
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody style={{ background: "var(--color-card)" }}>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} style={{ borderTop: "1px solid var(--color-border)" }}>
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-3">
                                            <div className="shimmer h-4 rounded" style={{ width: "70%" }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : sortedRows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-12 text-center">
                                    {emptyState ?? (
                                        <span style={{ color: "var(--color-text-muted)" }}>No data found.</span>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            sortedRows.map((row, idx) => (
                                <tr
                                    key={row.id ?? idx}
                                    style={{
                                        borderTop: "1px solid var(--color-border)",
                                        background: idx % 2 === 1 ? "var(--color-card-bg)" : "var(--color-card)",
                                        cursor: onRowClick ? "pointer" : "default",
                                    }}
                                    className="hover:brightness-[0.97] transition-[background]"
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="px-4 py-3"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
