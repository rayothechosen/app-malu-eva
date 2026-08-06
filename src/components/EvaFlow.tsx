import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Check, ChevronRight, Play, Zap, Loader2, X, Clock,
  RefreshCw, Shuffle, Captions, Mic, Scissors, Search, Wand2,
  Copy, Download, CalendarDays,
} from "lucide-react";
import { NichoIcon, EvaLoader, Starburst, type NichoTipo } from "@/components/EvaIcons";
import type { BrandTheme } from "@/lib/brandTheme";
import { supabase } from "@/lib/supabaseClient";

// ─── Tema ────────────────────────────────────────────────────────────────────
const P         = "var(--brand-primary)";
const LIME      = "var(--brand-accent)";
const INK       = "#16130E";
const CARD_DARK = "var(--brand-card-dark)";
const CARD_EDGE   = "1.5px solid rgba(22,19,14,0.10)";
const CARD_SHADOW = "0 2px 0 rgba(22,19,14,0.05), 0 14px 36px rgba(22,19,14,0.08)";
const PAGE_BG   = { background: "var(--brand-background)" };
const TIKTOK_RED = "#FE2C55";

const R2_EVA       = "https://pub-0b252875d435478a830daa595535d16c.r2.dev";

export interface ProdutoLite {
  id: string; nome: string; preco: string; comissao: string; img: string; badge: string;
}

interface VideoRow {
  message_id: string;
  nicho: string;
  link_video: string | null;
  legenda?: string | null;
  caption?: string | null;
  caption_pt_br?: string | null;
  hashtags?: string | string[] | null;
}

function ChannelDots({ channels, selected, size = 18 }: {
  channels: BrandTheme["channels"]; selected?: string[]; size?: number;
}) {
  const visible = channels.filter(channel => !selected || selected.includes(channel.name));
  return (
    <span className="inline-flex items-center gap-1">
      {visible.map(channel => (
        <span key={channel.name} className="inline-flex items-center justify-center rounded-full bg-white" style={{ width: size + 8, height: size + 8 }}>
          <img src={channel.logoUrl} alt={channel.name} style={{ width: size, height: size }} draggable={false} />
        </span>
      ))}
    </span>
  );
}

function BtnLime({ children, onClick, disabled }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full flex items-center justify-center gap-2 font-bold py-[14px] rounded-2xl text-sm transition-all active:scale-[0.98] disabled:opacity-40"
      style={{ background: LIME, color: INK, boxShadow: disabled ? undefined : "0 6px 20px rgba(140,190,20,0.35)" }}>
      {children}
    </button>
  );
}

