/* @ds-bundle: {"format":4,"namespace":"FreightClubDesignSystem_ab1e6b","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"ErrorBanner","sourcePath":"components/core/ErrorBanner.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"ProfitabilityBadge","sourcePath":"components/core/ProfitabilityBadge.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"Skeleton","sourcePath":"components/core/Skeleton.jsx"},{"name":"StatCard","sourcePath":"components/core/StatCard.jsx"},{"name":"StatusBadge","sourcePath":"components/core/StatusBadge.jsx"},{"name":"TabBar","sourcePath":"frontend/src/features/carrier/components/dashboard/TabBar.tsx"},{"name":"EQUIPMENT_TYPE_LABELS","sourcePath":"frontend/src/features/loads/types.ts"},{"name":"PAYMENT_TERMS_LABELS","sourcePath":"frontend/src/features/loads/types.ts"}],"sourceHashes":{"components/core/Avatar.jsx":"a2eb082115e3","components/core/Badge.jsx":"84219d2c6c1b","components/core/Button.jsx":"8a5ba7aa2cfe","components/core/Card.jsx":"ddae5006fdce","components/core/ErrorBanner.jsx":"1e9993b86b80","components/core/Input.jsx":"975f78cd8d1e","components/core/ProfitabilityBadge.jsx":"5c3bc2cf528b","components/core/Select.jsx":"aead63093685","components/core/Skeleton.jsx":"478c570c8fbe","components/core/StatCard.jsx":"376694bfd966","components/core/StatusBadge.jsx":"3fcbaeab2a47","frontend/src/features/carrier/components/dashboard/TabBar.tsx":"1ef447f144b4","frontend/src/features/loads/types.ts":"677aa09c7be8"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FreightClubDesignSystem_ab1e6b = window.FreightClubDesignSystem_ab1e6b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
/**
 * Avatar — user initials in a circular badge.
 * Shipper: white bg + bronze ring. Carrier: bronze bg + dark text.
 */
function Avatar({
  firstName = '',
  lastName = '',
  size = 'md',
  persona = 'shipper',
  style: extraStyle
}) {
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?';
  const sizes = {
    sm: {
      width: 28,
      height: 28,
      fontSize: 10
    },
    md: {
      width: 36,
      height: 36,
      fontSize: 13
    },
    lg: {
      width: 48,
      height: 48,
      fontSize: 16
    },
    xl: {
      width: 64,
      height: 64,
      fontSize: 22
    }
  };
  const shipperStyle = {
    background: 'var(--color-surface-white)',
    color: 'var(--color-text-primary)',
    boxShadow: 'var(--shadow-avatar)',
    border: '2px solid var(--color-bronze)'
  };
  const carrierStyle = {
    background: 'var(--color-bronze)',
    color: '#121212',
    border: 'none',
    boxShadow: 'none'
  };
  const sz = sizes[size] || sizes.md;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...sz,
      borderRadius: 'var(--radius-full)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--font-weight-bold)',
      flexShrink: 0,
      userSelect: 'none',
      ...(persona === 'carrier' ? carrierStyle : shipperStyle),
      ...extraStyle
    }
  }, initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
const BADGE_STYLES = {
  default: {
    bg: '#F1F5F9',
    color: '#475569',
    border: '#CBD5E1'
  },
  success: {
    bg: 'var(--color-success-subtle)',
    color: 'var(--color-success-text)',
    border: 'var(--color-success)'
  },
  warning: {
    bg: 'var(--color-warning-subtle)',
    color: 'var(--color-warning-text)',
    border: 'var(--color-warning)'
  },
  error: {
    bg: 'var(--color-critical-subtle)',
    color: 'var(--color-critical-text)',
    border: 'var(--color-critical)'
  },
  info: {
    bg: 'var(--color-info-subtle)',
    color: 'var(--color-info-text)',
    border: 'var(--color-info)'
  },
  bronze: {
    bg: 'rgba(176,141,87,0.15)',
    color: 'var(--color-bronze)',
    border: 'var(--color-bronze)'
  },
  rpm_high: {
    bg: 'rgba(34,197,94,0.12)',
    color: '#15803D',
    border: 'var(--color-rpm-high)'
  },
  rpm_neutral: {
    bg: 'rgba(245,158,11,0.12)',
    color: '#B45309',
    border: 'var(--color-rpm-neutral)'
  },
  rpm_low: {
    bg: 'rgba(239,68,68,0.12)',
    color: '#B91C1C',
    border: 'var(--color-rpm-low)'
  }
};

