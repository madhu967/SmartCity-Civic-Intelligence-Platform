import React from 'react';

/**
 * Bespoke Civic Intelligence Platform Iconography Suite
 * Handcrafted, precision geometric vectors designed specifically for
 * smart city governance, telemetry, spatial intelligence, and field dispatch.
 * Replaces generic AI template icons (Sparkles, Bot, generic Flame, Lucide defaults).
 */

// 1. Civic Intelligence Core (Replaces generic AI Sparkles & Robot Bot)
// Geometric neural prism with central municipal focal node and telemetry orbiters
export function CivicIntelligenceIcon({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Outer telemetry diamond brackets */}
      <path d="M12 2L21 9L12 16L3 9L12 2Z" className="stroke-current opacity-90" />
      <path d="M12 16V22" />
      <path d="M3 9V15L12 22L21 15V9" strokeDasharray="1 3" className="opacity-60" />
      {/* Core cognitive node */}
      <circle cx="12" cy="9" r="2.5" fill="currentColor" fillOpacity="0.2" />
      <circle cx="12" cy="9" r="1" fill="currentColor" />
      {/* Precision satellite telemetry nodes */}
      <circle cx="12" cy="2" r="1.2" fill="currentColor" />
      <circle cx="21" cy="9" r="1.2" fill="currentColor" />
      <circle cx="3" cy="9" r="1.2" fill="currentColor" />
      <circle cx="12" cy="22" r="1.2" fill="currentColor" />
    </svg>
  );
}

// 2. Hotspot Spatial Radar (Replaces generic Flame / Fire emoji)
// Tactical GIS coordinate crosshair with radial sonar pulse arcs
export function HotspotRadarIcon({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Circular sonar rings */}
      <circle cx="12" cy="12" r="9" className="opacity-40" strokeDasharray="3 3" />
      <circle cx="12" cy="12" r="6" className="opacity-70" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.25" />
      {/* Tactical reticle axes */}
      <path d="M12 2V5" />
      <path d="M12 19V22" />
      <path d="M2 12H5" />
      <path d="M19 12H22" />
      {/* Thermal incident focal beam */}
      <path d="M12 12L16.5 7.5" strokeWidth="2" />
      <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 3. Municipal Incident Beacon (Replaces generic FileWarning / Triangle alert)
// Octagonal tactical containment shield with high-visibility focal strobe
export function MunicipalIncidentIcon({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Precision chamfered warning polygon */}
      <path d="M7.86 2H16.14L22 7.86V16.14L16.14 22H7.86L2 16.14V7.86L7.86 2Z" />
      {/* Micro telemetry notches */}
      <path d="M12 7V13" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.25" fill="currentColor" />
      {/* Precision corner anchors */}
      <path d="M2 7.86L5 5" className="opacity-50" />
      <path d="M22 7.86L19 5" className="opacity-50" />
    </svg>
  );
}

// 4. Civic Command Matrix (Replaces generic LayoutDashboard / 4-box icon)
// Multi-district modular telemetry grid with primary sector highlight
export function CivicCommandMatrixIcon({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Command sector 1: Active primary node */}
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" fillOpacity="0.15" />
      <circle cx="6.75" cy="6.75" r="1.5" fill="currentColor" />
      {/* Command sector 2: Telemetry lines */}
      <rect x="13.5" y="3" width="7.5" height="5" rx="1.5" />
      <path d="M16 6H18.5" />
      {/* Command sector 3: Municipal graph bar */}
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <path d="M5.5 18V16" />
      <path d="M7.5 18V14.5" strokeWidth="2" />
      {/* Command sector 4: Wide monitor terminal */}
      <rect x="13.5" y="10.5" width="7.5" height="10.5" rx="2" />
      <circle cx="17.25" cy="14" r="1" fill="currentColor" />
      <path d="M15.5 17.5H19" strokeDasharray="1 1" />
    </svg>
  );
}

