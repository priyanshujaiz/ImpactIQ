import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Modal
 * Centered overlay modal with accessible focus trap and ESC to close.
 * @param {boolean}   isOpen
 * @param {Function}  onClose
 * @param {string}    title
 * @param {ReactNode} children
 * @param {ReactNode} [footer]   - Action buttons rendered in the modal footer
 * @param {string}    [size]     - "sm" | "md" (default) | "lg"
 */
const SIZE_MAP = {
    sm: "max-w-sm",
    md: "max-w-[480px]",
    lg: "max-w-2xl",
};

const Modal = ({ isOpen, onClose, title, children, footer, size = "md" }) => {
    const overlayRef = useRef(null);

    // ESC to close
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)" }}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div
                className={`w-full ${SIZE_MAP[size] ?? SIZE_MAP.md} rounded-[14px] flex flex-col max-h-[90vh]`}
                style={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-modal)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-b shrink-0"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <h2
                        className="text-[15px] font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[#f1f5f9]"
                    >
                        <X size={15} color="#94a3b8" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div
                        className="px-6 py-4 border-t flex items-center justify-end gap-3 shrink-0"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