/**
 * Generic badge/chip — status indicators, tags, counts.
 */
function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  children,
  style: extraStyle
}) {
  const s = BADGE_STYLES[variant] || BADGE_STYLES.default;
  const sizeStyles = {
    sm: {
      fontSize: 'var(--font-size-xs)',
      padding: '2px 8px'
    },
    md: {
      fontSize: 'var(--font-size-sm)',
      padding: '4px 10px'
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      borderRadius: 'var(--radius-pill)',
      border: `1px solid ${s.border}`,
      background: s.bg,
      color: s.color,
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--font-weight-semibold)',
      letterSpacing: 'var(--letter-spacing-wide)',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      ...sizeStyles[size],
      ...extraStyle
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: s.color,
      flexShrink: 0
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const bronzeGradient = 'linear-gradient(180deg, var(--color-bronze-light) 0%, var(--color-bronze) 45%, var(--color-bronze-dark) 100%)';

/**
 * FreightClub Button — persona-aware CTA.
 * Shipper + Carrier both use the bronze gradient as primary.
 */
function Button({
  variant = 'primary',
  size = 'md',
  persona = 'shipper',
  isLoading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
  style: extraStyle,
  ...props
}) {
  const isDisabled = disabled || isLoading;
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--font-weight-medium)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'all 150ms ease-in-out',
    border: 'none',
    outline: 'none',
    textDecoration: 'none',
    whiteSpace: 'nowrap'
  };
  const sizes = {
    sm: {
      padding: '4px 12px',
      fontSize: 'var(--font-size-sm)',
      borderRadius: 'var(--radius-button)',
      minHeight: '28px'
    },
    md: {
      padding: '8px 16px',
      fontSize: 'var(--font-size-base)',
      borderRadius: 'var(--radius-button)',
      minHeight: '36px'
    },
    lg: {
      padding: '12px 24px',
      fontSize: 'var(--font-size-lg)',
      borderRadius: 'var(--radius-button)',
      minHeight: '48px'
    }
  };
  const variants = {
    primary: {
      background: bronzeGradient,
      boxShadow: 'var(--shadow-btn)',
      border: '1px solid var(--color-bronze-border)',
      color: '#FFFFFF'
    },
    secondary: {
      background: persona === 'carrier' ? 'transparent' : '#FFFFFF',
      border: persona === 'carrier' ? '1px solid var(--carrier-border-glow)' : '1px solid var(--color-border-primary)',
      color: persona === 'carrier' ? 'var(--carrier-text)' : 'var(--color-text-primary)',
      boxShadow: 'none'
    },
    ghost: {
      background: 'transparent',
      border: '1px solid transparent',
      color: persona === 'carrier' ? 'var(--carrier-text-muted)' : 'var(--color-text-secondary)',
      boxShadow: 'none'
    },
    danger: {
      background: 'var(--color-critical)',
      border: '1px solid var(--color-critical-text)',
      color: '#FFFFFF',
      boxShadow: 'var(--shadow-btn-outer)'
    }
  };
  const disabledStyle = isDisabled ? {
    background: '#D3D3D3',
    border: '1px solid #CCCCCC',
    color: '#888888',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  } : {};
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: isDisabled,
    onClick: isDisabled ? undefined : onClick,
    style: {
      ...base,
      ...sizes[size],
      ...variants[variant],
      ...disabledStyle,
      ...extraStyle
    }
  }, props), isLoading && /*#__PURE__*/React.createElement("svg", {
    style: {
      marginRight: 8,
      width: 14,
      height: 14,
      animation: 'fc-spin 1s linear infinite',
      flexShrink: 0
    },
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10",
    stroke: "currentColor",
    strokeWidth: "4",
    opacity: "0.25"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    d: "M4 12a8 8 0 018-8v8H4z",
    opacity: "0.75"
  })), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FreightClub Card — universal widget container.
 * §6.5 spec: white bg, 1px #D0D0D0 border, 8px radius, subtle shadow, 24px padding.
 * Carrier variant flips to dark surface.
 */
