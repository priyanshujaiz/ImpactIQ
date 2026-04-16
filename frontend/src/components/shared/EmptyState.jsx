/**
 * EmptyState
 * Centered empty state with icon, message, and optional CTA button.
 * @param {ReactNode} icon
 * @param {string}    message
 * @param {string}    [actionLabel]
 * @param {Function}  [onAction]
 */
const EmptyState = ({ icon, message, actionLabel, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            {icon && (
                <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: "var(--color-card-bg)" }}
                >
                    {icon}
                </div>
            )}
            <p
                className="text-[14px] font-medium text-center max-w-xs"
                style={{ color: "var(--color-text-secondary)" }}
            >
                {message}
            </p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-1 px-4 py-2 rounded-md text-[13px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
                    style={{ background: "var(--color-primary)" }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
