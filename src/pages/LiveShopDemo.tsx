import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowUpRight, Check, Sparkles, Video,
  Unlock, Film, TrendingUp, GraduationCap,
  Heart, Users, Zap, ChevronRight, Play,
  Smartphone, ChefHat, Baby, Dumbbell, LayoutGrid,
  Shirt, Flame, Star, BookOpen,
  Loader2, Download, Clock, User, X, Share2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ─── Paleta ──────────────────────────────────────────────────────────────────
const P        = "#FE2C55";   // TikTok pink
const P2       = "#25F4EE";   // TikTok cyan
const CARD_DARK = "#080808";
const GRAD_BTN  = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;
const GLOW_BTN  = `0 4px 28px rgba(254,44,85,0.55)`;
const BTN_PROD  = "#1C1C1E";
// Cores dos badges por tipo
const BADGE_COLOR: Record<string, string> = {
  "DESTAQUE": "#E11D48",   // vermelho
  "EM ALTA":  "#EA580C",   // laranja
  "POPULAR":  "#0284C7",   // azul
  "TOP":      "#D97706",   // dourado
};

// ─── Produtos R2 ─────────────────────────────────────────────────────────────
const R2 = (name: string) =>
  `https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/${encodeURIComponent(name)}`;

interface Produto {
  id: string; nome: string; preco: string; precoOrig: string;
  desconto: string; comissao: string; badge: string; stars: number;
  destaque: boolean; fluxo: boolean; img: string;
}

const PRODUTOS_ALL: Produto[] = [
  // ── Destaques da semana (aparecem no módulo como destaque + disponíveis no fluxo IA)
  { id:"01", nome:"Produto 01", preco:"R$ 89,90",  precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true,  fluxo:true,  img:R2("produto01 (destaque) (fluxo).PNG") },
  { id:"02", nome:"Produto 02", preco:"R$ 49,90",  precoOrig:"R$99,00",  desconto:"-50%", comissao:"10%", badge:"DESTAQUE", stars:4.9, destaque:true,  fluxo:true,  img:R2("produto02 (destaque) (fluxo).PNG") },
  { id:"04", nome:"Produto 04", preco:"R$ 69,90",  precoOrig:"R$139,00", desconto:"-50%", comissao:"11%", badge:"DESTAQUE", stars:5.0, destaque:true,  fluxo:true,  img:R2("produto04 (destaque) (fluxo).PNG") },
  { id:"05", nome:"Produto 05", preco:"R$ 39,90",  precoOrig:"R$79,00",  desconto:"-50%", comissao:"9%",  badge:"DESTAQUE", stars:4.8, destaque:true,  fluxo:true,  img:R2("produto05 (destaque) (fluxo).PNG") },
  { id:"11", nome:"Produto 11", preco:"R$ 79,90",  precoOrig:"R$159,00", desconto:"-50%", comissao:"13%", badge:"DESTAQUE", stars:5.0, destaque:true,  fluxo:true,  img:R2("produto11 (destaque) (fluxo).PNG") },
  { id:"14", nome:"Produto 14", preco:"R$ 59,90",  precoOrig:"R$119,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:4.9, destaque:true,  fluxo:true,  img:R2("produto14 (destaque) (fluxo).PNG") },
  // ── Complementos (módulo Produtos em Alta)
  { id:"03", nome:"Produto 03", preco:"R$ 29,90",  precoOrig:"R$59,00",  desconto:"-49%", comissao:"8%",  badge:"EM ALTA",  stars:4.7, destaque:false, fluxo:false, img:R2("produto03.PNG") },
  { id:"06", nome:"Produto 06", preco:"R$ 24,90",  precoOrig:"R$49,00",  desconto:"-49%", comissao:"7%",  badge:"POPULAR",  stars:4.6, destaque:false, fluxo:false, img:R2("produto06.PNG") },
  { id:"07", nome:"Produto 07", preco:"R$ 19,90",  precoOrig:"R$39,00",  desconto:"-49%", comissao:"8%",  badge:"POPULAR",  stars:4.5, destaque:false, fluxo:false, img:R2("produto07.PNG") },
  { id:"08", nome:"Produto 08", preco:"R$ 34,90",  precoOrig:"R$69,00",  desconto:"-49%", comissao:"9%",  badge:"EM ALTA",  stars:4.7, destaque:false, fluxo:false, img:R2("produto08.PNG") },
  { id:"09", nome:"Produto 09", preco:"R$ 44,90",  precoOrig:"R$89,00",  desconto:"-50%", comissao:"10%", badge:"EM ALTA",  stars:4.8, destaque:false, fluxo:false, img:R2("produto09.PNG") },
  { id:"10", nome:"Produto 10", preco:"R$ 54,90",  precoOrig:"R$109,00", desconto:"-50%", comissao:"11%", badge:"TOP",      stars:4.7, destaque:false, fluxo:false, img:R2("produto10.PNG") },
  { id:"12", nome:"Produto 12", preco:"R$ 32,90",  precoOrig:"R$65,00",  desconto:"-49%", comissao:"8%",  badge:"POPULAR",  stars:4.6, destaque:false, fluxo:false, img:R2("produto12.PNG") },
  { id:"13", nome:"Produto 13", preco:"R$ 22,90",  precoOrig:"R$45,00",  desconto:"-49%", comissao:"7%",  badge:"POPULAR",  stars:4.5, destaque:false, fluxo:false, img:R2("produto13.PNG") },
  { id:"15", nome:"Produto 15", preco:"R$ 27,90",  precoOrig:"R$55,00",  desconto:"-49%", comissao:"8%",  badge:"TOP",      stars:4.7, destaque:false, fluxo:false, img:R2("produto15.PNG") },
];

const BY_ID = Object.fromEntries(PRODUTOS_ALL.map(p => [p.id, p]));
// Destaques da semana: 01 05 04 02 11 14 (02 e 05 trocados)
const PRODUTOS_DESTAQUE = ["01","05","04","02","11","14"].map(id => BY_ID[id]);
// Fluxo IA: 3 linhas de 2 — (11,14) (01,04) (02,05)
const PRODUTOS_FLUXO    = ["11","14","01","05","02","04"].map(id => BY_ID[id]);
// Mais produtos: 12 e 13 sobem pra primeira linha
const PRODUTOS_OUTROS   = ["03","12","13","08","09","10","06","07","15"].map(id => BY_ID[id]);

const NICHOS_ICONS: Record<string, typeof Shirt> = {
  "01 - Moda, Beleza e Estilo":                     Shirt,
  "02 - Casa, Cozinha e Decoração":                 ChefHat,
  "03 - Organização, Limpeza e Utilidades":         LayoutGrid,
  "04 - Maternidade e Infantil":                    Baby,
  "05 - Pets":                                      Heart,
  "06 - Eletrônicos e Tecnologia":                  Smartphone,
  "07 - Automóveis, Ferramentas e Segurança":       Zap,
  "08 - Papelaria, Artesanato e Personalizados":    Star,
  "09 - Alimentação e Comidas":                     ChefHat,
  "10 - Datas Comemorativas":                       Sparkles,
  "11 - Esporte, Fitness e Praia":                  Dumbbell,
  "12 - Virais, Dublados e Conteúdos de Apoio":     Film,
};
const NICHOS_LABEL: Record<string, string> = {
  "01 - Moda, Beleza e Estilo":                     "Moda e Beleza",
  "02 - Casa, Cozinha e Decoração":                 "Casa e Cozinha",
  "03 - Organização, Limpeza e Utilidades":         "Organização",
  "04 - Maternidade e Infantil":                    "Infantil",
  "05 - Pets":                                      "Pets",
  "06 - Eletrônicos e Tecnologia":                  "Eletrônicos",
  "07 - Automóveis, Ferramentas e Segurança":       "Automóveis",
  "08 - Papelaria, Artesanato e Personalizados":    "Papelaria",
  "09 - Alimentação e Comidas":                     "Alimentação",
  "10 - Datas Comemorativas":                       "Datas Comemorativas",
  "11 - Esporte, Fitness e Praia":                  "Fitness",
  "12 - Virais, Dublados e Conteúdos de Apoio":     "Virais",
};

const AULAS = [
  { num:"01", titulo:"Como criar sua primeira live no TikTok Shop", desc:"Configure tudo em menos de 10 minutos e comece a vender.", duracao:"28min", nivel:"Iniciante",     aulas:4 },
  { num:"02", titulo:"Produtos que mais vendem em live",            desc:"Os nichos e estratégias com maior taxa de conversão.",   duracao:"41min", nivel:"Iniciante",     aulas:5 },
  { num:"03", titulo:"IA de apresentador: guia completo",           desc:"Personalize seu apresentador virtual passo a passo.",    duracao:"35min", nivel:"Intermediário", aulas:6 },
  { num:"04", titulo:"Destrava TikTok Shop: perfil do zero",             desc:"Como liberar o live shopping em contas novas.",         duracao:"22min", nivel:"Iniciante",     aulas:3 },
];

// "Olhando agora" fake-urgency por produto destaque
const OLHANDO_AGORA: Record<string, string> = {
  "01":"347", "02":"218", "04":"429", "05":"193", "11":"512", "14":"284",
};

type Screen = "home" | "ia-lives" | "destrava" | "pack" | "produtos" | "treinamento";
interface VideoItem  { message_id:string; nicho:string; link_video:string|null; topico_original:string|null; r2_key:string|null; }
interface NichoRow   { nicho:string; total:number; }

interface DestravaData {
  active: boolean;
  username: string;
  meta: string;
  nicho: string;
  activatedAt: number;
  videosPosted: number;
}

function loadDestravaData(code: string): DestravaData | null {
  try { return JSON.parse(localStorage.getItem(`liveia_d_${code}`) ?? "null"); } catch { return null; }
}
function saveDestravaData(code: string, d: DestravaData) {
  localStorage.setItem(`liveia_d_${code}`, JSON.stringify(d));
}

// ─── Utility components ───────────────────────────────────────────────────────

function TikTokIcon({ size=18, color="white" }: { size?:number; color?:string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 106.34 6.34V8.69a8.17 8.17 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z"/>
    </svg>
  );
}

function Divider() {
  return <div className="w-12 h-[3px] rounded-full mt-4" style={{ background: P }} />;
}

function VideoModal({ url, onClose }: { url:string; onClose:()=>void }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
      style={{ background:"rgba(0,0,0,0.97)" }}
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-6 right-5 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background:"rgba(255,255,255,0.12)" }}>
        <X className="w-5 h-5 text-white" />
      </button>
      <div className="w-full max-w-sm px-4" onClick={e => e.stopPropagation()}>
        <video
          src={url}
          controls
          autoPlay
          playsInline
          className="w-full rounded-2xl"
          style={{ maxHeight:"78vh", background:"#000" }}
        />
      </div>
    </motion.div>
  );
}

