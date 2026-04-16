/**
 * PageHeader
 * Consistent page-level header: title left, action buttons right.
 * @param {string}    title
 * @param {string}    [subtitle]
 * @param {ReactNode} [actions]  - Buttons / controls to render on the right
 */
const PageHeader = ({ title, subtitle, actions }) => {
    return (
        <div className="flex items-start justify-between gap-4 mb-6">
            {/* left */}
            <div>
                <h1
                    className="text-[22px] font-bold leading-tight"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {title}
                </h1>
                {subtitle && (
                    <p
                        className="text-[13px] mt-0.5"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>

            {/* right */}
            {actions && (
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
