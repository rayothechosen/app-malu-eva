import { lazy, Suspense, useState, useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowUpRight, Check, Sparkles, Video,
  Unlock, Film, GraduationCap,
  Heart, Users, Zap, ChevronRight, Play,
  Smartphone, ChefHat, Baby, Dumbbell, LayoutGrid,
  Shirt, Flame, Star, BookOpen,
  Loader2, Download, Clock, User, X, Info, ChevronDown, Images, PanelsTopLeft, ExternalLink, LogOut,
  ShieldCheck, WalletCards, Send,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IconContas, IconVideos, IconAlta, IconTreino, Starburst,
  NichoIcon, IconRelogio, EvaLoader, type NichoTipo,
} from "@/components/EvaIcons";
import { getBrandTheme, type BrandId, type BrandTheme } from "@/lib/brandTheme";

const EvaFlow = lazy(() => import("@/components/EvaFlow"));

// ─── Paleta (Craft × Wise: neutros quentes + roxo vívido/lima do crachá) ─────
const P        = "var(--brand-primary)";
const P2       = "var(--brand-secondary)";
const LIME     = "var(--brand-accent)";
const R2_EVA    = "https://pub-0b252875d435478a830daa595535d16c.r2.dev";
const CARD_DARK = "var(--brand-card-dark)";
const GRAD_BTN  = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;
const GLOW_BTN  = `0 4px 28px rgba(122,43,245,0.40)`;
const BTN_PROD  = "#1C1C1E";
// Card bem definido (estilo Wise) com suavidade Craft
const CARD_EDGE   = "1.5px solid rgba(22,19,14,0.10)";
const CARD_SHADOW = "0 2px 0 rgba(22,19,14,0.05), 0 14px 36px rgba(22,19,14,0.08)";
// Fundo padrão das telas: bege/creme chapado
const PAGE_BG = { background: "var(--brand-background)" };

function brandVars(theme: BrandTheme): CSSProperties {
  return {
    "--brand-primary": theme.primary,
    "--brand-secondary": theme.secondary,
    "--brand-accent": theme.accent,
    "--brand-background": theme.background,
    "--brand-card-dark": theme.cardDark,
  } as CSSProperties;
}
// Cores dos badges por tipo
const BADGE_COLOR: Record<string, string> = {
  "DESTAQUE": "#E11D48",   // vermelho
  "EM ALTA":  "#EA580C",   // laranja
  "POPULAR":  "#0284C7",   // azul
  "TOP":      "#D97706",   // dourado
};

// ─── Produtos R2 ─────────────────────────────────────────────────────────────
interface Produto {
  id: string; nome: string; preco: string; precoOrig: string;
  desconto: string; comissao: string; badge: string; stars: number;
  destaque: boolean; fluxo: boolean; img: string; nicho?: string; link?: string;
}

const catalogProduct = (id: string, img: string, link: string, nome = "Produto em alta", nicho?: string, destaque = false): Produto => ({ id, nome, nicho, link, img, destaque, fluxo: false, preco: "", precoOrig: "", desconto: "", comissao: "", badge: destaque ? "DESTAQUE" : "EM ALTA", stars: 0 });

const PRODUTOS_EVA_DESTAQUE = [
  catalogProduct("d03", "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/liveia%20produtos03%20-%20destaque.PNG", "https://shop.tiktok.com/br/pdp/1734375756429297016", "Produto em destaque", undefined, true),
  catalogProduct("d06", "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/liveia%20produtos06%20-%20destaque.PNG", "https://shop.tiktok.com/br/pdp/1734495512822842823", "Produto em destaque", undefined, true),
  catalogProduct("d07", "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/liveia%20produtos07%20-%20destaque.PNG", "https://shop.tiktok.com/br/pdp/1735722191830353401", "Produto em destaque", undefined, true),
  catalogProduct("d10", "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/liveia%20produtos10%20-%20destaque.png", "https://shop.tiktok.com/br/pdp/1734161397194065363", "Produto em destaque", undefined, true),
];
const PRODUTOS_EVA_OUTROS = [
  catalogProduct("n01", "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/liveia%20produtos01.PNG", "https://shop.tiktok.com/br/pdp/1735151915144217865"),
  catalogProduct("n02", "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/liveia%20produtos02.PNG", "https://shop.tiktok.com/br/pdp/1732046342873843223"),
  catalogProduct("n04", "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/liveia%20produtos04.PNG", "https://shop.tiktok.com/br/pdp/1735743454732256685"),
  catalogProduct("n05", "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/liveia%20produtos05.PNG", "https://shop.tiktok.com/br/pdp/king-removedor-de-cuticulas-15s-gel-expresso-100ml-cora/1732251609505957228"),
  catalogProduct("n08", "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/liveia%20produtos08.PNG", "https://shop.tiktok.com/br/pdp/1734586690818705233"),
  catalogProduct("n09", "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/liveia%20produtos09.PNG", "https://shop.tiktok.com/br/pdp/1735555760230597795"),
];
const PRODUTOS_MALU_ALTA = [
  catalogProduct("malu-01", "https://down-br.img.susercontent.com/file/sg-11134201-822zm-mo5ipw6qvq4h04@resize_w450_nl.webp", "https://shopee.com.br/Secador-de-Cabelo-Philco-Titanium-Travel-750W-i.811034337.18473534737", "Secador de Cabelo Philco Titanium Travel 750W", "Moda, Beleza e Estilo"),
  catalogProduct("malu-02", "https://down-br.img.susercontent.com/file/br-11134207-820li-mlnqommcthxj6d@resize_w450_nl.webp", "https://shopee.com.br/Mochila-Couro-Masculina-Refor%C3%A7ada-Para-Notebook-Escolar-Excecultivo-Social-i.379659209.23892712301", "Mochila Couro Masculina Reforçada para Notebook", "Moda, Beleza e Estilo"),
  catalogProduct("malu-03", "https://down-br.img.susercontent.com/file/br-11134207-81z1k-mgyubugturk507@resize_w450_nl.webp", "https://shopee.com.br/Escova-de-limpeza-ajust%C3%A1vel-para-janelas-banheiros-e-cozinhas-Ferramentas-recarreg%C3%A1veis-9-em-1-i.1635030612.23594671583", "Escova de limpeza ajustável 9 em 1", "Organização, Limpeza e Utilidades"),
  catalogProduct("malu-04", "https://down-br.img.susercontent.com/file/br-11134207-81z1k-mh236zedcwe89d@resize_w450_nl.webp", "https://shopee.com.br/Short-Saia-Academia-Feminino-Cintura-Alta-Suplex-Rodado-Fitness-Tapa-Bumbum-i.869193731.48701437527", "Short Saia Academia Feminino Cintura Alta", "Esporte, Fitness e Praia"),
  catalogProduct("malu-05", "https://down-br.img.susercontent.com/file/br-11134258-820lw-mlc5ivsid3bb6c", "https://shopee.com.br/Torneira-De-Cozinha-Gourmet-Al%C3%A7a-%C3%9Anica-Com-Extensor-De-Spray-Tubo-De-%C3%81gua-Flex%C3%ADvel-Superior-Prateado-Para-Ajuste-i.1398191070.29028867072", "Torneira de Cozinha Gourmet com Extensor", "Casa, Cozinha e Decoração"),
  catalogProduct("malu-06", "https://down-br.img.susercontent.com/file/br-11134207-820ll-mme3bjipjf2897.webp", "https://shopee.com.br/Massageador-El%C3%A9trico-Profissional-Muscular-Pistola-Port%C3%A1til-Original-c-6-N%C3%ADveis-e-4-Ponteiras-i.1660293952.58207844933?extraParams=%7B%22display_model_id%22%3A199187588873%2C%22model_selection_logic%22%3A3%7D", "Massageador Elétrico Profissional Muscular", "Saúde e Bem-estar"),
  catalogProduct("malu-07", "https://down-br.img.susercontent.com/file/br-11134207-7r98o-lr7ob4xz6txpec.webp", "https://shopee.com.br/Caixa-De-Som-Bluetooth-Port%C3%A1til-RGB-Potente-TWS-USB-Est%C3%A9reo-30-50W-Para-Praia-Festa-ou-Viagem-Xtrad-i.717396632.21599194714", "Caixa de Som Bluetooth Portátil RGB", "Eletrônicos e Tecnologia"),
  catalogProduct("malu-08", "https://down-br.img.susercontent.com/file/sg-11134201-7rd5c-lwcwwniv4z2y4c.webp", "https://shopee.com.br/Aparelho-Medidor-De-Press%C3%A3o-Arterial-Digital-De-Bra%C3%A7o-i.425947430.22897584250", "Aparelho Medidor de Pressão Arterial", "Saúde e Bem-estar"),
  catalogProduct("malu-09", "https://down-br.img.susercontent.com/file/sg-11134201-7rdw6-mcs59c7zerls44@resize_w450_nl.webp", "https://shopee.com.br/Jogo-de-Panelas-Kit-9-P%C3%A7s-Antiaderente-Tampa-Vidro-Teflon-i.1595311947.22794270362", "Jogo de Panelas Kit 9 Peças Antiaderente", "Casa, Cozinha e Decoração"),
  catalogProduct("malu-10", "https://down-br.img.susercontent.com/file/br-11134207-81z1k-meqm2c8bggsi0d.webp", "https://shopee.com.br/C%C3%A2mera-Seguran%C3%A7a-Prova-D'%C3%A1gua-Infravermelho-L%C3%A2mpada-Externa-360-Sem-Fio-Wifi-2.4G-App-V360-Pro-G4-i.1241281618.2269882546", "Câmera Segurança Prova D'água Infravermelho", "Eletrônicos e Tecnologia"),
];

// Catálogo exclusivo do fluxo de postagem da Eva.
const PRODUTOS_FLUXO: Produto[] = [
  { id:"ppet01", nome:"Escova a vapor para pets 01", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/ppet01.jpg` },
  { id:"ppet02", nome:"Escova a vapor para pets 02", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/ppet02.jpg` },
  { id:"ppet03", nome:"Escova a vapor para pets 03", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/ppet03.jpg` },
  { id:"ppet04", nome:"Escova a vapor para pets 04", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/ppet04.jpg` },
  { id:"ppet05", nome:"Escova a vapor para pets 05", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/ppet05.jpg` },
  { id:"ppet06", nome:"Escova a vapor para pets 06", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/ppet06.jpg` },
];

const PRODUTOS_MALU_FLUXO: Produto[] = [
  { id:"malu01", nome:"Produto pet Shopee 01", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/malu/ppet%20shopee01.jpg` },
  { id:"malu02", nome:"Produto pet Shopee 02", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/malu/ppet%20shopee02.jpg` },
  { id:"malu03", nome:"Produto pet Shopee 03", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/malu/ppet%20shopee03.jpg` },
  { id:"malu04", nome:"Produto pet Shopee 04", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/malu/ppet%20shopee04.jpg` },
  { id:"malu05", nome:"Produto pet Shopee 05", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/malu/ppet%20shopee05.jpg` },
  { id:"malu06", nome:"Produto pet Shopee 06", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/malu/ppet%20shopee06.jpg` },
];

