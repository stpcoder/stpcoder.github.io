import{j as e}from"./index-DlKeVoc_.js";import{r,S as s}from"./StyleSwitcher-8J3P6NCJ.js";const n=(a,i="en")=>typeof a=="string"?a:a&&typeof a=="object"&&(a[i]||a.en||a.ko)||"",c=a=>a?.filter(i=>i.featured!==!1)||[];function l(){const a=r.skills?.programming?.map(i=>i.name)||[];return e.jsxs("div",{className:"cinematic-view",children:[e.jsxs("section",{className:"cinematic-section intro",children:[e.jsx("div",{className:"cinematic-overlay"}),e.jsxs("div",{className:"cinematic-text",children:[e.jsx("h1",{children:n(r.personal.name)}),e.jsx("p",{children:n(r.personal.title)})]})]}),e.jsxs("section",{className:"cinematic-section",children:[e.jsx("h2",{children:"The Journey Begins"}),e.jsx("div",{className:"cinematic-cards",children:c(r.education).map((i,t)=>e.jsxs("div",{className:"cinematic-card",children:[e.jsx("h3",{children:n(i.institution)}),e.jsx("p",{children:n(i.degree)}),e.jsx("span",{children:i.period})]},t))})]}),e.jsxs("section",{className:"cinematic-section dark",children:[e.jsx("h2",{children:"Experience"}),e.jsx("div",{className:"cinematic-cards",children:c(r.experience).map((i,t)=>e.jsxs("div",{className:"cinematic-card",children:[e.jsx("h3",{children:n(i.company)}),e.jsx("p",{children:n(i.position)}),e.jsx("span",{children:i.period})]},t))})]}),e.jsxs("section",{className:"cinematic-section finale",children:[e.jsx("h2",{children:"Skills Acquired"}),e.jsx("div",{className:"skill-bars",children:a.slice(0,5).map((i,t)=>e.jsxs("div",{className:"skill-bar",children:[e.jsx("span",{children:i}),e.jsx("div",{className:"bar",children:e.jsx("div",{className:"fill",style:{width:`${90-t*10}%`}})})]},t))})]}),e.jsx(s,{}),e.jsx("style",{children:`
        .cinematic-view {
          background: #000;
          color: white;
        }
        .cinematic-section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 4rem 2rem;
          position: relative;
        }
        .cinematic-section.intro {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        }
        .cinematic-section.dark {
          background: #0a0a0a;
        }
        .cinematic-section.finale {
          background: linear-gradient(to top, #1a1a2e, #000);
        }
        .cinematic-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.5) 100%);
        }
        .cinematic-text {
          position: relative;
          text-align: center;
        }
        .cinematic-text h1 {
          font-size: 5rem;
          font-weight: 100;
          letter-spacing: 0.3em;
          margin: 0;
          animation: fadeIn 2s ease;
        }
        .cinematic-text p {
          font-size: 1.5rem;
          opacity: 0.7;
          letter-spacing: 0.2em;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cinematic-section h2 {
          font-size: 2.5rem;
          font-weight: 300;
          letter-spacing: 0.2em;
          margin-bottom: 3rem;
          text-transform: uppercase;
        }
        .cinematic-cards {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 1200px;
        }
        .cinematic-card {
          background: rgba(255,255,255,0.05);
          padding: 2rem;
          border-radius: 4px;
          min-width: 280px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.3s ease;
        }
        .cinematic-card:hover {
          transform: translateY(-10px);
        }
        .cinematic-card h3 {
          margin: 0 0 0.5rem;
          font-weight: 400;
        }
        .cinematic-card p {
          opacity: 0.7;
          margin: 0 0 0.5rem;
        }
        .cinematic-card span {
          font-size: 0.85rem;
          opacity: 0.5;
        }
        .skill-bars {
          width: 100%;
          max-width: 600px;
        }
        .skill-bar {
          margin-bottom: 1.5rem;
        }
        .skill-bar span {
          display: block;
          margin-bottom: 0.5rem;
          letter-spacing: 0.1em;
        }
        .bar {
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
        }
        .fill {
          height: 100%;
          background: linear-gradient(90deg, #4facfe, #00f2fe);
          border-radius: 2px;
          transition: width 1s ease;
        }
        @media (max-width: 768px) {
          .cinematic-text h1 { font-size: 2.5rem; letter-spacing: 0.1em; }
          .cinematic-section h2 { font-size: 1.5rem; }
        }
      `})]})}export{l as default};