// 5. Citizen Mesh & Governance Registry (Replaces generic Users / UserRound)
// Interconnected civic community network with municipal trust seal
export function CitizenMeshIcon({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Central verified citizen */}
      <circle cx="12" cy="7" r="3.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M6 19C6 15.6863 8.68629 13 12 13C15.3137 13 18 15.6863 18 19" />
      {/* Satellite civic nodes */}
      <circle cx="4" cy="9" r="1.75" />
      <path d="M2 18C2 16 3 15 4 14.5" />
      <circle cx="20" cy="9" r="1.75" />
      <path d="M22 18C22 16 21 15 20 14.5" />
      {/* Mesh interconnect lines */}
      <path d="M5.5 10L8.5 8.5" strokeDasharray="1.5 1.5" className="opacity-60" />
      <path d="M18.5 10L15.5 8.5" strokeDasharray="1.5 1.5" className="opacity-60" />
      <path d="M9 21H15" strokeWidth="2" />
    </svg>
  );
}

// 6. Field Operations & Dispatch Unit (Replaces generic Briefcase / ShieldCheck)
// Heavy-duty tactical municipal dispatch crest with status indicator
export function FieldOpsIcon({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Tactical municipal helmet / dispatch crest */}
      <path d="M12 2L4 6V11C4 16.5 7.4 20.6 12 22C16.6 20.6 20 16.5 20 11V6L12 2Z" fill="currentColor" fillOpacity="0.08" />
      {/* Active dispatch chevron & tool axis */}
      <path d="M12 6.5V13.5" strokeWidth="2.2" />
      <path d="M8.5 10H15.5" strokeWidth="2.2" />
      <path d="M9 16L12 18.5L15 16" strokeWidth="1.75" />
      <circle cx="12" cy="6.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

// 7. Ward Telemetry Waveform (Replaces generic Radio / Activity)
// Encased frequency bracket with real-time heartbeat sensor pulse
export function WardTelemetryIcon({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Outer telemetry telemetry brackets */}
      <path d="M4 6H2V18H4" />
      <path d="M20 6H22V18H20" />
      {/* Live dynamic signal waveform */}
      <path d="M2 12H6L8.5 7L11.5 17L14.5 9L16.5 13.5L18 12H22" strokeWidth="2" />
      {/* Active transmission dot */}
      <circle cx="11.5" cy="17" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 8. Municipal Docket / Reports Ledger (Replaces generic Layers)
// Smart verifiable civic record with holographic seal notches
export function MunicipalDocketIcon({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Document stack */}
      <path d="M7 3H17L21 7V20C21 20.5523 20.5523 21 20 21H7C6.44772 21 6 20.5523 6 20V4C6 3.44772 6.44772 3 7 3Z" fill="currentColor" fillOpacity="0.08" />
      <path d="M16 3V8H21" />
      {/* Underlying docket layer */}
      <path d="M3 7V21C3 21.5523 3.44772 22 4 22H17" strokeDasharray="1.5 2" className="opacity-60" />
      {/* Technical telemetry readout tracks */}
      <path d="M10 12H17" strokeWidth="1.8" />
      <path d="M10 15.5H15" strokeWidth="1.8" />
      <circle cx="10" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

// 9. Verified Resolution Seal (Replaces generic CheckCircle2)
// Multi-faceted civic verification stamp with precision check reticle
export function VerifiedResolutionSeal({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* 12-point municipal star seal outline */}
      <path
        d="M12 2L14.2 4.4L17.4 4.1L18.4 7.2L21.4 8.6L20.8 11.8L22.6 14.5L20.1 16.6L20.1 19.8L17 20.3L15 22.8L12 21.6L9 22.8L7 20.3L3.9 19.8L3.9 16.6L1.4 14.5L3.2 11.8L2.6 8.6L5.6 7.2L6.6 4.1L9.8 4.4L12 2Z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Precision verification check */}
      <path d="M8.5 12L11 14.5L16 9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 10. Spatial GIS Target Reticle (Replaces generic MapPin)
// Geodetic precision coordinate crosshair
export function SpatialGisReticle({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Geodetic marker pin with radar aperture */}
      <path d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z" />
      {/* Target focal aperture */}
      <circle cx="12" cy="9" r="3" fill="currentColor" fillOpacity="0.2" />
      <circle cx="12" cy="9" r="1.2" fill="currentColor" />
      {/* Precision coordinate ticks */}
      <path d="M12 5V7" />
      <path d="M12 11V13" />
      <path d="M8 9H10" />
      <path d="M14 9H16" />
    </svg>
  );
}

// 11. Optical Vision Aperture (Replaces generic Camera / Image for AI audit)
// High-tech lens aperture with corner framing brackets
export function OpticalVisionIcon({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Frame brackets */}
      <path d="M3 8V5C3 3.89543 3.89543 3 5 3H8" strokeWidth="2" />
      <path d="M16 3H19C20.1046 3 21 3.89543 21 5V8" strokeWidth="2" />
      <path d="M21 16V19C21 20.1046 20.1046 21 19 21H16" strokeWidth="2" />
      <path d="M8 21H5C3.89543 21 3 20.1046 3 19V16" strokeWidth="2" />
      {/* Sensor optic center */}
      <circle cx="12" cy="12" r="4.5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 7.5L14.5 12" strokeWidth="1.5" />
      <path d="M14.5 12L12 16.5" strokeWidth="1.5" />
      <path d="M12 16.5L9.5 12" strokeWidth="1.5" />
      <path d="M9.5 12L12 7.5" strokeWidth="1.5" />
    </svg>
  );
}

// 12. Civic Telemetry Trends (Replaces generic BarChart3 / TrendingUp)
// Ascending precision step-meter with target trend vector
export function CivicTelemetryTrendsIcon({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Stepped telemetry bars with rounded tops */}
      <rect x="3" y="14" width="3.5" height="7" rx="1" fill="currentColor" fillOpacity="0.2" />
      <rect x="8.5" y="10" width="3.5" height="11" rx="1" fill="currentColor" fillOpacity="0.4" />
      <rect x="14" y="6" width="3.5" height="15" rx="1" fill="currentColor" fillOpacity="0.7" />
      {/* Projection trajectory vector */}
      <path d="M3 12L10 7L16 11L21 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 4H21V8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21" cy="4" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 13. Municipal Dispatch Mail / Secure Comms (Replaces generic Mail)
// Encrypted municipal communiqué with digital wax seal
export function MunicipalCommsIcon({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="2" y="4" width="20" height="16" rx="2.5" fill="currentColor" fillOpacity="0.06" />
      <path d="M2 7L12 13.5L22 7" strokeWidth="1.75" />
      {/* Secure cryptographic chip wafer */}
      <circle cx="12" cy="13.5" r="2" fill="currentColor" />
      <path d="M12 17V19" strokeWidth="2" />
      <path d="M9 19H15" strokeWidth="2" />
    </svg>
  );
}

// 14. Priority Incident Strobe (Replaces generic AlertTriangle)
// Beacon tower broadcasting municipal emergency notification
export function PriorityBeaconIcon({ className = 'w-5 h-5', size, ...props }) {
  const s = size || undefined;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Central beacon tower */}
      <path d="M12 8V16" strokeWidth="2.5" />
      <path d="M9 20H15" strokeWidth="2" />
      <path d="M10 16L9 20" />
      <path d="M14 16L15 20" />
      <circle cx="12" cy="6" r="2.5" fill="currentColor" />
      {/* Pulsing acoustic/radio signal brackets */}
      <path d="M7 4C5.5 5.5 5.5 8.5 7 10" strokeWidth="1.8" />
      <path d="M17 4C18.5 5.5 18.5 8.5 17 10" strokeWidth="1.8" />
      <path d="M4 2C1.5 4.5 1.5 9.5 4 12" strokeWidth="1.8" strokeDasharray="2 2" className="opacity-60" />
      <path d="M20 2C22.5 4.5 22.5 9.5 20 12" strokeWidth="1.8" strokeDasharray="2 2" className="opacity-60" />
    </svg>
  );
}