const NICHOS_TIPO: Record<string, NichoTipo> = {
  "01 - Moda, Beleza e Estilo":                     "camiseta",
  "02 - Casa, Cozinha e Decoração":                 "panela",
  "03 - Organização, Limpeza e Utilidades":         "caixa",
  "04 - Maternidade e Infantil":                    "mamadeira",
  "05 - Pets":                                      "pata",
  "06 - Eletrônicos e Tecnologia":                  "celular",
  "07 - Automóveis, Ferramentas e Segurança":       "carro",
  "08 - Papelaria, Artesanato e Personalizados":    "lapis",
  "09 - Alimentação e Comidas":                     "talher",
  "10 - Datas Comemorativas":                       "balao",
  "11 - Esporte, Fitness e Praia":                  "halter",
  "12 - Virais, Dublados e Conteúdos de Apoio":     "play",
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
  { num:"01", titulo:"Como ativar seu primeiro TikTok Shop",  desc:"Configure tudo em menos de 10 minutos e comece a vender.", duracao:"28min", nivel:"Iniciante",     aulas:4 },
  { num:"02", titulo:"Produtos que mais vendem no TikTok Shop", desc:"Os nichos e estratégias com maior taxa de conversão.",   duracao:"41min", nivel:"Iniciante",     aulas:5 },
  { num:"03", titulo:"IA de apresentador: guia completo",           desc:"Personalize seu apresentador virtual passo a passo.",    duracao:"35min", nivel:"Intermediário", aulas:6 },
  { num:"04", titulo:"Eva no automático: perfil do zero",             desc:"Como liberar o TikTok Shop em contas novas.",         duracao:"22min", nivel:"Iniciante",     aulas:3 },
];

type Screen = "home" | "destrava" | "pack" | "carrosseis" | "stories" | "produtos";
const SCREEN_SEGMENT: Record<Screen, string> = {
  home: "",
  destrava: "postar",
  pack: "pack-videos",
  carrosseis: "pack-carrosseis",
  stories: "pack-stories",
  produtos: "produtos-em-alta",
};
interface VideoItem  { message_id:string; nicho:string; link_video:string|null; link_shopee?:string|null; topico_original:string|null; r2_key:string|null; }
interface NichoRow   { nicho:string; total:number; }
interface CreativeAsset { id:string; creative_set_id:string; position:number; image_url:string; r2_key:string|null; original_filename:string|null; created_at:string; }
interface CreativeSet { id:string; type:"story"|"carousel"; category:string|null; product_url:string|null; product_name:string|null; r2_folder:string|null; is_active:boolean; created_at:string; creative_assets:CreativeAsset[]; }
interface IntegrationStatus { checkout_clicked_at?: string; proof_filename?: string; proof_size?: number; activated_at?: string; }

type TempoId = "24h" | "36h" | "48h";

interface DestravaData {
  active: boolean;
  username: string;
  nicho: string;
  tempo: TempoId;
  volume: number;
  activatedAt: number;
}


function TikTokIcon({ size=18, color="white" }: { size?:number; color?:string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 106.34 6.34V8.69a8.17 8.17 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z"/>
    </svg>
  );
}

function IconCarrosseis({ size, stroke }: { size:number; stroke:string; accent?:string; bg?:string }) {
  return <PanelsTopLeft size={size} color={stroke} strokeWidth={2.2} />;
}