function Card({
  persona = 'shipper',
  padding = 'lg',
  hover = false,
  children,
  style: extraStyle,
  ...props
}) {
  const padMap = {
    sm: 'var(--space-sm)',
    md: 'var(--space-md)',
    lg: 'var(--space-lg)',
    xl: 'var(--space-xl)',
    none: 0
  };
  const shipperStyle = {
    background: 'var(--color-surface-white)',
    border: 'var(--border-widget)',
    borderRadius: 'var(--radius-widget)',
    boxShadow: 'var(--shadow-subtle)',
    padding: padMap[padding] ?? 'var(--space-lg)'
  };
  const carrierStyle = {
    background: 'var(--carrier-surface)',
    border: '1px solid var(--carrier-border)',
    borderRadius: 'var(--radius-widget)',
    boxShadow: 'none',
    padding: padMap[padding] ?? 'var(--space-lg)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      ...(persona === 'carrier' ? carrierStyle : shipperStyle),
      transition: 'box-shadow 200ms ease',
      ...(hover ? {
        cursor: 'pointer'
      } : {}),
      ...extraStyle
    },
    onMouseEnter: hover ? e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-elevated)';
    } : undefined,
    onMouseLeave: hover ? e => {
      e.currentTarget.style.boxShadow = persona === 'carrier' ? 'none' : 'var(--shadow-subtle)';
    } : undefined
  }, props), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/ErrorBanner.jsx
try { (() => {
/**
 * ErrorBanner — inline error message block.
 */
function ErrorBanner({
  message,
  children,
  style: extraStyle
}) {
  const text = message || children;
  if (!text) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-md)',
      borderRadius: 'var(--radius-widget)',
      background: 'var(--color-critical-subtle)',
      border: '1px solid var(--color-critical)',
      color: 'var(--color-critical-text)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-base)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-sm)',
      ...extraStyle
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      flexShrink: 0
    }
  }, "\u26A0"), /*#__PURE__*/React.createElement("span", null, text));
}
Object.assign(__ds_scope, { ErrorBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ErrorBanner.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/**
 * FreightClub Input — form input with label, helper text, error state.
 * §6.3 specs: 40px height, 4px radius, bronze focus ring.
 */
function Input({
  label,
  error,
  helper,
  disabled = false,
  id,
  style: extraStyle,
  containerStyle,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-xs)',
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-base)',
      fontWeight: 'var(--font-weight-medium)',
      color: 'var(--color-text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    disabled: disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      height: '40px',
      padding: '8px 12px',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-base)',
      color: 'var(--color-text-primary)',
      background: disabled ? 'var(--color-surface-light)' : '#FFFFFF',
      border: error ? '2px solid var(--color-critical)' : focused ? 'var(--border-focus)' : '1px solid var(--color-border-primary)',
      borderRadius: 'var(--radius-input)',
      outline: 'none',
      transition: 'border-color 150ms ease',
      width: '100%',
      boxSizing: 'border-box',
      cursor: disabled ? 'not-allowed' : 'text',
      opacity: disabled ? 0.7 : 1,
      ...extraStyle
    }
  }, props)), error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-sm)',
      fontStyle: 'italic',
      color: 'var(--color-critical)'
    }
  }, error), helper && !error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-sm)',
      fontStyle: 'italic',
      color: 'var(--color-text-tertiary)'
    }
  }, helper));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/ProfitabilityBadge.jsx
