// Soft, eye-friendly color palette
export const colors = {
    page: "#f8fafc",
    card: "#ffffff",
    border: "#e2e8f0",
    borderLight: "#f1f5f9",
    text: "#1e293b",
    textSecondary: "#475569",
    muted: "#94a3b8",
    primary: "#6366f1",
    primaryLight: "#a5b4fc",
    primaryDark: "#4f46e5",
    accent: "#14b8a6",
    accentLight: "#99f6e4",
    success: "#22c55e",
    successLight: "#bbf7d0",
    danger: "#f43f5e",
    dangerLight: "#fecdd3",
    warning: "#f59e0b",
    warningLight: "#fef3c7",
};

// Typography scale
export const typography = {
    largeTitle: { fontSize: 28, fontWeight: "800", lineHeight: 34 },
    title: { fontSize: 22, fontWeight: "700", lineHeight: 28 },
    headline: { fontSize: 17, fontWeight: "600", lineHeight: 22 },
    body: { fontSize: 15, fontWeight: "400", lineHeight: 20 },
    callout: { fontSize: 14, fontWeight: "500", lineHeight: 18 },
    caption: { fontSize: 12, fontWeight: "500", lineHeight: 16 },
    micro: { fontSize: 11, fontWeight: "600", lineHeight: 14, letterSpacing: 0.5 },
};

// Spacing scale (4px base)
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// Border radii
export const radii = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
};

// Shadows with softer appearance
export const shadows = {
    sm: {
        shadowColor: "#64748b",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        elevation: 2,
    },
    card: {
        shadowColor: "#64748b",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
    },
    lifted: {
        shadowColor: "#64748b",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        elevation: 8,
    },
};
