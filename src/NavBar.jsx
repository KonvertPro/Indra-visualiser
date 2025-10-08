import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

export function NavBar({
    logo,
    navItems = [],
    ctaText,
    ctaColor,
    bgColor,
    textColor,
    mobileBgColor,
    dropdownBgColor,
    mobileIconSize,
    mobileIconRadius,
    helpBoxBg,
    helpBoxText,
    helpBoxColor,
    helpBoxBorderColor,
    helpBoxButtonText,
    helpBoxButtonColor,
}) {
    const [openIndex, setOpenIndex] = React.useState(null)
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

    const Arrow = ({ open }) => (
        <span
            style={{
                marginLeft: 4,
                display: "inline-block",
                fontSize: 8,
                color: "#ABFF73",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease, color 0.2s ease",
            }}
        >
            ▼
        </span>
    )

    /* ---------- Desktop Navbar ---------- */
    const desktop = (
        <div
            className="nav-shell"
            onMouseLeave={() => setOpenIndex(null)}
            style={{ width: "100%" }}
        >
            <nav
                style={{
                    width: "100%",
                    padding: "12px 20px",
                    background: bgColor,
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                }}
            >
                <div
                    style={{
                        maxWidth: 1800,
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        fontFamily: "Poppins, sans-serif",
                    }}
                >
                    <img
                        src={logo}
                        alt="Logo"
                        style={{ height: 80, objectFit: "contain" }}
                    />

                    <div
                        className="nav-desktop"
                        style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                        }}
                    >
                        {(navItems || []).map((item, i) => {
                            const hasChildren = !!(
                                item.children && item.children.length > 0
                            )
                            return (
                                <div key={i} style={{ display: "inline-block" }}>
                                    <a
                                        href={item.url || "#"}
                                        onMouseEnter={() =>
                                            setOpenIndex(hasChildren ? i : null)
                                        }
                                        style={{
                                            textDecoration: "none",
                                            color: textColor,
                                            fontSize: 14,
                                            fontWeight: 400,
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "12px 0",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        {item.title}
                                        {hasChildren && (
                                            <Arrow open={openIndex === i} />
                                        )}
                                    </a>
                                </div>
                            )
                        })}

                        <a
                            href="#"
                            style={{
                                padding: "10px 20px",
                                background: ctaColor,
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 15,
                                fontWeight: 500,
                                cursor: "pointer",
                                textDecoration: "none",
                            }}
                        >
                            {ctaText}
                        </a>
                    </div>
                </div>
            </nav>

            {openIndex !== null &&
                navItems[openIndex]?.children &&
                navItems[openIndex]?.children.length > 0 && (
                    <div
                        onMouseEnter={() => setOpenIndex(openIndex)}
                        style={{
                            width: "100%",
                            background: dropdownBgColor,
                            boxShadow: "inset 0 1px 0 rgba(0,0,0,0.05)",
                            padding: "40px 0",
                        }}
                    >
                        {navItems[openIndex].title === "Conditions" ? (
                            <div
                                style={{
                                    maxWidth: 1200,
                                    margin: "0 auto",
                                    padding: "0 32px",
                                    display: "grid",
                                    gridTemplateColumns: "2fr 1fr",
                                    gap: 40,
                                    alignItems: "start",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 10,
                                    }}
                                >
                                    {navItems[openIndex].children.map(
                                        (child, j) => (
                                            <a
                                                key={j}
                                                href={child.url || "#"}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 14,
                                                    textDecoration: "none",
                                                    color: textColor,
                                                    padding: "12px 16px",
                                                    borderRadius: 10,
                                                    background: "transparent",
                                                    transition:
                                                        "all 0.25s ease",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background =
                                                        "#f9f9f9"
                                                    e.currentTarget.style.color =
                                                        ctaColor
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background =
                                                        "transparent"
                                                    e.currentTarget.style.color =
                                                        textColor
                                                }}
                                            >
                                                {child.icon && (
                                                    <img
                                                        src={child.icon}
                                                        alt={child.title}
                                                        className="child-icon"
                                                        style={{
                                                            width:
                                                                child.iconSize ||
                                                                40,
                                                            height:
                                                                child.iconSize ||
                                                                40,
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                )}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: 16,
                                                            fontWeight: 500,
                                                            lineHeight: 1.4,
                                                        }}
                                                    >
                                                        {child.title}
                                                    </span>
                                                    {child.description && (
                                                        <span
                                                            style={{
                                                                fontSize: 13,
                                                                color: "#666",
                                                                marginTop: 2,
                                                            }}
                                                        >
                                                            {child.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </a>
                                        )
                                    )}
                                </div>

                                <div
                                    style={{
                                        background: helpBoxBg,
                                        padding: 24,
                                        borderRadius: 12,
                                        border: `1px solid ${helpBoxBorderColor}`,
                                        color: helpBoxColor,
                                        fontSize: 14,
                                        lineHeight: 1.6,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 16,
                                    }}
                                >
                                    <div>{helpBoxText}</div>
                                    {helpBoxButtonText && (
                                        <a
                                            href="#"
                                            style={{
                                                display: "inline-block",
                                                padding: "8px 16px",
                                                background: helpBoxButtonColor,
                                                color: "#fff",
                                                borderRadius: 8,
                                                fontSize: 14,
                                                fontWeight: 500,
                                                textDecoration: "none",
                                                textAlign: "center",
                                            }}
                                        >
                                            {helpBoxButtonText}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div
                                style={{
                                    maxWidth: 1200,
                                    margin: "0 auto",
                                    padding: "0 32px",
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fill, minmax(160px, 1fr))",
                                    gap: "40px 60px",
                                    justifyItems: "center",
                                    textAlign: "center",
                                }}
                            >
                                {navItems[openIndex].children.map(
                                    (child, j) => (
                                        <a
                                            key={j}
                                            href={child.url || "#"}
                                            style={{
                                                textDecoration: "none",
                                                color: textColor,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            {child.icon && (
                                                <img
                                                    src={child.icon}
                                                    alt={child.title}
                                                    className="child-icon"
                                                    style={{
                                                        width:
                                                            child.iconSize ||
                                                            200,
                                                        height:
                                                            child.iconSize ||
                                                            200,
                                                        borderRadius: 12,
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            )}
                                            <span
                                                style={{
                                                    fontSize: 15,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {child.title}
                                            </span>
                                            {child.description && (
                                                <span
                                                    style={{
                                                        fontSize: 13,
                                                        color: "#666",
                                                    }}
                                                >
                                                    {child.description}
                                                </span>
                                            )}
                                        </a>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                )}
        </div>
    )

    /* ---------- Mobile Navbar ---------- */
    const mobile = (
        <>
            <nav
                style={{
                    width: "100%",
                    padding: "12px 20px",
                    background: bgColor,
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                }}
            >
                <div
                    style={{
                        maxWidth: 1200,
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                    }}
                >
                    <img
                        src={logo}
                        alt="Logo"
                        style={{ height: 60, objectFit: "contain" }}
                    />
                    <button
                        aria-label="Toggle menu"
                        onClick={() => setMobileMenuOpen((v) => !v)}
                        style={{
                            background: "transparent",
                            border: "none",
                            fontSize: 26,
                            color: textColor,
                            cursor: "pointer",
                        }}
                    >
                        ☰
                    </button>
                </div>
            </nav>

            {mobileMenuOpen && (
                <div
                    style={{
                        marginTop: 12,
                        background: mobileBgColor,
                        borderRadius: 6,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        padding: 12,
                        maxWidth: 1200,
                        marginLeft: "auto",
                        marginRight: "auto",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div>
                        {(navItems || []).map((item, i) => {
                            const hasChildren = !!(
                                item.children && item.children.length > 0
                            )
                            const open = openIndex === i
                            return (
                                <div key={i} style={{ marginBottom: 8 }}>
                                    <div
                                        onClick={() =>
                                            setOpenIndex(
                                                open && hasChildren
                                                    ? null
                                                    : hasChildren
                                                    ? i
                                                    : null
                                            )
                                        }
                                        style={{
                                            fontWeight: 400,
                                            fontSize: 18,
                                            color: textColor,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            cursor: hasChildren
                                                ? "pointer"
                                                : "default",
                                            padding: "8px 4px",
                                        }}
                                    >
                                        <a
                                            href={item.url || "#"}
                                            style={{
                                                color: "inherit",
                                                textDecoration: "none",
                                            }}
                                        >
                                            {item.title}
                                        </a>
                                        {hasChildren && <Arrow open={open} />}
                                    </div>
                                    {hasChildren && open && (
                                        <div
                                            style={{
                                                marginLeft: 12,
                                                marginTop: 6,
                                                display: "grid",
                                                gap: 12,
                                            }}
                                        >
                                            {item.children.map((child, j) => (
                                                <a
                                                    key={j}
                                                    href={child.url || "#"}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 12,
                                                        color: textColor,
                                                        fontSize: 15,
                                                        textDecoration: "none",
                                                    }}
                                                >
                                                    {child.icon && (
                                                        <img
                                                            src={child.icon}
                                                            alt={child.title}
                                                            className="child-icon"
                                                            style={{
                                                                width: mobileIconSize,
                                                                height: mobileIconSize,
                                                                borderRadius:
                                                                    mobileIconRadius,
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                    )}
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexDirection:
                                                                "column",
                                                        }}
                                                    >
                                                        <span>
                                                            {child.title}
                                                        </span>
                                                        {child.description && (
                                                            <span
                                                                style={{
                                                                    fontSize: 13,
                                                                    color: "#666",
                                                                }}
                                                            >
                                                                {
                                                                    child.description
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <a
                        href="#"
                        style={{
                            marginTop: 16,
                            padding: "0.8em 1.2em",
                            background: ctaColor,
                            color: "#fff",
                            borderRadius: 8,
                            fontSize: "clamp(14px, 2.5vw, 16px)",
                            fontWeight: 500,
                            textDecoration: "none",
                            textAlign: "center",
                        }}
                    >
                        {ctaText}
                    </a>
                </div>
            )}
        </>
    )

    return (
        <div style={{ width: "100%", fontFamily: "Poppins, sans-serif" }}>
            <div className="only-desktop">{desktop}</div>
            <div className="only-mobile">{mobile}</div>

            <style>
                {`
          .only-desktop { display: block; }
          .only-mobile { display: none; }
          @media (max-width: 810px) {
            .only-desktop { display: none !important; }
            .only-mobile { display: block !important; }
          }

          .child-icon {
            transition: transform 0.25s ease;
          }
          .child-icon:hover {
            transform: scale(1.1) rotate(2deg);
          }
        `}
            </style>
        </div>
    )
}

/* ---------- Defaults ---------- */
NavBar.defaultProps = {
    logo: "https://framerusercontent.com/images/placeholder.png",
    navItems: [
        {
            title: "Conditions",
            url: "#",
            children: [
                {
                    title: "Chronic Pain",
                    url: "#",
                    icon: "https://via.placeholder.com/100",
                    iconSize: 40,
                    description: "Helps manage long-term pain symptoms",
                },
                {
                    title: "Anxiety",
                    url: "#",
                    icon: "https://via.placeholder.com/100",
                    iconSize: 40,
                    description: "Relief for stress and anxiety conditions",
                },
            ],
        },
    ],
    ctaText: "Check Eligibility",
    ctaColor: "#008060",
    bgColor: "#ffffff",
    textColor: "#222222",
    mobileBgColor: "#f9f9f9",
    dropdownBgColor: "#ffffff",
    mobileIconSize: 32,
    mobileIconRadius: 8,
    helpBoxBg: "#f5f5f5",
    helpBoxBorderColor: "#cccccc",
    helpBoxText: "Need help choosing a condition? Contact our team today.",
    helpBoxColor: "#333333",
    helpBoxButtonText: "Get Help",
    helpBoxButtonColor: "#008060",
}

/* ---------- Framer Controls ---------- */
addPropertyControls(NavBar, {
    logo: { type: ControlType.Image, title: "Logo" },
    navItems: {
        type: ControlType.Array,
        title: "Menu Items",
        propertyControl: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                url: { type: ControlType.String, title: "URL" },
                children: {
                    type: ControlType.Array,
                    title: "Children",
                    propertyControl: {
                        type: ControlType.Object,
                        controls: {
                            title: { type: ControlType.String, title: "Child Title" },
                            url: { type: ControlType.String, title: "Child URL" },
                            icon: { type: ControlType.Image, title: "Child Icon" },
                            iconSize: {
                                type: ControlType.Number,
                                title: "Desktop Icon Size",
                                min: 20,
                                max: 400,
                                defaultValue: 120,
                            },
                            description: { type: ControlType.String, title: "Child Description" },
                        },
                    },
                },
            },
        },
    },
    ctaText: { type: ControlType.String, title: "CTA Text" },
    ctaColor: { type: ControlType.Color, title: "CTA Color" },
    bgColor: { type: ControlType.Color, title: "Desktop BG" },
    textColor: { type: ControlType.Color, title: "Text Color" },
    mobileBgColor: { type: ControlType.Color, title: "Mobile Menu BG" },
    dropdownBgColor: { type: ControlType.Color, title: "Dropdown BG" },
    mobileIconSize: {
        type: ControlType.Number,
        title: "Mobile Icon Size",
        min: 16,
        max: 200,
        defaultValue: 32,
    },
    mobileIconRadius: {
        type: ControlType.Number,
        title: "Mobile Icon Radius",
        min: 0,
        max: 100,
        defaultValue: 8,
    },
    helpBoxBg: { type: ControlType.Color, title: "Help Box BG" },
    helpBoxBorderColor: { type: ControlType.Color, title: "Help Box Border" },
    helpBoxText: { type: ControlType.String, title: "Help Box Text" },
    helpBoxColor: { type: ControlType.Color, title: "Help Box Text Color" },
    helpBoxButtonText: { type: ControlType.String, title: "Help Box Button Text" },
    helpBoxButtonColor: { type: ControlType.Color, title: "Help Box Button Color" },
})