function ProgressSegs({ total, current }: { total:number; current:number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-[3px] rounded-full transition-all"
          style={{ width: i <= current ? 22 : 14, background: i <= current ? P : "#DDD9EE" }} />
      ))}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled }: {
  children:ReactNode; onClick?:()=>void; disabled?:boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full flex items-center justify-center gap-2 font-bold py-[14px] rounded-2xl text-sm text-white transition-all active:scale-[0.98] disabled:opacity-40"
      style={{ background: "#1C1C1E", boxShadow: disabled ? undefined : "0 4px 16px rgba(0,0,0,0.25)" }}>
      {children}
    </button>
  );
}

function SelectCard({ icon, title, desc, selected, onClick }: {
  icon:ReactNode; title:string; desc?:string; selected:boolean; onClick:()=>void;
}) {
  return (
    <div onClick={onClick}
      className="flex items-center gap-4 bg-white rounded-2xl px-4 py-4 cursor-pointer active:scale-[0.99] transition-transform"
      style={{ boxShadow: selected ? `0 0 0 2px ${P}` : "0 1px 4px rgba(0,0,0,0.07)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
        style={{ background: selected ? P : "rgba(0,0,0,0.04)" }}>
        <div style={{ color: selected ? "white" : P }}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[13px] text-foreground">{title}</p>
        {desc && <p className="text-[11px] text-foreground/50 mt-0.5 leading-snug">{desc}</p>}
      </div>
      <div className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all"
        style={{ borderColor: selected ? P : "#D5D1E8", background: selected ? P : "white" }}>
        {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </div>
    </div>
  );
}

function PillGroup({ label, options, value, onChange }: {
  label:string; options:{ id:string; label:string }[]; value:string; onChange:(v:string)=>void;
}) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-foreground/40 mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <div key={o.id} onClick={() => onChange(o.id)}
            className="px-4 py-2 rounded-full text-[12px] font-bold cursor-pointer transition-all active:scale-95"
            style={{
              background: value === o.id ? P : "white",
              color: value === o.id ? "white" : "rgba(0,0,0,0.55)",
              boxShadow: value === o.id ? GLOW_BTN : "0 1px 4px rgba(0,0,0,0.07)",
            }}>
            {o.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepHeader({ step, total, stepName, onBack }: {
  step:number; total:number; stepName:string; onBack:()=>void;
}) {
  return (
    <div className="px-5 pt-7 pb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 text-foreground/50" />
          <span className="text-[11px] font-bold text-foreground/50">Etapa {step}</span>
        </div>
        <span className="text-[11px] font-bold" style={{ color: P }}>{stepName}</span>
      </div>
      <ProgressSegs total={total} current={step - 1} />
    </div>
  );
}

function TopLogo() {
  return (
    <div className="flex justify-center pt-9 pb-0">
      <img src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/liveiapng.png" alt="LiveIA" className="h-12 w-auto" />
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────

function Home({ onNavigate }: { onNavigate:(s:Screen)=>void }) {
  const secondary = [
    { id:"destrava"    as Screen, title:"Destrava TikTok Shop",       desc:"Ainda não tem perfil liberado? A IA movimenta sua conta com vídeos prontos.", Icon:Unlock,       clr:P },
    { id:"pack"        as Screen, title:"Pack +7.000 Vídeos",  desc:"Vídeos prontos por nicho para alimentar seu perfil e acelerar suas lives.", Icon:Film,          clr:P },
    { id:"produtos"    as Screen, title:"Produtos em Alta",     desc:"Os mais vendidos nas últimas 24h para divulgar nas suas lives.", Icon:TrendingUp,    clr:P },
    { id:"treinamento" as Screen, title:"Treinamento Rápido",   desc:"Configure sua primeira live em poucos minutos.", Icon:GraduationCap, clr:P },
  ];

  return (
    <div className="min-h-screen bg-background">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
        className="flex justify-center pt-10">
        <img src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/liveiapng.png" alt="LiveIA" className="h-12 w-auto" />
      </motion.div>

      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="max-w-md mx-auto px-5 pt-8 pb-2">
        <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-4">Painel de Lives</p>
        <h1 className="text-[2rem] font-extrabold leading-[1.1]">
          A IA que faz lives<br /><span style={{ color:P }}>no TikTok Shop.</span>
        </h1>
        <Divider />
      </motion.div>

      <div className="max-w-md mx-auto px-5 pt-7 pb-16 space-y-2.5">
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
          className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Módulos</span>
          <span className="text-[10px] font-bold" style={{ color:P }}>5 ativos</span>
        </motion.div>

        {/* Card principal dark */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}
          onClick={() => onNavigate("ia-lives")}
          className="rounded-[1.25rem] px-5 pt-5 pb-5 cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden"
          style={{ background: CARD_DARK }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background:"radial-gradient(ellipse 60% 50% at 80% 0%, rgba(37,244,238,0.14) 0%, transparent 70%)" }} />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: P }}>
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span className="text-[9px] font-bold tracking-wider text-black px-2.5 py-[3px] rounded-full uppercase"
                  style={{ background: P2 }}>Principal</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/25" />
            </div>
            <h3 className="text-[17px] font-extrabold text-white">IA de Lives</h3>
            <p className="text-white/45 text-[12px] mt-1 leading-snug max-w-[240px]">
              Crie uma live automática para vender no TikTok Shop sem aparecer.
            </p>
            <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <p className="text-white/40 text-[11px]">Crie sua live agora</p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/70 bg-white/[0.08] px-3 py-1.5 rounded-full">
                Acessar <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cards secundários */}
        {secondary.map(({ id, title, desc, Icon, clr }, i) => (
          <motion.div key={id}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: 0.16 + i * 0.04 }}
            onClick={() => onNavigate(id)}
            className="bg-white rounded-[1.25rem] px-5 py-4 flex items-center gap-4 cursor-pointer active:scale-[0.99] transition-transform"
            style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background:"rgba(254,44,85,0.08)" }}>
              <Icon className="w-5 h-5" style={{ color:P }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[14px] text-foreground">{title}</p>
              <p className="text-[11px] text-foreground/50 mt-0.5 leading-snug line-clamp-2">{desc}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-foreground/25 shrink-0" />
          </motion.div>
        ))}

        <p className="text-center text-[10px] text-foreground/20 pt-4 font-semibold tracking-wide">
          LIVESHOP IA · TIKTOK SHOP · V2.0
        </p>
      </div>
    </div>
  );
}

