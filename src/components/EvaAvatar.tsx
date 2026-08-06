import { motion } from "framer-motion";

// Avatar da Eva — estilo chibi flat (referência do usuário): cabeça grande,
// olhos redondos grandes, blush, mecha roxa e sparkle lima no cabelo, camiseta
// preta com sparkle, mão no bolso. Desenhada em SVG com partes animáveis.

const HAIR   = "#1B2321";
const SKIN   = "#FBEEE1";
const SHIRT  = "#252D2A";
const PANTS  = "#262E36";
const CUFF   = "#3A4351";
const SHOE   = "#15181B";
const SOLE   = "#EFE9DF";
const EYE    = "#141B19";
const BLUSH  = "#E8A79A";
const MOUTH  = "#4A3A34";
const STREAK = "#8B5CF6";
const SPARK  = "#B9F227";

// Sparkle de 4 pontas centrado em (cx, cy)
export function sparklePath(cx: number, cy: number, s: number) {
  return `M ${cx} ${cy - s}
    C ${cx + s * 0.12} ${cy - s * 0.38}, ${cx + s * 0.38} ${cy - s * 0.12}, ${cx + s} ${cy}
    C ${cx + s * 0.38} ${cy + s * 0.12}, ${cx + s * 0.12} ${cy + s * 0.38}, ${cx} ${cy + s}
    C ${cx - s * 0.12} ${cy + s * 0.38}, ${cx - s * 0.38} ${cy + s * 0.12}, ${cx - s} ${cy}
    C ${cx - s * 0.38} ${cy - s * 0.12}, ${cx - s * 0.12} ${cy - s * 0.38}, ${cx} ${cy - s} Z`;
}