try { (() => {
const TIER_STYLES = {
  green: {
    bg: 'rgba(34,197,94,0.12)',
    color: '#15803D',
    border: 'var(--color-rpm-high)',
    label: '●'
  },
  yellow: {
    bg: 'rgba(245,158,11,0.12)',
    color: '#B45309',
    border: 'var(--color-rpm-neutral)',
    label: '◐'
  },
  red: {
    bg: 'rgba(239,68,68,0.12)',
    color: '#B91C1C',
    border: 'var(--color-rpm-low)',
    label: '○'
  },
  unknown: {
    bg: '#F1F5F9',
    color: '#94A3B8',
    border: '#CBD5E1',
    label: '—'
  }
};

/**
 * RPM Profitability Badge — shows $/mile with color-coded tier.
 * green ≥ minRpm×1.2, yellow within 20%, red below.
 */
function ProfitabilityBadge({
  rpm,
  minRpm,
  style: extraStyle
}) {
  let tier = 'unknown';
  if (rpm != null && minRpm != null) {
    if (rpm >= minRpm * 1.2) tier = 'green';else if (rpm >= minRpm) tier = 'yellow';else tier = 'red';
  } else if (rpm != null) {
    tier = rpm >= 1.5 ? 'green' : rpm >= 1.0 ? 'yellow' : 'red';
  }
  const s = TIER_STYLES[tier];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: 'var(--font-weight-semibold)',
      whiteSpace: 'nowrap',
      ...extraStyle
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, s.label), rpm != null ? `$${Number(rpm).toFixed(2)}/mi` : '—');
}
Object.assign(__ds_scope, { ProfitabilityBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ProfitabilityBadge.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/**
 * Select dropdown — form select matching Input styling.
 */
function Select({
  label,
  error,
  helper,
  options = [],
  disabled = false,
  id,
  value,
  onChange,
  placeholder,
  containerStyle,
  style: extraStyle,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-xs)',
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: selectId,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-base)',
      fontWeight: 'var(--font-weight-medium)',
      color: 'var(--color-text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("select", _extends({
    id: selectId,
    disabled: disabled,
    value: value,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      height: '40px',
      padding: '8px 12px',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-base)',
      color: value ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
      background: disabled ? 'var(--color-surface-light)' : '#FFFFFF',
      border: error ? '2px solid var(--color-critical)' : focused ? 'var(--border-focus)' : '1px solid var(--color-border-primary)',
      borderRadius: 'var(--radius-input)',
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      width: '100%',
      boxSizing: 'border-box',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23636E72' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      paddingRight: 32,
      ...extraStyle
    }
  }, props), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(opt => /*#__PURE__*/React.createElement("option", {
    key: typeof opt === 'object' ? opt.value : opt,
    value: typeof opt === 'object' ? opt.value : opt
  }, typeof opt === 'object' ? opt.label : opt))), error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-sm)',
      fontStyle: 'italic',
      color: 'var(--color-critical)'
    }
  }, error), helper && !error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-sm)',
      fontStyle: 'italic',
      color: 'var(--color-text-tertiary)'
    }
  }, helper));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/Skeleton.jsx
try { (() => {
/**
 * Skeleton — animated loading placeholder.
 * Use while awaiting API data.
 */
function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  style: extraStyle
}) {
  const defaults = {
    text: {
      width: '100%',
      height: 16,
      borderRadius: 4
    },
    title: {
      width: '60%',
      height: 28,
      borderRadius: 4
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: '50%'
    },
    card: {
      width: '100%',
      height: 120,
      borderRadius: 8
    },
    badge: {
      width: 64,
      height: 20,
      borderRadius: 9999
    }
  };
  const base = defaults[variant] || defaults.text;
  const block = key => /*#__PURE__*/React.createElement("div", {
    key: key,
    style: {
      background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
      backgroundSize: '200% 100%',
      animation: 'fc-shimmer 1.4s ease-in-out infinite',
      ...base,
      ...(width ? {
        width
      } : {}),
      ...(height ? {
        height
      } : {}),
      ...extraStyle
    }
  });
  if (count === 1) return block('s');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-sm)'
    }
  }, Array.from({
    length: count
  }, (_, i) => block(i)));
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/core/StatCard.jsx
try { (() => {
const STATUS_COLORS = {
  default: 'var(--color-text-primary)',
  green: 'var(--color-success)',
  yellow: 'var(--color-warning)',
  red: 'var(--color-critical)',
  bronze: 'var(--color-bronze)'
};

/**
 * KPI stat card — "Number-First" hierarchy pattern.
 * Large metric up top, uppercase label below.
 */
function StatCard({
  label,
  value,
  prefix = '',
  suffix = '',
  statusColor = 'default',
  sublabel,
  icon,
  isLoading = false,
  style: extraStyle
}) {
  const numColor = STATUS_COLORS[statusColor] || STATUS_COLORS.default;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface-white)',
      border: 'var(--border-widget)',
      borderRadius: 'var(--radius-widget)',
      boxShadow: 'var(--shadow-subtle)',
      padding: 'var(--space-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-sm)',
      ...extraStyle
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--color-text-tertiary)',
      fontSize: 20,
      marginBottom: 'var(--space-xs)'
    }
  }, icon), isLoading ? /*#__PURE__*/React.createElement("div", {
    style: {
      height: 64,
      background: '#F1F5F9',
      borderRadius: 4,
      animation: 'fc-pulse 1.5s ease-in-out infinite'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--font-size-4xl)',
      fontWeight: 'var(--font-weight-heavy)',
      lineHeight: 'var(--line-height-tight)',
      color: numColor
    }
  }, prefix, value ?? '—', suffix), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-sm)',
      fontWeight: 'var(--font-weight-semibold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--letter-spacing-wider)',
      color: 'var(--color-text-tertiary)'
    }
  }, label), sublabel && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-sm)',
      color: 'var(--color-text-secondary)'
    }
  }, sublabel));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusBadge.jsx