// ─── IA DE LIVES ─────────────────────────────────────────────────────────────

function LiveSuccess({ onBack }: { onBack:()=>void }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
      className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full px-5 flex flex-col items-center justify-center flex-1 py-16">
        {/* Live ao vivo indicator */}
        <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
          transition={{ type:"spring", stiffness:280, delay:0.1 }}
          className="flex items-center gap-2 bg-red-500 px-5 py-3 rounded-full mb-6"
          style={{ boxShadow:"0 4px 20px rgba(239,68,68,0.4)" }}>
          <motion.span animate={{ opacity:[1,0.2,1] }} transition={{ repeat:Infinity, duration:1 }}
            className="w-2.5 h-2.5 rounded-full bg-white shrink-0" />
          <span className="text-white text-[13px] font-extrabold tracking-wide">AO VIVO</span>
        </motion.div>
        <h2 className="text-[1.9rem] font-extrabold text-center leading-[1.1]">
          Live<br /><span style={{ color:P }}>iniciada!</span>
        </h2>
        <Divider />
        <div className="w-full bg-white rounded-2xl px-5 py-5 mt-6 space-y-3.5"
          style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
          {[["Duração","1 hora"],["Plataforma","TikTok Shop"]].map(([k,v]) => (
            <div key={k} className="flex justify-between items-center">
              <span className="text-[12px] text-foreground/45">{k}</span>
              <span className="text-[12px] font-bold text-foreground">{v}</span>
            </div>
          ))}
        </div>
        <div className="w-full mt-6">
          <button onClick={onBack}
            className="w-full flex items-center justify-center gap-2.5 font-bold py-[14px] rounded-2xl text-sm text-white active:scale-[0.98] transition-all"
            style={{ background:"#1C1C1E", boxShadow:"0 4px 16px rgba(0,0,0,0.25)" }}>
            <TikTokIcon size={16} color="white" /> Acessar live no TikTok
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function IAStep1Content({ produto, onSelect }: { produto:Produto|null; onSelect:(p:Produto)=>void }) {
  return (
    <motion.div key="ia1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-5 pb-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Produto</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">
        Escolha o<br /><span style={{ color:P }}>Produto</span>
      </h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">Qual produto será divulgado nessa live?</p>
      <div className="grid grid-cols-2 gap-3">
        {PRODUTOS_FLUXO.map(p => (
          <div key={p.id}
            className="bg-white rounded-2xl overflow-hidden flex flex-col"
            style={{ boxShadow: produto?.id === p.id ? `0 0 0 2px ${P}` : "0 1px 6px rgba(0,0,0,0.08)" }}>
            <img src={p.img} alt="" className="w-full block rounded-t-2xl" />
            <div className="px-2 py-2 flex flex-col gap-1.5">
              <span className="text-[8px] font-extrabold text-white px-1.5 py-[2px] rounded-full uppercase w-fit"
                style={{ background: BADGE_COLOR[p.badge] ?? P }}>{p.badge}</span>
              <button onClick={() => onSelect(p)}
                className="w-full text-white text-[9px] font-extrabold rounded-lg py-2 active:scale-95 transition-transform"
                style={{ background: produto?.id === p.id ? P : BTN_PROD }}>
                {produto?.id === p.id ? "Selecionado" : "Usar produto"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function IAStep2Content({ genero, idade, cenario, setGenero, setIdade, setCenario, onNext }: {
  genero:string; idade:string; cenario:string;
  setGenero:(v:string)=>void; setIdade:(v:string)=>void; setCenario:(v:string)=>void;
  onNext:()=>void;
}) {
  return (
    <motion.div key="ia2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-5 pb-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Apresentador IA</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">
        Configure o apresentador<br /><span style={{ color:P }}>e o cenário</span>
      </h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">Defina o perfil do apresentador e o ambiente da live.</p>
      <PillGroup label="Gênero" value={genero} onChange={setGenero}
        options={[{ id:"feminino", label:"Feminino" }, { id:"masculino", label:"Masculino" }]} />
      <PillGroup label="Faixa etária" value={idade} onChange={setIdade}
        options={[{ id:"jovem", label:"Jovem" }, { id:"adulto", label:"Adulto" }, { id:"maduro", label:"Maduro" }]} />
      <PillGroup label="Cenário da live" value={cenario} onChange={setCenario}
        options={[{ id:"quarto", label:"Quarto" }, { id:"sala", label:"Sala de estar" }, { id:"loja", label:"Loja" }, { id:"mesa", label:"Mesa de produtos" }]} />
      <PrimaryBtn onClick={onNext}>Próximo <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </motion.div>
  );
}

function IAStep3Content({ duracao, setDuracao, onNext }: {
  duracao:string; setDuracao:(v:string)=>void; onNext:()=>void;
}) {
  return (
    <motion.div key="ia3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-5 pb-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Duração</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">
        Quanto tempo<br /><span style={{ color:P }}>vai durar?</span>
      </h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-6">Escolha a duração da sua live no TikTok Shop.</p>
      <PillGroup
        label="Duração da live"
        options={[
          { id:"1h", label:"1 hora" },
          { id:"2h", label:"2 horas" },
          { id:"3h", label:"3 horas" },
        ]}
        value={duracao}
        onChange={setDuracao}
      />
      <PrimaryBtn onClick={onNext}>Próximo <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </motion.div>
  );
}

const PREVIEW_GIFS: Record<string, string> = {
  "01": "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/gif%20brasil.gif",
  "02": "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/gif%20militar.gif",
};

function IAStep4Content({ produto, onNext }: { produto:Produto|null; onNext:()=>void }) {
  const [generating, setGenerating] = useState(true);
  const gif = produto ? (PREVIEW_GIFS[produto.id] ?? PREVIEW_GIFS["01"]) : null;
  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 2000);
    return () => clearTimeout(t);
  }, []);
  if (generating) return (
    <motion.div key="gen" initial={{ opacity:0 }} animate={{ opacity:1 }}
      className="px-5 flex flex-col items-center justify-center min-h-[55vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin" style={{ color:P }} />
      <div className="text-center">
        <p className="font-extrabold text-[15px]">Gerando prévia da live...</p>
        <p className="text-[12px] text-foreground/40 mt-1">A IA está preparando sua apresentação</p>
      </div>
    </motion.div>
  );
  return (
    <motion.div key="ia4" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-5 pb-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Prévia</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">
        Como vai<br /><span style={{ color:P }}>ficar</span>
      </h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">Pré-visualização antes de publicar.</p>

      {/* Live preview */}
      <div className="rounded-2xl overflow-hidden relative mb-5">
        {gif && <img src={gif} alt="prévia da live" className="w-full block" />}
        {/* AO VIVO badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 px-2.5 py-[5px] rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-white text-[10px] font-bold tracking-wide">AO VIVO</span>
        </div>
      </div>

      <PrimaryBtn onClick={onNext}>Confirmar e agendar <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </motion.div>
  );
}

function IAStep5Content({ inicio, setInicio, onSubmit }: {
  inicio:string; setInicio:(v:string)=>void; onSubmit:()=>void;
}) {
  return (
    <motion.div key="ia5" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-5 pb-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Programar</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">
        Quando<br /><span style={{ color:P }}>começar?</span>
      </h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">Escolha quando a live vai ao ar.</p>
      <div className="space-y-2.5 mb-5">
        <SelectCard icon={<Zap className="w-5 h-5" />} title="Agora"
          desc="A live começa imediatamente após confirmar."
          selected={inicio==="agora"} onClick={() => setInicio("agora")} />
        <SelectCard icon={<Clock className="w-5 h-5" />} title="Programar data e hora"
          desc="Escolha dia e hora para a live ir ao ar automaticamente."
          selected={inicio==="programar"} onClick={() => setInicio("programar")} />
      </div>
      {inicio === "programar" && (
        <div className="bg-white rounded-2xl px-4 py-4 mb-5"
          style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-foreground/40 mb-2">Data e hora</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-background rounded-xl px-3 py-2.5 text-[13px] font-bold text-foreground/50">
              Hoje, 20h00
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: P }}>
              <Clock className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      )}
      <PrimaryBtn onClick={onSubmit}>Criar live</PrimaryBtn>
    </motion.div>
  );
}

const PREP_STEPS = [
  "Configurando o apresentador virtual...",
  "Carregando produtos na vitrine...",
  "Iniciando transmissão no TikTok...",
];

function LivePreparingScreen({ onDone }: { onDone:()=>void }) {
  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const total = PREP_STEPS.length;
    let step = 0;
    const tick = setInterval(() => {
      step++;
      if (step < total) {
        setIdx(step);
        setPct(Math.round((step / total) * 100));
      } else {
        clearInterval(tick);
        setPct(100);
        setTimeout(onDone, 600);
      }
    }, 1100);
    return () => clearInterval(tick);
  }, [onDone]);

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ background: CARD_DARK }}>
      {/* glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:"radial-gradient(ellipse 70% 50% at 50% 40%, rgba(254,44,85,0.25) 0%, transparent 70%)" }} />

      <div className="relative flex flex-col items-center gap-8 w-full max-w-xs">
        {/* spinner */}
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
            <motion.circle cx="40" cy="40" r="34" stroke={P} strokeWidth="5" fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 34}
              animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - pct / 100) }}
              transition={{ duration:0.6, ease:"easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-extrabold text-[15px]">{pct}%</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-white font-extrabold text-[18px] mb-2">Preparando live</p>
          <AnimatePresence mode="wait">
            <motion.p key={idx} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
              className="text-white/50 text-[13px]">
              {PREP_STEPS[idx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* progress bar */}
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: GRAD_BTN }}
            animate={{ width:`${pct}%` }} transition={{ duration:0.6, ease:"easeOut" }} />
        </div>
      </div>
    </motion.div>
  );
}

function IALivesFlow({ onBack, initialProduto }: { onBack:()=>void; initialProduto?:Produto }) {
  const [step, setStep]       = useState<1|2|3|4|5>(initialProduto ? 2 : 1);
  const [produto, setProduto] = useState<Produto|null>(initialProduto ?? null);
  const [genero, setGenero]   = useState("feminino");
  const [idade, setIdade]     = useState("jovem");
  const [cenario, setCenario] = useState("quarto");
  const [duracao, setDuracao] = useState("1h");
  const [inicio, setInicio]   = useState("agora");
  const [preparing, setPreparing] = useState(false);
  const [success, setSuccess] = useState(false);
  const names = ["Produto","Apresentador","Duração","Prévia","Programar"];
  const prev  = () => step === 1 ? onBack() : setStep((step - 1) as 1|2|3|4|5);
  if (success)    return <LiveSuccess onBack={onBack} />;
  if (preparing)  return <LivePreparingScreen onDone={() => { setPreparing(false); setSuccess(true); }} />;
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <StepHeader step={step} total={5} stepName={names[step-1]} onBack={prev} />
        <AnimatePresence mode="wait">
          {step===1 && <IAStep1Content key="ia1" produto={produto} onSelect={p => { setProduto(p); setStep(2); }} />}
          {step===2 && <IAStep2Content key="ia2" genero={genero} idade={idade} cenario={cenario}
            setGenero={setGenero} setIdade={setIdade} setCenario={setCenario} onNext={() => setStep(3)} />}
          {step===3 && <IAStep3Content key="ia3" duracao={duracao} setDuracao={setDuracao} onNext={() => setStep(4)} />}
          {step===4 && <IAStep4Content key="ia4" produto={produto} onNext={() => setStep(5)} />}
          {step===5 && <IAStep5Content key="ia5" inicio={inicio} setInicio={setInicio} onSubmit={() => setPreparing(true)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── DESTRAVA LIVES ───────────────────────────────────────────────────────────

function DestravaSuccess({ onBack }: { onBack:()=>void }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
      className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full px-5 flex flex-col items-center justify-center flex-1 py-16">
        <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
          transition={{ type:"spring", stiffness:280, delay:0.1 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: GRAD_BTN, boxShadow: GLOW_BTN }}>
          <Check className="w-9 h-9 text-white" strokeWidth={2.5} />
        </motion.div>
        <h2 className="text-[1.9rem] font-extrabold text-center leading-[1.1]">
          Plano ativado<br /><span style={{ color:P }}>com sucesso!</span>
        </h2>
        <Divider />
        <p className="text-foreground/50 text-[13px] mt-4 text-center leading-snug max-w-[240px]">
          A IA vai trabalhar sua conta nos próximos dias. Você receberá notificações do progresso.
        </p>
        <div className="w-full mt-7">
          <PrimaryBtn onClick={onBack}>Voltar ao início</PrimaryBtn>
        </div>
      </div>
    </motion.div>
  );
}

function DStep1Content({ onNext }: { onNext:()=>void }) {
  const [fase, setFase] = useState<"input"|"buscando"|"found">("input");
  const [username, setUsername] = useState("");

  function buscar() {
    if (username.length < 3) return;
    setFase("buscando");
    setTimeout(() => setFase("found"), 1800);
  }

  return (
    <motion.div key="d1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-5 pb-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Conectar Perfil</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">
        Conecte sua<br /><span style={{ color:P }}>Conta</span>
      </h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">A IA vai movimentar sua conta com vídeos naturais para liberar lives.</p>

      {fase === "input" && (
        <>
          <div className="bg-white rounded-2xl px-4 py-4 mb-5" style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-foreground/40 mb-2">Usuário TikTok</p>
            <div className="flex items-center gap-2 bg-background rounded-xl px-3 py-2.5">
              <span className="text-foreground/30 text-[15px] font-bold">@</span>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="seuperfil"
                className="flex-1 bg-transparent text-[14px] font-bold text-foreground placeholder:text-foreground/25 outline-none" />
            </div>
          </div>
          <PrimaryBtn onClick={buscar} disabled={username.length < 3}>
            Buscar perfil <ChevronRight className="w-4 h-4" />
          </PrimaryBtn>
        </>
      )}

      {fase === "buscando" && (
        <div className="flex flex-col items-center py-10 gap-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color:P2 }} />
          <p className="text-[13px] text-foreground/50 font-semibold">Buscando @{username} no TikTok...</p>
        </div>
      )}

      {fase === "found" && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
          <div className="bg-white rounded-2xl px-4 py-4 mb-5 flex items-center gap-4"
            style={{ boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
            <img src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/iconperfil.jpeg"
              alt="perfil" className="w-14 h-14 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-[15px] text-foreground leading-none mb-0.5">@lumacedo.ofc</p>
              <div className="flex items-center gap-1.5 mb-2">
                <TikTokIcon size={11} color="#000" />
                <p className="text-[11px] text-foreground/45">TikTok</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[13px] font-extrabold text-foreground">234</p>
                  <p className="text-[9px] text-foreground/40">seguidores</p>
                </div>
                <div>
                  <p className="text-[13px] font-extrabold text-foreground">9</p>
                  <p className="text-[9px] text-foreground/40">publicações</p>
                </div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background:"#22C55E" }}>
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
          </div>
          <PrimaryBtn onClick={onNext}>
            Continuar <ChevronRight className="w-4 h-4" />
          </PrimaryBtn>
        </motion.div>
      )}
    </motion.div>
  );
}

function DStep2Content({ meta, onSelect }: { meta:string; onSelect:(v:string)=>void }) {
  return (
    <motion.div key="d2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-5 pb-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Meta</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">
        Qual seu<br /><span style={{ color:P }}>Objetivo?</span>
      </h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">A IA ajusta a estratégia conforme sua meta.</p>
      <div className="space-y-2.5">
        <SelectCard icon={<Video className="w-5 h-5" />} title="Liberar lives"
          desc="Chegar a 1.000 seguidores para ativar o recurso de live no TikTok."
          selected={meta==="lives"} onClick={() => onSelect("lives")} />
        <SelectCard icon={<TrendingUp className="w-5 h-5" />} title="TikTok Shopping"
          desc="Chegar a 2.000 seguidores para ativar o live commerce no perfil."
          selected={meta==="shop"} onClick={() => onSelect("shop")} />
      </div>
    </motion.div>
  );
}

function DStep3Content({ velocidade, setVelocidade, nicho, setNicho, onNext }: {
  velocidade:string; setVelocidade:(v:string)=>void;
  nicho:string; setNicho:(v:string)=>void; onNext:()=>void;
}) {
  return (
    <motion.div key="d3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-5 pb-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Configurar</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">
        Velocidade e<br /><span style={{ color:P }}>Nicho</span>
      </h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">Configure como a IA vai trabalhar sua conta.</p>
      <PillGroup label="Velocidade" value={velocidade} onChange={setVelocidade}
        options={[{ id:"rapido", label:"Rápido" }, { id:"normal", label:"Normal" }, { id:"moderado", label:"Moderada" }]} />
      <PillGroup label="Nicho do perfil" value={nicho} onChange={setNicho}
        options={[{ id:"moda", label:"Moda" }, { id:"eletro", label:"Eletrônicos" }, { id:"casa", label:"Casa" }, { id:"fitness", label:"Fitness" }, { id:"pets", label:"Pets" }]} />
      <div className="bg-white rounded-2xl px-4 py-4 mb-5"
        style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <p className="text-[12px] text-foreground/50 leading-snug">
          A IA vai postar vídeos do nicho <span className="font-bold" style={{ color:P }}>"{nicho}"</span> para construir autoridade antes das lives.
        </p>
      </div>
      <PrimaryBtn onClick={onNext}>Continuar <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </motion.div>
  );
}

const NICHO_MAP: Record<string,string> = {
  "moda":    "01 - Moda, Beleza e Estilo",
  "casa":    "02 - Casa, Cozinha e Decoração",
  "fitness": "11 - Esporte, Fitness e Praia",
  "eletro":  "06 - Eletrônicos e Tecnologia",
  "pets":    "05 - Pets",
};

const NICHO_HASHTAGS: Record<string,string> = {
  "moda":    "#moda #modafeminina #ootd #lookdodia #tiktokshop",
  "casa":    "#casa #decoracao #organizacao #casaellar #tiktokshop",
  "fitness": "#fitness #treino #gym #vidasaudavel #tiktokshop",
  "eletro":  "#tecnologia #eletronicos #gadgets #techtok #tiktokshop",
  "pets":    "#pets #cachorro #gato #petlovers #tiktokshop",
};

const LEGENDA_TEMPLATES: Record<string, string[]> = {
  "moda": [
    "Esse achado da Shopee vai mudar seu look! Corre ver 🛍️",
    "Comprei e me arrependi de não ter comprado antes 😍",
    "O achado de moda que todo mundo tá comprando agora 🔥",
    "Esse produto tá esgotando rápido, pega o link na bio ✨",
    "Testei e aprovei! Qualidade surreal pelo preço 💜",
    "Não acredito que encontrei isso na Shopee 😱",
    "Look completo por um preço impossível! Tá no link 🛒",
  ],
  "casa": [
    "Esse produto transformou minha casa inteira! 🏠",
    "Achado de organização que mudou minha rotina ✨",
    "Minha casa ficou outra depois desse produto 😍",
    "Ninguém acredita que comprei na Shopee por esse preço 🔥",
    "Se você não tem isso em casa, está perdendo tempo 💜",
    "O item de decoração que mais recebi perguntas 🛍️",
    "Cozinha organizada em minutos com esse achado! ✨",
  ],
  "fitness": [
    "Meu treino mudou completamente com esse produto 💪",
    "Equipamento fitness com o melhor custo-benefício 🔥",
    "Treinar em casa ficou muito mais fácil! 😍",
    "Esse achado fitness tá bombando na Shopee ✨",
    "Resultado em 30 dias usando esse produto 💜",
    "Personal trainer me indicou e eu fui atrás 🏋️",
    "Quem malha em casa precisa ter isso! Sério 🛍️",
  ],
  "eletro": [
    "Esse gadget mudou minha produtividade 📱",
    "O eletrônico do mês, melhor compra que fiz 🔥",
    "Tecnologia acessível que vale muito o preço 😍",
    "Comprei achando que era furada e me surpreendi ✨",
    "Esse produto tech tá esgotando na Shopee 💜",
    "Review honesto: vale MUITO a pena! 🛍️",
    "Gadget que todo mundo deveria ter em casa 📲",
  ],
  "pets": [
    "Meu pet não vive mais sem esse produto! 🐾",
    "O achado pet que todo tutor precisa conhecer 😍",
    "Meu bichinho amou e eu também! 🔥",
    "Melhor produto que comprei pro meu pet ✨",
    "Testado e aprovado pelo meu cachorro 🐶💜",
    "Produto pet com qualidade premium e preço acessível 🛍️",
    "Ninguém me contou desse achado, eu que descobri! 🐱",
  ],
};

function DStep4Content({ nicho, onSubmit }: { nicho:string; onSubmit:()=>void }) {
  const [videos, setVideos] = useState<(VideoItem & { _legenda:string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalUrl, setModalUrl] = useState<string|null>(null);

  useEffect(() => {
    const nichoFull = NICHO_MAP[nicho] ?? nicho;
    const templates = LEGENDA_TEMPLATES[nicho] ?? LEGENDA_TEMPLATES["moda"];
    supabase.from("videos_achadinhos")
      .select("message_id, nicho, link_video, topico_original, r2_key")
      .eq("nicho", nichoFull)
      .limit(50)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 10);
          setVideos(shuffled.map((v, i) => ({
            ...(v as VideoItem),
            _legenda: templates[i % templates.length],
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [nicho]);

  return (
    <motion.div key="d4" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-5 pb-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Vídeos do Plano</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">
        Vídeos que serão<br /><span style={{ color:P }}>postados</span>
      </h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">A IA vai postar esses vídeos no seu perfil para ativar a conta.</p>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color:P2 }} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {videos.map((v) => (
              <div key={v.message_id} className="rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                style={{ background: CARD_DARK, boxShadow:"0 2px 10px rgba(0,0,0,0.2)" }}
                onClick={() => v.link_video && setModalUrl(v.link_video)}>
                <div className="relative">
                  <video
                    src={v.link_video ?? ""}
                    preload="metadata"
                    muted
                    playsInline
                    onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).currentTime = 0.1; }}
                    style={{ width:"100%", height:150, objectFit:"cover", display:"block" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ background:"rgba(0,0,0,0.18)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)" }}>
                      <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
                <div className="px-2.5 pt-2 pb-2.5 space-y-1">
                  <p className="text-[10px] font-bold text-white line-clamp-2 leading-snug">{v._legenda}</p>
                  <p className="text-[9px] font-semibold line-clamp-1 leading-snug" style={{ color:P }}>
                    {NICHO_HASHTAGS[nicho] ?? "#tiktokshop"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl px-4 py-5 mb-5 relative overflow-hidden" style={{ background: CARD_DARK }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background:"radial-gradient(ellipse 80% 60% at 100% 0%, rgba(254,44,85,0.35) 0%, transparent 65%)" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Film className="w-4 h-4 shrink-0" style={{ color:P }} />
                <span className="text-[10px] font-extrabold tracking-[0.15em] uppercase" style={{ color:P }}>Plano completo</span>
              </div>
              <p className="text-white font-extrabold text-[22px] leading-none mb-1">
                65 vídeos que vão
              </p>
              <p className="text-white font-extrabold text-[22px] leading-none mb-3" style={{ color:P }}>
                viralizar no seu perfil
              </p>
              <p className="text-white/45 text-[11px] leading-snug">
                A IA posta automaticamente com legenda e hashtags prontas. Você não precisa gravar nada.
              </p>
            </div>
          </div>
        </>
      )}

      <PrimaryBtn onClick={onSubmit}><Zap className="w-4 h-4" /> Ativar plano</PrimaryBtn>

      <AnimatePresence>
        {modalUrl && <VideoModal url={modalUrl} onClose={() => setModalUrl(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

function DestravaFlow({ onBack, onActivate }: { onBack:()=>void; onActivate:(meta:string, nicho:string)=>void }) {
  const [step, setStep]             = useState<1|2|3|4>(1);
  const [meta, setMeta]             = useState("");
  const [velocidade, setVelocidade] = useState("normal");
  const [nicho, setNicho]           = useState("moda");
  const names = ["Conectar","Objetivo","Configurar","Vídeos"];
  const prev  = () => step === 1 ? onBack() : setStep((step - 1) as 1|2|3|4);
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <StepHeader step={step} total={4} stepName={names[step-1]} onBack={prev} />
        <AnimatePresence mode="wait">
          {step===1 && <DStep1Content key="d1" onNext={() => setStep(2)} />}
          {step===2 && <DStep2Content key="d2" meta={meta} onSelect={v => { setMeta(v); setStep(3); }} />}
          {step===3 && <DStep3Content key="d3" velocidade={velocidade} setVelocidade={setVelocidade} nicho={nicho} setNicho={setNicho} onNext={() => setStep(4)} />}
          {step===4 && <DStep4Content key="d4" nicho={nicho} onSubmit={() => onActivate(meta, nicho)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── PACK +10.000 VÍDEOS ─────────────────────────────────────────────────────

function PackScreen({ onBack }: { onBack:()=>void }) {
  const [nichos, setNichos]       = useState<NichoRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [nichoCurr, setNichoCurr] = useState<NichoRow|null>(null);
  const [videos, setVideos]       = useState<VideoItem[]>([]);
  const [vLoading, setVLoading]   = useState(false);
  const [modalUrl, setModalUrl]   = useState<string|null>(null);
  const total = nichos.reduce((a, n) => a + Number(n.total), 0);

  useEffect(() => {
    supabase.rpc("get_nichos_videos")
      .then(({ data }) => { setNichos((data as NichoRow[]) ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function openNicho(n: NichoRow) {
    setNichoCurr(n);
    setVLoading(true);
    const { data } = await supabase
      .from("videos_achadinhos")
      .select("message_id, nicho, link_video, topico_original, r2_key")
      .eq("nicho", n.nicho)
      .limit(30);
    setVideos((data as VideoItem[]) ?? []);
    setVLoading(false);
  }

  /* ── Video list view ── */
  if (nichoCurr) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto">
          <div className="px-5 pt-7 pb-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
              style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}
              onClick={() => setNichoCurr(null)}>
              <ArrowLeft className="w-4 h-4 text-foreground/60" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Pack de Vídeos</p>
              <p className="font-extrabold text-[15px] text-foreground leading-tight">
                {NICHOS_LABEL[nichoCurr.nicho] ?? nichoCurr.nicho}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background:"rgba(0,0,0,0.05)", color:P }}>
              {nichoCurr.total} vídeos
            </span>
          </div>

          <div className="px-5 pb-14">
            {vLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin" style={{ color:P2 }} />
              </div>
            ) : videos.length === 0 ? (
              <p className="text-center text-foreground/40 text-[13px] py-16">Nenhum vídeo encontrado.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {videos.map(v => (
                  <div key={v.message_id} className="rounded-2xl overflow-hidden"
                    style={{ background: CARD_DARK, boxShadow:"0 2px 10px rgba(0,0,0,0.2)" }}>
                    <div className="relative cursor-pointer active:opacity-80 transition-opacity"
                      onClick={() => v.link_video && setModalUrl(v.link_video)}>
                      <video
                        src={v.link_video ?? ""}
                        preload="metadata"
                        muted
                        playsInline
                        onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).currentTime = 0.1; }}
                        style={{ width:"100%", height:140, objectFit:"cover", display:"block" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ background:"rgba(0,0,0,0.18)" }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)" }}>
                          <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                    </div>
                    <div className="px-2.5 pt-2 pb-2.5 space-y-1.5">
                      <p className="text-[10px] font-bold text-white line-clamp-2 leading-snug">
                        {v.topico_original ?? "Vídeo"}
                      </p>
                      <p className="text-[9px] font-semibold line-clamp-1 leading-snug" style={{ color:P }}>
                        {NICHOS_LABEL[v.nicho] ?? v.nicho}
                      </p>
                      <div className="flex gap-1.5 pt-0.5">
                        <a href={v.link_video ?? "#"} download
                          onClick={e => e.stopPropagation()}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[9px] font-bold"
                          style={{ background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.65)" }}>
                          <Download className="w-3 h-3" /> Baixar
                        </a>
                        <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[9px] font-bold text-white"
                          style={{ background: P }}>
                          <Share2 className="w-3 h-3" /> Publicar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <AnimatePresence>
          {modalUrl && <VideoModal url={modalUrl} onClose={() => setModalUrl(null)} />}
        </AnimatePresence>
      </div>
    );
  }

  /* ── Nicho list view ── */
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <div className="px-5 pt-7 pb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}
            onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-4">Atualizado hoje</p>
          <h2 className="text-[2rem] font-extrabold leading-[1.1]">
            Pack de<br /><span style={{ color:P }}>Vídeos</span>
          </h2>
          <Divider />
          <p className="text-foreground/50 text-[13px] mt-3">Vídeos prontos por nicho para suas lives.</p>
        </div>

        <div className="px-5 mt-5 mb-6">
          <div className="bg-white rounded-2xl px-5 py-5" style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-foreground/40 mb-2">Vídeos disponíveis</p>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color:P2 }} />
                <span className="text-[14px] font-bold text-foreground/50">Carregando...</span>
              </div>
            ) : (
              <>
                <p className="text-[2rem] font-extrabold" style={{ color:P }}>
                  +{total.toLocaleString("pt-BR")}
                </p>
                <p className="text-[12px] text-foreground/50 mt-0.5">vídeos prontos para suas lives</p>
              </>
            )}
          </div>
        </div>

        <div className="px-5 pb-14">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Nichos</span>
            <span className="text-[10px] font-bold" style={{ color:P }}>Selecione um</span>
          </div>
          <div className="space-y-2.5">
            {nichos.map(n => {
              const Icon = NICHOS_ICONS[n.nicho] ?? Film;
              const label = NICHOS_LABEL[n.nicho] ?? n.nicho;
              return (
                <div key={n.nicho} onClick={() => openNicho(n)}
                  className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 cursor-pointer active:scale-[0.99] transition-transform"
                  style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background:"rgba(0,0,0,0.04)" }}>
                    <Icon className="w-5 h-5" style={{ color:P }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[14px] text-foreground">{label}</p>
                    <p className="text-[11px] text-foreground/45 mt-0.5">{Number(n.total).toLocaleString("pt-BR")} vídeos</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/25" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PRODUTOS EM ALTA ────────────────────────────────────────────────────────

function ProdutosScreen({ onBack, onCriarLive }: { onBack:()=>void; onCriarLive:(p:Produto)=>void }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-7 pb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }} onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <motion.span animate={{ opacity:[1,0.2,1] }} transition={{ repeat:Infinity, duration:1.2 }}
              className="w-2 h-2 rounded-full shrink-0" style={{ background:"#E11D48" }} />
            <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase">Atualizado agora</p>
          </div>
          <h2 className="text-[2rem] font-extrabold leading-[1.1]">
            <span>Produtos </span><span style={{ color:P }}>em Alta</span>
          </h2>
          <Divider />
          <p className="text-foreground/50 text-[13px] mt-3">Selecionados com base nas <span className="font-bold text-foreground/70">vendas das últimas 24h</span>. Esses são os que mais convertem agora.</p>
        </div>

        <div className="px-5 pb-14 mt-4">

          {/* ── Seção 1: Destaques da semana ── */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" style={{ color:P }} />
              <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/60 uppercase">Destaques da semana</span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background:"rgba(0,0,0,0.05)", color:P }}>
              {PRODUTOS_DESTAQUE.length} produtos
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {PRODUTOS_DESTAQUE.map((p, i) => (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden flex flex-col"
                style={{ boxShadow:"0 2px 10px rgba(0,0,0,0.09)" }}>

                <div className="relative w-full rounded-t-2xl overflow-hidden">
                  <img src={p.img} alt="" className="w-full block" />
                  <span className="absolute top-2 left-2 text-[8px] font-extrabold tracking-wider text-white px-2 py-[3px] rounded-full uppercase"
                    style={{ background: BADGE_COLOR[p.badge] ?? P }}>{p.badge}</span>
                  <span className="absolute top-2 right-2 text-[10px] font-extrabold text-foreground/55 bg-white/90 px-1.5 py-0.5 rounded-full"
                    style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.1)" }}>
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="px-3 pt-2.5 pb-3 flex-1 flex flex-col justify-end">
                  <button onClick={() => onCriarLive(p)}
                    className="w-full text-white text-[11px] font-extrabold rounded-xl py-2.5 active:scale-95 transition-transform"
                    style={{ background: BTN_PROD }}>
                    Criar live
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Seção 2: Mais produtos ── */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Mais produtos</span>
            <span className="text-[10px] font-bold text-foreground/40">{PRODUTOS_OUTROS.length} itens</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {PRODUTOS_OUTROS.map(p => (
              <div key={p.id}
                className="bg-white rounded-2xl overflow-hidden flex flex-col"
                style={{ boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
                <img src={p.img} alt="" className="w-full block rounded-t-2xl" />
                <div className="px-2 py-2 flex flex-col gap-1.5">
                  <span className="text-[8px] font-extrabold text-white px-1.5 py-[2px] rounded-full uppercase w-fit"
                    style={{ background: BADGE_COLOR[p.badge] ?? P }}>{p.badge}</span>
                  <button onClick={() => onCriarLive(p)}
                    className="w-full text-white text-[9px] font-extrabold rounded-lg py-2 active:scale-95 transition-transform"
                    style={{ background: BTN_PROD }}>
                    Criar live
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── TREINAMENTO RÁPIDO ───────────────────────────────────────────────────────

function TreinamentoScreen({ onBack }: { onBack:()=>void }) {
  const [aberta, setAberta] = useState<string>("01");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <div className="px-5 pt-7 pb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}
            onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-4">Academia</p>
          <h2 className="text-[2rem] font-extrabold leading-[1.1]">
            Domine o<br /><span style={{ color:P }}>sistema</span>
          </h2>
          <Divider />
          <p className="text-foreground/50 text-[13px] mt-3">Quatro módulos práticos para você fazer lives no TikTok Shop.</p>
        </div>

        <div className="px-5 mt-6 pb-14 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Em destaque</span>
            <span className="text-[10px] font-bold" style={{ color:P }}>Comece por aqui</span>
          </div>

          {AULAS.map((a) => {
            const isOpen = aberta === a.num;
            const isPrincipal = a.num === "01";
            return (
              <div key={a.num} className="bg-white rounded-2xl overflow-hidden cursor-pointer"
                style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.07)" }}
                onClick={() => setAberta(isOpen ? "" : a.num)}>

                {/* Thumbnail — só aparece quando aberta */}
                {isOpen && (
                  <div className="relative w-full overflow-hidden">
                    {isPrincipal ? (
                      <>
                        <img src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/thumbnail.png"
                          alt="Aula 01" className="w-full block" />
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center"
                          style={{ background:"rgba(0,0,0,0.22)" }}>
                          <div className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }}>
                            <Play className="w-6 h-6 text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-center"
                        style={{ height:110, background:`linear-gradient(135deg, rgba(254,44,85,0.12) 0%, rgba(254,44,85,0.04) 100%)` }}>
                        <Play className="w-8 h-8" style={{ color:P }} fill={P} />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[9px] font-extrabold tracking-wider text-white px-2.5 py-[4px] rounded-full uppercase"
                      style={{ background: P }}>
                      Aula {a.num}
                    </span>
                    <span className="absolute bottom-3 right-3 text-[10px] font-bold text-white bg-black/40 px-2.5 py-1 rounded-full">
                      {a.duracao}
                    </span>
                  </div>
                )}

                {/* Header sempre visível */}
                <div className="px-4 pt-3.5 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: isOpen ? P : "rgba(0,0,0,0.05)" }}>
                      {isOpen
                        ? <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                        : <span className="text-[11px] font-extrabold text-foreground/35">{a.num}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-[13px] text-foreground leading-snug line-clamp-2">{a.titulo}</p>
                      {isOpen && <p className="text-[11px] text-foreground/50 leading-snug mt-1">{a.desc}</p>}
                    </div>
                    <ChevronRight className={`w-4 h-4 text-foreground/25 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </div>
                  {isOpen && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-black/[0.05]">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-foreground/35" />
                        <span className="text-[11px] text-foreground/45">{a.aulas} aulas · {a.duracao}</span>
                      </div>
                      <span className="w-1 h-1 rounded-full bg-foreground/20" />
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background:"rgba(254,44,85,0.1)", color:P }}>
                        {a.nivel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CODE LOGIN ──────────────────────────────────────────────────────────────

function CodeLoginScreen({ onCode }: { onCode:(c:string)=>void }) {
  const [val, setVal] = useState("");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background">
      <img src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/liveiapng.png" alt="LiveIA" className="h-16 w-auto mb-14" />
      <div className="w-full max-w-xs">
        <h2 className="text-[1.8rem] font-extrabold leading-[1.1] mb-1.5">
          Acesse com<br /><span style={{ color:P }}>seu código</span>
        </h2>
        <p className="text-foreground/45 text-[13px] mb-8">Digite o código de acesso para entrar.</p>
        <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-foreground/40 mb-2 block">Código de acesso</label>
        <input
          className="w-full border border-black/10 rounded-2xl px-4 py-4 text-[20px] font-extrabold text-foreground outline-none mb-6 tracking-[0.4em] text-center bg-white"
          style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}
          placeholder="••••"
          value={val}
          onChange={e => setVal(e.target.value.toUpperCase())}
          maxLength={8}
          onKeyDown={e => e.key === "Enter" && val.trim().length > 0 && onCode(val.trim())}
        />
        <PrimaryBtn onClick={() => val.trim().length > 0 && onCode(val.trim())} disabled={val.trim().length === 0}>
          Entrar <ChevronRight className="w-4 h-4" />
        </PrimaryBtn>
      </div>
    </div>
  );
}

// ─── DESTRAVA DASHBOARD ───────────────────────────────────────────────────────

function DestravaDashboard({ data, onBack }: { data:DestravaData; onBack:()=>void }) {
  const [videos, setVideos] = useState<(VideoItem & { _legenda:string })[]>([]);
  const [modalUrl, setModalUrl] = useState<string|null>(null);

  useEffect(() => {
    const nichoFull = NICHO_MAP[data.nicho] ?? data.nicho;
    const templates = LEGENDA_TEMPLATES[data.nicho] ?? LEGENDA_TEMPLATES["moda"];
    supabase.from("videos_achadinhos")
      .select("message_id, nicho, link_video, topico_original, r2_key")
      .eq("nicho", nichoFull)
      .limit(20)
      .then(({ data:rows, error }) => {
        if (!error && rows && rows.length > 0) {
          const shuffled = [...rows].sort(() => Math.random() - 0.5).slice(0, 3);
          setVideos(shuffled.map((v, i) => ({
            ...(v as VideoItem),
            _legenda: templates[i % templates.length],
          })));
        }
      });
  }, [data.nicho]);

  const elapsed   = Date.now() - data.activatedAt;
  const totalMs   = 32 * 60 * 60 * 1000;
  const remaining = Math.max(0, totalMs - elapsed);
  const hoursLeft = Math.floor(remaining / (60 * 60 * 1000));
  const minsLeft  = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  const pct       = Math.min(100, Math.round((elapsed / totalMs) * 100));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-7 pb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }} onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Destrava TikTok Shop</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background:"rgba(34,197,94,0.1)" }}>
            <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ repeat:Infinity, duration:1.5 }}
              className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-[11px] font-bold text-green-600">Ativo</span>
          </div>
        </div>

        <div className="px-5 pb-14 space-y-4">
          {/* Profile */}
          <div className="bg-white rounded-2xl px-4 py-4 flex items-center gap-4"
            style={{ boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
            <img src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/iconperfil.jpeg"
              alt="perfil" className="w-14 h-14 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-[15px] text-foreground leading-none mb-0.5">{data.username}</p>
              <div className="flex items-center gap-1.5 mb-2">
                <TikTokIcon size={11} color="#000" />
                <p className="text-[11px] text-foreground/45">TikTok</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-extrabold">369</p>
                    <span className="text-[9px] font-bold text-green-500 flex items-center gap-0.5">
                      ↑+135
                    </span>
                  </div>
                  <p className="text-[9px] text-foreground/40">seguidores</p>
                </div>
                <div>
                  <p className="text-[13px] font-extrabold">6</p>
                  <p className="text-[9px] text-foreground/40">publicações</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status card */}
          <div className="rounded-2xl px-4 py-5 relative overflow-hidden" style={{ background:CARD_DARK }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background:"radial-gradient(ellipse 70% 50% at 80% 0%, rgba(254,44,85,0.35) 0%, transparent 70%)" }} />
            <div className="relative">
              <p className="text-white/50 text-[11px] font-bold uppercase tracking-[0.12em] mb-2">Progresso para lives</p>
              <p className="text-white font-extrabold text-[19px] leading-none mb-1">Ativando perfil...</p>
              <p className="text-white/50 text-[12px] mb-4">
                Em até <span className="text-white font-bold">{hoursLeft}h {minsLeft}min</span> seu perfil estará pronto para lives
              </p>
              {/* Barra começa em 234/1000 */}
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background:GRAD_BTN }}
                  initial={{ width:"36.9%" }}
                  animate={{ width:`${Math.max(36.9, 36.9 + pct * 0.05)}%` }}
                  transition={{ duration:1.5, ease:"easeOut" }} />
              </div>
              <div className="flex justify-between mt-2">
                <div className="flex items-center gap-1">
                  <span className="text-white/55 text-[9px] font-bold">369</span>
                  <span className="text-[9px] text-green-400 font-bold">↑</span>
                </div>
                <span className="text-white/35 text-[9px]">meta: 1.000</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
              <p className="text-[2rem] font-extrabold" style={{ color:P }}>{data.videosPosted}</p>
              <p className="text-[11px] text-foreground/50">vídeos postados</p>
            </div>
            <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
              <p className="text-[2rem] font-extrabold text-foreground">57</p>
              <p className="text-[11px] text-foreground/50">faltam postar</p>
            </div>
          </div>

          {/* Vídeos postados */}
          {videos.length > 0 && (
            <>
              <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Últimos postados</p>
              <div className="grid grid-cols-3 gap-2">
                {videos.map(v => (
                  <div key={v.message_id} className="rounded-xl overflow-hidden cursor-pointer active:opacity-80 transition-opacity"
                    style={{ background:CARD_DARK }}
                    onClick={() => v.link_video && setModalUrl(v.link_video)}>
                    <div className="relative">
                      <video src={v.link_video ?? ""} preload="metadata" muted playsInline
                        onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).currentTime = 0.1; }}
                        style={{ width:"100%", height:110, objectFit:"cover", display:"block" }} />
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background:"rgba(0,0,0,0.2)" }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background:"rgba(0,0,0,0.6)" }}>
                          <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                    </div>
                    <div className="px-2 pt-1.5 pb-2">
                      <p className="text-[9px] text-white/55 line-clamp-2 leading-snug">{v._legenda}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <button className="w-full py-3.5 rounded-2xl text-[13px] font-semibold text-foreground/40 border border-black/10 mt-2">
            Pausar plano
          </button>
        </div>
      </div>

      <AnimatePresence>
        {modalUrl && <VideoModal url={modalUrl} onClose={() => setModalUrl(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── DESTRAVA ACTIVATION SCREEN ──────────────────────────────────────────────

function DestravaActivationScreen({ onDone }: { onDone:()=>void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ background: CARD_DARK }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:"radial-gradient(ellipse 70% 50% at 50% 45%, rgba(34,197,94,0.12) 0%, transparent 70%)" }} />

      <div className="relative flex flex-col items-center text-center gap-6 max-w-xs">
        {/* Ícone de sucesso */}
        <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
          transition={{ type:"spring", stiffness:260, delay:0.1 }}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background:"rgba(34,197,94,0.15)", border:"2px solid rgba(34,197,94,0.3)" }}>
          <Check className="w-9 h-9 text-green-400" strokeWidth={3} />
        </motion.div>

        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <p className="text-white font-extrabold text-[2rem] leading-[1.1] mb-2">
            Plano ativado!
          </p>
          <p className="text-white/50 text-[14px] leading-snug">
            Sua IA vai começar a trabalhar no seu perfil em instantes. Os primeiros vídeos já estão sendo preparados.
          </p>
        </motion.div>

        {/* Dots animados */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
          className="flex items-center gap-2">
          {[0,1,2].map(i => (
            <motion.div key={i} className="w-2 h-2 rounded-full"
              style={{ background:"rgba(34,197,94,0.6)" }}
              animate={{ opacity:[0.3,1,0.3], scale:[0.8,1,0.8] }}
              transition={{ repeat:Infinity, duration:1.4, delay:i*0.18 }} />
          ))}
        </motion.div>

        <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}
          onClick={onDone}
          className="text-white/35 text-[12px] underline underline-offset-2 mt-2">
          Ir para o painel →
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function LiveShopDemo() {
  const [code, setCode]                 = useState<string|null>(() => sessionStorage.getItem("liveia_code"));
  const [screen, setScreen]             = useState<Screen>("home");
  const [prodfromProd, setProdfromProd] = useState<Produto|undefined>(undefined);
  const [destravaData, setDestravaState] = useState<DestravaData|null>(() => {
    const c = sessionStorage.getItem("liveia_code");
    return c ? loadDestravaData(c) : null;
  });
  const [showActivation, setShowActivation] = useState(false);

  function handleCode(c: string) {
    sessionStorage.setItem("liveia_code", c);
    setCode(c);
    setDestravaState(loadDestravaData(c));
  }

  function nav(s: Screen) { setScreen(s); }
  function goHome()        { setScreen("home"); setProdfromProd(undefined); }

  function criarLiveComProduto(p: Produto) {
    setProdfromProd(p);
    setScreen("ia-lives");
  }

  function handleDestravaActivate(meta: string, nicho: string) {
    const d: DestravaData = {
      active: true,
      username: "@lumacedo.ofc",
      meta, nicho,
      activatedAt: Date.now(),
      videosPosted: 7,
    };
    if (code) saveDestravaData(code, d);
    setDestravaState(d);
    setShowActivation(true);
  }

  if (!code) return <CodeLoginScreen onCode={handleCode} />;
  if (showActivation) return (
    <AnimatePresence mode="wait">
      <DestravaActivationScreen key="activation" onDone={() => { setShowActivation(false); goHome(); }} />
    </AnimatePresence>
  );

  return (
    <AnimatePresence mode="wait">
      {screen === "home" && (
        <motion.div key="home" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <Home onNavigate={nav} />
        </motion.div>
      )}
      {screen === "ia-lives" && (
        <motion.div key="ia-lives" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <IALivesFlow onBack={goHome} initialProduto={prodfromProd} />
        </motion.div>
      )}
      {screen === "destrava" && (
        <motion.div key="destrava" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          {destravaData?.active
            ? <DestravaDashboard data={destravaData} onBack={goHome} />
            : <DestravaFlow onBack={goHome} onActivate={handleDestravaActivate} />
          }
        </motion.div>
      )}
      {screen === "pack" && (
        <motion.div key="pack" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <PackScreen onBack={goHome} />
        </motion.div>
      )}
      {screen === "produtos" && (
        <motion.div key="produtos" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <ProdutosScreen onBack={goHome} onCriarLive={criarLiveComProduto} />
        </motion.div>
      )}
      {screen === "treinamento" && (
        <motion.div key="treinamento" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <TreinamentoScreen onBack={goHome} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