function Dots({ current }: { current: number }) {
  const total = 4;
  return (
    <div className="flex items-center">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current, curr = i === current;
        return (
          <div key={i} className="flex items-center">
            <motion.div
              animate={curr ? { scale: [1, 1.14, 1] } : { scale: 1 }}
              transition={curr ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
              style={{
                background: done ? LIME : curr ? P : "#fff",
                color: done ? INK : curr ? "#fff" : "rgba(22,19,14,0.35)",
                border: done || curr ? "none" : CARD_EDGE,
                boxShadow: curr ? "0 4px 12px rgba(122,43,245,0.35)" : undefined,
              }}>
              {done ? <Check className="w-3 h-3" strokeWidth={3.5} /> : i + 1}
            </motion.div>
            {i < total - 1 && (
              <div className="w-4 h-[2.5px] rounded-full" style={{ background: i < current ? LIME : "rgba(22,19,14,0.12)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TopBar({ step, label, onBack }: { step: number; label: string; onBack: () => void }) {
  return (
    <div className="px-5 pt-7 pb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 text-foreground/50" />
          <span className="text-[11px] font-bold text-foreground/50">Voltar</span>
        </div>
        <span className="text-[11px] font-bold" style={{ color: P }}>{label}</span>
      </div>
      <Dots current={step} />
    </div>
  );
}

function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,0.97)" }} onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-6 right-5 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.12)" }}>
        <X className="w-5 h-5 text-white" />
      </button>
      <div className="w-full max-w-sm px-4" onClick={e => e.stopPropagation()}>
        <video src={url} controls autoPlay playsInline className="w-full rounded-2xl"
          style={{ maxHeight: "78vh", background: "#000" }} />
      </div>
    </motion.div>
  );
}

// ─── Dados do fluxo ──────────────────────────────────────────────────────────

const NICHOS: { id: string; label: string; tipo: NichoTipo }[] = [
  { id: "moda",        label: "Moda e beleza",     tipo: "camiseta" },
  { id: "casa",        label: "Casa e decoração",  tipo: "panela" },
  { id: "eletro",      label: "Eletrônicos",       tipo: "celular" },
  { id: "maternidade", label: "Maternidade",       tipo: "mamadeira" },
  { id: "pet",         label: "Pet",               tipo: "pata" },
  { id: "saude",       label: "Saúde e bem-estar", tipo: "halter" },
  { id: "auto",        label: "A assistente escolhe", tipo: "play" },
];

const PESQUISA_STEPS = () => [
  "Preparando o demonstrativo...",
  "Carregando os seis produtos da escova a vapor...",
  "Separando as imagens prontas para você escolher...",
  "Preparando os três vídeos do produto pet...",
  "Verificando os materiais do fluxo demonstrativo...",
  "Organizando a experiência de edição...",
  "Tudo pronto para escolher o produto!",
];

const FORMATOS = [
  { id: "auto",     label: "Deixar a assistente escolher", rec: true },
  { id: "achadinho", label: "Achadinho viral" },
  { id: "demo",     label: "Demonstração" },
  { id: "oferta",   label: "Oferta rápida" },
  { id: "review",   label: "Review narrado" },
];

const STUDIO_STEPS: { label: string; fx: string; Icon: typeof Search }[] = [
  { label: "Buscando materiais autorizados",   fx: "scan",    Icon: Search },
  { label: "Selecionando as melhores cenas",   fx: "scan",    Icon: Wand2 },
  { label: "Criando novos cortes",             fx: "cut",     Icon: Scissors },
  { label: "Preparando o gancho",              fx: "hook",    Icon: Zap },
  { label: "Criando a narração",               fx: "voice",   Icon: Mic },
  { label: "Adicionando legendas",             fx: "caption", Icon: Captions },
  { label: "Aplicando elementos visuais",      fx: "fx",      Icon: Wand2 },
  { label: "Verificando o áudio",              fx: "voice",   Icon: Mic },
  { label: "Finalizando o vídeo",              fx: "final",   Icon: Check },
];

const LEGENDAS = [
  "Essa escova a vapor deixa o pelo do seu pet limpo e macio em poucos minutos",
  "O cuidado que cães e gatos merecem para um pelo bonito e sem nós",
  "Banho e escovação em casa com muito mais praticidade para você e seu pet",
];
const HASHTAGS = "#pet #pets #cachorro #gato #cuidadopet #tiktokshop";
const HASHTAGS_MALU = "#pet #pets #cachorro #gato #cuidadopet #shopee #afiliadoshopee";

const DEMO_VIDEOS: VideoRow[] = [
  { message_id: "ppet01", nicho: "05 - Pets", link_video: `${R2_EVA}/ppet01.mp4` },
  { message_id: "ppet02", nicho: "05 - Pets", link_video: `${R2_EVA}/ppet02.mp4` },
  { message_id: "ppet03", nicho: "05 - Pets", link_video: `${R2_EVA}/ppet03.mp4` },
];

// ─── Fase 1: Nicho ───────────────────────────────────────────────────────────

function FaseNicho({ nicho, setNicho, onNext, onBack, brandName }: {
  nicho: string; setNicho: (v: string) => void; onNext: () => void; onBack: () => void; brandName: string;
}) {
  const nichos = NICHOS.map(n => n.id === "auto" ? { ...n, label: `A ${brandName} escolhe` } : n);
  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        <TopBar step={0} label="Nicho" onBack={onBack} />
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pb-10">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Escolha do nicho</p>
          <h2 className="font-extrabold text-[1.7rem] leading-[1.15] tracking-tight">
            Qual nicho você<br /><em className="italic" style={{ color: P }}>quer trabalhar?</em>
          </h2>
          <p className="text-foreground/50 text-[12px] mt-3 mb-5">Neste demonstrativo, os mesmos produtos pet aparecem independentemente do nicho escolhido.</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {nichos.map((n, i) => {
              const sel = nicho === n.id;
              return (
                <motion.div key={n.id} onClick={() => setNicho(n.id)}
                  animate={{ rotate: sel ? 0 : [-1.4, 1.4, 1.1, -1.1, 1.3, -1.3, 0.9][i], scale: sel ? 1.04 : 1 }}
                  whileTap={{ scale: 0.93 }}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl py-5 cursor-pointer ${n.id === "auto" ? "col-span-2" : ""}`}
                  style={{
                    background: sel ? P : "#fff",
                    border: sel ? `1.5px solid ${P}` : CARD_EDGE,
                    boxShadow: sel ? "0 12px 26px rgba(122,43,245,0.38)" : "0 2px 8px rgba(22,19,14,0.05)",
                  }}>
                  {sel && (
                    <motion.div className="absolute -top-2.5 -right-2 pointer-events-none"
                      initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 14 }}>
                      <Starburst size={28} color={LIME} spin={false} />
                    </motion.div>
                  )}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: sel ? "rgba(255,255,255,0.16)" : "rgba(122,43,245,0.07)" }}>
                    <NichoIcon tipo={n.tipo} size={27} stroke={sel ? "#fff" : INK} accent={sel ? LIME : P}
                      bg={sel ? "#9350F7" : "#F4EFFE"} />
                  </div>
                  <span className={`text-[12px] font-bold ${sel ? "text-white" : "text-foreground"}`}>{n.label}</span>
                </motion.div>
              );
            })}
          </div>
          <BtnLime onClick={onNext}>Encontrar produtos <ChevronRight className="w-4 h-4" /></BtnLime>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Fase 2: Pesquisa de produtos ────────────────────────────────────────────

function FasePesquisa({ onDone, searchImageUrl, brandName }: { onDone: () => void; searchImageUrl: string; brandName: string }) {
  const steps = useMemo(() => PESQUISA_STEPS(), []);
  const [idx, setIdx] = useState(0);
  const last = steps.length - 1;

  useEffect(() => {
    if (idx > last) { onDone(); return; }
    const t = setTimeout(() => setIdx(i => i + 1), idx === last ? 620 : 740);
    return () => clearTimeout(t);
  }, [idx, last, onDone]);

  const visible = Math.min(idx + 1, steps.length);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-8" style={PAGE_BG}>
      <div className="relative w-full max-w-xs">
        {/* Eva procurando os produtos */}
        <div className="relative flex justify-center pb-2">
          <motion.div className="absolute pointer-events-none" style={{ top: 4 }}
            animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
            <Starburst size={132} color="rgba(185,242,39,0.28)" spin={false} />
          </motion.div>
          <motion.img src={searchImageUrl} alt={`${brandName} pesquisando`} draggable={false}
            className="relative" style={{ width: 148, height: "auto" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: [0, -6, 0] }}
            transition={{ opacity: { duration: 0.5 }, y: { duration: 3.4, repeat: Infinity, ease: "easeInOut" } }} />
        </div>
        <p className="text-foreground/40 text-[10px] font-bold tracking-[0.18em] uppercase text-center mb-5">Pesquisa da {brandName}</p>
        <div className="bg-white rounded-[1.5rem] px-5 py-6 space-y-4" style={{ border: CARD_EDGE, boxShadow: CARD_SHADOW }}>
          {Array.from({ length: visible }).map((_, i) => {
            const isDone = i < idx;
            const isCurrent = i === idx && idx <= last;
            const isFinal = i === last;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: isCurrent ? 1 : 0.45, scale: isCurrent ? 1 : 0.95 }}
                transition={{ duration: 0.4 }} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: isDone || (isFinal && isCurrent) ? LIME : isCurrent ? P : "rgba(22,19,14,0.08)" }}>
                  {(isDone || (isFinal && isCurrent))
                    ? <Check className="w-3 h-3" strokeWidth={3.5} style={{ color: INK }} />
                    : isCurrent ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : null}
                </div>
                <p className={`text-[13px] font-semibold leading-snug ${isCurrent ? "text-foreground" : "text-foreground/45"}`}>{steps[i]}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Fase 3: Escolha do produto ──────────────────────────────────────────────

function FaseProdutos({ produtos, sel, setSel, onNext, onBack }: {
  produtos: ProdutoLite[]; sel: string | null; setSel: (id: string) => void; onNext: () => void; onBack: () => void;
}) {
  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        <TopBar step={1} label="Produto" onBack={onBack} />
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pb-28">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Oportunidades encontradas</p>
          <h2 className="font-extrabold text-[1.7rem] leading-[1.15] tracking-tight">
            Melhores produtos<br /><em className="italic" style={{ color: P }}>para você vender</em>
          </h2>
          <p className="text-foreground/50 text-[12px] mt-3 mb-5">
            Escolha uma das seis imagens da escova a vapor para pets.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {produtos.map((p, i) => {
              const isSel = sel === p.id;
              return (
                <motion.div key={p.id} onClick={() => setSel(p.id)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0, scale: isSel ? 1.02 : 1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ delay: 0.04 * i }}
                  className="relative bg-white rounded-[1.4rem] overflow-hidden cursor-pointer"
                  style={{
                    border: isSel ? `1.5px solid ${P}` : CARD_EDGE,
                    boxShadow: isSel ? "0 12px 28px rgba(122,43,245,0.28)" : "0 4px 12px rgba(22,19,14,0.06)",
                  }}>
                  {isSel && (
                    <motion.div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 16 }}
                      style={{ background: LIME, boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>
                      <Check className="w-4 h-4" strokeWidth={3.5} style={{ color: INK }} />
                    </motion.div>
                  )}
                  <img src={p.img} alt="" className="w-full block" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-5 pt-8 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 0%, #F4EFE6 55%)" }}>
          <div className="max-w-md mx-auto pointer-events-auto">
            <BtnLime onClick={onNext} disabled={!sel}>
              Trabalhar com este produto <ChevronRight className="w-4 h-4" />
            </BtnLime>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fase 4: Verificação da vitrine ──────────────────────────────────────────

function FaseVitrine({ produto, onDone, brandName }: { produto: ProdutoLite; onDone: () => void; brandName: string }) {
  const [etapa, setEtapa] = useState<"verificando" | "capturando" | "ok">("verificando");

  useEffect(() => {
    const t1 = setTimeout(() => setEtapa("capturando"), 1700);
    const t2 = setTimeout(() => setEtapa("ok"), 4100);
    const t3 = setTimeout(onDone, 5700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-8" style={PAGE_BG}>
      <div className="w-full max-w-xs">
        <div className="relative bg-white rounded-[1.5rem] px-5 py-6 text-center" style={{ border: CARD_EDGE, boxShadow: CARD_SHADOW }}>
          {etapa === "ok" && (
            <motion.div className="absolute -top-4 -right-3 pointer-events-none"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260 }}>
              <Starburst size={52} color={LIME} />
            </motion.div>
          )}
          <div className="relative w-[132px] mx-auto mb-4">
            <div className="rounded-xl overflow-hidden" style={{ border: CARD_EDGE }}>
              <img src={produto.img} alt="" className="w-full block" />
            </div>
            <AnimatePresence>
              {etapa === "ok" && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -bottom-2.5 -right-2.5 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: LIME, boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>
                  <Check className="w-4.5 h-4.5" strokeWidth={3.5} style={{ color: INK }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {etapa === "verificando" && (
            <div className="space-y-3">
              <EvaLoader size={34} className="py-0" />
              <p className="text-[13px] font-semibold text-foreground/60">{brandName === "Malu" ? "Verificando o produto na Shopee..." : "Verificando sua vitrine no TikTok Shop..."}</p>
            </div>
          )}
          {etapa === "capturando" && (
            <div className="space-y-3">
              <p className="text-[13px] font-semibold text-foreground">{brandName === "Malu" ? "Capturando seu link de afiliada..." : "Adicionando produto à sua vitrine…"}</p>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(22,19,14,0.08)" }}>
                <motion.div className="h-full rounded-full" style={{ background: P }}
                  initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2.2, ease: "easeInOut" }} />
              </div>
            </div>
          )}
          {etapa === "ok" && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="text-[14px] font-extrabold" style={{ color: brandName === "Malu" ? P : "#4d7c0f" }}>
              {brandName === "Malu" ? "Link de afiliada capturado" : "Produto adicionado com sucesso"}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Fase 5: Configuração dos vídeos ─────────────────────────────────────────

function FaseConfig({ qtd, setQtd, formato, setFormato, onNext, onBack, brandName }: {
  qtd: number; setQtd: (n: number) => void; formato: string; setFormato: (f: string) => void;
  onNext: () => void; onBack: () => void; brandName: string;
}) {
  const formatos = FORMATOS.map(f => f.id === "auto" ? { ...f, label: `Deixar a ${brandName} escolher` } : f);
  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        <TopBar step={2} label="Vídeos" onBack={onBack} />
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pb-10">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Configuração</p>
          <h2 className="font-extrabold text-[1.7rem] leading-[1.15] tracking-tight">
            Quantos vídeos<br /><em className="italic" style={{ color: P }}>vamos criar?</em>
          </h2>
          <p className="text-foreground/50 text-[12px] mt-3">Nesta demonstração, os três vídeos pet são sempre utilizados, independentemente da quantidade selecionada.</p>
          <div className="grid grid-cols-3 gap-3 mt-5 mb-7">
            {[3, 5, 10].map((n, i) => {
              const sel = qtd === n;
              return (
                <motion.div key={n} onClick={() => setQtd(n)}
                  animate={{ rotate: sel ? 0 : [-1, 1.2, -0.8][i], scale: sel ? 1.04 : 1 }}
                  whileTap={{ scale: 0.94 }}
                  className="relative flex flex-col items-center rounded-2xl py-4 cursor-pointer"
                  style={{
                    background: sel ? CARD_DARK : "#fff",
                    border: sel ? "1.5px solid #16130E" : CARD_EDGE,
                    boxShadow: sel ? "0 12px 26px rgba(22,19,14,0.30)" : "0 2px 8px rgba(22,19,14,0.05)",
                  }}>
                  {sel && (
                    <motion.div className="absolute -top-2.5 -right-2 pointer-events-none"
                      initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Starburst size={24} color={LIME} spin={false} />
                    </motion.div>
                  )}
                  <p className="text-[1.6rem] font-extrabold leading-none" style={{ color: sel ? LIME : INK }}>{n}</p>
                  <p className={`text-[10px] font-bold mt-1 ${sel ? "text-white/60" : "text-foreground/45"}`}>vídeos</p>
                </motion.div>
              );
            })}
          </div>

          <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase mb-3">Formato dos vídeos</p>
          <div className="grid grid-cols-2 gap-2.5 mb-7">
            {formatos.map((f) => {
              const sel = formato === f.id;
              return (
                <motion.div key={f.id} onClick={() => setFormato(f.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 cursor-pointer text-center ${f.rec ? "col-span-2" : ""}`}
                  style={{
                    background: sel ? P : "#fff",
                    border: sel ? `1.5px solid ${P}` : CARD_EDGE,
                    boxShadow: sel ? "0 8px 20px rgba(122,43,245,0.32)" : "0 2px 8px rgba(22,19,14,0.05)",
                  }}>
                  {f.rec && (
                    <span className="absolute -top-2.5 right-3 text-[8.5px] font-extrabold px-2 py-[2.5px] rounded-full uppercase tracking-wide"
                      style={{ background: LIME, color: INK }}>
                      Recomendado
                    </span>
                  )}
                  <span className={`text-[12px] font-bold ${sel ? "text-white" : "text-foreground"}`}>{f.label}</span>
                </motion.div>
              );
            })}
          </div>

          <BtnLime onClick={onNext}><Zap className="w-4 h-4" /> Criar meus vídeos</BtnLime>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Fase 6: EVA Studio ──────────────────────────────────────────────────────

function Waveform() {
  return (
    <div className="flex items-end gap-[3px] h-6">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div key={i} className="w-[3px] rounded-full" style={{ background: LIME }}
          animate={{ height: [4 + Math.random() * 6, 10 + Math.random() * 14, 4 + Math.random() * 6] }}
          transition={{ duration: 0.5 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

function FaseStudio({ produto, pool, onDone, editingImageUrl, brandName }: {
  produto: ProdutoLite; pool: VideoRow[]; editingImageUrl: string; brandName: string;
  onDone: (videos: VideoRow[]) => void;
}) {
  const videos = useMemo(() => pool.slice(0, DEMO_VIDEOS.length), [pool]);
  const [vidIdx, setVidIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const doneRef = useRef(false);

  const totalSteps = STUDIO_STEPS.length;
  const current = videos[Math.min(vidIdx, videos.length - 1)];
  const fx = STUDIO_STEPS[Math.min(stepIdx, totalSteps - 1)]?.fx;
  const legenda = LEGENDAS[vidIdx % LEGENDAS.length];

  useEffect(() => {
    if (doneRef.current) return;
    const fast = vidIdx > 0;
    if (stepIdx >= totalSteps) {
      if (vidIdx + 1 >= videos.length) {
        doneRef.current = true;
        const t = setTimeout(() => onDone(videos), 900);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => { setVidIdx(v => v + 1); setStepIdx(0); }, 420);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStepIdx(s => s + 1), fast ? 250 : 480);
    return () => clearTimeout(t);
  }, [stepIdx, vidIdx, totalSteps, videos, onDone]);

  const pct = Math.min(100, Math.round((stepIdx / totalSteps) * 100));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto px-5 pt-7 pb-12">
        {/* Header com a Eva editando */}
        <div className="flex items-end justify-between gap-3 mb-4">
          <div className="pb-1">
            <div className="flex items-center gap-2">
              <Starburst size={22} color={LIME} />
              <span className="font-extrabold text-[17px] tracking-tight text-foreground">{brandName} Studio</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white rounded-full pl-1 pr-3 py-1 mt-2.5 w-fit"
              style={{ border: CARD_EDGE }}>
              <img src={produto.img} alt="" className="w-5 h-5 rounded-full object-cover" style={{ objectPosition: "top" }} />
              <span className="text-[9.5px] font-bold text-foreground/60">Produto vinculado</span>
            </div>
          </div>
          <motion.img src={editingImageUrl} alt={`${brandName} editando`} draggable={false}
            className="shrink-0 -mb-1" style={{ width: 96, height: "auto" }}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0, y: [0, -4, 0] }}
            transition={{ opacity: { duration: 0.4 }, x: { duration: 0.4 }, y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } }} />
        </div>

        <div className="flex gap-3.5">
          {/* Prévia do vídeo: monitor de edição */}
          <div className="relative shrink-0 rounded-[1.4rem] overflow-hidden"
            style={{ width: 172, height: 300, background: "#0A0A0A", boxShadow: "0 16px 36px rgba(22,19,14,0.30)" }}>
            {current?.link_video && (
              <video key={current.message_id} src={current.link_video} autoPlay muted loop playsInline
                onCanPlay={(e) => { void (e.currentTarget as HTMLVideoElement).play().catch(() => {}); }}
                className="w-full h-full object-cover" />
            )}

            {/* HUD: status de edição + timecode */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1 rounded-md px-1.5 py-[3px]"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
                <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: LIME }}
                  animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.1, repeat: Infinity }} />
                <span className="text-[7.5px] font-extrabold tracking-[0.1em] text-white uppercase">Editando</span>
              </div>
              <span className="text-[7.5px] font-bold text-white/70 tabular-nums rounded-md px-1.5 py-[3px]"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                00:{String(4 + stepIdx * 3).padStart(2, "0")}
              </span>
            </div>

            {/* Cantoneiras de enquadramento */}
            <div className="absolute inset-3 pointer-events-none opacity-45">
              {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2",
                "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map(c => (
                <div key={c} className={`absolute w-3.5 h-3.5 border-white ${c}`} style={{ borderRadius: 1 }} />
              ))}
            </div>

            {/* Análise de cena */}
            {fx === "scan" && (
              <>
                <motion.div className="absolute left-0 right-0 h-[2px] pointer-events-none"
                  style={{ background: LIME, boxShadow: `0 0 16px ${LIME}` }}
                  animate={{ top: ["6%", "92%", "6%"] }}
                  transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="absolute pointer-events-none rounded-sm"
                  style={{ border: `1.5px solid ${LIME}`, left: "18%", top: "26%", width: "58%", height: "34%" }}
                  animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </>
            )}

            {/* Cortes na timeline */}
            {fx === "cut" && (
              <div className="absolute bottom-9 left-2.5 right-2.5 pointer-events-none">
                <div className="flex gap-[3px] mb-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <motion.div key={i} className="flex-1 h-3 rounded-[2px]"
                      style={{ background: "rgba(255,255,255,0.28)" }}
                      animate={{ background: ["rgba(255,255,255,0.28)", LIME, "rgba(255,255,255,0.28)"] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.14 }} />
                  ))}
                </div>
                <motion.div className="w-[2px] h-4 -mt-4" style={{ background: "#fff" }}
                  animate={{ marginLeft: ["2%", "94%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} />
              </div>
            )}

            {/* Gancho de abertura */}
            {fx === "hook" && (
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="absolute top-11 left-3 right-3 text-center pointer-events-none">
                <span className="inline-block text-[11px] font-extrabold leading-tight px-2 py-1 rounded-md"
                  style={{ background: LIME, color: INK, transform: "rotate(-2deg)" }}>
                  NÃO PULA ESSA PARTE
                </span>
              </motion.div>
            )}

            {/* Narração e áudio */}
            {fx === "voice" && (
              <div className="absolute bottom-9 left-0 right-0 flex flex-col items-center gap-1.5 pointer-events-none">
                <Waveform />
                <span className="text-[7.5px] font-bold text-white/60 tracking-[0.1em] uppercase">Voz da {brandName}</span>
              </div>
            )}

            {/* Legendas palavra a palavra */}
            {fx === "caption" && (
              <div className="absolute bottom-10 left-3 right-3 text-center pointer-events-none">
                <div className="inline-flex flex-wrap justify-center gap-x-1 gap-y-0.5">
                  {legenda.split(" ").slice(0, 7).map((w, i) => (
                    <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.13 }}
                      className="text-[10px] font-extrabold text-white leading-tight px-1 rounded"
                      style={{ background: "rgba(0,0,0,0.6)", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                      {w}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Elementos visuais */}
            {fx === "fx" && (
              <>
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-16 right-3 pointer-events-none">
                  <Starburst size={26} color={LIME} />
                </motion.div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.15, 1] }}
                  transition={{ delay: 0.15 }}
                  className="absolute top-28 left-3 rounded-full pointer-events-none"
                  style={{ width: 22, height: 22, border: `2.5px solid ${LIME}` }} />
                <motion.div initial={{ width: 0 }} animate={{ width: 46 }} transition={{ delay: 0.25 }}
                  className="absolute h-[3px] rounded-full pointer-events-none"
                  style={{ background: "#fff", top: 148, right: 14 }} />
              </>
            )}

            {/* Renderização final */}
            {fx === "final" && (
              <div className="absolute inset-x-3 bottom-9 pointer-events-none">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[7.5px] font-extrabold tracking-[0.1em] text-white uppercase">Renderizando</span>
                  <span className="text-[7.5px] font-bold text-white/60">1080p</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.22)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: LIME }}
                    initial={{ width: "8%" }} animate={{ width: "100%" }} transition={{ duration: 0.65 }} />
                </div>
              </div>
            )}

            {/* Timeline da edição (sempre visível) */}
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-5 pointer-events-none"
              style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.75))" }}>
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.25)" }}>
                <motion.div className="h-full rounded-full" style={{ background: LIME }}
                  animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
              </div>
            </div>
          </div>

          {/* Etapas do vídeo atual */}
          <div className="flex-1 bg-white rounded-2xl px-3.5 py-4 self-start" style={{ border: CARD_EDGE, boxShadow: "0 4px 14px rgba(22,19,14,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9.5px] font-extrabold tracking-[0.1em] uppercase text-foreground/45">Vídeo {Math.min(vidIdx + 1, videos.length)}</p>
              <span className="text-[9.5px] font-extrabold" style={{ color: P }}>{pct}%</span>
            </div>
            <div className="space-y-2">
              {STUDIO_STEPS.map((s, i) => {
                const done = i < stepIdx;
                const curr = i === stepIdx;
                return (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: done ? LIME : curr ? P : "rgba(22,19,14,0.07)" }}>
                      {done ? <Check className="w-2.5 h-2.5" strokeWidth={4} style={{ color: INK }} />
                        : curr ? <Loader2 className="w-2.5 h-2.5 text-white animate-spin" /> : null}
                    </div>
                    <p className={`text-[9.5px] leading-tight font-semibold ${done ? "text-foreground/40" : curr ? "text-foreground" : "text-foreground/30"}`}>
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fila de criação */}
        <div className="mt-4 bg-white rounded-2xl px-4 py-4" style={{ border: CARD_EDGE, boxShadow: "0 4px 14px rgba(22,19,14,0.06)" }}>
          <p className="text-[9.5px] font-extrabold tracking-[0.1em] uppercase text-foreground/45 mb-3">Fila de criação</p>
          <div className="space-y-2.5">
            {videos.map((v, i) => {
              const pronto = i < vidIdx || (i === vidIdx && stepIdx >= totalSteps);
              const criando = i === vidIdx && stepIdx < totalSteps;
              return (
                <div key={v.message_id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: pronto ? "rgba(185,242,39,0.30)" : criando ? "rgba(122,43,245,0.10)" : "rgba(22,19,14,0.05)" }}>
                    {pronto ? <Check className="w-4 h-4" strokeWidth={3} style={{ color: "#4d7c0f" }} />
                      : criando ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: P }} />
                      : <Play className="w-3.5 h-3.5 text-foreground/25" />}
                  </div>
                  <p className={`text-[12px] font-bold flex-1 ${pronto || criando ? "text-foreground" : "text-foreground/35"}`}>
                    Vídeo {i + 1}
                  </p>
                  <span className="text-[10px] font-bold"
                    style={{ color: pronto ? "#4d7c0f" : criando ? P : "rgba(22,19,14,0.30)" }}>
                    {pronto ? "pronto" : criando ? `criando ${pct}%` : "aguardando"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Fase 7: Revisão e postagem ──────────────────────────────────────────────

function FaseRevisao({ produto, videos, extras, onBack, onTrocar, brandName, channels }: {
  produto: ProdutoLite; videos: VideoRow[]; extras: VideoRow[];
  onBack: () => void; onTrocar: () => void; brandName: string; channels: BrandTheme["channels"];
}) {
  const [lista, setLista] = useState(videos);
  const [regen, setRegen] = useState<{ i: number; label: string } | null>(null);
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [postando, setPostando] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState(() => channels.map(channel => channel.name));
  const extraRef = useRef(0);

  const dur = useMemo(() => lista.map((_, i) => [17, 21, 33][i] ?? 20), [lista]);

  function refazer(i: number, label: string) {
    if (regen !== null) return;
    setRegen({ i, label });
    setTimeout(() => {
      const next = extras[extraRef.current % Math.max(1, extras.length)];
      extraRef.current++;
      if (next) setLista(l => l.map((v, j) => (j === i ? next : v)));
      setRegen(null);
    }, 1300);
  }

  function toggleChannel(name: string) {
    setSelectedChannels(current => current.includes(name)
      ? current.filter(channel => channel !== name)
      : [...current, name]);
  }

  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        <TopBar step={3} label="Revisão" onBack={onBack} />
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pb-4">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Vídeos prontos</p>
          <h2 className="font-extrabold text-[1.7rem] leading-[1.15] tracking-tight">
            Revise os vídeos<br /><em className="italic" style={{ color: P }}>criados pela {brandName}</em>
          </h2>
          <p className="text-foreground/50 text-[12px] mt-3 mb-5">
            Tudo pronto. Aprove para a {brandName} publicar nos seus canais com o produto vinculado.
          </p>

          <div className="space-y-3.5">
            {lista.map((v, i) => (
              <motion.div key={`${v.message_id}-${i}`}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                className="bg-white rounded-2xl p-3.5" style={{ border: CARD_EDGE, boxShadow: "0 4px 14px rgba(22,19,14,0.07)" }}>
                <div className="flex gap-3">
                  {/* Prévia */}
                  <div className="relative w-[86px] h-[150px] rounded-xl overflow-hidden shrink-0 cursor-pointer"
                    style={{ background: "#0A0A0A" }}
                    onClick={() => v.link_video && setModalUrl(v.link_video)}>
                    {regen?.i === i ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: LIME }} />
                        <span className="text-[8px] font-bold text-white/60 text-center px-1">{regen.label}</span>
                      </div>
                    ) : (
                      <>
                        {v.link_video && (
                          <video key={v.message_id} src={v.link_video} muted playsInline preload="metadata"
                            onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).currentTime = 0.1; }}
                            className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.18)" }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
                            <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
                          </div>
                        </div>
                        <span className="absolute top-1.5 right-1.5 text-[8.5px] font-extrabold text-white bg-black/55 px-1.5 py-0.5 rounded-full">
                          {dur[i]}s
                        </span>
                      </>
                    )}
                  </div>
                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] font-bold text-foreground leading-snug line-clamp-2">
                      {LEGENDAS[i % LEGENDAS.length]}
                    </p>
                    <p className="text-[10px] font-semibold mt-1 line-clamp-1" style={{ color: P }}>{brandName === "Malu" ? HASHTAGS_MALU : HASHTAGS}</p>
                    <div className="flex items-start gap-1.5 mt-2.5 rounded-lg px-2 py-1.5"
                      style={{ background: "rgba(77,124,15,0.08)" }}>
                      <Check className="w-3 h-3 shrink-0 mt-[1px]" strokeWidth={3.5} style={{ color: "#4d7c0f" }} />
                      <p className="text-[9px] font-semibold leading-snug" style={{ color: "#4d7c0f" }}>
                        Materiais verificados: sem direitos autorais e liberados para publicação.
                      </p>
                    </div>
                    <div className="flex gap-1.5 mt-2.5">
                      <button onClick={() => refazer(i, "gerando...")}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[9.5px] font-bold active:scale-95 transition-transform"
                        style={{ background: "rgba(22,19,14,0.06)", color: INK }}>
                        <RefreshCw className="w-3 h-3" /> Nova versão
                      </button>
                      <button onClick={() => refazer(i, "novo estilo...")}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[9.5px] font-bold active:scale-95 transition-transform"
                        style={{ background: "rgba(122,43,245,0.08)", color: P }}>
                        <Shuffle className="w-3 h-3" /> Trocar estilo
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mx-5 mt-5 mb-32 rounded-2xl bg-white px-4 py-4" style={{ border: CARD_EDGE, boxShadow: "0 4px 14px rgba(22,19,14,0.07)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-extrabold tracking-[0.14em] uppercase text-foreground/45">Onde publicar?</p>
            <span className="text-[10px] font-semibold text-foreground/40">Selecione os canais</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {channels.map(channel => {
              const active = selectedChannels.includes(channel.name);
              return (
                <button key={channel.name} onClick={() => toggleChannel(channel.name)}
                  className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 transition-all active:scale-95"
                  style={{ background: active ? "rgba(249,115,22,0.10)" : "rgba(22,19,14,0.035)", border: active ? `1.5px solid ${P}` : CARD_EDGE }}>
                  <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white">
                    <img src={channel.logoUrl} alt={channel.name} className="w-5 h-5" draggable={false} />
                    {active && <span className="absolute -right-1 -top-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: P }}><Check className="w-2.5 h-2.5 text-white" strokeWidth={4} /></span>}
                  </span>
                  <span className={`text-[10px] font-bold ${active ? "text-foreground" : "text-foreground/45"}`}>{channel.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-5 pb-5 pt-8 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 0%, #F4EFE6 55%)" }}>
          <div className="max-w-md mx-auto pointer-events-auto">
            <BtnLime onClick={() => setPostando(true)} disabled={selectedChannels.length === 0}>
              <ChannelDots channels={channels} selected={selectedChannels} size={13} /> Aprovar e postar
            </BtnLime>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalUrl && <VideoModal url={modalUrl} onClose={() => setModalUrl(null)} />}
        {postando && <PopupTikTok videos={lista} onDone={onTrocar} brandName={brandName}
          channels={channels} selectedChannels={selectedChannels} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Popup do TikTok (postagem) ──────────────────────────────────────────────

const HORARIOS_PICO = [
  { hora: "19:30", dia: "hoje",    motivo: "pico de audiência do seu nicho" },
  { hora: "12:15", dia: "amanhã",  motivo: "horário de almoço, alta rolagem" },
  { hora: "20:45", dia: "amanhã",  motivo: "maior taxa de conversão da semana" },
  { hora: "18:00", dia: "quinta",  motivo: "público mais ativo da sua base" },
  { hora: "21:10", dia: "quinta",  motivo: "janela com menos concorrência" },
  { hora: "13:00", dia: "sexta",   motivo: "pico de compras por impulso" },
  { hora: "19:00", dia: "sexta",   motivo: "maior alcance orgânico previsto" },
  { hora: "11:30", dia: "sábado",  motivo: "audiência de fim de semana" },
];

const ANALISE_HORARIOS = [
  "Lendo o histórico de audiência do perfil",
  "Cruzando com os picos do seu nicho",
  "Evitando concorrência com criadores grandes",
  "Distribuindo os vídeos nos melhores horários",
];

function PopupTikTok({ videos, onDone, brandName, channels, selectedChannels }: {
  videos: VideoRow[]; onDone: () => void; brandName: string;
  channels: BrandTheme["channels"]; selectedChannels: string[];
}) {
  const total = videos.length;
  const publicarAgora = Math.min(2, total);
  const isMalu = brandName === "Malu";
  const postAccent = isMalu ? "#F97316" : LIME;
  const postAccentSoft = isMalu ? "rgba(249,115,22,0.18)" : "rgba(185,242,39,0.18)";
  const postAccentWash = isMalu ? "rgba(249,115,22,0.12)" : "rgba(185,242,39,0.10)";
  const postAction = isMalu ? "#EE4D2D" : TIKTOK_RED;
  const scheduledAccent = isMalu ? "#FFB067" : "#B388FF";
  // fase 0: analisando horários | fase 1: publicando | fase 2: concluído
  const [fase, setFase] = useState(0);
  const [analiseIdx, setAnaliseIdx] = useState(0);
  const [postados, setPostados] = useState(0);

  const agendados = useMemo(
    () => videos.slice(publicarAgora).map((_, i) => HORARIOS_PICO[i % HORARIOS_PICO.length]),
    [videos, publicarAgora]);

  useEffect(() => {
    if (fase !== 0) return;
    if (analiseIdx >= ANALISE_HORARIOS.length) {
      const t = setTimeout(() => setFase(1), 420);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setAnaliseIdx(i => i + 1), 620);
    return () => clearTimeout(t);
  }, [fase, analiseIdx]);

  useEffect(() => {
    if (fase !== 1) return;
    if (postados >= publicarAgora) {
      const t = setTimeout(() => setFase(2), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPostados(p => p + 1), 1200);
    return () => clearTimeout(t);
  }, [fase, postados, publicarAgora]);

  const completo = fase === 2;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.78)" }}>
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="w-full max-w-md rounded-t-[1.75rem] sm:rounded-[1.75rem] px-6 pt-7 pb-8 max-h-[92vh] overflow-y-auto"
        style={{ background: isMalu ? "#111114" : "#0B0B0F" }}>
        {/* Cabeçalho estilo TikTok */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-auto min-w-11 h-11 px-1.5 rounded-2xl flex items-center justify-center"
            style={{ background: "#000", border: "1px solid rgba(255,255,255,0.12)" }}>
            <ChannelDots channels={channels} selected={selectedChannels} size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-extrabold text-[15px] leading-tight">
              {fase === 0 ? "Escolhendo os melhores horários"
                : fase === 1 ? (brandName === "Malu" ? "Publicando nos seus canais" : "Publicando no TikTok")
                : (brandName === "Malu" ? "Tudo pronto nos seus canais" : "Tudo pronto no seu TikTok")}
            </p>
            <p className="text-white/45 text-[11px]">{brandName === "Malu" ? "Shopee · TikTok · Instagram" : "@lumacedo.ofc · vitrine conectada"}</p>
          </div>
          {!completo && <Loader2 className="w-5 h-5 animate-spin shrink-0" style={{ color: postAction }} />}
        </div>

        {/* Fase 0: análise de horários */}
        {fase === 0 && (
          <div className="space-y-3 mb-2">
            {ANALISE_HORARIOS.map((t, i) => {
              const done = i < analiseIdx;
              const curr = i === analiseIdx;
              if (i > analiseIdx) return null;
              return (
                <motion.div key={t} initial={{ opacity: 0, y: 8 }} animate={{ opacity: curr ? 1 : 0.5, y: 0 }}
                  className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: done ? postAccentSoft : "rgba(255,255,255,0.08)" }}>
                    {done ? <Check className="w-3 h-3" strokeWidth={3.5} style={{ color: postAccent }} />
                      : <Loader2 className="w-3 h-3 text-white/70 animate-spin" />}
                  </div>
                  <p className={`text-[12.5px] font-semibold ${curr ? "text-white" : "text-white/45"}`}>{t}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Fases 1 e 2: publicação e agendamento */}
        {fase > 0 && (
          <>
            <p className="text-[9.5px] font-extrabold tracking-[0.14em] uppercase text-white/35 mb-2.5">
              Publicando agora
            </p>
            <div className="space-y-2.5 mb-5">
              {videos.slice(0, publicarAgora).map((v, i) => {
                const feito = i < postados;
                const agora = i === postados && fase === 1;
                return (
                  <div key={`now-${v.message_id}-${i}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: feito ? postAccentSoft : "rgba(255,255,255,0.07)" }}>
                      {feito ? <Check className="w-3.5 h-3.5" strokeWidth={3.5} style={{ color: postAccent }} />
                        : agora ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: postAction }} />
                        : <Play className="w-3 h-3 text-white/30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold text-white">Vídeo {i + 1}</p>
                      <p className="text-[10px] text-white/40">
                        {feito ? "publicado nos canais selecionados" : agora ? `enviando para ${brandName === "Malu" ? "seus canais" : "o TikTok"}` : "aguardando"}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold shrink-0"
                      style={{ color: feito ? postAccent : agora ? postAction : "rgba(255,255,255,0.3)" }}>
                      {feito ? "no ar" : agora ? "enviando" : "na fila"}
                    </span>
                  </div>
                );
              })}
            </div>

            {agendados.length > 0 && (
              <>
                <p className="text-[9.5px] font-extrabold tracking-[0.14em] uppercase text-white/35 mb-2.5">
                  Programados pela {brandName}
                </p>
                <div className="space-y-2.5 mb-5">
                  {agendados.map((h, i) => {
                    const idx = publicarAgora + i;
                    const liberado = fase === 2;
                    return (
                      <motion.div key={`sch-${idx}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: liberado ? 1 : 0.45, y: 0 }}
                        transition={{ delay: liberado ? 0.1 * i : 0 }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: liberado ? (isMalu ? "rgba(249,115,22,0.18)" : "rgba(122,43,245,0.25)") : "rgba(255,255,255,0.07)" }}>
                          <Clock className="w-3.5 h-3.5" style={{ color: liberado ? scheduledAccent : "rgba(255,255,255,0.3)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-bold text-white">Vídeo {idx + 1}</p>
                          <p className="text-[10px] text-white/40 truncate">{h.motivo}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[11.5px] font-extrabold" style={{ color: scheduledAccent }}>{h.hora}</p>
                          <p className="text-[9px] text-white/35">{h.dia}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {completo ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-xl px-3.5 py-3 mb-4" style={{ background: postAccentWash }}>
              <p className="text-[11.5px] font-semibold leading-snug" style={{ color: postAccent }}>
                {publicarAgora === 1 ? "1 vídeo já está no ar" : `${publicarAgora} vídeos já estão no ar`}
                {agendados.length > 0 && (agendados.length === 1
                  ? " e 1 vai ao ar sozinho no melhor horário."
                  : ` e os outros ${agendados.length} vão ao ar sozinhos nos horários de maior alcance.`)}
              </p>
            </div>
            <button onClick={onDone}
              className="w-full flex items-center justify-center gap-2 font-bold py-[14px] rounded-2xl text-sm active:scale-[0.98] transition-transform"
              style={{ background: postAccent, color: INK }}>
              <Check className="w-4 h-4" strokeWidth={3} /> Concluir
            </button>
          </motion.div>
        ) : (
          <p className="text-center text-white/35 text-[11px] pt-1">
            {fase === 0
              ? `A ${brandName} está calculando quando cada vídeo rende mais`
              : (isMalu ? "Publicando com o link de afiliada selecionado" : "Publicando com o produto vinculado à sua vitrine")}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Raiz do fluxo ───────────────────────────────────────────────────────────

// ─── Planejador de rotina ────────────────────────────────────────────────────

interface DatabaseNiche { nicho: string; total: number; }
interface RoutineVideo {
  id: string;
  url: string;
  niche: string;
  caption: string;
  hashtags: string;
  scheduled_at: string;
}
interface SavedRoutine {
  id: string;
  brand: string;
  niche: string;
  niche_label: string;
  created_at: string;
  expires_at: string;
  videos: RoutineVideo[];
}
interface DailyRoutineCount { date: string; count: number; }

type PlannerPhase = "saved" | "niche" | "quantity" | "searching" | "result";

const EXCLUDED_NICHE = /alimenta|comida/i;
const ROUTINE_DURATION_MS = 12 * 60 * 60 * 1000;
const CAPTIONS_BY_NICHE: Record<string, string[]> = {
  moda: [
    "Esse achadinho deixou meu look muito mais prático e bonito.",
    "Uma escolha versátil para usar todos os dias e gastar menos.",
    "Se você gosta de estilo sem complicação, olha esse produto.",
  ],
  casa: [
    "Pequena mudança em casa que faz uma diferença enorme na rotina.",
    "Um achadinho prático para deixar sua casa mais organizada.",
    "Daqueles produtos que facilitam o dia e ainda deixam tudo bonito.",
  ],
  organiz: [
    "Depois que comecei a usar isso, minha rotina ficou muito mais simples.",
    "Achadinho para quem ama organização sem gastar muito.",
    "Uma solução simples que ajuda a deixar tudo no lugar.",
  ],
  matern: [
    "Item prático que pode facilitar muito a rotina das famílias.",
    "Um achadinho pensado para deixar os cuidados do dia a dia mais leves.",
    "Quem tem criança em casa vai entender a praticidade desse produto.",
  ],
  pet: [
    "Um cuidado simples para deixar seu pet ainda mais confortável no dia a dia.",
    "Achadinho que une praticidade e carinho para quem tem pet em casa.",
    "Seu pet merece uma rotina de cuidado muito mais fácil.",
  ],
  eletro: [
    "Tecnologia prática para resolver pequenas tarefas do dia a dia.",
    "Um achadinho inteligente que vale conhecer antes de comprar outro igual.",
    "Daqueles itens que parecem simples, mas ajudam muito na rotina.",
  ],
  auto: [
    "Um item útil para deixar os cuidados com o carro bem mais práticos.",
    "Achadinho para quem gosta de manter tudo organizado e seguro no carro.",
    "Pequeno detalhe que faz diferença na rotina de quem dirige.",
  ],
  papel: [
    "Uma ideia criativa para deixar seus projetos ainda mais bonitos.",
    "Achadinho para quem ama papelaria, organização e criatividade.",
    "Um item simples que deixa os detalhes do dia a dia mais especiais.",
  ],
  fitness: [
    "Um aliado prático para tornar sua rotina de treino ainda mais consistente.",
    "Achadinho para quem quer cuidar do corpo sem complicar a rotina.",
    "Pequena escolha que ajuda você a manter o foco no bem-estar.",
  ],
  virais: [
    "Você também já viu esse achadinho aparecendo por todo lado?",
    "Um produto que está chamando atenção pela praticidade.",
    "Olha por que esse achadinho está conquistando tanta gente.",
  ],
};
const HASHTAGS_BY_NICHE: Record<string, string> = {
  moda: "#moda #beleza #estilo #achadinhos #comprinhas #tiktokshop",
  casa: "#casa #decoracao #casapratica #achadinhos #utilidades #tiktokshop",
  organiz: "#organizacao #casorganizada #utilidades #achadinhos #rotina",
  matern: "#maternidade #maedeprimeiraviagem #infantil #achadinhos #familia",
  pet: "#pet #pets #cachorro #gato #cuidadopet #achadinhos",
  eletro: "#tecnologia #eletronicos #gadget #achadinhos #utilidades",
  auto: "#carro #automotivo #acessoriosparacarro #achadinhos #motorista",
  papel: "#papelaria #artesanato #criatividade #organizacao #achadinhos",
  fitness: "#fitness #treino #bemestar #saude #rotinafitness #achadinhos",
  virais: "#viral #achadinhos #produtoviral #dicas #comprinhas",
};

function nicheKey(niche: string) {
  const value = niche.toLowerCase();
  if (/moda|beleza|estilo/.test(value)) return "moda";
  if (/casa|cozinha|decora/.test(value)) return "casa";
  if (/organiz|limpeza|utilidade/.test(value)) return "organiz";
  if (/matern|infantil|beb[eê]/.test(value)) return "matern";
  if (/pet|animal/.test(value)) return "pet";
  if (/eletr|tecnolog/.test(value)) return "eletro";
  if (/autom|ferrament|seguran/.test(value)) return "auto";
  if (/papel|artesan|personaliz/.test(value)) return "papel";
  if (/fitness|esporte|praia|sa[uú]de|bem-estar/.test(value)) return "fitness";
  return "virais";
}

function nicheLabel(niche: string) {
  return niche.replace(/^\d+\s*-\s*/, "").replace(/,\s*/g, " e ");
}

function nicheIcon(niche: string): NichoTipo {
  const key = nicheKey(niche);
  return ({ moda: "camiseta", casa: "panela", organiz: "caixa", matern: "mamadeira", pet: "pata", eletro: "celular", auto: "carro", papel: "lapis", fitness: "halter", virais: "play" } as Record<string, NichoTipo>)[key];
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function activeRoutines(value: unknown): SavedRoutine[] {
  if (!Array.isArray(value)) return [];
  const now = Date.now();
  return value.reduce<SavedRoutine[]>((routines, routine) => {
    if (!routine || typeof routine !== "object") return routines;
    const candidate = routine as SavedRoutine;
    const createdAt = new Date(candidate.created_at).getTime();
    const storedExpiry = new Date(candidate.expires_at).getTime();
    const cappedExpiry = Number.isFinite(createdAt) ? Math.min(storedExpiry, createdAt + ROUTINE_DURATION_MS) : storedExpiry;
    if (!Number.isFinite(cappedExpiry) || cappedExpiry <= now || !Array.isArray(candidate.videos)) return routines;
    routines.push({ ...candidate, expires_at: new Date(cappedExpiry).toISOString() });
    return routines;
  }, []);
}

function formatSchedule(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const prefix = date.toDateString() === today.toDateString() ? "Hoje" : date.toDateString() === tomorrow.toDateString() ? "Amanhã" : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return `${prefix}, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatBlockAt(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function RoutineTopBar({ step, label, onBack }: { step: number; label: string; onBack: () => void }) {
  return (
    <div className="px-5 pt-7 pb-5">
      <div className="flex items-center justify-between mb-3">
        <button type="button" className="flex items-center gap-1.5 text-foreground/50" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" /><span className="text-[11px] font-bold">Voltar</span>
        </button>
        <span className="text-[11px] font-bold" style={{ color: P }}>{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map(index => <div key={index} className="h-1.5 flex-1 rounded-full" style={{ background: index <= step ? (index === step ? P : LIME) : "rgba(22,19,14,0.1)" }} />)}
      </div>
    </div>
  );
}

function RoutineNicheStep({ niches, selected, onSelect, onNext, onBack, brandName, loading, error }: {
  niches: DatabaseNiche[]; selected: string; onSelect: (value: string) => void; onNext: () => void; onBack: () => void; brandName: string; loading: boolean; error: string | null;
}) {
  return <div className="min-h-screen" style={PAGE_BG}><div className="max-w-md mx-auto">
    <RoutineTopBar step={0} label="Nicho" onBack={onBack} />
    <div className="px-5 pb-10">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Sua rotina de conteúdo</p>
      <h1 className="text-[1.7rem] font-extrabold leading-tight">Qual nicho você<br /><em className="italic" style={{ color: P }}>quer trabalhar?</em></h1>
      <p className="text-[12px] leading-relaxed text-foreground/55 mt-3 mb-5">Escolha um nicho para receber vídeos reais, legenda, hashtags e sugestões de horário.</p>
      {loading ? <div className="py-14"><EvaLoader label="Carregando nichos..." /></div> : error ? <div className="rounded-2xl bg-white p-5 text-center" style={{ border: CARD_EDGE }}><p className="text-[12px] text-foreground/60">{error}</p></div> : <>
        <button type="button" onClick={() => onSelect("auto")} className="w-full rounded-2xl p-4 flex items-center gap-3 mb-3 text-left transition-all" style={{ background: selected === "auto" ? P : CARD_DARK, color: "#fff", boxShadow: selected === "auto" ? "0 12px 26px rgba(122,43,245,.35)" : undefined }}>
          <span className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center"><NichoIcon tipo="play" size={25} stroke="#fff" accent={LIME} bg="transparent" /></span>
          <span><b className="block text-[13px]">A {brandName} escolhe</b><span className="text-[10.5px] text-white/65">Um nicho aleatório com vídeos disponíveis</span></span>
        </button>
        <div className="grid grid-cols-2 gap-3">
          {niches.map((niche, index) => { const active = selected === niche.nicho; return <motion.button type="button" key={niche.nicho} onClick={() => onSelect(niche.nicho)} whileTap={{ scale: .96 }} className="rounded-2xl p-4 text-left" style={{ background: active ? P : "#fff", color: active ? "#fff" : INK, border: active ? `1.5px solid ${P}` : CARD_EDGE, boxShadow: active ? "0 10px 22px rgba(122,43,245,.28)" : "0 2px 8px rgba(22,19,14,.05)" }}>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: active ? "rgba(255,255,255,.16)" : "rgba(122,43,245,.08)" }}><NichoIcon tipo={nicheIcon(niche.nicho)} size={23} stroke={active ? "#fff" : INK} accent={active ? LIME : P} bg="transparent" /></span>
            <b className="block text-[11px] leading-snug">{nicheLabel(niche.nicho)}</b>
          </motion.button>; })}
        </div>
      </>}
      {!loading && !error && <div className="pt-6"><BtnLime onClick={onNext} disabled={!selected}>Escolher quantidade <ChevronRight className="w-4 h-4" /></BtnLime></div>}
    </div>
  </div></div>;
}

function RoutineQuantityStep({ quantity, onSelect, onNext, onBack }: { quantity: number; onSelect: (quantity: number) => void; onNext: () => void; onBack: () => void }) {
  return <div className="min-h-screen" style={PAGE_BG}><div className="max-w-md mx-auto"><RoutineTopBar step={1} label="Vídeos" onBack={onBack} /><div className="px-5 pb-10">
    <p className="text-[10px] font-bold tracking-[.18em] text-foreground/40 uppercase mb-3">Planejamento</p><h1 className="text-[1.7rem] font-extrabold leading-tight">Quantos vídeos você<br /><em className="italic" style={{ color: P }}>quer planejar?</em></h1>
    <p className="text-[12px] text-foreground/55 mt-3 mb-6">Você receberá vídeos prontos para baixar, com a mesma legenda e hashtags do nicho escolhido.</p>
    <div className="grid grid-cols-2 gap-3 mb-7">{[3, 5, 7, 10].map(value => { const active = quantity === value; return <button type="button" key={value} onClick={() => onSelect(value)} className="rounded-2xl py-5 transition-all" style={{ background: active ? CARD_DARK : "#fff", border: active ? `1.5px solid ${CARD_DARK}` : CARD_EDGE, boxShadow: active ? "0 12px 24px rgba(22,19,14,.26)" : "0 2px 8px rgba(22,19,14,.05)" }}><strong className="block text-[1.65rem] leading-none" style={{ color: active ? LIME : INK }}>{value}</strong><span className={active ? "text-white/60 text-[10px] font-bold" : "text-foreground/45 text-[10px] font-bold"}>vídeos</span></button>; })}</div>
    <BtnLime onClick={onNext}><Search className="w-4 h-4" /> Escolher os melhores vídeos</BtnLime>
  </div></div></div>;
}

function RoutineSearching({ brandName, imageUrl, label }: { brandName: string; imageUrl: string; label: string }) {
  const messages = ["Lendo os vídeos disponíveis no seu nicho", "Selecionando conteúdos com potencial", "Preparando legenda e hashtags", "Montando seus melhores horários"];
  const [step, setStep] = useState(0);
  useEffect(() => { if (step >= messages.length - 1) return; const timer = window.setTimeout(() => setStep(current => current + 1), 650); return () => window.clearTimeout(timer); }, [step, messages.length]);
  return <div className="min-h-screen flex items-center justify-center px-7" style={PAGE_BG}><div className="w-full max-w-xs text-center"><div className="relative h-44 flex items-end justify-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 28, ease: "linear", repeat: Infinity }} className="absolute top-2"><Starburst size={130} color="rgba(185,242,39,.3)" /></motion.div><motion.img src={imageUrl} alt={brandName} className="relative w-36" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} /></div><p className="text-[10px] uppercase tracking-[.18em] font-bold text-foreground/40 mb-4">{brandName} trabalhando</p><h1 className="font-extrabold text-[1.55rem] leading-tight">Escolhendo os melhores<br /><em className="italic" style={{ color: P }}>vídeos para {label}</em></h1><div className="mt-6 bg-white rounded-2xl p-5 text-left space-y-3" style={{ border: CARD_EDGE, boxShadow: CARD_SHADOW }}>{messages.slice(0, step + 1).map((message, index) => <div className="flex gap-2.5 items-center" key={message}><span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: index < step ? LIME : P }}>{index < step ? <Check className="w-3 h-3" strokeWidth={3} style={{ color: INK }} /> : <Loader2 className="w-3 h-3 text-white animate-spin" />}</span><span className={index === step ? "text-[12px] font-bold" : "text-[12px] font-semibold text-foreground/45"}>{message}</span></div>)}</div></div></div>;
}

function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  const input = document.createElement("textarea"); input.value = value; input.style.position = "fixed"; document.body.appendChild(input); input.select(); document.execCommand("copy"); input.remove(); return Promise.resolve();
}

function downloadVideo(url: string, index: number) {
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = `video-planejado-${index + 1}.mp4`; anchor.target = "_blank"; anchor.rel = "noreferrer"; document.body.appendChild(anchor); anchor.click(); anchor.remove();
}

function RoutineResult({ routine, onBack, onNew, limitReached }: { routine: SavedRoutine; onBack: () => void; onNew: () => void; limitReached: boolean }) {
  const [preview, setPreview] = useState<string | null>(null); const [copied, setCopied] = useState<string | null>(null);
  const copy = async (value: string, key: string) => { await copyToClipboard(value); setCopied(key); window.setTimeout(() => setCopied(null), 1600); };
  return <div className="min-h-screen pb-12" style={PAGE_BG}><div className="max-w-md mx-auto"><RoutineTopBar step={2} label="Rotina pronta" onBack={onBack} /><div className="px-5"><div className="rounded-[1.5rem] p-5 mb-5" style={{ background: CARD_DARK, boxShadow: "0 14px 30px rgba(22,19,14,.24)" }}><div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-bold tracking-[.15em] uppercase text-white/45">Sua rotina foi planejada</p><h1 className="text-white text-[1.35rem] font-extrabold leading-tight mt-1">{routine.videos.length} vídeos para<br />{routine.niche_label}</h1></div><CalendarDays className="w-7 h-7" style={{ color: LIME }} /></div><p className="text-[11px] text-white/55 mt-3">Disponível até {new Date(routine.expires_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}.</p></div>
    <div className="mb-4 rounded-xl px-3.5 py-3 flex items-center gap-2" style={{ background: "rgba(122,43,245,.08)", border: "1px solid rgba(122,43,245,.16)" }}><Clock className="w-4 h-4 shrink-0" style={{ color: P }} /><p className="text-[10.5px] font-semibold leading-snug text-foreground/70">Esta rotina finaliza em <strong style={{ color: P }}>{formatBlockAt(routine.expires_at)}</strong>.</p></div>
    <div className="space-y-4">{routine.videos.map((video, index) => <motion.article key={video.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .035 }} className="bg-white rounded-[1.4rem] p-3.5" style={{ border: CARD_EDGE, boxShadow: "0 4px 12px rgba(22,19,14,.06)" }}><div className="flex gap-3"><button type="button" onClick={() => setPreview(video.url)} className="relative w-[92px] h-[146px] shrink-0 rounded-xl overflow-hidden bg-black"><video src={`${video.url}#t=0.1`} muted preload="metadata" playsInline className="w-full h-full object-cover" /><span className="absolute inset-0 flex items-center justify-center bg-black/15"><span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"><Play className="w-3.5 h-3.5" fill={INK} /></span></span></button><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="text-[11px] font-extrabold">Vídeo {index + 1}</p><span className="text-[10px] font-extrabold whitespace-nowrap" style={{ color: P }}>{formatSchedule(video.scheduled_at)}</span></div><p className="text-[10px] font-semibold leading-snug text-foreground/65 mt-2">{video.caption}</p><p className="text-[9.5px] leading-snug mt-1.5" style={{ color: P }}>{video.hashtags}</p><div className="mt-2.5 rounded-lg px-2 py-1.5 flex gap-1.5" style={{ background: "rgba(77,124,15,.08)" }}><Check className="w-3 h-3 shrink-0" strokeWidth={3} style={{ color: "#4d7c0f" }} /><span className="text-[8.5px] leading-snug font-semibold" style={{ color: "#4d7c0f" }}>Materiais verificados: sem direitos autorais e liberados para publicação.</span></div></div></div><div className="grid grid-cols-3 gap-2 mt-3"><button type="button" onClick={() => downloadVideo(video.url, index)} className="py-2 rounded-xl text-[9px] font-bold flex items-center justify-center gap-1" style={{ background: CARD_DARK, color: "#fff" }}><Download className="w-3 h-3" /> Baixar</button><button type="button" onClick={() => void copy(video.caption, `caption-${index}`)} className="py-2 rounded-xl text-[9px] font-bold flex items-center justify-center gap-1" style={{ background: "rgba(122,43,245,.08)", color: P }}><Copy className="w-3 h-3" /> {copied === `caption-${index}` ? "Copiado" : "Legenda"}</button><button type="button" onClick={() => void copy(video.hashtags, `hashtags-${index}`)} className="py-2 rounded-xl text-[9px] font-bold flex items-center justify-center gap-1" style={{ background: "rgba(22,19,14,.06)", color: INK }}><Copy className="w-3 h-3" /> {copied === `hashtags-${index}` ? "Copiado" : "Hashtags"}</button></div></motion.article>)}</div>
    <div className="mt-6"><BtnLime onClick={onBack}><ArrowLeft className="w-4 h-4" /> Voltar ao painel</BtnLime></div>
  </div></div><AnimatePresence>{preview && <VideoModal url={preview} onClose={() => setPreview(null)} />}</AnimatePresence></div>;
}

function RoutineStatusCard({ routine, onOpen }: { routine: SavedRoutine; onOpen: () => void }) {
  const now = Date.now();
  const ordered = [...routine.videos].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const overdue = ordered.filter(video => new Date(video.scheduled_at).getTime() <= now);
  const next = ordered.find(video => new Date(video.scheduled_at).getTime() > now);
  const status = overdue.length > 0
    ? { title: `${overdue.length} ${overdue.length === 1 ? "vídeo está" : "vídeos estão"} no horário`, detail: "Bora postar para manter sua rotina em dia.", color: "#DC2626", bg: "rgba(220,38,38,.08)" }
    : next
      ? { title: `Próximo: ${formatSchedule(next.scheduled_at)}`, detail: `Faltam ${ordered.length} vídeos na sua rotina.`, color: P, bg: "rgba(122,43,245,.08)" }
      : { title: "Horários concluídos", detail: "Confira os materiais da sua rotina.", color: "#4d7c0f", bg: "rgba(77,124,15,.08)" };

  return <button type="button" onClick={onOpen} className="w-full text-left rounded-[1.45rem] bg-white p-4" style={{ border: CARD_EDGE, boxShadow: "0 6px 18px rgba(22,19,14,.07)" }}>
    <div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-extrabold tracking-[.14em] uppercase text-foreground/40">Olha aqui tua rotina</p><h2 className="text-[14px] font-extrabold mt-1">{routine.videos.length} vídeos · {routine.niche_label}</h2></div><span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: status.bg }}><ChevronRight className="w-4 h-4" style={{ color: status.color }} /></span></div>
    <div className="mt-3 rounded-xl px-3 py-2.5" style={{ background: status.bg }}><p className="text-[11px] font-extrabold" style={{ color: status.color }}>{status.title}</p><p className="text-[10px] text-foreground/55 mt-0.5">{status.detail}</p></div>
    <div className="mt-3 flex items-center gap-1.5 text-[9.5px] font-semibold text-foreground/55"><Clock className="w-3.5 h-3.5" style={{ color: P }} /> Finaliza em {formatBlockAt(routine.expires_at)}</div>
  </button>;
}

function SavedRoutinesPanel({ routines, onOpen, onNew, onExit, loading, limitReached }: { routines: SavedRoutine[]; onOpen: (routine: SavedRoutine) => void; onNew: () => void; onExit: () => void; loading: boolean; limitReached: boolean }) {
  return <div className="min-h-screen" style={PAGE_BG}><div className="max-w-md mx-auto px-5 pt-8 pb-12"><button type="button" className="flex items-center gap-1.5 text-foreground/50 mb-8" onClick={onExit}><ArrowLeft className="w-4 h-4" /><span className="text-[11px] font-bold">Início</span></button>{loading ? <EvaLoader label="Carregando suas rotinas..." /> : <><p className="text-[10px] uppercase font-bold tracking-[.18em] text-foreground/40">Planejador de rotina</p><h1 className="text-[1.8rem] font-extrabold leading-tight mt-2">Seu conteúdo,<br /><em className="italic" style={{ color: P }}>organizado para postar.</em></h1><p className="text-[12px] text-foreground/55 mt-3">Você pode criar até 3 rotinas por dia. Cada uma finaliza exatamente 12 horas após a criação.</p>{routines.length > 0 ? <div className="mt-7"><div className="flex items-center justify-between mb-3"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-foreground/40">Suas rotinas ativas</p><span className="text-[10px] font-bold" style={{ color: P }}>{routines.length} ativa{routines.length > 1 ? "s" : ""}</span></div><div className="space-y-3">{routines.map(routine => <RoutineStatusCard key={routine.id} routine={routine} onOpen={() => onOpen(routine)} />)}</div></div> : <div className="mt-7 rounded-[1.5rem] bg-white px-5 py-7 text-center" style={{ border: CARD_EDGE, boxShadow: "0 4px 12px rgba(22,19,14,.05)" }}><Zap className="w-6 h-6 mx-auto mb-3" style={{ color: P }} /><b className="block text-[13px]">Nenhuma rotina ativa agora</b><p className="text-[10.5px] leading-relaxed text-foreground/50 mt-1.5">Crie sua primeira rotina e receba os vídeos com horário, legenda e hashtags.</p></div>}<div className="mt-7">{limitReached ? <div className="rounded-2xl bg-white px-5 py-4 text-center" style={{ border: CARD_EDGE }}><b className="text-[12px]">Limite de hoje alcançado</b><p className="text-[10.5px] text-foreground/50 mt-1">Você já criou suas 3 rotinas de hoje. As ativas ficam disponíveis por 12 horas.</p></div> : <BtnLime onClick={onNew}><Zap className="w-4 h-4" /> Criar minha rotina</BtnLime>}</div></>}</div></div>;
}

function SavedRoutines({ routines, onOpen, onNew, onExit, loading, limitReached }: { routines: SavedRoutine[]; onOpen: (routine: SavedRoutine) => void; onNew: () => void; onExit: () => void; loading: boolean; limitReached: boolean }) {
  return <div className="min-h-screen" style={PAGE_BG}><div className="max-w-md mx-auto px-5 pt-8 pb-12"><button type="button" className="flex items-center gap-1.5 text-foreground/50 mb-8" onClick={onExit}><ArrowLeft className="w-4 h-4" /><span className="text-[11px] font-bold">Início</span></button>{loading ? <EvaLoader label="Carregando suas rotinas..." /> : <><p className="text-[10px] uppercase font-bold tracking-[.18em] text-foreground/40">Planejador de rotina</p><h1 className="text-[1.8rem] font-extrabold leading-tight mt-2">Seu conteúdo,<br /><em className="italic" style={{ color: P }}>organizado para postar.</em></h1><p className="text-[12px] text-foreground/55 mt-3">Crie até 3 rotinas por dia. Cada rotina fica disponível por 24 horas.</p>{routines.length > 0 && <div className="mt-7"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-foreground/40 mb-3">Rotinas ativas</p><div className="space-y-3">{routines.map(routine => <button type="button" key={routine.id} onClick={() => onOpen(routine)} className="w-full text-left rounded-2xl bg-white p-4 flex items-center justify-between gap-3" style={{ border: CARD_EDGE, boxShadow: "0 3px 10px rgba(22,19,14,.05)" }}><span><b className="block text-[12px]">{routine.videos.length} vídeos · {routine.niche_label}</b><span className="block text-[10px] text-foreground/45 mt-1">Disponível até {new Date(routine.expires_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></span><ChevronRight className="w-4 h-4" style={{ color: P }} /></button>)}</div></div>}<div className="mt-8">{limitReached ? <div className="rounded-2xl bg-white px-5 py-4 text-center" style={{ border: CARD_EDGE }}><b className="text-[12px]">Limite de hoje alcançado</b><p className="text-[10.5px] text-foreground/50 mt-1">Suas rotinas ativas continuam disponíveis por 24 horas.</p></div> : <BtnLime onClick={onNew}><Zap className="w-4 h-4" /> Criar minha rotina</BtnLime>}</div></>}</div></div>;
}

export default function EvaFlow({ produtos: _produtos, onExit, theme }: { produtos: ProdutoLite[]; onExit: () => void; theme: BrandTheme }) {
  const [phase, setPhase] = useState<PlannerPhase>("saved");
  const [niches, setNiches] = useState<DatabaseNiche[]>([]); const [nichesLoading, setNichesLoading] = useState(true); const [nichesError, setNichesError] = useState<string | null>(null);
  const [selectedNiche, setSelectedNiche] = useState(""); const [quantity, setQuantity] = useState(3);
  const [routines, setRoutines] = useState<SavedRoutine[]>([]); const [currentRoutine, setCurrentRoutine] = useState<SavedRoutine | null>(null); const [routinesLoading, setRoutinesLoading] = useState(true);
  const [dailyRoutineCounts, setDailyRoutineCounts] = useState<Record<string, DailyRoutineCount>>({});
  const [dailyCountsReady, setDailyCountsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  void _produtos;

  const brandRoutines = routines.filter(routine => routine.brand === theme.id);
  const todayKey = localDayKey();
  const routineCountToday = dailyRoutineCounts[theme.id]?.date === todayKey
    ? dailyRoutineCounts[theme.id].count
    : brandRoutines.filter(routine => localDayKey(new Date(routine.created_at)) === todayKey).length;
  const limitReached = routineCountToday >= 3;

  useEffect(() => { let active = true; (async () => { const [{ data: userData }, { data, error: dbError }] = await Promise.all([supabase.auth.getUser(), supabase.rpc("get_nichos_videos")]); if (!active) return; const savedSource = userData.user?.user_metadata?.content_routines; const saved = activeRoutines(savedSource); setRoutines(saved); setRoutinesLoading(false); if (Array.isArray(savedSource) && JSON.stringify(savedSource) !== JSON.stringify(saved)) void supabase.auth.updateUser({ data: { content_routines: saved } }); if (dbError) { setNichesError("Não foi possível carregar os nichos agora. Tente novamente em instantes."); } else { setNiches(((data ?? []) as DatabaseNiche[]).filter(niche => !EXCLUDED_NICHE.test(niche.nicho) && Number(niche.total) > 0)); } setNichesLoading(false); })(); return () => { active = false; }; }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      const savedCounts = user?.user_metadata?.routine_daily_counts;
      if (savedCounts && typeof savedCounts === "object" && !Array.isArray(savedCounts)) {
        setDailyRoutineCounts(savedCounts as Record<string, DailyRoutineCount>);
        setDailyCountsReady(true);
        return;
      }
      const fallback: Record<string, DailyRoutineCount> = {};
      for (const routine of activeRoutines(user?.user_metadata?.content_routines)) {
        if (localDayKey(new Date(routine.created_at)) !== localDayKey()) continue;
        const previous = fallback[routine.brand];
        fallback[routine.brand] = { date: localDayKey(), count: (previous?.count ?? 0) + 1 };
      }
      setDailyRoutineCounts(fallback);
      setDailyCountsReady(true);
    }).catch(() => { if (active) setDailyCountsReady(true); });
    return () => { active = false; };
  }, []);

  const createRoutine = useCallback(async () => {
    if (limitReached || !selectedNiche) return;
    setError(null); setPhase("searching");
    const available = selectedNiche === "auto" ? niches : niches.filter(niche => niche.nicho === selectedNiche);
    const chosen = available[Math.floor(Math.random() * available.length)];
    if (!chosen) { setError("Não encontramos vídeos disponíveis para este nicho."); setPhase("niche"); return; }
    const total = Math.max(Number(chosen.total) || 0, quantity);
    const start = total > 40 ? Math.floor(Math.random() * Math.max(1, total - 40)) : 0;
    const searchingDelay = new Promise<void>(resolve => window.setTimeout(resolve, 2800));
    const { data, error: fetchError } = await supabase.from("videos_achadinhos").select("*").eq("nicho", chosen.nicho).range(start, start + Math.max(40, quantity * 4));
    await searchingDelay;
    const candidates = shuffle(((data ?? []) as VideoRow[]).filter(video => Boolean(video.link_video))).slice(0, quantity);
    if (fetchError || candidates.length < quantity) { setError("Não foi possível separar a quantidade de vídeos agora. Escolha outro nicho ou tente novamente."); setPhase("niche"); return; }
    const key = nicheKey(chosen.nicho); const captions = CAPTIONS_BY_NICHE[key] ?? CAPTIONS_BY_NICHE.virais; const contentSource = candidates.find(video => video.legenda || video.caption || video.caption_pt_br || video.hashtags); const caption = contentSource?.legenda || contentSource?.caption || contentSource?.caption_pt_br || captions[Math.floor(Math.random() * captions.length)]; const hashtags = Array.isArray(contentSource?.hashtags) ? contentSource.hashtags.join(" ") : contentSource?.hashtags || HASHTAGS_BY_NICHE[key] || HASHTAGS_BY_NICHE.virais;
    const now = new Date(); const firstPost = new Date(now.getTime() + (12 + Math.floor(Math.random() * 28)) * 60_000);
    const routine: SavedRoutine = { id: crypto.randomUUID(), brand: theme.id, niche: chosen.nicho, niche_label: nicheLabel(chosen.nicho), created_at: now.toISOString(), expires_at: new Date(now.getTime() + ROUTINE_DURATION_MS).toISOString(), videos: candidates.map((video, index) => ({ id: video.message_id, url: video.link_video as string, niche: chosen.nicho, caption, hashtags, scheduled_at: new Date(firstPost.getTime() + index * 40 * 60_000).toISOString() })) };
    const nextRoutines = [routine, ...activeRoutines(routines)].slice(0, 12);
    const nextDailyCounts = { ...dailyRoutineCounts, [theme.id]: { date: todayKey, count: routineCountToday + 1 } };
    const { error: saveError } = await supabase.auth.updateUser({ data: { content_routines: nextRoutines, routine_daily_counts: nextDailyCounts } });
    if (saveError) { setError("A rotina foi criada, mas não conseguimos salvá-la na sua conta. Tente novamente."); setPhase("niche"); return; }
    setRoutines(nextRoutines); setDailyRoutineCounts(nextDailyCounts); setCurrentRoutine(routine); setPhase("result");
  }, [limitReached, selectedNiche, niches, quantity, routines, dailyRoutineCounts, routineCountToday, theme.id, todayKey]);

  return <AnimatePresence mode="wait">
    {phase === "saved" && <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SavedRoutinesPanel routines={brandRoutines} loading={routinesLoading || !dailyCountsReady} limitReached={limitReached} onExit={onExit} onNew={() => { setError(null); setPhase("niche"); }} onOpen={routine => { setCurrentRoutine(routine); setPhase("result"); }} /></motion.div>}
    {phase === "niche" && <motion.div key="niche" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RoutineNicheStep niches={niches} selected={selectedNiche} onSelect={setSelectedNiche} onNext={() => setPhase("quantity")} onBack={() => setPhase("saved")} brandName={theme.name} loading={nichesLoading} error={error ?? nichesError} /></motion.div>}
    {phase === "quantity" && <motion.div key="quantity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RoutineQuantityStep quantity={quantity} onSelect={setQuantity} onNext={() => void createRoutine()} onBack={() => setPhase("niche")} /></motion.div>}
    {phase === "searching" && <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RoutineSearching brandName={theme.name} imageUrl={theme.searchImageUrl} label={selectedNiche === "auto" ? "você" : nicheLabel(selectedNiche)} /></motion.div>}
    {phase === "result" && currentRoutine && <motion.div key={currentRoutine.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RoutineResult routine={currentRoutine} limitReached={limitReached} onBack={() => setPhase("saved")} onNew={() => { setCurrentRoutine(null); setSelectedNiche(""); setPhase("niche"); }} /></motion.div>}
  </AnimatePresence>;
}