try { (() => {
const STATUS_CONFIG = {
  DRAFT: {
    bg: '#F1F5F9',
    color: '#475569',
    border: '#CBD5E1',
    icon: '✎',
    label: 'Draft'
  },
  OPEN: {
    bg: '#DBEAFE',
    color: '#1D4ED8',
    border: '#3498DB',
    icon: '●',
    label: 'Open'
  },
  CLAIMED: {
    bg: '#FEF3C7',
    color: '#B45309',
    border: '#F39C12',
    icon: '⚑',
    label: 'Claimed'
  },
  IN_TRANSIT: {
    bg: '#EDE9FE',
    color: '#6D28D9',
    border: '#7C3AED',
    icon: '▶',
    label: 'In Transit'
  },
  DELIVERED: {
    bg: '#DCFCE7',
    color: '#15803D',
    border: '#27AE60',
    icon: '✓',
    label: 'Delivered'
  },
  SETTLED: {
    bg: '#CCFBF1',
    color: '#0F766E',
    border: '#14B8A6',
    icon: '★',
    label: 'Settled'
  },
  CANCELLED: {
    bg: '#FEE2E2',
    color: '#B91C1C',
    border: '#E74C3C',
    icon: '✕',
    label: 'Cancelled'
  }
};

/**
 * Load lifecycle status badge. Maps FreightClub status strings to colored pills.
 */
function StatusBadge({
  status
}) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.color,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: 'var(--font-weight-semibold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--letter-spacing-wide)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      fontSize: 9
    }
  }, cfg.icon), cfg.label);
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// frontend/src/features/carrier/components/dashboard/TabBar.tsx
try { (() => {
/**
 * AC-1: Tab bar (48px fixed)
 * Three tabs: My Stats | Available Loads | Quick Actions
 * Tap-only navigation (no swipe)
 */

const TabBar = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [{
    id: 'my-stats',
    label: 'My Stats'
  }, {
    id: 'available-loads',
    label: 'Available Loads'
  }, {
    id: 'quick-actions',
    label: 'Quick Actions'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: 48,
      display: 'flex',
      gap: 0,
      padding: 0
    }
  }, tabs.map(tab => /*#__PURE__*/React.createElement("button", {
    key: tab.id,
    "data-testid": `tab-button-${tab.id}`,
    onClick: () => onTabChange(tab.id),
    style: {
      flex: 1,
      height: 48,
      backgroundColor: activeTab === tab.id ? '#333333' : 'transparent',
      border: 'none',
      borderBottom: activeTab === tab.id ? '3px solid #B08D57' : '1px solid #2A2F37',
      color: activeTab === tab.id ? '#FFFFFF' : '#B0B0B0',
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'all 200ms ease',
      minWidth: 48,
      minHeight: 48
    }
  }, tab.label)));
};
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "frontend/src/features/carrier/components/dashboard/TabBar.tsx", error: String((e && e.message) || e) }); }

// frontend/src/features/loads/types.ts
try { (() => {
const EQUIPMENT_TYPE_LABELS = {
  DRY_VAN: 'Dry Van',
  FLATBED: 'Flatbed',
  REEFER: 'Refrigerated (Reefer)',
  STEP_DECK: 'Step Deck',
  REFRIGERATED: 'Refrigerated',
  TANKER: 'Tanker',
  SPECIALIZED: 'Specialized'
};
const PAYMENT_TERMS_LABELS = {
  QUICK_PAY: 'Quick Pay',
  NET_7: 'Net 7',
  NET_15: 'Net 15',
  NET_30: 'Net 30',
  IMMEDIATE: 'Immediate (Same/Next Day)',
  NET_14: 'Net 14'
};
Object.assign(__ds_scope, { EQUIPMENT_TYPE_LABELS, PAYMENT_TERMS_LABELS });
})(); } catch (e) { __ds_ns.__errors.push({ path: "frontend/src/features/loads/types.ts", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ErrorBanner = __ds_scope.ErrorBanner;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.ProfitabilityBadge = __ds_scope.ProfitabilityBadge;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.TabBar = __ds_scope.TabBar;

__ds_ns.EQUIPMENT_TYPE_LABELS = __ds_scope.EQUIPMENT_TYPE_LABELS;

__ds_ns.PAYMENT_TERMS_LABELS = __ds_scope.PAYMENT_TERMS_LABELS;

})();
