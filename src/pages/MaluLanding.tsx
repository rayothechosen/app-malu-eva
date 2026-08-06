import { useEffect, useState } from "react";
import { Check, ChevronDown, MessageCircle, Play } from "lucide-react";
import { BRAND_THEMES } from "@/lib/brandTheme";

import guaranteeSeal from "../assets/malu-guarantee.png";

const malu = BRAND_THEMES.malu;
const R2 = "https://pub-087c3f92e3134b8cb358b6210b3554f5.r2.dev";
const TESTIMONIAL_R2 = "https://pub-69ddd09562c34185a376f620c936f5db.r2.dev";

const cards = [
  { image: `${R2}/CARD%20IAVIDEOS.jpg`, title: "Uma assistente que organiza sua rotina", description: "A Malu separa os melhores materiais, sugere horários e deixa sua próxima rotina mais simples de executar." },
  { image: `${R2}/CARD%2010K.png`, title: "Mais de 10.551 vídeos prontos", description: "Encontre vídeos organizados por nicho, prontos para baixar e usar na sua estratégia de conteúdo." },
  { image: `${R2}/CARD%20PRODUTOS.png`, title: "Produtos em alta para inspirar", description: "Tenha ideias de produtos que combinam com a sua rotina de posts e com o seu público." },
  { image: `${R2}/CARD%20TREINAMENTO.png`, title: "Tudo em um só lugar", description: "Vídeos, stories, carrosséis, legendas e hashtags para você manter constância todos os dias." },
];

const faqs = [
  ["Onde encontro os conteúdos da Malu?", "Depois de liberar seu acesso, você entra no painel e encontra os vídeos, stories, carrosséis e produtos em alta organizados em um só lugar."],
  ["A Malu publica os conteúdos automaticamente?", "A Malu planeja a sua rotina: ela sugere vídeos, legendas, hashtags e os horários para que você publique com mais consistência."],
  ["Funciona pelo celular?", "Sim. A Malu foi desenhada para ser usada pelo celular e também funciona no computador."],
  ["Preciso saber editar vídeos?", "Não. Os conteúdos disponíveis nos packs já estão prontos para você baixar e publicar."],
  ["Se eu precisar de ajuda, terei suporte?", "Sim. Você terá suporte para dúvidas de acesso e uso da plataforma."],
  ["E se eu não gostar?", "Você tem 7 dias para solicitar o reembolso, sem burocracia."],
];

function Cta({ children, direct = false }: { children: React.ReactNode; direct?: boolean }) {
  const handleScroll = () => document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth", block: "center" });
  return direct ? <a className="malu-ref-cta malu-ref-cta--green" href="#oferta">{children}</a> : <button className="malu-ref-cta" type="button" onClick={handleScroll}>{children}</button>;
}

function AudioTestimonial({ src, name }: { src: string; name: string }) {
  return <div className="malu-ref-audio"><audio controls preload="metadata" src={src} /><div><b>{name}</b><span>Depoimento em áudio</span></div></div>;
}