function IconStories({ size, stroke }: { size:number; stroke:string; accent?:string; bg?:string }) {
  return <Images size={size} color={stroke} strokeWidth={2.2} />;
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

// O fragmento temporal pede ao navegador um quadro real do inÃ­cio do arquivo.
// Com preload="auto", o card nÃ£o depende de o usuÃ¡rio abrir o player para
// desenhar sua prÃ©via (alguns MP4s mantÃªm os Ã­ndices no fim do arquivo).
function videoPreviewUrl(url: string | null) {
  if (!url) return "";
  return url.includes("#") ? url : `${url}#t=0.15`;
}

function PrimaryBtn({ children, onClick, disabled }: {
  children:ReactNode; onClick?:()=>void; disabled?:boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full flex items-center justify-center gap-2 font-bold py-[14px] rounded-2xl text-sm transition-all active:scale-[0.98] disabled:opacity-40"
      style={{ background: LIME, color: "#16130E", boxShadow: disabled ? undefined : "0 6px 20px rgba(140,190,20,0.35)" }}>
      {children}
    </button>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────

function Home({ onNavigate, onStart, onLogout, onProductsLocked, onRefunded, refundRequested, theme }: { onNavigate:(s:Screen)=>void; onStart:()=>void; onLogout:()=>void; onProductsLocked:()=>void; onRefunded:()=>void; refundRequested:boolean; theme: BrandTheme }) {
  const modsRef = useRef<HTMLDivElement>(null);

  const modules = [
    { id:"produtos"    as Screen, title:"Produtos em Alta",   desc:"Produtos selecionados para divulgar.", Comp:IconAlta, look:"dark"  as const, rot:-2.2 },
    { id:"carrosseis"  as Screen, title:"Pack de Carrosséis", desc:"Artes prontas para publicar.",          Comp:IconCarrosseis, look:"light" as const, rot:1.8 },
    { id:"stories"     as Screen, title:"Pack de Stories",    desc:"Stories prontos para engajar.",          Comp:IconStories, look:"vivid" as const, rot:-1.1 },
    { id:"pack"        as Screen, title:"Pack de Vídeos",     desc:"Vídeos prontos para divulgar.",          Comp:IconVideos, look:"lime" as const, rot:1.1 },
  ];

  // Variações de card (crachá: roxo vívido, lima, preto, branco)
  const looks = {
    vivid: { card: { background: P, boxShadow: "0 14px 32px rgba(122,43,245,0.34)" },       title: "text-white",      desc: "text-white/70",      box: "#fff",    stroke: "#16130E", accent: P },
    lime:  { card: { background: LIME, boxShadow: "0 12px 28px rgba(140,190,20,0.35)" },    title: "text-foreground", desc: "text-foreground/60", box: "#fff",    stroke: "#16130E", accent: P },
    dark:  { card: { background: CARD_DARK, boxShadow: "0 14px 32px rgba(22,19,14,0.32)" }, title: "text-white",      desc: "text-white/60",      box: "#2C2822", stroke: "#fff",    accent: LIME },
    light: { card: { background: "#fff", border: CARD_EDGE, boxShadow: CARD_SHADOW },       title: "text-foreground", desc: "text-foreground/55", box: theme.id === "malu" ? "#FFF1E5" : "#F2EBFE", stroke: "#16130E", accent: P },
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={PAGE_BG}>
      {/* Nav estilo Craft: wordmark + links + botão preto */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        className="max-w-md mx-auto px-4 pt-5">
        <div className="bg-white/85 backdrop-blur rounded-full pl-3 pr-1.5 py-1.5 flex items-center justify-between"
          style={{ border: CARD_EDGE, boxShadow: "0 6px 20px rgba(22,19,14,0.08)" }}>
          <img src={theme.logoUrl} alt={theme.name} className="h-11 w-auto -my-1" draggable={false} />
          <div className="flex items-center gap-1.5">
            <button onClick={onLogout} title="Sair"
              className="w-8 h-8 rounded-full bg-black/[0.05] flex items-center justify-center text-foreground/55 active:scale-95 transition-transform">
              <LogOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={onStart}
              className="flex items-center gap-1.5 text-white text-[11.5px] font-bold pl-3.5 pr-4 py-2 rounded-full active:scale-95 transition-transform"
              style={{ background: "#16130E" }}>
              {theme.id === "malu" ? theme.channels.map(channel => (
                <span key={channel.name} className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white">
                  <img src={channel.logoUrl} alt={channel.name} className="w-2.5 h-2.5" draggable={false} />
                </span>
              )) : <TikTokIcon size={11} />} Começar
            </button>
          </div>
        </div>
      </motion.div>

      {/* Headline serif com rabiscos (estilo Craft) */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
        className="max-w-md mx-auto px-6 pt-12 pb-2 text-center relative">
        <p className="text-[10px] font-bold tracking-[0.2em] text-foreground/40 uppercase mb-4">
          Sua assistente virtual
        </p>
        <h1 className="font-extrabold text-[29px] leading-[1.15] text-foreground tracking-tight">
          {theme.id === "malu" ? <>Use a Malu para postar<br /> em varios canais</> : <>Use a Eva para postar<br /> no{" "}</>}{" "}
          <span className="relative inline-block">
            <em className="font-display italic" style={{ color: P }}>{theme.id === "malu" ? "e vender mais." : "TikTok Shop."}</em>
            <svg className="absolute left-0 -bottom-1.5 w-full" height="8" viewBox="0 0 60 8" preserveAspectRatio="none">
              <path d="M2 6 Q 12 2 22 5 T 42 5 T 58 4" stroke={LIME} strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
      </motion.div>

      <div className="max-w-md mx-auto px-5 pt-9 pb-16">
        {/* Banner principal roxo (estilo Craft "Let's get started") com a Eva em cima */}
        <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}
          onClick={onStart}
          className="relative rounded-[1.75rem] cursor-pointer active:scale-[0.995] transition-transform"
          style={{ background: P, boxShadow: "0 20px 46px rgba(122,43,245,0.38)" }}>

          {/* Textura de pincelada orgânica + rabisco lima */}
          <div className="absolute inset-0 rounded-[1.75rem] overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 260" preserveAspectRatio="none">
              <path d="M-30 200 C 60 130, 100 235, 185 165 S 320 60, 440 130"
                stroke={P} strokeWidth="42" fill="none" strokeLinecap="round" opacity="0.55" />
              <path d="M-20 70 C 90 20, 170 105, 260 50 S 380 90, 430 40"
                stroke={P2} strokeWidth="26" fill="none" strokeLinecap="round" opacity="0.5" />
              <motion.path d="M-10 240 Q 40 216 92 236 T 200 232 T 305 240 T 425 228"
                stroke={LIME} strokeWidth="5" fill="none" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: 1.5, duration: 1.1, ease: "easeInOut" }} />
            </svg>
          </div>

          {/* Explosão lima atrás da Eva (estilo crachá) */}
          <div className="absolute pointer-events-none" style={{ right: 118, top: -22, zIndex: 4 }}>
            <Starburst size={76} color={LIME} />
          </div>

          {/* Eva em pé sobre o card, atrás dos botões */}
          <motion.div className="absolute pointer-events-none" style={{ right: -4, bottom: 0, zIndex: 5 }}
            initial={{ y: 42, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 120, damping: 15 }}>
            <motion.div animate={{ y: [0, -4, 0], rotate: [-1, 1, -1] }}
              transition={{ delay: 2.2, duration: 3.6, repeat: Infinity, ease: "easeInOut" }}>
              <img src={theme.homeImageUrl} alt={theme.name} draggable={false} style={{ width: 140, height: "auto" }} />
            </motion.div>
          </motion.div>

          <div className="relative px-6 pt-7 pb-7">
            <span className="relative z-10 inline-block text-[9px] font-bold tracking-[0.14em] px-3 py-[5px] rounded-full uppercase text-white"
              style={{ background: "rgba(255,255,255,0.18)" }}>No automático</span>
            <h3 className="relative z-10 font-display italic font-semibold text-[30px] leading-[1.08] tracking-tight mt-3 max-w-[210px] text-white">
              Poste com a&nbsp;{theme.name}
            </h3>
            <p className="relative z-10 text-[12.5px] mt-2 leading-relaxed max-w-[200px]" style={{ color: "rgba(255,255,255,0.75)" }}>
              {refundRequested ? "Sua automação foi encerrada após o pedido de reembolso. Seus packs continuam disponíveis." : theme.id === "malu" ? "Ela encontra produtos da Shopee e prepara conteúdo para Shopee Video, TikTok e Instagram." : "Ela publica por você até liberar o TikTok Shop. Sem aparecer."}
            </p>
            {theme.id === "malu" && (
              <div className="relative z-10 flex items-center gap-1.5 mt-3">
                {theme.channels.map(channel => (
                  <span key={channel.name} className="w-6 h-6 rounded-full bg-white flex items-center justify-center" title={channel.name}>
                    <img src={channel.logoUrl} alt={channel.name} className="w-3.5 h-3.5" draggable={false} />
                  </span>
                ))}
              </div>
            )}
            <div className="relative z-20 mt-5 flex flex-wrap items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); onStart(); }}
                className="flex items-center gap-1.5 text-[13px] font-bold px-5 py-3 rounded-full active:scale-95 transition-transform"
                style={{ background: LIME, color: "#16130E", boxShadow: "0 6px 18px rgba(0,0,0,0.28)" }}>
                Começar agora <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Título de seção serif com estrela atrás */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="relative text-center pt-12 pb-6">
          <div className="absolute pointer-events-none opacity-90" style={{ left: "50%", marginLeft: -128, top: 26 }}>
            <Starburst size={56} color={LIME} />
          </div>
          <h2 className="relative font-display font-medium text-[26px] text-foreground tracking-tight">Tudo para você vender</h2>
          <p className="relative text-[12px] text-foreground/50 mt-1.5">Explore o que a {theme.name} já deixou pronto pra você.</p>
        </motion.div>

        {/* Grid de módulos: cards tortos */}
        <div className="relative">
          <div ref={modsRef} className="relative grid grid-cols-2 gap-3">
            {modules.map(({ id, title, desc, Comp, look, rot }, i) => {
              const lk = looks[look];
              return (
                <motion.div key={id}
                  initial={{ opacity:0, y:18, rotate: rot }}
                  animate={{ opacity:1, y:0, rotate: rot }}
                  whileHover={{ rotate: 0, y: -5, transition: { delay: 0, duration: 0.25 } }}
                  whileTap={{ scale: 0.95, rotate: 0, transition: { delay: 0, duration: 0.12 } }}
                  transition={{ delay: 0.38 + i * 0.06 }}
                  onClick={() => refundRequested && id === "produtos" ? onProductsLocked() : onNavigate(id)}
                  className="rounded-[1.5rem] px-4 pt-6 pb-5 flex flex-col items-center text-center cursor-pointer"
                  style={lk.card}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5"
                    style={{ background: lk.box, boxShadow: "0 4px 12px rgba(22,19,14,0.16)" }}>
                    <Comp size={34} stroke={lk.stroke} accent={lk.accent} bg={lk.box} />
                  </div>
                  <p className={`text-[11px] font-extrabold tracking-[0.1em] uppercase leading-tight ${lk.title}`}>{title}</p>
                  <p className={`text-[10.5px] mt-1.5 leading-snug ${lk.desc}`}>{desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[10px] text-foreground/25 pt-7 font-semibold tracking-[0.15em] uppercase">
          {theme.name} · Sua assistente virtual
        </p>

        <RefundSection theme={theme} refunded={refundRequested} onRefunded={onRefunded} />
      </div>
    </div>
  );
}

// O checkout será preenchido assim que os links de pagamento forem definidos.
const INTEGRATION_CHECKOUT_URL: Record<BrandId, string> = {
  eva: "https://checkout.perfectpay.com.br/pay/PPU38CQF3I8",
  malu: "https://checkout.perfectpay.com.br/pay/PPU38CQF3IH",
};
const REFUND_WEBHOOK_URL = "https://n8n.afiliadasbrasil.com/webhook/642881a3-2ad5-473e-9a7d-1eaa8bd1ee78";

function readIntegrationStatus(metadata: unknown, brand: BrandId): IntegrationStatus {
  if (!metadata || typeof metadata !== "object") return {};
  const integrations = (metadata as Record<string, unknown>).integrations;
  if (!integrations || typeof integrations !== "object") return {};
  const status = (integrations as Record<string, unknown>)[brand];
  return status && typeof status === "object" ? status as IntegrationStatus : {};
}

function hasRefundRequest(metadata: unknown) {
  return Boolean(metadata && typeof metadata === "object" && (metadata as Record<string, unknown>).refund_requested_at);
}

function hasAccountBlocked(metadata: unknown) {
  return Boolean(metadata && typeof metadata === "object" && (metadata as Record<string, unknown>).account_blocked_at);
}

async function saveIntegrationStatus(brand: BrandId, update: IntegrationStatus) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Não foi possível identificar sua conta. Entre novamente e tente de novo.");

  const current = readIntegrationStatus(user.user_metadata, brand);
  const integrations = user.user_metadata?.integrations && typeof user.user_metadata.integrations === "object"
    ? user.user_metadata.integrations as Record<string, unknown>
    : {};
  const next = { ...current, ...update };
  const { error } = await supabase.auth.updateUser({
    data: { ...user.user_metadata, integrations: { ...integrations, [brand]: next } },
  });
  if (error) throw error;
  return next;
}

function IntegrationModal({ theme, status, onClose, onRequestRefund, onStatusChange, onActivated }: {
  theme: BrandTheme;
  status: IntegrationStatus;
  onClose:()=>void;
  onRequestRefund:()=>void;
  onStatusChange:(status: IntegrationStatus)=>void;
  onActivated:(status: IntegrationStatus)=>void;
}) {
  const malu = theme.id === "malu";
  const checkoutUrl = INTEGRATION_CHECKOUT_URL[theme.id];
  const channels = malu ? "Shopee, TikTok e Instagram" : "ByteDance (TikTok)";
  const [proof, setProof] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentStarted = Boolean(status.checkout_clicked_at);

  async function startPayment() {
    setBusy(true);
    setError(null);
    try {
      const next = await saveIntegrationStatus(theme.id, { checkout_clicked_at: new Date().toISOString() });
      onStatusChange(next);
      window.location.assign(checkoutUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível registrar o acesso ao checkout.");
      setBusy(false);
    }
  }

  async function confirmProof() {
    if (!proof) return;
    setBusy(true);
    setError(null);
    try {
      const next = await saveIntegrationStatus(theme.id, {
        proof_filename: proof.name,
        proof_size: proof.size,
        activated_at: new Date().toISOString(),
      });
      onStatusChange(next);
      onActivated(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível liberar a integração agora.");
      setBusy(false);
    }
  }

  // Depois do primeiro clique no checkout, este é deliberadamente um modal
  // separado: nenhuma copy, taxa ou informação da etapa inicial é renderizada.
  if (paymentStarted) {
    return (
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/65 p-3 sm:p-5"
        onClick={onClose}>
        <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:28 }}
          transition={{ type:"spring", damping:25, stiffness:260 }} onClick={(event) => event.stopPropagation()}
          className="w-full max-w-md rounded-[1.75rem] bg-white p-5 sm:p-6" style={{ boxShadow:"0 24px 80px rgba(0,0,0,0.35)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/40">Pagamento iniciado</p>
              <h2 className="mt-2 text-[1.55rem] font-extrabold leading-[1.12] tracking-tight">Já fez o pagamento?<br /><em className="italic" style={{ color:P }}>Anexe o comprovante.</em></h2>
            </div>
            <button onClick={onClose} aria-label="Fechar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-foreground/55"><X className="h-4 w-4" /></button>
          </div>

          <div className="mt-5 rounded-2xl border border-black/[0.08] p-3.5">
            <label htmlFor="payment-proof" className="block text-[11px] font-extrabold text-foreground">Anexar comprovante de pagamento</label>
            <input id="payment-proof" type="file" onChange={(event) => setProof(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-[11px] text-foreground/60 file:mr-3 file:rounded-lg file:border-0 file:bg-black/[0.06] file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-foreground" />
            {proof && <p className="mt-2 truncate text-[10px] font-semibold" style={{ color:P }}>{proof.name}</p>}
          </div>
          <button onClick={confirmProof} disabled={!proof || busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[13px] font-extrabold text-white disabled:opacity-50" style={{ background:P }}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? "Confirmando..." : "Confirmar e liberar post automático"}
          </button>
          <button onClick={startPayment} disabled={busy} className="mt-4 w-full text-center text-[11px] font-extrabold underline underline-offset-2 disabled:opacity-50" style={{ color:P }}>
            Ainda não fez o pagamento? Faça por aqui
          </button>
          {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-[11px] font-medium text-red-700">{error}</p>}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/65 p-3 sm:p-5"
      onClick={onClose}>
      <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:28 }}
        transition={{ type:"spring", damping:25, stiffness:260 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-[1.75rem] bg-white p-5 sm:p-6"
        style={{ boxShadow:"0 24px 80px rgba(0,0,0,0.35)" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/40">{paymentStarted ? "Pagamento iniciado" : "Ativação necessária"}</p>
            <h2 className="mt-2 text-[1.55rem] font-extrabold leading-[1.12] tracking-tight">
              {paymentStarted ? <>Já fez o pagamento?<br /><em className="italic" style={{ color:P }}>Anexe o comprovante.</em></> : <>Libere a {theme.name}<br /><em className="italic" style={{ color:P }}>para trabalhar no automático.</em></>}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-foreground/55">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!paymentStarted && <>
          <p className="mt-4 text-[13px] leading-relaxed text-foreground/60">
            Para a {theme.name} publicar automaticamente, é preciso ativar a conexão oficial com {channels}.
          </p>

          <div className="mt-4 rounded-2xl p-4" style={{ background: malu ? "#FFF4EC" : "#F4F0FF" }}>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white" style={{ color:P }}><ShieldCheck className="h-5 w-5" /></span>
              <div>
                <p className="text-[12px] font-extrabold text-foreground">Pagamento direto às plataformas</p>
                <p className="mt-1 text-[11px] leading-relaxed text-foreground/60">
                  Os R$ 19,55 são pagos diretamente para {channels}. A {theme.name} não fica com esse dinheiro.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-black/[0.08] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.05]" style={{ color:P }}><WalletCards className="h-5 w-5" /></span>
                <div>
                  <p className="text-[12px] font-extrabold">Taxa de integração oficial</p>
                  <p className="text-[10.5px] text-foreground/50">Pix ou cartão de crédito</p>
                </div>
              </div>
              <p className="text-[1.35rem] font-extrabold" style={{ color:P }}>R$ 19,55</p>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-foreground/55">
              Essa é a taxa da integração oficial exigida pelas plataformas. A conversão foi congelada em R$ 19,55 para você não ter variação no valor.
            </p>
          </div>

          {malu && <div className="mt-3 flex items-center gap-1.5 px-1">
            {theme.channels.map(channel => <span key={channel.name} className="flex h-7 w-7 items-center justify-center rounded-full border border-black/[0.08] bg-white" title={channel.name}>
              <img src={channel.logoUrl} alt={channel.name} className="h-4 w-4" draggable={false} />
            </span>)}
            <span className="ml-1 text-[10px] font-semibold text-foreground/50">Integração com os seus canais</span>
          </div>}
        </>}

        {paymentStarted ? <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-black/[0.08] p-3.5">
            <label htmlFor="payment-proof" className="block text-[11px] font-extrabold text-foreground">Anexar comprovante de pagamento</label>
            <input id="payment-proof" type="file" onChange={(event) => setProof(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-[11px] text-foreground/60 file:mr-3 file:rounded-lg file:border-0 file:bg-black/[0.06] file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-foreground" />
            {proof && <p className="mt-2 truncate text-[10px] font-semibold" style={{ color:P }}>{proof.name}</p>}
          </div>
          <button onClick={confirmProof} disabled={!proof || busy} className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[13px] font-extrabold text-white disabled:opacity-50" style={{ background:P }}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? "Confirmando..." : "Confirmar e liberar post automático"}
          </button>
          <button onClick={startPayment} disabled={busy} className="w-full text-center text-[11px] font-extrabold underline underline-offset-2 disabled:opacity-50" style={{ color:P }}>
            Ainda não fez o pagamento? Faça por aqui
          </button>
        </div> : <button onClick={startPayment} disabled={busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[13px] font-extrabold text-white disabled:opacity-60" style={{ background:P }}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Abrindo pagamento..." : "Fazer o pagamento e ativar"} {!busy && <ChevronRight className="h-4 w-4" />}
        </button>}
        {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-[11px] font-medium text-red-700">{error}</p>}

        {!paymentStarted && <div className="mt-5 border-t border-black/[0.07] pt-4 text-center">
          <p className="text-[11px] leading-relaxed text-foreground/55">Os packs continuam disponíveis mesmo sem ativar a integração.</p>
          <button onClick={onRequestRefund} className="mt-2 text-[11px] font-extrabold underline underline-offset-2" style={{ color:P }}>Realizar pedido de reembolso</button>
        </div>}
      </motion.div>
    </motion.div>
  );
}

function ProductsLockedModal({ theme, onClose }: { theme: BrandTheme; onClose:()=>void }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/65 p-5" onClick={onClose}>
      <motion.div initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:22 }}
        onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-[1.75rem] bg-white p-6" style={{ boxShadow:"0 24px 80px rgba(0,0,0,0.35)" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/40">Acesso encerrado</p>
            <h2 className="mt-2 text-[1.5rem] font-extrabold leading-[1.12] tracking-tight">Produtos em Alta<br /><em className="italic" style={{ color:P }}>está bloqueado.</em></h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-foreground/55"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-foreground/60">Após a solicitação de reembolso, o acesso à {theme.name}, ao post automático e a Produtos em Alta é encerrado. Seus Packs de Vídeos, Stories e Carrosséis continuam disponíveis.</p>
        <button onClick={onClose} className="mt-5 w-full rounded-xl py-3.5 text-[13px] font-extrabold text-white" style={{ background:P }}>Entendi</button>
      </motion.div>
    </motion.div>
  );
}

function AutomationLockedModal({ theme, onClose }: { theme: BrandTheme; onClose:()=>void }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/65 p-5" onClick={onClose}>
      <motion.div initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:22 }}
        onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-[1.75rem] bg-white p-6" style={{ boxShadow:"0 24px 80px rgba(0,0,0,0.35)" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/40">Acesso encerrado</p>
            <h2 className="mt-2 text-[1.5rem] font-extrabold leading-[1.12] tracking-tight">A automação da {theme.name}<br /><em className="italic" style={{ color:P }}>está bloqueada.</em></h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-foreground/55"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-foreground/60">Após a solicitação de reembolso, o acesso à automação da {theme.name} foi encerrado. Seus Packs de Vídeos, Stories e Carrosséis continuam disponíveis.</p>
        <button onClick={onClose} className="mt-5 w-full rounded-xl py-3.5 text-[13px] font-extrabold text-white" style={{ background:P }}>Entendi</button>
      </motion.div>
    </motion.div>
  );
}

function RefundSection({ theme, refunded, onRefunded }: { theme: BrandTheme; refunded:boolean; onRefunded:()=>void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [sent, setSent] = useState(refunded);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSent(refunded);
  }, [refunded]);

  function submitRefund(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirming(true);
  }

  async function confirmRefund() {
    setSending(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Não foi possível identificar sua conta. Entre novamente e tente de novo.");

      const requestedAt = new Date().toISOString();
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        phone_raw: phone.replace(/\D/g, ""),
        source: "reembolso_trial",
        requested_at: requestedAt,
        user_id: user.id,
      };

      // O n8n informado recebe application/x-www-form-urlencoded e expõe estes
      // campos exatamente dentro de body, como no payload de referência.
      await fetch(REFUND_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams(payload).toString(),
      });

      const { error: updateError } = await supabase.auth.updateUser({
        data: { ...user.user_metadata, refund_requested_at: requestedAt, account_blocked_at: requestedAt },
      });
      if (updateError) throw updateError;
      setSent(true);
      onRefunded();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível enviar o pedido agora. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  const fieldClass = "w-full rounded-xl border border-black/[0.10] bg-white px-3.5 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/[0.08]";

  return (
    <section id="reembolso" className="mt-14">
      <div className="rounded-[1.5rem] bg-white p-5" style={{ border:CARD_EDGE, boxShadow:CARD_SHADOW }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/40">Atendimento</p>
        <h2 className="mt-2 text-[1.35rem] font-extrabold tracking-tight">Realizar pedido de reembolso</h2>
        <p className="mt-2 text-[12px] leading-relaxed text-foreground/55">Preencha seus dados para solicitar o reembolso da compra.</p>

        {!open && !sent && <button onClick={() => setOpen(true)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-black/[0.10] py-3.5 text-[12px] font-extrabold text-foreground">
          Realizar pedido de reembolso <ChevronRight className="h-3.5 w-3.5" />
        </button>}

        {sent ? <div className="mt-5 rounded-2xl p-4 text-[12px] leading-relaxed" style={{ background: theme.id === "malu" ? "#FFF4EC" : "#F4F0FF" }}>
          <p className="font-extrabold">Reembolso solicitado com sucesso.</p>
          <p className="mt-1 text-foreground/60">Em até cinco dias úteis, a instituição financeira irá realizar o estorno para sua conta. O acesso à automação e a Produtos em Alta foi encerrado; seus packs continuam disponíveis.</p>
        </div> : confirming ? <div className="mt-5 rounded-2xl border border-black/[0.10] p-4">
          <p className="text-[13px] font-extrabold">Confirmar pedido de reembolso?</p>
          <p className="mt-2 text-[11px] leading-relaxed text-foreground/60">Ao confirmar, você perde o acesso à {theme.name}, ao post automático e a Produtos em Alta. Seus Packs de Vídeos, Stories e Carrosséis continuam disponíveis.</p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setConfirming(false)} disabled={sending} className="flex-1 rounded-xl border border-black/[0.10] py-3 text-[11px] font-extrabold disabled:opacity-50">Voltar</button>
            <button onClick={confirmRefund} disabled={sending} className="flex-1 rounded-xl py-3 text-[11px] font-extrabold text-white disabled:opacity-50" style={{ background:P }}>
              {sending ? "Enviando..." : "Confirmar"}
            </button>
          </div>
          {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-[11px] font-medium text-red-700">{error}</p>}
        </div> : open && <form onSubmit={submitRefund} className="mt-5 space-y-3">
          <div>
            <label htmlFor="refund-name" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/45">Seu nome</label>
            <input id="refund-name" required value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} placeholder="Como consta na compra" />
          </div>
          <div>
            <label htmlFor="refund-email" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/45">E-mail usado na compra</label>
            <input id="refund-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} placeholder="voce@email.com" />
          </div>
          <div>
            <label htmlFor="refund-phone" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/45">Telefone</label>
            <input id="refund-phone" type="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} placeholder="(00) 00000-0000" />
          </div>
          <button type="submit" className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-black/[0.10] py-3.5 text-[12px] font-extrabold text-foreground">
            <Send className="h-3.5 w-3.5" /> Continuar
          </button>
        </form>}
      </div>
    </section>
  );
}

const NICHO_MAP: Record<string,string> = {
  "moda":        "01 - Moda, Beleza e Estilo",
  "casa":        "02 - Casa, Cozinha e Decoração",
  "fitness":     "11 - Esporte, Fitness e Praia",
  "eletro":      "06 - Eletrônicos e Tecnologia",
  "pets":        "05 - Pets",
  "maternidade": "04 - Maternidade e Infantil",
};

// ─── PACK +10.000 VÍDEOS ─────────────────────────────────────────────────────

function PackScreen({ onBack, theme }: { onBack:()=>void; theme: BrandTheme }) {
  const VIDEO_PAGE_SIZE = 24;
  const [nichos, setNichos]       = useState<NichoRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [nichoCurr, setNichoCurr] = useState<NichoRow|null>(null);
  const [videos, setVideos]       = useState<VideoItem[]>([]);
  const [vLoading, setVLoading]   = useState(false);
  const [loadingMoreVideos, setLoadingMoreVideos] = useState(false);
  const [hasMoreVideos, setHasMoreVideos] = useState(false);
  const [modalUrl, setModalUrl]   = useState<string|null>(null);

  useEffect(() => {
    supabase.rpc("get_nichos_videos")
      .then(({ data }) => { setNichos((data as NichoRow[]) ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function openNicho(n: NichoRow) {
    setNichoCurr(n);
    setVideos([]);
    setHasMoreVideos(false);
    setVLoading(true);
    const { data } = await supabase
      .from("videos_achadinhos")
      .select("message_id, nicho, link_video, link_shopee, topico_original, r2_key")
      .eq("nicho", n.nicho)
      .order("message_id", { ascending:false })
      .range(0, VIDEO_PAGE_SIZE - 1);
    const initialVideos = (data as VideoItem[]) ?? [];
    setVideos(initialVideos);
    setHasMoreVideos(initialVideos.length === VIDEO_PAGE_SIZE);
    setVLoading(false);
  }

  async function loadMoreVideos() {
    if (!nichoCurr || loadingMoreVideos) return;
    setLoadingMoreVideos(true);
    const start = videos.length;
    const { data } = await supabase
      .from("videos_achadinhos")
      .select("message_id, nicho, link_video, link_shopee, topico_original, r2_key")
      .eq("nicho", nichoCurr.nicho)
      .order("message_id", { ascending:false })
      .range(start, start + VIDEO_PAGE_SIZE - 1);
    const nextVideos = (data as VideoItem[]) ?? [];
    setVideos((current) => [...current, ...nextVideos]);
    setHasMoreVideos(nextVideos.length === VIDEO_PAGE_SIZE);
    setLoadingMoreVideos(false);
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
              <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Pack de Vídeos {theme.id === "malu" ? "Shopee" : ""}</p>
              <p className="font-extrabold text-[15px] text-foreground leading-tight">
                {NICHOS_LABEL[nichoCurr.nicho] ?? nichoCurr.nicho}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: LIME, color: "#16130E" }}>
              {nichoCurr.total} vídeos
            </span>
          </div>

          <div className="px-5 pb-14">
            {vLoading ? (
              <EvaLoader className="py-16" label={`A ${theme.name} está buscando os vídeos...`} />
            ) : videos.length === 0 ? (
              <p className="text-center text-foreground/40 text-[13px] py-16">Nenhum vídeo encontrado.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  {videos.map(v => (
                  <div key={v.message_id} className="rounded-2xl overflow-hidden"
                    style={{ background: CARD_DARK, boxShadow:"0 2px 10px rgba(0,0,0,0.2)" }}>
                    <div className="relative cursor-pointer active:opacity-80 transition-opacity"
                      onClick={() => v.link_video && setModalUrl(v.link_video)}>
                      <video
                        src={videoPreviewUrl(v.link_video)}
                        preload="auto"
                        muted
                        playsInline
                        onLoadedData={(e) => { (e.currentTarget as HTMLVideoElement).pause(); }}
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
                        {theme.id === "malu" && v.link_shopee && (
                          <a href={v.link_shopee} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[9px] font-bold"
                            style={{ background: "rgba(255,255,255,0.96)", color: "#D94824" }}>
                            <ExternalLink className="w-3 h-3" /> Ver produto
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
                {hasMoreVideos && <button onClick={loadMoreVideos} disabled={loadingMoreVideos}
                  className="w-full mt-5 rounded-xl py-3 text-[11px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background:"#fff", color:P, border:CARD_EDGE, boxShadow:"0 3px 10px rgba(22,19,14,0.05)" }}>
                  {loadingMoreVideos ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                  {loadingMoreVideos ? "Carregando..." : "Ver mais vÃ­deos"}
                </button>}
              </>
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
    <div className="min-h-screen" style={PAGE_BG}>
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
          <h2 className="font-extrabold text-[1.85rem] leading-[1.15] tracking-tight">
            Pack de<br /><em className="italic" style={{ color:P }}>Vídeos</em>
          </h2>
          <p className="text-foreground/50 text-[13px] mt-3">Vídeos prontos por nicho para {theme.name} postar.</p>
        </div>

        <div className="px-5 mt-5 mb-7">
          <motion.div initial={{ opacity:0, y:12, rotate:-1.2 }} animate={{ opacity:1, y:0, rotate:-1.2 }}
            className="relative rounded-[1.5rem] px-5 py-5"
            style={{ background: CARD_DARK, boxShadow: "0 14px 32px rgba(22,19,14,0.30)" }}>
            <div className="absolute -top-3.5 -right-2 pointer-events-none">
              <Starburst size={46} color={LIME} />
            </div>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/45 mb-2">Vídeos disponíveis</p>
            {loading ? (
              <EvaLoader size={30} className="py-1 items-start" />
            ) : (
              <>
                <p className="text-[2.2rem] font-extrabold leading-none" style={{ color: LIME }}>
                  +10.551
                </p>
                <p className="text-[12px] text-white/50 mt-1.5">vídeos prontos para a {theme.name} postar por você</p>
              </>
            )}
          </motion.div>
        </div>

        <div className="px-5 pb-14">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/60 uppercase">Nichos</span>
            <span className="text-[10px] font-bold" style={{ color:P }}>Selecione um</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {nichos.map((n, i) => {
              const tipo = NICHOS_TIPO[n.nicho] ?? "play";
              const label = NICHOS_LABEL[n.nicho] ?? n.nicho;
              const look = ([
                { card: { background: "#fff", border: CARD_EDGE, boxShadow: "0 4px 14px rgba(22,19,14,0.06)" }, chip: "#F4EFFE", stroke: "#16130E", accent: P,    title: "text-foreground", count: { background: "rgba(122,43,245,0.08)", color: P } },
                { card: { background: LIME, boxShadow: "0 10px 24px rgba(140,190,20,0.30)" },                   chip: "#fff",    stroke: "#16130E", accent: P,    title: "text-foreground", count: { background: "rgba(22,19,14,0.10)", color: "#16130E" } },
                { card: { background: CARD_DARK, boxShadow: "0 12px 26px rgba(22,19,14,0.30)" },                chip: "#2C2822", stroke: "#fff",    accent: LIME, title: "text-white",      count: { background: "rgba(255,255,255,0.10)", color: LIME } },
                { card: { background: "#fff", border: CARD_EDGE, boxShadow: "0 4px 14px rgba(22,19,14,0.06)" }, chip: "#F4EFFE", stroke: "#16130E", accent: P2,   title: "text-foreground", count: { background: "rgba(236,72,153,0.08)", color: P2 } },
              ] as const)[i % 4];
              const rot = [-1.6, 1.4, 1.6, -1.4][i % 4];
              return (
                <motion.div key={n.nicho} onClick={() => openNicho(n)}
                  initial={{ opacity: 0, y: 14, rotate: rot }} animate={{ opacity: 1, y: 0, rotate: rot }}
                  whileTap={{ scale: 0.94, rotate: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  className="rounded-[1.4rem] px-3 py-5 flex flex-col items-center text-center gap-2.5 cursor-pointer"
                  style={look.card as React.CSSProperties}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: look.chip, boxShadow: "0 3px 10px rgba(22,19,14,0.13)" }}>
                    <NichoIcon tipo={tipo} size={27} stroke={look.stroke} accent={look.accent} bg={look.chip} />
                  </div>
                  <p className={`text-[12.5px] font-extrabold leading-tight ${look.title}`}>{label}</p>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={look.count as React.CSSProperties}>
                    {Number(n.total).toLocaleString("pt-BR")} vídeos
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PACKS DE CRIATIVOS ───────────────────────────────────────────────────────

function downloadCreativeAssets(assets: CreativeAsset[]) {
  assets.forEach((asset, index) => {
    window.setTimeout(() => {
      const anchor = document.createElement("a");
      anchor.href = asset.image_url;
      anchor.download = asset.original_filename ?? `criativo-${index + 1}.jpg`;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }, index * 180);
  });
}

function CreativePreview({ set, type, theme, onClose }: { set: CreativeSet; type:"story"|"carousel"; theme:BrandTheme; onClose:()=>void }) {
  const assets = [...(set.creative_assets ?? [])].sort((a, b) => a.position - b.position);
  const [current, setCurrent] = useState(0);
  const asset = assets[current];
  if (!asset) return null;

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.80)" }} onClick={onClose}>
      <motion.div initial={{ y:18, scale:0.98 }} animate={{ y:0, scale:1 }} exit={{ y:18, scale:0.98 }}
        className="w-full max-w-sm rounded-[1.6rem] overflow-hidden" style={{ background: CARD_DARK }} onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-white/45">{type === "carousel" ? "Carrossel" : "Story"}</p>
            <p className="text-[13px] font-extrabold text-white">{set.product_name ?? set.category ?? "Criativo pronto"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
        </div>
        <div className={`mx-4 rounded-2xl overflow-hidden bg-black/25 ${type === "story" ? "aspect-[9/16]" : "aspect-square"}`}>
          <img src={asset.image_url} alt="Prévia do criativo" className="w-full h-full object-contain" />
        </div>
        {assets.length > 1 && <div className="flex gap-2 overflow-x-auto px-4 pt-3">
          {assets.map((item, index) => <button key={item.id} onClick={() => setCurrent(index)}
            className="w-11 h-14 rounded-lg overflow-hidden shrink-0" style={{ border: index === current ? `2px solid ${P}` : "1px solid rgba(255,255,255,0.15)" }}>
            <img src={item.image_url} alt={`Página ${index + 1}`} className="w-full h-full object-cover" />
          </button>)}
        </div>}
        <div className="p-4 grid gap-2">
          <button onClick={() => downloadCreativeAssets(assets)} className="w-full rounded-xl py-3 text-[11px] font-bold flex items-center justify-center gap-2" style={{ background:"rgba(255,255,255,0.12)", color:"#fff" }}>
            <Download className="w-3.5 h-3.5" /> Baixar {type === "carousel" ? "imagens" : "story"}
          </button>
          {theme.id === "malu" && set.product_url && <a href={set.product_url} target="_blank" rel="noopener noreferrer"
            className="w-full rounded-xl py-3 text-[11px] font-bold flex items-center justify-center gap-2" style={{ background:"#fff", color:"#D94824" }}>
            <ExternalLink className="w-3.5 h-3.5" /> Ver produto na Shopee
          </a>}
        </div>
      </motion.div>
    </motion.div>
  );
}

const CREATIVE_PAGE_SIZE = 24;

async function getCreativeSets(type: "story" | "carousel", start = 0) {
  return supabase.from("creative_sets")
    .select("id, type, category, product_url, product_name, r2_folder, is_active, created_at, creative_assets(id, creative_set_id, position, image_url, r2_key, original_filename, created_at)")
    .eq("type", type)
    .eq("is_active", true)
    .order("created_at", { ascending:false })
    .range(start, start + CREATIVE_PAGE_SIZE - 1);
}

function CreativePackScreen({ onBack, theme, type }: { onBack:()=>void; theme:BrandTheme; type:"story"|"carousel" }) {
  const [sets, setSets] = useState<CreativeSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState<CreativeSet|null>(null);
  const isCarousel = type === "carousel";
  const title = isCarousel ? "Pack de Carrosséis" : "Pack de Stories";

  useEffect(() => {
    let active = true;

    getCreativeSets(type)
      .then(({ data }) => {
        if (!active) return;
        const initialSets = (data as CreativeSet[]) ?? [];
        setSets(initialSets);
        setHasMore(initialSets.length === CREATIVE_PAGE_SIZE);
      })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [type]);

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const { data } = await getCreativeSets(type, sets.length);
      const nextSets = (data as CreativeSet[]) ?? [];
      setSets((current) => [...current, ...nextSets]);
      setHasMore(nextSets.length === CREATIVE_PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        <div className="px-5 pt-7 pb-2 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] active:scale-95 transition-transform"><ArrowLeft className="w-4 h-4 text-foreground/60" /></button>
        </div>
        <div className="px-5 pt-4 pb-3">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-4">Atualizado hoje</p>
          <h2 className="font-extrabold text-[1.85rem] leading-[1.15] tracking-tight">{isCarousel ? <>Pack de<br /><em className="italic" style={{ color:P }}>Carrosséis</em></> : <>Pack de<br /><em className="italic" style={{ color:P }}>Stories</em></>}</h2>
          <p className="text-foreground/50 text-[13px] mt-3">{isCarousel ? "Sequências prontas de imagens para divulgar produtos." : "Stories prontos para você baixar e compartilhar."}</p>
        </div>
        <div className="px-5 pb-14 pt-4">
          {loading ? <EvaLoader className="py-16" label={`A ${theme.name} está organizando os criativos...`} /> : sets.length === 0 ? (
            <div className="rounded-2xl bg-white border border-black/[0.08] px-5 py-12 text-center"><p className="text-[13px] font-bold text-foreground/55">Nenhum criativo disponível no momento.</p></div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {sets.map((set, index) => {
                const assets = [...(set.creative_assets ?? [])].sort((a, b) => a.position - b.position);
                const preview = assets.slice(0, isCarousel ? 3 : 1);
                if (!preview.length) return null;
                return <motion.div key={set.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:index * 0.03 }}
                  className="rounded-2xl overflow-hidden bg-white" style={{ border:CARD_EDGE, boxShadow:"0 4px 14px rgba(22,19,14,0.07)" }}>
                  <button onClick={() => setSelected(set)} className={`w-full relative overflow-hidden ${isCarousel ? "aspect-[4/3] p-2 flex gap-1 bg-black/[0.03]" : "aspect-[9/14] bg-black/[0.03]"}`}>
                    {preview.map((asset, assetIndex) => <img key={asset.id} src={asset.image_url} alt="Prévia do criativo" className={isCarousel ? "w-1/3 h-full rounded-md object-cover" : "w-full h-full object-cover"} style={isCarousel ? { transform:`rotate(${assetIndex === 1 ? 0 : assetIndex === 0 ? -2 : 2}deg)` } : undefined} />)}
                    {isCarousel && assets.length > 3 && <span className="absolute right-2 bottom-2 px-2 py-1 rounded-full bg-black/70 text-white text-[9px] font-bold">+{assets.length - 3} imagens</span>}
                    {!isCarousel && <span className="absolute right-2 bottom-2 px-2 py-1 rounded-full bg-black/70 text-white text-[9px] font-bold">Story</span>}
                  </button>
                  <div className="px-3 pt-3 pb-3">
                    <p className="text-[10.5px] font-extrabold leading-tight line-clamp-1">{set.product_name ?? set.category ?? "Criativo pronto"}</p>
                    <p className="text-[9px] text-foreground/45 mt-1">{isCarousel ? `${assets.length} imagens` : "Imagem pronta"}</p>
                    <div className="flex gap-1.5 mt-3">
                      <button onClick={() => downloadCreativeAssets(assets)} className="flex-1 rounded-lg py-2 text-[9px] font-bold flex items-center justify-center gap-1" style={{ background:"rgba(22,19,14,0.06)", color:"#16130E" }}><Download className="w-3 h-3" /> Baixar</button>
                      {theme.id === "malu" && set.product_url && <a href={set.product_url} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg py-2 text-[9px] font-bold flex items-center justify-center gap-1" style={{ background:"#FFF1E8", color:"#D94824" }}><ExternalLink className="w-3 h-3" /> Ver produto</a>}
                    </div>
                  </div>
                </motion.div>;
                })}
              </div>
              {hasMore && <button onClick={loadMore} disabled={loadingMore}
                className="w-full mt-5 rounded-xl py-3 text-[11px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background:"#fff", color:P, border:CARD_EDGE, boxShadow:"0 3px 10px rgba(22,19,14,0.05)" }}>
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                {loadingMore ? "Carregando..." : "Ver mais"}
              </button>}
            </>
          )}
        </div>
      </div>
      <AnimatePresence>{selected && <CreativePreview set={selected} type={type} theme={theme} onClose={() => setSelected(null)} />}</AnimatePresence>
    </div>
  );
}

// ─── PRODUTOS EM ALTA ────────────────────────────────────────────────────────

// O ranking é recalculado de 3 em 3 horas. Mostra há quanto tempo foi a última
// leitura e quanto falta para a próxima, com contagem regressiva ao vivo.
function RankingStatus() {
  const CICLO_MIN = 180;
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const minutosNoCiclo = Math.floor(agora / 60000) % CICLO_MIN;
  const faltamMin = CICLO_MIN - minutosNoCiclo;
  const segundos = 59 - (Math.floor(agora / 1000) % 60);
  const h = Math.floor(faltamMin / 60);
  const m = faltamMin % 60;

  return (
    <div className="mt-4 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 bg-white"
      style={{ border: CARD_EDGE, boxShadow: "0 3px 10px rgba(22,19,14,0.05)" }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(185,242,39,0.30)" }}>
          <TrendingUp className="w-4 h-4" style={{ color: "#4d7c0f" }} />
        </div>
        <div>
          <p className="text-[11.5px] font-extrabold text-foreground leading-none">
            Atualizado há {minutosNoCiclo === 0 ? "1 min" : `${minutosNoCiclo} min`}
          </p>
          <p className="text-[9.5px] text-foreground/45 mt-1">dados direto do TikTok Shop</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[12.5px] font-extrabold tabular-nums leading-none" style={{ color: P }}>
          {h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m ${String(segundos).padStart(2, "0")}s`}
        </p>
        <p className="text-[9.5px] text-foreground/45 mt-1">até o novo ranking</p>
      </div>
    </div>
  );
}


function ProdutosScreen({ onBack, onCriarLive, theme }: { onBack:()=>void; onCriarLive:(p:Produto)=>void; theme: BrandTheme }) {
  const produtosDestaque = theme.id === "malu" ? PRODUTOS_MALU_ALTA : [...PRODUTOS_EVA_DESTAQUE, ...PRODUTOS_EVA_OUTROS];
  const produtosOutros: Produto[] = [];
  return (
    <div className="min-h-screen" style={PAGE_BG}>
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
            <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase">Ranking ao vivo</p>
          </div>
          <h2 className="font-extrabold text-[1.85rem] leading-[1.15] tracking-tight">
            <span>Produtos </span><em className="italic" style={{ color:P }}>em Alta</em>
          </h2>
          <p className="text-foreground/50 text-[13px] mt-3">{theme.id === "malu" ? "Produtos para divulgar nos seus canais de afiliada Shopee." : "Produtos para explorar e divulgar no TikTok Shop."}</p>
        </div>

        <div className="px-5 pb-14 mt-4">

          {/* ── Seção 1: Destaques da semana ── */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/60 uppercase">Destaques da semana</span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background:"rgba(122,43,245,0.08)", color:P }}>
              {produtosDestaque.length} produtos
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {produtosDestaque.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 14, rotate: i % 2 === 0 ? -1.3 : 1.3 }}
                animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -1.3 : 1.3 }}
                whileTap={{ scale: 0.96, rotate: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden flex flex-col"
                style={{ border: CARD_EDGE, boxShadow:"0 6px 18px rgba(22,19,14,0.10)" }}>

                <div className="relative w-full rounded-t-2xl overflow-hidden">
                  <img src={p.img} alt={p.nome} loading="lazy" className="w-full aspect-square object-contain block" />
                  <span className="absolute top-2 left-2 text-[8px] font-extrabold tracking-wider text-white px-2 py-[3px] rounded-full uppercase"
                    style={{ background: BADGE_COLOR[p.badge] ?? P }}>{p.badge}</span>
                  <span className="absolute top-2 right-2 text-[10px] font-extrabold text-white px-1.5 py-0.5 rounded-full"
                    style={{ background: P, boxShadow:"0 1px 6px rgba(122,43,245,0.4)" }}>
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="px-3 pt-2.5 pb-3 flex-1 flex flex-col justify-end">
                  {theme.id === "malu" && <>
                    <p className="text-[10px] font-extrabold leading-snug line-clamp-2 mb-1.5">{p.nome}</p>
                    <p className="text-[8.5px] leading-snug text-foreground/45 line-clamp-2 mb-2.5">{p.nicho}</p>
                  </>}
                  <button onClick={() => onCriarLive(p)}
                    className="w-full text-[11px] font-extrabold rounded-xl py-2.5 active:scale-95 transition-transform"
                    style={{ background: LIME, color: "#16130E", boxShadow: "0 3px 10px rgba(140,190,20,0.35)" }}>
                    Ver produto <ExternalLink className="inline-block w-3 h-3 ml-1 -mt-0.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Seção 2: Mais produtos ── */}
          {produtosOutros.length > 0 && <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Mais produtos</span>
            <span className="text-[10px] font-bold text-foreground/40">{produtosOutros.length} itens</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {produtosOutros.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 12, rotate: [-1.4, 1.2, -1][i % 3] }}
                animate={{ opacity: 1, y: 0, rotate: [-1.4, 1.2, -1][i % 3] }}
                whileTap={{ scale: 0.95, rotate: 0 }}
                transition={{ delay: 0.05 + i * 0.03 }}
                className="bg-white rounded-2xl overflow-hidden flex flex-col"
                style={{ border: CARD_EDGE, boxShadow:"0 4px 12px rgba(22,19,14,0.08)" }}>
                <img src={p.img} alt="" className="w-full block rounded-t-2xl" />
                <div className="px-2 py-2 flex flex-col gap-1.5">
                  <span className="text-[8px] font-extrabold text-white px-1.5 py-[2px] rounded-full uppercase w-fit"
                    style={{ background: BADGE_COLOR[p.badge] ?? P }}>{p.badge}</span>
                  <button onClick={() => onCriarLive(p)}
                    className="w-full text-[9px] font-extrabold rounded-lg py-2 active:scale-95 transition-transform"
                    style={{ background: LIME, color: "#16130E" }}>
                    Usar produto
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          </>}

        </div>
      </div>
    </div>
  );
}

// ─── TREINAMENTO RÁPIDO ───────────────────────────────────────────────────────

function TreinamentoScreen({ onBack, theme }: { onBack:()=>void; theme: BrandTheme }) {
  const [aberta, setAberta] = useState<string>("01");
  const aulas = theme.id === "malu"
    ? AULAS.map(a => ({ ...a, titulo: a.titulo.replace("TikTok Shop", "Shopee").replace("Eva", "Malu"), desc: a.desc.replace("TikTok Shop", "Shopee") }))
    : AULAS;

  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        <div className="px-5 pt-7 pb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}
            onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
        </div>

        <div className="px-5 pt-4 pb-2 relative">
          <div className="absolute pointer-events-none" style={{ left: 6, top: 34 }}>
            <Starburst size={46} color={LIME} />
          </div>
          <p className="relative text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-4">Academia da {theme.name}</p>
          <h2 className="relative font-extrabold text-[1.85rem] leading-[1.15] tracking-tight">
            Domine o<br /><em className="italic" style={{ color:P }}>sistema</em>
          </h2>
          <p className="text-foreground/50 text-[13px] mt-3">Quatro módulos práticos para você vender em seus canais.</p>
        </div>

        <div className="px-5 mt-6 pb-14 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Em destaque</span>
            <span className="text-[10px] font-bold" style={{ color:P }}>Comece por aqui</span>
          </div>

          {aulas.map((a, ai) => {
            const isOpen = aberta === a.num;
            const isPrincipal = a.num === "01";
            const chip = ([
              { bg: P,         txt: "#fff" },
              { bg: LIME,      txt: "#16130E" },
              { bg: CARD_DARK, txt: "#fff" },
              { bg: "#fff",    txt: "rgba(22,19,14,0.55)", border: CARD_EDGE },
            ] as const)[ai % 4];
            return (
              <motion.div key={a.num}
                animate={{ rotate: isOpen ? 0 : [-1, 1.1, -0.9, 1][ai % 4] }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer"
                style={{ border: CARD_EDGE, boxShadow: isOpen ? "0 12px 30px rgba(22,19,14,0.14)" : "0 3px 10px rgba(22,19,14,0.06)" }}
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
                        style={{ height:110, background:"rgba(22,19,14,0.05)" }}>
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
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: isOpen ? P : chip.bg,
                        border: !isOpen && "border" in chip ? chip.border : undefined,
                        boxShadow: isOpen ? "0 4px 12px rgba(122,43,245,0.35)" : "0 2px 8px rgba(22,19,14,0.10)",
                      }}>
                      {isOpen
                        ? <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                        : <span className="text-[11px] font-extrabold" style={{ color: chip.txt }}>{a.num}</span>
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
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold"
                        style={{ background: LIME, color: "#16130E" }}>
                        {a.nivel}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CODE LOGIN ──────────────────────────────────────────────────────────────

function friendlyAuthError(message: string) {
  if (/invalid login credentials/i.test(message)) return "E-mail ou senha incorretos.";
  if (/already registered/i.test(message)) return "Este e-mail já possui uma conta. Entre com sua senha.";
  if (/password should be at least/i.test(message)) return "A senha precisa ter pelo menos 6 caracteres.";
  return message;
}

function AuthScreen({ theme }: { theme: BrandTheme }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signingUp = mode === "signup";

  function changeMode(nextMode: "login" | "signup") {
    setMode(nextMode);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (signingUp && password !== confirmPassword) {
      setError("As senhas não são iguais. Confira e tente novamente.");
      return;
    }

    setLoading(true);
    const result = signingUp
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (result.error) setError(friendlyAuthError(result.error.message));
    else if (signingUp && !result.data.session) {
      setError("A conta foi criada, mas o login automático não foi concluído. Tente entrar com sua senha.");
      setMode("login");
    }
    setLoading(false);
  }

  const fieldClass = "w-full rounded-xl border border-black/[0.10] bg-white px-4 py-3.5 text-[14px] text-foreground outline-none transition-shadow focus:ring-2 focus:ring-black/[0.08]";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8" style={PAGE_BG}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-9">
          <img src={theme.logoUrl} alt={theme.name} className="h-14 w-auto" draggable={false} />
        </div>
        <div className="rounded-[1.75rem] bg-white p-6 sm:p-7" style={{ border: CARD_EDGE, boxShadow: CARD_SHADOW }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-foreground/40 mb-3">
            {signingUp ? "Sua conta em poucos segundos" : "Acesse sua conta"}
          </p>
          <h1 className="font-extrabold text-[1.75rem] leading-[1.12] tracking-tight text-foreground">
            {signingUp ? <>Comece a usar a<br /><em className="italic" style={{ color:P }}>{theme.name} hoje.</em></> : <>Que bom ter você<br /><em className="italic" style={{ color:P }}>de volta.</em></>}
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-foreground/55">
            {signingUp ? "Use apenas seu e-mail e uma senha. Sem código de acesso e sem confirmação por e-mail." : `Entre para acessar tudo o que a ${theme.name} deixou pronto para você.`}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="auth-email" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/45">E-mail</label>
              <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} placeholder="voce@email.com" />
            </div>
            <div>
              <label htmlFor="auth-password" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/45">Senha</label>
              <input id="auth-password" type="password" autoComplete={signingUp ? "new-password" : "current-password"} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} placeholder="Mínimo de 6 caracteres" />
            </div>
            {signingUp && <div>
              <label htmlFor="auth-confirm-password" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/45">Confirme sua senha</label>
              <input id="auth-confirm-password" type="password" autoComplete="new-password" minLength={6} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={fieldClass} placeholder="Repita sua senha" />
            </div>}
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[12px] font-medium leading-snug text-red-700">{error}</p>}
            <button type="submit" disabled={loading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[13px] font-extrabold text-white transition-opacity disabled:opacity-60" style={{ background:P, boxShadow:"0 8px 20px rgba(22,19,14,0.16)" }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Aguarde..." : signingUp ? "Criar minha conta" : "Entrar"}
              {!loading && <ChevronRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-5 text-center text-[12px] text-foreground/50">
            {signingUp ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
            <button type="button" onClick={() => changeMode(signingUp ? "login" : "signup")} className="font-extrabold" style={{ color:P }}>
              {signingUp ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function AccountBlockedScreen({ theme }: { theme: BrandTheme }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-8" style={PAGE_BG}>
      <div className="w-full max-w-sm rounded-[1.75rem] bg-white p-6 text-center" style={{ border:CARD_EDGE, boxShadow:CARD_SHADOW }}>
        <img src={theme.logoUrl} alt={theme.name} className="mx-auto h-12 w-auto" draggable={false} />
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/40">Acesso encerrado</p>
        <h1 className="mt-3 text-[1.7rem] font-extrabold leading-[1.12] tracking-tight">Seu acesso foi<br /><em className="italic" style={{ color:P }}>encerrado.</em></h1>
        <p className="mt-4 text-[13px] leading-relaxed text-foreground/60">O pedido de reembolso foi registrado e esta conta não possui mais acesso à {theme.name}.</p>
      </div>
    </div>
  );
}

// ─── PAINEL DE VÍDEOS ─────────────────────────────────────────────────────────

// Desempenho de uma conta pequena e realista (~2 mil seguidores).
// GMV é o valor bruto vendido através dos vídeos; a comissão do afiliado é uma
// fatia desse total (aqui ~7,9%, dentro da faixa comum do TikTok Shop).
interface DiaResumo {
  gmv: number; comissao: number; pedidos: number;
  videos: number; views: number; seguidores: number; novosSeguidores: number;
  // métricas do painel oficial do TikTok Shop
  baseComissao: number; viewsProduto: number; cliquesProduto: number;
  varGmv: number; varItens: number; varComissao: number;
  varBase: number; varViewsProd: number; varCliques: number;
}

const DIA_PADRAO: DiaResumo = {
  gmv: 1174.6, comissao: 92.37, pedidos: 14,
  videos: 7, views: 24803, seguidores: 2043, novosSeguidores: 38,
  baseComissao: 1168.2, viewsProduto: 5284, cliquesProduto: 631,
  varGmv: 15.6, varItens: 27.27, varComissao: 15.6,
  varBase: 14.8, varViewsProd: 22.14, varCliques: -4.2,
};
const DIA_V1: DiaResumo = {
  gmv: 743.2, comissao: 58.91, pedidos: 9,
  videos: 6, views: 16274, seguidores: 1876, novosSeguidores: 21,
  baseComissao: 739.05, viewsProduto: 3417, cliquesProduto: 428,
  varGmv: -8.4, varItens: -10.0, varComissao: -8.4,
  varBase: -8.9, varViewsProd: 6.32, varCliques: -12.7,
};
const DIA_V2: DiaResumo = {
  gmv: 1592.35, comissao: 128.64, pedidos: 19,
  videos: 8, views: 31488, seguidores: 2317, novosSeguidores: 64,
  baseComissao: 1584.9, viewsProduto: 7126, cliquesProduto: 903,
  varGmv: 61.4, varItens: 46.15, varComissao: 63.2,
  varBase: 60.8, varViewsProd: 38.47, varCliques: 24.9,
};

const VIEWS_VIDEOS = [8412, 5207, 3884, 2941, 2106, 1523, 730];
const HORAS_VIDEOS = ["07:20", "09:45", "11:30", "13:15", "16:40", "19:05", "21:30"];

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compact = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1).replace(".", ",")} mil` : String(v);

// Réplica do bloco "Dados principais" do painel de afiliado do TikTok Shop.
// Fundo preto, grid 3x2, variação em ciano quando positiva e vermelha quando cai.
const TT_CIANO = "#4DD8E8";
const TT_VERMELHO = "#FF4D67";

// Formata como o painel do TikTok: sem casas quando é inteiro, sem zeros à direita
function pct(v: number) {
  const s = v.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return s.replace(".", ",");
}

function TTMetrica({ label, valor, variacao }: { label: string; valor: string; variacao: number }) {
  const sobe = variacao >= 0;
  return (
    <div className="flex flex-col items-center text-center px-1">
      <p className="text-[11px] leading-tight" style={{ color: "rgba(255,255,255,0.62)" }}>{label}</p>
      <p className="text-white font-bold text-[19px] leading-none mt-2 tabular-nums">{valor}</p>
      <p className="text-[11px] font-medium mt-1.5 tabular-nums"
        style={{ color: sobe ? TT_CIANO : TT_VERMELHO }}>
        {sobe ? "+" : ""}{pct(variacao)}%
      </p>
    </div>
  );
}

function PainelTikTok({ d }: { d: DiaResumo }) {
  const kbrl = (v: number) =>
    v >= 1000 ? `R$ ${(v / 1000).toFixed(1).replace(".", ",")}K` : `R$ ${brl(v)}`;
  const knum = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1).replace(".", ",")}K` : String(v);

  return (
    <div className="px-4 pt-5 pb-6" style={{ background: "#000" }}>
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-white font-bold text-[19px] tracking-tight">Dados principais</h3>
        <Info className="w-4 h-4" style={{ color: "rgba(255,255,255,0.55)" }} />
      </div>
      <div className="grid grid-cols-3 gap-y-7">
        <TTMetrica label="GMV"                     valor={kbrl(d.gmv)}                variacao={d.varGmv} />
        <TTMetrica label="Itens vendidos"          valor={String(d.pedidos)}          variacao={d.varItens} />
        <TTMetrica label="Comissão estimada"       valor={`R$ ${brl(d.comissao)}`}    variacao={d.varComissao} />
        <TTMetrica label="Base de comissão"        valor={kbrl(d.baseComissao)}       variacao={d.varBase} />
        <TTMetrica label="Visualizações do produto" valor={knum(d.viewsProduto)}      variacao={d.varViewsProd} />
        <TTMetrica label="Cliques no produto"      valor={knum(d.cliquesProduto)}     variacao={d.varCliques} />
      </div>
    </div>
  );
}

function VideosDoDia({ nicho, total }: { nicho: string; total: number }) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [modalUrl, setModalUrl] = useState<string|null>(null);

  useEffect(() => {
    const nichoFull = NICHO_MAP[nicho] ?? nicho;
    supabase.from("videos_achadinhos")
      .select("message_id, nicho, link_video, topico_original, r2_key")
      .eq("nicho", nichoFull)
      .limit(30)
      .then(({ data }) => {
        const rows = ((data as VideoItem[]) ?? []).filter(v => v.link_video);
        setVideos([...rows].sort(() => Math.random() - 0.5).slice(0, total));
      });
  }, [nicho, total]);

  if (videos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {videos.map((v, i) => (
          <div key={v.message_id}
            className="relative rounded-xl overflow-hidden cursor-pointer active:opacity-80 transition-opacity"
            style={{ background: CARD_DARK }}
            onClick={() => v.link_video && setModalUrl(v.link_video)}>
            <video src={videoPreviewUrl(v.link_video)} preload="auto" muted playsInline
              onLoadedData={(e) => { (e.currentTarget as HTMLVideoElement).pause(); }}
              style={{ width: "100%", height: 128, objectFit: "cover", display: "block" }} />
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.15)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
                <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-1.5 pb-1.5 pt-4"
              style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85))" }}>
              <p className="text-[10px] font-extrabold text-white leading-none">
                {compact(VIEWS_VIDEOS[i % VIEWS_VIDEOS.length])}
              </p>
              <p className="text-[7.5px] text-white/55 mt-0.5">views · {HORAS_VIDEOS[i % HORAS_VIDEOS.length]}</p>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {modalUrl && <VideoModal url={modalUrl} onClose={() => setModalUrl(null)} />}
      </AnimatePresence>
    </>
  );
}

interface ShopeePeriodData {
  dias: number;
  data: string;
  videosReceita: number;
  visualizacoes: number;
  cliques: number;
  pedidos: number;
  itens: number;
  vendas: number;
  comissao: number;
  compradores: number;
}

const SHOPEE_30: ShopeePeriodData = {
  dias: 30, data: "10/07/2026 - 08/08/2026", videosReceita: 18,
  visualizacoes: 92400, cliques: 31400, pedidos: 100, itens: 128,
  vendas: 22200, comissao: 3100, compradores: 96,
};

function shopeePeriod(days: number): ShopeePeriodData {
  const ratio = days / SHOPEE_30.dias;
  return {
    ...SHOPEE_30,
    dias: days,
    data: days === 1 ? "Hoje" : days === 7 ? "02/08/2026 - 08/08/2026" : SHOPEE_30.data,
    videosReceita: Math.max(1, Math.round(SHOPEE_30.videosReceita * ratio)),
    visualizacoes: Math.max(1, Math.round(SHOPEE_30.visualizacoes * ratio)),
    cliques: Math.max(1, Math.round(SHOPEE_30.cliques * ratio)),
    pedidos: Math.max(1, Math.round(SHOPEE_30.pedidos * ratio)),
    itens: Math.max(1, Math.round(SHOPEE_30.itens * ratio)),
    vendas: Math.max(1, Math.round(SHOPEE_30.vendas * ratio)),
    comissao: Math.max(1, Math.round(SHOPEE_30.comissao * ratio)),
    compradores: Math.max(1, Math.round(SHOPEE_30.compradores * ratio)),
  };
}

function shopeeCompact(value: number, currency = false) {
  const prefix = currency ? "R$ " : "";
  if (value >= 1000) return prefix + (value / 1000).toFixed(1).replace(".", ",") + "mil";
  return prefix + value.toLocaleString("pt-BR");
}

function ShopeeMetric({ label, value, change, selected }: { label: string; value: string; change: number; selected?: boolean }) {
  return (
    <div className="min-h-[84px] rounded-xl border px-3 py-3 flex flex-col justify-between"
      style={{ borderColor: selected ? P : "rgba(22,19,14,0.12)", borderWidth: selected ? 2 : 1 }}>
      <p className="text-[11px] leading-tight font-semibold text-foreground/60">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-2">
        <p className="text-[18px] leading-none font-extrabold text-foreground tabular-nums">{value}</p>
        <span className="text-[11px] font-bold tabular-nums" style={{ color: change >= 0 ? "#16A66A" : "#F04438" }}>
          {change >= 0 ? "+" : ""}{pct(change)}%
        </span>
      </div>
    </div>
  );
}

function PainelShopee({ onBack, destravaData, theme }: { onBack:()=>void; destravaData:DestravaData|null; theme: BrandTheme }) {
  const [period, setPeriod] = useState<1 | 7 | 30>(30);
  const d = shopeePeriod(period);
  const shopeeLogo = theme.channels.find(channel => channel.name === "Shopee")?.logoUrl;
  const periods = [
    { value: 1 as const, label: "Hoje" },
    { value: 7 as const, label: "Últimos 7 dias" },
    { value: 30 as const, label: "Últimos 30 dias" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F3F3F3" }}>
      <div className="max-w-md mx-auto">
        <div className="px-4 pt-6 pb-3 flex items-center gap-3 bg-white">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.08] cursor-pointer active:scale-95 transition-transform"
            onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Malu</p>
            <p className="font-extrabold text-[17px] leading-tight">Painel de Vídeos</p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FFF1E8" }}>
            {shopeeLogo && <img src={shopeeLogo} alt="Shopee" className="w-5 h-5" />}
          </div>
        </div>

        <div className="px-2 py-3 flex gap-2 bg-white border-t border-black/[0.05]">
          {periods.map(item => (
            <button key={item.value} onClick={() => setPeriod(item.value)}
              className="flex-1 min-w-0 rounded-xl px-2 py-2.5 text-[10px] font-bold whitespace-nowrap active:scale-[0.98] transition-transform"
              style={{ background: period === item.value ? "#FFF7F2" : "#F3F3F3", color: period === item.value ? P : "#292929", border: period === item.value ? `1.5px solid ${P}` : "1px solid transparent" }}>
              {item.label}
            </button>
          ))}
          <button className="w-10 rounded-xl flex items-center justify-center bg-[#F3F3F3] text-foreground/45" aria-label="Mais períodos">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 py-3 pb-14">
          <div className="rounded-[1.25rem] bg-white p-4" style={{ boxShadow: "0 4px 14px rgba(22,19,14,0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-extrabold tracking-tight">Métricas Principais</h2>
                <Info className="w-4 h-4 text-foreground/40" />
              </div>
              <span className="text-[10px] font-semibold text-foreground/45">{d.data}</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <ShopeeMetric label="Vídeos com Receita" value={String(d.videosReceita)} change={0} />
              <ShopeeMetric label="Visualizações" value={shopeeCompact(d.visualizacoes)} change={-1} />
              <ShopeeMetric label="Tempo Médio de Visualização" value="00:01:30" change={13} />
              <ShopeeMetric label="Cliques" value={shopeeCompact(d.cliques)} change={398} />
              <ShopeeMetric label="Pedidos" value={String(d.pedidos)} change={197} />
              <ShopeeMetric label="Itens vendidos" value={String(d.itens)} change={132} />
              <ShopeeMetric label="Vendas (R$)" value={shopeeCompact(d.vendas)} change={214} selected />
              <ShopeeMetric label="Comissão Est. (R$)" value={shopeeCompact(d.comissao, true)} change={415} />
              <ShopeeMetric label="Compradores" value={String(d.compradores)} change={195} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 pb-2">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/45 uppercase">Vídeos publicados</span>
            <span className="text-[10px] font-bold" style={{ color: P }}>{d.videosReceita} vídeos</span>
          </div>
          <VideosDoDia nicho={destravaData?.nicho ?? "moda"} total={Math.min(d.videosReceita, 7)} />
        </div>
      </div>
    </div>
  );
}

function PainelScreen({ onBack, destravaData, versao, theme }: { onBack:()=>void; destravaData:DestravaData|null; versao?:"v1"|"v2"; theme: BrandTheme }) {
  if (theme.id === "malu") return <PainelShopee onBack={onBack} destravaData={destravaData} theme={theme} />;
  const d = versao === "v1" ? DIA_V1 : versao === "v2" ? DIA_V2 : DIA_PADRAO;
  const nicho = destravaData?.nicho ?? "moda";

  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-7 pb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }} onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">{theme.name}</p>
            <p className="font-extrabold text-[17px] text-foreground leading-tight tracking-tight">Painel de Vídeos</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-full"
            style={{ background: "rgba(122,43,245,0.09)", color: P }}>
            Hoje
          </span>
        </div>

        <div className="px-5 pb-14 space-y-3.5">
          {/* Perfil */}
          <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ border: CARD_EDGE, boxShadow: "0 3px 10px rgba(22,19,14,0.05)" }}>
            <img src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/iconperfil.jpeg"
              alt="perfil" className="w-11 h-11 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-[14px] text-foreground leading-tight">@lumacedo.ofc</p>
              <p className="text-[11px] text-foreground/45 mt-0.5">
                {d.seguidores.toLocaleString("pt-BR")} seguidores
                <span className="font-bold" style={{ color: "#4d7c0f" }}> +{d.novosSeguidores} hoje</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
              style={{ background: "rgba(34,197,94,0.10)" }}>
              <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ repeat:Infinity, duration:1.5 }}
                className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold text-green-700">Ativo</span>
            </div>
          </div>

          {/* Painel oficial do TikTok Shop */}
          <div className="rounded-[1.4rem] overflow-hidden"
            style={{ boxShadow: "0 14px 32px rgba(22,19,14,0.30)" }}>
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "#000" }}>
              <TikTokIcon size={13} />
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
                Central do vendedor
              </span>
              <span className="ml-auto text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                Hoje
              </span>
            </div>
            <PainelTikTok d={d} />
          </div>

          {/* Métricas do dia */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { v: String(d.videos), l: "vídeos postados", c: "#fff" },
              { v: compact(d.views), l: "visualizações",  c: "#fff" },
              { v: String(d.pedidos), l: "vendas geradas", c: "#fff" },
            ].map((m, i) => (
              <motion.div key={m.l}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-2xl px-3 py-4"
                style={{ background: "#000", boxShadow: "0 8px 20px rgba(0,0,0,0.28)" }}>
                <p className="text-[1.35rem] font-extrabold leading-none" style={{ color: m.c }}>{m.v}</p>
                <p className="text-[10px] text-white/45 mt-1.5 leading-snug">{m.l}</p>
              </motion.div>
            ))}
          </div>

          {/* Vídeos publicados hoje */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Publicados hoje</span>
            <span className="text-[10px] font-bold" style={{ color: P }}>{d.videos} vídeos</span>
          </div>
          <VideosDoDia nicho={nicho} total={d.videos} />

          <p className="text-center text-[10px] text-foreground/30 pt-2 leading-relaxed">
            A Eva publica e acompanha os resultados. Os valores são atualizados pelo TikTok Shop a cada venda confirmada.
          </p>
        </div>
      </div>
    </div>
  );
}
// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function Eva({ versao, brand = "eva", standaloneBasePath }: { versao?:"v1"|"v2"; brand?: BrandId; standaloneBasePath?: string } = {}) {
  const theme = getBrandTheme(brand);
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = standaloneBasePath ?? (brand === "malu" ? "/malu" : `/eva${versao ? `/${versao}` : ""}`);
  const segment = location.pathname.startsWith(basePath)
    ? location.pathname.slice(basePath.length).split("/").filter(Boolean)[0] ?? ""
    : "";
  const homePath = basePath || "/";
  const screen = (Object.keys(SCREEN_SEGMENT) as Screen[]).find((key) => SCREEN_SEGMENT[key] === segment) ?? "home";
  const fluxoProdutos = brand === "malu" ? PRODUTOS_MALU_FLUXO : PRODUTOS_FLUXO;
  const [authReady, setAuthReady]       = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [integrationOpen, setIntegrationOpen] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({});
  const [refundRequested, setRefundRequested] = useState(false);
  const [productsLockedOpen, setProductsLockedOpen] = useState(false);
  const [automationLockedOpen, setAutomationLockedOpen] = useState(false);
  const [accountBlocked, setAccountBlocked] = useState(false);

  useEffect(() => {
    let mounted = true;
    const syncAuth = (session: Session | null) => {
      const isAnonymous = (session?.user as { is_anonymous?: boolean } | undefined)?.is_anonymous === true;
      if (!mounted) return;
      if (session && hasAccountBlocked(session.user.user_metadata)) {
        setAccountBlocked(true);
        setAuthenticated(false);
        setAuthReady(true);
        void supabase.auth.signOut();
        return;
      }
      if (session) setAccountBlocked(false);
      setAuthenticated(Boolean(session) && !isAnonymous);
      setIntegrationStatus(session ? readIntegrationStatus(session.user.user_metadata, brand) : {});
      setRefundRequested(session ? hasRefundRequest(session.user.user_metadata) : false);
      setAuthReady(true);
    };

    supabase.auth.getSession().then(({ data }) => syncAuth(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => syncAuth(session));
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [brand]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate(homePath, { replace:true });
    setIntegrationStatus({});
    setRefundRequested(false);
    setAccountBlocked(false);
  }

  function nav(s: Screen) {
    const next = SCREEN_SEGMENT[s];
    navigate(next ? `${basePath}/${next}` : homePath);
  }
  function goHome() { nav("home"); }
  function requestRefund() {
    setIntegrationOpen(false);
    window.setTimeout(() => document.getElementById("reembolso")?.scrollIntoView({ behavior:"smooth", block:"start" }), 120);
  }

  function startAutomatic() {
    if (refundRequested) {
      setAutomationLockedOpen(true);
      return;
    }
    if (integrationStatus.activated_at) nav("destrava");
    else setIntegrationOpen(true);
  }

  function criarLiveComProduto(produto: Produto) {
    if (produto.link) window.open(produto.link, "_blank", "noopener,noreferrer");
  }

  async function handleRefunded() {
    setRefundRequested(true);
    setAccountBlocked(true);
    await supabase.auth.signOut();
  }

  if (!authReady) return <div className="min-h-screen flex items-center justify-center" style={{ ...brandVars(theme), ...PAGE_BG }}><EvaLoader label="Carregando..." /></div>;
  if (accountBlocked) return <div style={brandVars(theme)}><AccountBlockedScreen theme={theme} /></div>;
  if (!authenticated) return <div style={brandVars(theme)}><AuthScreen theme={theme} /></div>;

  return (
    <div style={brandVars(theme)}>
    <AnimatePresence mode="wait">
      {screen === "home" && (
        <motion.div key="home" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <Home onNavigate={nav} onStart={startAutomatic} onLogout={handleLogout} onProductsLocked={() => setProductsLockedOpen(true)} onRefunded={handleRefunded} refundRequested={refundRequested} theme={theme} />
        </motion.div>
      )}
      {screen === "destrava" && !refundRequested && (
        <motion.div key="destrava" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={PAGE_BG}><EvaLoader label={`Carregando a ${theme.name}...`} /></div>}>
            <EvaFlow produtos={fluxoProdutos} onExit={goHome} theme={theme} />
          </Suspense>
        </motion.div>
      )}
      {screen === "pack" && (
        <motion.div key="pack" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <PackScreen onBack={goHome} theme={theme} />
        </motion.div>
      )}
      {screen === "carrosseis" && (
        <motion.div key="carrosseis" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <CreativePackScreen onBack={goHome} theme={theme} type="carousel" />
        </motion.div>
      )}
      {screen === "stories" && (
        <motion.div key="stories" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <CreativePackScreen onBack={goHome} theme={theme} type="story" />
        </motion.div>
      )}
      {screen === "produtos" && !refundRequested && (
        <motion.div key="produtos" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <ProdutosScreen onBack={goHome} onCriarLive={criarLiveComProduto} theme={theme} />
        </motion.div>
      )}
    </AnimatePresence>
    <AnimatePresence>
      {integrationOpen && <IntegrationModal
        theme={theme}
        status={integrationStatus}
        onClose={() => setIntegrationOpen(false)}
        onRequestRefund={requestRefund}
        onStatusChange={setIntegrationStatus}
        onActivated={(status) => { setIntegrationStatus(status); setIntegrationOpen(false); nav("destrava"); }}
      />}
      {productsLockedOpen && <ProductsLockedModal theme={theme} onClose={() => setProductsLockedOpen(false)} />}
      {automationLockedOpen && <AutomationLockedModal theme={theme} onClose={() => setAutomationLockedOpen(false)} />}
    </AnimatePresence>
    </div>
  );
}