function Twinkle({ cx, cy, size, color = SPARK, delay = 0 }: {
  cx: number; cy: number; size: number; color?: string; delay?: number;
}) {
  return (
    <motion.path d={sparklePath(cx, cy, size)} fill={color}
      animate={{ scale: [1, 0.72, 1], rotate: [0, 18, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay }}
      style={{ originX: `${cx}px`, originY: `${cy}px` }} />
  );
}

// ─── Cabeça chibi (compartilhada entre EvaHead e EvaStanding) ────────────────

function ChibiHead({ animate = true }: { animate?: boolean }) {
  const head = (
    <g>
      {/* Cabelo — silhueta do bob */}
      <ellipse cx="120" cy="108" rx="86" ry="90" fill={HAIR} />
      {/* Mechas laterais */}
      <path d="M34 108 C 30 160 38 196 50 210 Q 66 218 72 196 C 76 168 70 150 68 120 Z" fill={HAIR} />
      <path d="M206 108 C 210 160 202 196 190 210 Q 174 218 168 196 C 164 168 170 150 172 120 Z" fill={HAIR} />

      {/* Orelhas */}
      <circle cx="68" cy="146" r="9" fill={SKIN} />
      <circle cx="172" cy="146" r="9" fill={SKIN} />

      {/* Rosto */}
      <ellipse cx="120" cy="142" rx="50" ry="48" fill={SKIN} />

      {/* Franja */}
      <path d="M120 50
        C 78 50 60 74 58 118
        Q 60 128 70 126
        C 78 108 88 104 92 118
        Q 96 126 104 118
        C 108 106 122 104 128 116
        Q 134 124 142 114
        C 146 102 158 106 164 122
        Q 170 130 178 124
        C 180 84 162 50 120 50 Z" fill={HAIR} />

      {/* Mecha roxa */}
      <path d="M74 84 Q 92 62 118 58" fill="none" stroke={STREAK} strokeWidth="8" strokeLinecap="round" />

      {/* Sparkle lima no cabelo */}
      <Twinkle cx={172} cy={86} size={11} delay={0.4} />

      {/* Olhos grandes */}
      {animate ? (
        <motion.g
          style={{ originY: "144px" }}
          animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
          transition={{ duration: 4.4, times: [0, 0.9, 0.94, 0.98, 1], repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="98" cy="144" r="9" fill={EYE} />
          <circle cx="142" cy="144" r="9" fill={EYE} />
          <circle cx="95" cy="140.5" r="2.4" fill="#fff" />
          <circle cx="139" cy="140.5" r="2.4" fill="#fff" />
        </motion.g>
      ) : (
        <g>
          <circle cx="98" cy="144" r="9" fill={EYE} />
          <circle cx="142" cy="144" r="9" fill={EYE} />
          <circle cx="95" cy="140.5" r="2.4" fill="#fff" />
          <circle cx="139" cy="140.5" r="2.4" fill="#fff" />
        </g>
      )}

      {/* Blush (risquinhos) */}
      <g stroke={BLUSH} strokeWidth="2.4" strokeLinecap="round">
        <path d="M72 158 L 78 165" />
        <path d="M79 156 L 85 163" />
        <path d="M86 154 L 92 161" />
        <path d="M148 154 L 154 161" />
        <path d="M155 156 L 161 163" />
        <path d="M162 158 L 168 165" />
      </g>

      {/* Sorriso */}
      <path d="M112 168 Q 120 174.5 128 168" fill="none" stroke={MOUTH} strokeWidth="3.2" strokeLinecap="round" />
    </g>
  );

  if (!animate) return head;
  return (
    <motion.g
      style={{ originX: "120px", originY: "190px" }}
      animate={{ rotate: [-1.2, 1.2, -1.2] }}
      transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
    >
      {head}
    </motion.g>
  );
}

// ─── Cabeça (nav, login, avatares pequenos) ──────────────────────────────────

export function EvaHead({ size = 40, animate = true, className }: {
  size?: number; animate?: boolean; className?: string;
}) {
  return (
    <svg viewBox="26 12 188 206" width={size} height={size} className={className} aria-label="Eva">
      <ChibiHead animate={animate} />
    </svg>
  );
}

// ─── Eva de corpo inteiro, mão no bolso ──────────────────────────────────────

export function EvaStanding({ width = 130, className, delay = 0.8 }: {
  width?: number; className?: string; delay?: number;
}) {
  return (
    <svg viewBox="0 0 240 400" width={width} height={width * (400 / 240)} className={className} aria-label="Eva">
      {/* Sombra no chão */}
      <ellipse cx="120" cy="382" rx="68" ry="8" fill="rgba(22,19,14,0.10)" />

      {/* Braço esquerdo — mão no bolso (a ponta fica coberta pela calça) */}
      <path d="M74 244 Q 70 262 88 278" fill="none" stroke={SKIN} strokeWidth="12" strokeLinecap="round" />

      {/* Braço direito — solto, balançando de leve */}
      <motion.g
        style={{ originX: "166px", originY: "244px" }}
        animate={{ rotate: [0, 3.5, 0, -2, 0] }}
        transition={{ delay: delay + 0.6, duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M166 244 Q 172 266 170 290" fill="none" stroke={SKIN} strokeWidth="12" strokeLinecap="round" />
        <circle cx="170" cy="296" r="7.5" fill={SKIN} />
      </motion.g>

      {/* Camiseta */}
      <rect x="62" y="212" width="24" height="36" rx="12" fill={SHIRT} transform="rotate(14 74 230)" />
      <rect x="154" y="212" width="24" height="36" rx="12" fill={SHIRT} transform="rotate(-14 166 230)" />
      <path d="M86 206 Q 120 196 154 206 L 162 214 Q 168 224 166 244 L 158 270 L 82 270 L 74 244 Q 72 224 78 214 Z" fill={SHIRT} />
      {/* Sparkle no peito */}
      <Twinkle cx={103} cy={232} size={7} delay={1.1} />

      {/* Calça */}
      <path d="M80 264 L 160 264 L 162 302 L 158 306 L 82 306 L 78 302 Z" fill={PANTS} />
      <rect x="84" y="298" width="34" height="56" rx="6" fill={PANTS} />
      <rect x="122" y="298" width="34" height="56" rx="6" fill={PANTS} />
      {/* Abertura do bolso */}
      <path d="M84 272 Q 96 274 100 288" fill="none" stroke={CUFF} strokeWidth="2.5" />
      {/* Barras dobradas */}
      <rect x="82" y="342" width="38" height="14" rx="4" fill={CUFF} />
      <rect x="120" y="342" width="38" height="14" rx="4" fill={CUFF} />

      {/* Tênis */}
      <rect x="80" y="354" width="42" height="18" rx="8" fill={SHOE} />
      <rect x="76" y="368" width="50" height="9" rx="4.5" fill={SOLE} />
      <rect x="118" y="354" width="42" height="18" rx="8" fill={SHOE} />
      <rect x="114" y="368" width="50" height="9" rx="4.5" fill={SOLE} />

      {/* Cabeça por cima do corpo */}
      <ChibiHead />
    </svg>
  );
}