export default function MaluLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://scripts.converteai.net/b4eae634-a642-471f-b580-88ad9ba9c8b1/players/6a5b00e2d87f51a71ede7042/v4/player.js";
    script.async = true;
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  useEffect(() => {
    const page = document.getElementById("page");
    if (!page) return;
    let wasRevealed = false;
    const observer = new MutationObserver(() => {
      if (page.style.display !== "none") wasRevealed = true;
      if (wasRevealed && page.style.display === "none") page.style.display = "block";
    });
    observer.observe(page, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, []);

  return <main className="malu-ref">
    <div className="malu-ref-topbar">Segredo das top afiliadas revelado!</div>

    <section className="malu-ref-hero">
      <div className="malu-ref-shell">
        <img className="malu-ref-logo" src={malu.logoUrl} alt="Malu" />
        <h1>Veja como a <mark>Malu</mark> organiza o conteúdo para você</h1>
        <p>Assista ao vídeo abaixo e descubra uma forma mais simples de planejar sua rotina de posts.</p>
        <div className="malu-ref-player" dangerouslySetInnerHTML={{ __html: '<vturb-smartplayer id="vid-6a5b00e2d87f51a71ede7042" style="display:block;margin:0 auto;width:100%;max-width:400px;"></vturb-smartplayer>' }} />
      </div>
    </section>

    <div id="page" style={{ display: "none" }}>
      <div className="malu-ref-scroll"><span>Role para baixo</span><ChevronDown size={28} /></div>

      <section className="malu-ref-features">
        <div className="malu-ref-shell">
          <div className="malu-ref-heading"><span>O QUE VOCÊ RECEBE</span><h2>Tudo isso liberado <em>hoje.</em></h2></div>
          <div className="malu-ref-card-list">
            {cards.map((card, index) => <article className="malu-ref-card" key={card.title}>
              <div className="malu-ref-card__line" />
              <div className="malu-ref-card__copy"><i>{String(index + 1).padStart(2, "0")}</i><div><h3>{card.title}</h3><p>{card.description}</p></div></div>
              <img src={card.image} alt="" loading="lazy" />
            </article>)}
          </div>
          <Cta>QUERO CONHECER A MALU</Cta>
        </div>
      </section>

      <section className="malu-ref-testimonials">
        <div className="malu-ref-shell">
          <div className="malu-ref-heading malu-ref-heading--light"><span>RESULTADOS REAIS</span><h2>Depoimentos dos nossos <em>afiliados.</em></h2><p>Conheça quem já faz parte dessa rotina.</p></div>
          <div className="malu-ref-testimonial-media">
            <video controls playsInline preload="metadata" poster={`${TESTIMONIAL_R2}/depimagem01.jpg`} src={`${TESTIMONIAL_R2}/ia%20depoimento02.mp4`} />
            <img src={`${TESTIMONIAL_R2}/depimagem02.jpg`} alt="Depoimento de cliente" loading="lazy" />
          </div>
          <div className="malu-ref-audio-list">
            <p>Ouça também quem já usou</p>
            <AudioTestimonial name="Kleber Santana" src={`${TESTIMONIAL_R2}/audio%20depoimento.mp3`} />
            <AudioTestimonial name="Marilia Pereira" src={`${TESTIMONIAL_R2}/audio%20depoimento2.mp3`} />
          </div>
          <Cta>QUERO CONHECER A MALU</Cta>
        </div>
      </section>

      <section className="malu-ref-author">
        <div className="malu-ref-shell">
          <img src={`${TESTIMONIAL_R2}/insta.jpg`} alt="Perfil de especialista afiliada" loading="lazy" />
          <div className="malu-ref-heading"><span>UMA ROTINA CRIADA PARA AFILIADAS</span><h2>Mais clareza para postar, todos os <em>dias.</em></h2></div>
          <p>Encontrar vídeos, pensar em legendas e decidir o que publicar consome um tempo que poderia ser usado para vender. A Malu nasceu para organizar essa parte da rotina.</p>
          <p>Ela reúne conteúdos, formatos e sugestões para você não precisar começar do zero toda vez que for postar.</p>
          <Cta>QUERO CONHECER A MALU</Cta>
        </div>
      </section>

      <section className="malu-ref-support">
        <div className="malu-ref-shell"><MessageCircle size={44} /><span>SUPORTE INCLUÍDO</span><h2>Você não fica<br /><em>sozinha.</em></h2><p>Qualquer dúvida sobre o acesso e a plataforma, nossa equipe responde direto no WhatsApp.</p><Cta>QUERO CONHECER A MALU</Cta></div>
      </section>

      <section id="oferta" className="malu-ref-offer-section">
        <div className="malu-ref-shell">
          <div className="malu-ref-heading"><h2>Chegou a sua hora de ter uma rotina de conteúdo mais <em>leve.</em></h2><p>Aproveite a condição de hoje e receba acesso imediato.</p></div>
          <article className="malu-ref-offer">
            <div className="malu-ref-offer__banner">ACESSO IMEDIATO</div>
            <img src={`${R2}/CAPAOFERTA%20IAVIDEOS.png`} alt="Prévia do acesso à plataforma" loading="lazy" />
            <h3>Malu: conteúdo e rotina para afiliadas</h3>
            <ul>{["Mais de 10.551 vídeos prontos", "Produtos em alta", "Packs de stories e carrosséis", "Legendas, hashtags e horários sugeridos", "Suporte para tirar dúvidas", "7 dias de garantia"].map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
            <div className="malu-ref-price"><s>De R$149,90</s><b>R$27,90</b></div>
            <Cta direct>COMPRAR AGORA</Cta>
          </article>
        </div>
      </section>

      <section className="malu-ref-guarantee">
        <div className="malu-ref-shell"><img src={guaranteeSeal} alt="Selo de garantia de 7 dias" /><h2>Garantia de 7 dias</h2><p>Se por qualquer motivo você não estiver satisfeita, basta solicitar o reembolso dentro de 7 dias. Você recebe 100% do seu dinheiro de volta, sem burocracia.</p><Cta>QUERO CONHECER A MALU</Cta></div>
      </section>

      <section className="malu-ref-faq">
        <div className="malu-ref-shell"><div className="malu-ref-heading"><span>TIRE SUAS DÚVIDAS</span><h2>Perguntas frequentes</h2></div><div className="malu-ref-faq-list">{faqs.map(([question, answer], index) => <article className={openFaq === index ? "is-open" : ""} key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)}>{question}<ChevronDown size={16} /></button><div><p>{answer}</p></div></article>)}</div><Cta>QUERO CONHECER A MALU</Cta></div>
      </section>
    </div>

    <footer className="malu-ref-footer"><img src={malu.logoUrl} alt="Malu" /><p>© {new Date().getFullYear()} Malu. Todos os direitos reservados.</p></footer>
  </main>;
}
