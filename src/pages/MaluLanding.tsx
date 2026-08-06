import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CirclePlay,
  Clock3,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { BRAND_THEMES } from "@/lib/brandTheme";

const malu = BRAND_THEMES.malu;

const productImages = [
  "https://down-br.img.susercontent.com/file/sg-11134201-822zm-mo5ipw6qvq4h04@resize_w450_nl.webp",
  "https://down-br.img.susercontent.com/file/br-11134207-820li-mlnqommcthxj6d@resize_w450_nl.webp",
  "https://down-br.img.susercontent.com/file/br-11134207-81z1k-mgyubugturk507@resize_w450_nl.webp",
  "https://down-br.img.susercontent.com/file/br-11134207-81z1k-mh236zedcwe89d@resize_w450_nl.webp",
];

const faqs = [
  ["O que é a Malu?", "A Malu é uma assistente para afiliadas que organiza vídeos, stories e carrosséis prontos para você postar nos seus canais."],
  ["Preciso aparecer nos vídeos?", "Não. Você recebe criativos prontos para baixar, com legenda, hashtags e uma sugestão de horário para publicar."],
  ["Em quais canais posso publicar?", "A Malu foi pensada para a sua rotina na Shopee Video, TikTok e Instagram."],
  ["Os conteúdos têm direito autoral?", "Os packs indicam os materiais verificados disponíveis para baixar e usar na sua rotina de conteúdo."],
  ["Posso cancelar se não gostar?", "Sim. Você tem garantia de 7 dias para conhecer a Malu com tranquilidade."],
];

function CtaButton({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <a className={`malu-lp-cta ${dark ? "malu-lp-cta--light" : ""}`} href="#oferta">
      {children} <ArrowRight size={16} strokeWidth={2.8} />
    </a>
  );
}

function MiniPhone({ image, label }: { image: string; label: string }) {
  return (
    <div className="malu-lp-phone" aria-label={label}>
      <div className="malu-lp-phone__notch" />
      <img src={image} alt="" />
      <div className="malu-lp-phone__shine" />
    </div>
  );
}

