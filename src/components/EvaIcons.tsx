import { motion } from "framer-motion";
import { sparklePath } from "./EvaAvatar";

// Ícones próprios do painel da Eva — desenhados à mão no mesmo traço monoline
// do avatar (contorno grosso, cantos arredondados) e animados com framer-motion.
// `stroke` = cor do traço, `accent` = cor de destaque, `bg` = cor de fundo do
// chip onde o ícone está (usada para oclusão entre formas sobrepostas).

interface IconProps {
  size?: number;
  stroke?: string;
  accent?: string;
  bg?: string;
  className?: string;
}

const INK = "#16130E";

// ─── Painel de Contas: duas pessoas + badge de notificação ───────────────────

export function IconContas({ size = 32, stroke = INK, accent = "#7A2BF5", bg = "#fff", className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      {/* pessoa de trás */}
      <circle cx="31" cy="17" r="7" fill="none" stroke={stroke} strokeWidth="4" />
      <path d="M26 40 Q 27 30 35 31 Q 42 32 42 40" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      {/* pessoa da frente */}
      <motion.g animate={{ y: [0, -1.5, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M5 41 Q 5 30 17 30 Q 29 30 29 41" fill={bg} stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <circle cx="17" cy="19" r="8.5" fill={bg} stroke={stroke} strokeWidth="4" />
        <motion.g
          style={{ originY: "18px" }}
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 3.8, times: [0, 0.88, 0.93, 0.97, 1], repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="14.2" cy="18" r="1.5" fill={stroke} />
          <circle cx="19.8" cy="18" r="1.5" fill={stroke} />
        </motion.g>
        <path d="M14.5 22 Q 17 24.4 19.5 22" fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
      </motion.g>
      {/* badge de notificação */}
      <motion.circle cx="40" cy="8" r="4" fill={accent}
        animate={{ scale: [1, 1.35, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "40px", originY: "8px" }} />
    </svg>
  );
}

// ─── Pack de Vídeos: claquete que bate + play pulsando ───────────────────────

export function IconVideos({ size = 32, stroke = INK, accent = "#7A2BF5", bg = "#fff", className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      {/* topo da claquete (bate a cada ciclo) */}
      <motion.g
        style={{ originX: "9px", originY: "21px" }}
        animate={{ rotate: [0, -18, 0] }}
        transition={{ duration: 0.55, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
      >
        <rect x="8" y="12" width="32" height="9" rx="3" fill={bg} stroke={stroke} strokeWidth="4" />
        <path d="M15 13 L 12 20 M24 13 L 21 20 M33 13 L 30 20" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      </motion.g>
      {/* corpo */}
      <rect x="8" y="21" width="32" height="17" rx="3.5" fill={bg} stroke={stroke} strokeWidth="4" />
      {/* play */}
      <motion.path d="M21 25.5 L 28.5 29.5 L 21 33.5 Z" fill={accent}
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "24px", originY: "29.5px" }} />
    </svg>
  );
}

// ─── Produtos em Alta: seta subindo (redesenha) + sparkle ────────────────────

export function IconAlta({ size = 32, stroke = INK, accent = "#7A2BF5", className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      {/* traço fantasma para a forma persistir entre os redesenhos */}
      <path d="M7 37 L 18 26 L 25 31 L 36 18" fill="none" stroke={stroke} strokeWidth="4.5"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
      <motion.path d="M7 37 L 18 26 L 25 31 L 36 18" fill="none" stroke={stroke} strokeWidth="4.5"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1] }}
        transition={{ duration: 2.6, times: [0, 0.45, 1], repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }} />
      {/* ponta da seta */}
      <path d="M40 13 L 30.5 14 L 35.5 21 Z" fill={stroke} />
      {/* sparkle */}
      <motion.path
        d="M40 3 C 40.6 6.4 42.6 8.4 46 9 C 42.6 9.6 40.6 11.6 40 15 C 39.4 11.6 37.4 9.6 34 9 C 37.4 8.4 39.4 6.4 40 3 Z"
        fill={accent}
        animate={{ scale: [1, 0.7, 1], rotate: [0, 14, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "40px", originY: "9px" }} />
    </svg>
  );
}

// ─── Treinamento: capelo com borla balançando ────────────────────────────────

export function IconTreino({ size = 32, stroke = INK, accent = "#7A2BF5", bg = "#fff", className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      {/* base */}
      <path d="M14 21 L 14 30 Q 24 36.5 34 30 L 34 21" fill={bg} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
      {/* capelo */}
      <path d="M24 8 L 43 16.5 L 24 25 L 5 16.5 Z" fill={stroke} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      {/* borla pendulando */}
      <motion.g
        style={{ originX: "43px", originY: "16.5px" }}
        animate={{ rotate: [12, -12, 12] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M43 16.5 L 43 28" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <circle cx="43" cy="31" r="3.2" fill={accent} />
      </motion.g>
    </svg>
  );
}

// ─── Ícones de nicho desenhados à mão (traço monoline + detalhe de cor) ──────

export type NichoTipo =
  | "camiseta" | "celular" | "panela" | "halter" | "pata" | "mamadeira"
  | "caixa" | "carro" | "lapis" | "talher" | "balao" | "play";

export function NichoIcon({ tipo, size = 24, stroke = INK, accent = "#7A2BF5", bg = "#fff", className }: {
  tipo: NichoTipo; size?: number; stroke?: string; accent?: string; bg?: string; className?: string;
}) {
  const s: React.SVGAttributes<SVGElement> = {
    fill: "none", stroke, strokeWidth: 3.6, strokeLinecap: "round", strokeLinejoin: "round",
  };
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      {tipo === "camiseta" && (<>
        <path d="M14 10 L19 7 Q24 12 29 7 L34 10 L40 17 L34 21 L34 40 L14 40 L14 21 L8 17 Z" {...s} fill={bg} />
        <path d={sparklePath(24, 27, 5)} fill={accent} />
      </>)}
      {tipo === "celular" && (<>
        <rect x="15" y="7" width="18" height="34" rx="4.5" {...s} fill={bg} />
        <path d="M21 11.5 L27 11.5" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <path d="M24 31 C 21.6 28.7, 19 27, 20.1 24.5 C 20.9 22.7, 23.3 22.7, 24 24.5 C 24.7 22.7, 27.1 22.7, 27.9 24.5 C 29 27, 26.4 28.7, 24 31 Z" fill={accent} />
      </>)}
      {tipo === "panela" && (<>
        <path d="M19 12 q -2 -4 0 -7" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M29 12 q 2 -4 0 -7" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M12 23 L12 31 Q12 37 18 37 L30 37 Q36 37 36 31 L36 23" {...s} fill={bg} />
        <path d="M9 23 L39 23" {...s} />
        <path d="M5.5 28 L9 28 M39 28 L42.5 28" {...s} />
      </>)}
      {tipo === "halter" && (<>
        <path d="M16 24 L32 24" {...s} />
        <rect x="10" y="15" width="6" height="18" rx="3" {...s} fill={bg} />
        <rect x="32" y="15" width="6" height="18" rx="3" {...s} fill={bg} />
        <rect x="5" y="19" width="3.5" height="10" rx="1.75" fill={accent} />
        <rect x="39.5" y="19" width="3.5" height="10" rx="1.75" fill={accent} />
      </>)}
      {tipo === "pata" && (<>
        <ellipse cx="15" cy="19" rx="3.4" ry="4.2" {...s} fill={bg} />
        <ellipse cx="24" cy="15.5" rx="3.4" ry="4.2" {...s} fill={bg} />
        <ellipse cx="33" cy="19" rx="3.4" ry="4.2" fill={accent} />
        <path d="M16 32 Q16 25 24 25 Q32 25 32 32 Q32 38 24 38 Q16 38 16 32 Z" {...s} fill={bg} />
      </>)}
      {tipo === "mamadeira" && (<>
        <path d="M20.5 13 Q24 5.5 27.5 13 Z" fill={accent} />
        <rect x="19.5" y="13" width="9" height="5" rx="2" {...s} fill={bg} />
        <rect x="17" y="18" width="14" height="22" rx="6" {...s} fill={bg} />
        <path d="M21 26 L25 26 M21 31 L25 31" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
      </>)}
      {tipo === "caixa" && (<>
        <circle cx="24" cy="17" r="3.4" fill={accent} />
        <path d="M11 22 L37 22 L34.5 40 L13.5 40 Z" {...s} fill={bg} />
        <path d="M11 22 L16 14 M37 22 L32 14" {...s} />
      </>)}
      {tipo === "carro" && (<>
        <path d="M8 31 Q8 25 13 24 L17 17.5 Q18 16 20.5 16 L28 16 Q30.5 16 31.5 17.5 L35 24 Q40 25 40 31 L40 33 L8 33 Z" {...s} fill={bg} />
        <circle cx="15.5" cy="34" r="4" {...s} fill={bg} />
        <circle cx="32.5" cy="34" r="4" {...s} fill={bg} />
        <circle cx="36.5" cy="28" r="1.9" fill={accent} />
      </>)}
      {tipo === "lapis" && (<>
        <path d="M13 35 L15.5 27.5 L30 8.5 L37 13.5 L22.5 32.5 Z" {...s} fill={bg} />
        <path d="M28 11.2 L35 16.2" stroke={accent} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M17 40 q 7 3.5 14 0" stroke={accent} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      </>)}
      {tipo === "talher" && (<>
        <path d="M16 8 L16 15 M20 8 L20 15 M24 8 L24 15" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <path d="M16 15 Q16 20 20 20 Q24 20 24 15" {...s} strokeWidth="3" />
        <path d="M20 20 L20 40" {...s} />
        <ellipse cx="32" cy="13" rx="4.2" ry="6" {...s} fill={bg} />
        <path d="M32 19 L32 40" {...s} />
        <circle cx="32" cy="13" r="1.8" fill={accent} />
      </>)}
      {tipo === "balao" && (<>
        <ellipse cx="24" cy="16" rx="8.5" ry="10" fill={accent} />
        <ellipse cx="24" cy="16" rx="8.5" ry="10" {...s} />
        <path d="M21.8 26.5 L26.2 26.5 L24 29.6 Z" fill={stroke} />
        <path d="M24 29.6 q 3.5 4.4 -0.5 7.4 q -3.5 3 0.5 6" stroke={stroke} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      </>)}
      {tipo === "play" && (<>
        <path d="M17.5 11.5 L36 24 L17.5 36.5 Z" {...s} fill={bg} />
        <path d={sparklePath(38.5, 11, 4.5)} fill={accent} />
      </>)}
    </svg>
  );
}

// ─── Relógio com ponteiro girando (opções de tempo) ──────────────────────────

export function IconRelogio({ size = 24, stroke = INK, accent = "#7A2BF5", bg = "#fff", className }: {
  size?: number; stroke?: string; accent?: string; bg?: string; className?: string;
}) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      <circle cx="24" cy="24" r="16" fill={bg} stroke={stroke} strokeWidth="4" />
      <path d="M24 11.5 L24 14 M36.5 24 L34 24 M24 36.5 L24 34 M11.5 24 L14 24"
        stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
      <motion.g style={{ originX: "24px", originY: "24px" }}
        animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
        <path d="M24 24 L24 15.5" stroke={stroke} strokeWidth="3.2" strokeLinecap="round" />
      </motion.g>
      <path d="M24 24 L29.5 27" stroke={stroke} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="2.4" fill={accent} />
    </svg>
  );
}

// ─── Loader da Eva (estrela girando + sparkle pulsando) ──────────────────────

export function EvaLoader({ label, size = 46, className }: {
  label?: string; size?: number; className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className ?? "py-10"}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <motion.div className="absolute inset-0"
          animate={{ rotate: 360 }} transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}>
          <Starburst size={size} spin={false} />
        </motion.div>
        <motion.div className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 0.7, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}>
          <svg viewBox="0 0 24 24" width={size * 0.36} height={size * 0.36}>
            <path d={sparklePath(12, 12, 9)} fill="#7A2BF5" />
          </svg>
        </motion.div>
      </div>
      {label && <p className="text-[12.5px] font-semibold text-foreground/50 text-center">{label}</p>}
    </div>
  );
}

// ─── Explosão de estrela (decoração, estilo crachá) ──────────────────────────

export function Starburst({ size = 64, color = "#B9F227", className, spin = true }: {
  size?: number; color?: string; className?: string; spin?: boolean;
}) {
  return (
    <motion.svg viewBox="0 0 64 64" width={size} height={size} className={className}
      animate={spin ? { rotate: 360 } : undefined}
      transition={spin ? { duration: 32, repeat: Infinity, ease: "linear" } : undefined}>
      <path
        d="M62 32 L43.1 36.6 L53.2 53.2 L36.6 43.1 L32 62 L27.4 43.1 L10.8 53.2 L20.9 36.6 L2 32 L20.9 27.4 L10.8 10.8 L27.4 20.9 L32 2 L36.6 20.9 L53.2 10.8 L43.1 27.4 Z"
        fill={color} />
    </motion.svg>
  );
}
