import{b as o,j as e}from"./index-DlKeVoc_.js";import{r,S as f}from"./StyleSwitcher-8J3P6NCJ.js";const n=(a,s="en")=>typeof a=="string"?a:a&&typeof a=="object"&&(a[s]||a.en||a.ko)||"",l=a=>a?.filter(s=>s.featured!==!1)||[];function j(){const a=o.useRef(null),[s,c]=o.useState(0);o.useEffect(()=>{const t=a.current;if(!t)return;const i=()=>{const{scrollTop:p,scrollHeight:x,clientHeight:g}=t,h=p/(x-g);c(h)};return t.addEventListener("scroll",i),()=>t.removeEventListener("scroll",i)},[]);const m=r.skills?.programming?.map(t=>t.name)||[],d=r.skills?.technologies?.map(t=>t.name)||[];return e.jsxs("div",{className:"galaxy-view",ref:a,children:[e.jsx("div",{className:"stars",style:{opacity:1-s*.3}}),e.jsx("div",{className:"stars stars-2"}),e.jsxs("div",{className:"galaxy-content",children:[e.jsxs("section",{className:"galaxy-section hero",children:[e.jsx("h1",{children:n(r.personal.name)}),e.jsx("p",{className:"hero-title",children:n(r.personal.title)}),e.jsxs("div",{className:"scroll-indicator",children:[e.jsx("span",{children:"Scroll to explore"}),e.jsx("div",{className:"scroll-arrow"})]})]}),e.jsxs("section",{className:"galaxy-section",children:[e.jsx("h2",{children:"Education"}),e.jsx("div",{className:"timeline",children:l(r.education).map((t,i)=>e.jsxs("div",{className:"timeline-item",children:[e.jsx("div",{className:"timeline-dot"}),e.jsxs("div",{className:"timeline-content",children:[e.jsx("h3",{children:n(t.institution)}),e.jsx("p",{children:n(t.degree)}),e.jsx("span",{className:"period",children:t.period})]})]},i))})]}),e.jsxs("section",{className:"galaxy-section",children:[e.jsx("h2",{children:"Experience"}),e.jsx("div",{className:"timeline",children:l(r.experience).map((t,i)=>e.jsxs("div",{className:"timeline-item",children:[e.jsx("div",{className:"timeline-dot"}),e.jsxs("div",{className:"timeline-content",children:[e.jsx("h3",{children:n(t.company)}),e.jsx("p",{className:"position",children:n(t.position)}),e.jsx("span",{className:"period",children:t.period}),t.description&&e.jsx("p",{className:"description",children:n(t.description)})]})]},i))})]}),e.jsxs("section",{className:"galaxy-section",children:[e.jsx("h2",{children:"Skills"}),e.jsxs("div",{className:"skill-cloud",children:[m.map((t,i)=>e.jsx("span",{className:"skill-tag programming",children:t},`prog-${i}`)),d.map((t,i)=>e.jsx("span",{className:"skill-tag technology",children:t},`tech-${i}`))]})]}),e.jsxs("section",{className:"galaxy-section final",children:[e.jsx("h2",{children:"Contact"}),e.jsxs("div",{className:"contact-info",children:[e.jsx("a",{href:`mailto:${r.personal.email}`,className:"contact-link",children:r.personal.email}),e.jsx("p",{className:"location",children:n(r.personal.location)})]})]})]}),e.jsx(f,{}),e.jsx("style",{children:`
        .galaxy-view {
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          background: linear-gradient(to bottom, #0a0a1a 0%, #1a1a3a 50%, #0a0a2a 100%);
          position: relative;
        }
        .stars {
          position: fixed;
          inset: 0;
          background-image:
            radial-gradient(2px 2px at 20px 30px, #fff, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90px 40px, #fff, transparent),
            radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 230px 180px, #fff, transparent),
            radial-gradient(2px 2px at 300px 50px, rgba(255,255,255,0.7), transparent);
          background-size: 350px 350px;
          animation: twinkle 8s ease-in-out infinite;
          pointer-events: none;
        }
        .stars-2 {
          background-size: 450px 450px;
          animation-delay: -4s;
          opacity: 0.5;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .galaxy-content {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .galaxy-section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem 0;
        }
        .galaxy-section.hero {
          text-align: center;
          align-items: center;
        }
        .galaxy-section h1 {
          font-size: 4rem;
          color: white;
          text-shadow: 0 0 40px rgba(138, 100, 255, 0.8), 0 0 80px rgba(138, 100, 255, 0.4);
          margin: 0;
          font-weight: 300;
          letter-spacing: 0.1em;
        }
        .hero-title {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.3rem;
          margin-top: 1rem;
          letter-spacing: 0.2em;
        }
        .scroll-indicator {
          position: absolute;
          bottom: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          animation: float 2s ease-in-out infinite;
        }
        .scroll-arrow {
          width: 20px;
          height: 20px;
          border-right: 2px solid rgba(255, 255, 255, 0.5);
          border-bottom: 2px solid rgba(255, 255, 255, 0.5);
          transform: rotate(45deg);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        .galaxy-section h2 {
          font-size: 2rem;
          color: #a78bfa;
          margin-bottom: 2rem;
          font-weight: 300;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        .timeline {
          position: relative;
          padding-left: 2rem;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, transparent, #a78bfa, transparent);
        }
        .timeline-item {
          position: relative;
          margin-bottom: 2rem;
          padding-left: 1.5rem;
        }
        .timeline-dot {
          position: absolute;
          left: -2rem;
          top: 0.5rem;
          width: 12px;
          height: 12px;
          background: #a78bfa;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(167, 139, 250, 0.6);
        }
        .timeline-content {
          background: rgba(255, 255, 255, 0.03);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(167, 139, 250, 0.2);
          backdrop-filter: blur(10px);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .timeline-content:hover {
          transform: translateX(10px);
          border-color: rgba(167, 139, 250, 0.5);
        }
        .timeline-content h3 {
          color: white;
          margin: 0 0 0.5rem;
          font-size: 1.2rem;
          font-weight: 500;
        }
        .timeline-content p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          line-height: 1.6;
        }
        .timeline-content .position {
          color: #a78bfa;
          font-style: italic;
        }
        .timeline-content .period {
          display: block;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }
        .timeline-content .description {
          margin-top: 0.75rem;
          font-size: 0.95rem;
        }
        .skill-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
        }
        .skill-tag {
          padding: 0.75rem 1.5rem;
          border-radius: 30px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          cursor: default;
        }
        .skill-tag.programming {
          background: rgba(167, 139, 250, 0.2);
          color: #a78bfa;
          border: 1px solid rgba(167, 139, 250, 0.4);
        }
        .skill-tag.technology {
          background: rgba(96, 165, 250, 0.2);
          color: #60a5fa;
          border: 1px solid rgba(96, 165, 250, 0.4);
        }
        .skill-tag:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px currentColor;
        }
        .galaxy-section.final {
          text-align: center;
          align-items: center;
        }
        .contact-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .contact-link {
          color: #a78bfa;
          text-decoration: none;
          font-size: 1.2rem;
          padding: 1rem 2rem;
          border: 1px solid rgba(167, 139, 250, 0.4);
          border-radius: 30px;
          transition: all 0.3s ease;
        }
        .contact-link:hover {
          background: rgba(167, 139, 250, 0.2);
          box-shadow: 0 0 30px rgba(167, 139, 250, 0.4);
        }
        .location {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.95rem;
        }
        @media (max-width: 768px) {
          .galaxy-section h1 { font-size: 2.5rem; }
          .hero-title { font-size: 1rem; }
          .galaxy-section h2 { font-size: 1.5rem; }
          .timeline { padding-left: 1.5rem; }
          .timeline-item { padding-left: 1rem; }
          .timeline-dot { left: -1.5rem; }
          .skill-tag { padding: 0.5rem 1rem; font-size: 0.85rem; }
        }
      `})]})}export{j as default};