export default function MaluLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [playing, setPlaying] = useState<number | null>(null);

  return (
    <main className="malu-lp">
      <div className="malu-lp__announcement">Conteúdos prontos para a rotina de afiliadas</div>

      <section className="malu-lp-hero">
        <div className="malu-lp-container malu-lp-hero__content">
          <img className="malu-lp-logo" src={malu.logoUrl} alt="Malu" />
          <div className="malu-lp-eyebrow"><Sparkles size={13} /> sua nova assistente de conteúdo</div>
          <h1>Conteúdos que ajudam você a <em>vender todos os dias.</em></h1>
          <p>Conheça a Malu: ela separa os melhores criativos, organiza sua rotina e deixa tudo pronto para você publicar.</p>

          <div className="malu-lp-hero__video" role="img" aria-label="Prévia da Malu em ação">
            <MiniPhone image={malu.homeImageUrl} label="Tela inicial da Malu" />
            <button className="malu-lp-play" type="button" aria-label="Reproduzir apresentação">
              <Play size={23} fill="currentColor" />
            </button>
            <span>Veja a Malu em ação</span>
          </div>
          <a className="malu-lp-scroll" href="#recursos">conheça por dentro <span>↓</span></a>
        </div>
      </section>

      <section id="recursos" className="malu-lp-section malu-lp-section--cream">
        <div className="malu-lp-container">
          <div className="malu-lp-section-heading">
            <span>POR DENTRO DA MALU</span>
            <h2>Tudo isso liberado <em>para você.</em></h2>
          </div>

          <div className="malu-lp-feature-list">
            <article className="malu-lp-feature-card">
              <div className="malu-lp-feature-card__copy">
                <span className="malu-lp-badge">01 · ROTINA PRONTA</span>
                <h3>Escolha seu nicho. A Malu organiza o resto.</h3>
                <p>Selecione a quantidade de vídeos e receba uma rotina com os melhores horários para publicar.</p>
              </div>
              <div className="malu-lp-routine-preview">
                <div><span className="malu-lp-dot" /> Nicho: Casa e decoração <b>✓</b></div>
                <div><Clock3 size={14} /> 3 vídeos · hoje, 18:40</div>
                <div><Clock3 size={14} /> 5 vídeos · amanhã, 09:15</div>
              </div>
            </article>

            <article className="malu-lp-feature-card malu-lp-feature-card--orange">
              <div className="malu-lp-feature-card__copy">
                <span className="malu-lp-badge">02 · PACK DE VÍDEOS</span>
                <h3>Mais de <strong>10.551 vídeos</strong> para se inspirar.</h3>
                <p>Conteúdos de diversos nichos, já organizados para você encontrar o que faz sentido para o seu perfil.</p>
              </div>
              <div className="malu-lp-video-strip">
                {[malu.searchImageUrl, malu.editingImageUrl, malu.homeImageUrl].map((image, index) => (
                  <div key={image} className="malu-lp-video-thumb">
                    <img src={image} alt="" />
                    <span><CirclePlay size={20} fill="currentColor" /></span>
                    <small>{index === 0 ? "00:19" : index === 1 ? "00:27" : "00:16"}</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="malu-lp-feature-card">
              <div className="malu-lp-feature-card__copy">
                <span className="malu-lp-badge">03 · PRODUTOS EM ALTA</span>
                <h3>Ideias de produtos que estão em movimento.</h3>
                <p>Veja itens em alta para encontrar oportunidades que combinam com os seus conteúdos.</p>
              </div>
              <div className="malu-lp-product-grid">
                {productImages.map((image) => <img key={image} src={image} alt="Produto em alta" />)}
              </div>
            </article>

            <article className="malu-lp-feature-card malu-lp-feature-card--warm">
              <div className="malu-lp-feature-card__copy">
                <span className="malu-lp-badge">04 · MAIS FORMATOS</span>
                <h3>Vídeos, stories e carrosséis em um só lugar.</h3>
                <p>Baixe os materiais que quiser e leve sua presença para os canais que fazem parte da sua estratégia.</p>
              </div>
              <div className="malu-lp-format-preview">
                <div className="malu-lp-story-card">stories<br /><b>prontos</b></div>
                <div className="malu-lp-carousel-card"><span>1</span><span>2</span><span>3</span><b>carrosséis</b></div>
              </div>
            </article>
          </div>
          <div className="malu-lp-center"><CtaButton>QUERO CONHECER A MALU</CtaButton></div>
        </div>
      </section>

      <section className="malu-lp-section malu-lp-testimonials">
        <div className="malu-lp-container">
          <div className="malu-lp-section-heading malu-lp-section-heading--light">
            <span>RESULTADOS REAIS</span>
            <h2>Quem já colocou a Malu na <em>rotina.</em></h2>
          </div>
          <div className="malu-lp-testimonial-stage">
            <div className="malu-lp-testimonial-phone">
              <img src={malu.editingImageUrl} alt="Criativo organizado pela Malu" />
              <div><span>Rotina criada</span><b>Conteúdo pronto para postar</b></div>
            </div>
            <div className="malu-lp-audios">
              {["Eu finalmente consegui postar todos os dias.", "A parte de achar vídeo bom ficou muito mais simples.", "Já sei exatamente o que publicar quando abro a Malu."].map((quote, index) => (
                <button key={quote} className={`malu-lp-audio ${playing === index ? "is-playing" : ""}`} type="button" onClick={() => setPlaying(playing === index ? null : index)}>
                  <span>{playing === index ? "Ⅱ" : "▶"}</span>
                  <i><b>Afiliada Malu</b>{quote}</i>
                  <small>0:1{index + 4}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="malu-lp-center"><CtaButton dark>QUERO COMEÇAR MINHA ROTINA</CtaButton></div>
        </div>
      </section>

      <section className="malu-lp-section malu-lp-section--cream malu-lp-proof-section">
        <div className="malu-lp-container malu-lp-proof">
          <div className="malu-lp-proof__avatar">M</div>
          <div><div className="malu-lp-stars">★★★★★</div><span>uma rotina simples, prática e pensada para afiliadas</span></div>
          <h2>“A Malu não tenta complicar. Ela entrega um caminho claro para manter constância no conteúdo.”</h2>
          <p>Você escolhe o nicho e o formato. A Malu organiza os materiais, a legenda, as hashtags e os horários sugeridos para o dia.</p>
          <CtaButton>QUERO TER ESSA ROTINA</CtaButton>
        </div>
      </section>

      <section className="malu-lp-whatsapp">
        <div className="malu-lp-container">
          <MessageCircle size={38} strokeWidth={1.7} />
          <span>SUPORTE PARA VOCÊ</span>
          <h2>Você não fica <em>sozinha.</em></h2>
          <p>Se surgir qualquer dúvida ao longo do caminho, você terá um canal de suporte para conversar com a equipe.</p>
          <CtaButton dark>QUERO COMEÇAR AGORA</CtaButton>
        </div>
      </section>

      <section id="oferta" className="malu-lp-section malu-lp-section--cream">
        <div className="malu-lp-container">
          <div className="malu-lp-section-heading">
            <span>ACESSO À MALU</span>
            <h2>Chegou a hora de fazer da sua rotina um hábito.</h2>
          </div>
          <div className="malu-lp-offer">
            <div className="malu-lp-offer__top"><img src={malu.logoUrl} alt="Malu" /><span>Acesso completo</span></div>
            <div className="malu-lp-offer__showcase"><MiniPhone image={malu.homeImageUrl} label="Malu" /></div>
            <ul>
              {["Vídeos prontos em diversos nichos", "Packs de stories e carrosséis", "Legendas, hashtags e horários sugeridos", "Produtos em alta para inspirar seus posts", "Suporte para tirar dúvidas"].map((item) => <li key={item}><Check size={16} />{item}</li>)}
            </ul>
            <p className="malu-lp-offer__note">As condições de acesso são exibidas na próxima etapa.</p>
            <a className="malu-lp-offer__button" href="#faq">LIBERAR MEU ACESSO <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      <section className="malu-lp-guarantee">
        <div className="malu-lp-container">
          <div className="malu-lp-seal"><b>7</b><span>DIAS</span></div>
          <h2>Garantia de 7 dias</h2>
          <p>Experimente a Malu com calma. Se ela não fizer sentido para você, é só solicitar o reembolso dentro do prazo.</p>
          <CtaButton dark>QUERO CONHECER A MALU</CtaButton>
        </div>
      </section>

      <section id="faq" className="malu-lp-section malu-lp-section--cream malu-lp-faq">
        <div className="malu-lp-container">
          <div className="malu-lp-section-heading"><span>AINDA TEM DÚVIDAS?</span><h2>Perguntas <em>frequentes.</em></h2></div>
          <div className="malu-lp-faq-list">
            {faqs.map(([question, answer], index) => (
              <article className={`malu-lp-faq-item ${openFaq === index ? "is-open" : ""}`} key={question}>
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{question}</span><ChevronDown size={18} /></button>
                <div><p>{answer}</p></div>
              </article>
            ))}
          </div>
          <div className="malu-lp-center"><CtaButton>QUERO LIBERAR MEU ACESSO</CtaButton></div>
        </div>
      </section>

      <footer className="malu-lp-footer"><img src={malu.logoUrl} alt="Malu" /><span>© {new Date().getFullYear()} Malu. Todos os direitos reservados.</span></footer>
    </main>
  );
}
