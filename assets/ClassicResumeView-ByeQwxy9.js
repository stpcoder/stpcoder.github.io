import{j as e}from"./index-DlKeVoc_.js";import{r as i,S as m}from"./StyleSwitcher-8J3P6NCJ.js";const n=(r,t="en")=>typeof r=="string"?r:r&&typeof r=="object"&&(r[t]||r.en||r.ko)||"",o=r=>r?.filter(t=>t.featured!==!1)||[];function d(){const r=i.skills?.programming?.map(s=>s.name)||[],t=i.skills?.technologies?.map(s=>s.name)||[];return e.jsxs("div",{className:"classic-resume-view",children:[e.jsxs("div",{className:"resume-paper",children:[e.jsxs("header",{className:"resume-header",children:[e.jsx("h1",{children:n(i.personal.name)}),e.jsx("p",{className:"title",children:n(i.personal.title)}),e.jsxs("div",{className:"contact-info",children:[e.jsx("span",{children:i.personal.email}),e.jsx("span",{children:"•"}),e.jsx("span",{children:n(i.personal.location)})]})]}),e.jsxs("section",{className:"resume-section",children:[e.jsx("h2",{children:"Education"}),o(i.education).map((s,a)=>e.jsxs("div",{className:"resume-item",children:[e.jsxs("div",{className:"item-header",children:[e.jsx("strong",{children:n(s.institution)}),e.jsx("span",{children:s.period})]}),e.jsx("p",{children:n(s.degree)})]},a))]}),e.jsxs("section",{className:"resume-section",children:[e.jsx("h2",{children:"Experience"}),o(i.experience).map((s,a)=>e.jsxs("div",{className:"resume-item",children:[e.jsxs("div",{className:"item-header",children:[e.jsx("strong",{children:n(s.company)}),e.jsx("span",{children:s.period})]}),e.jsx("p",{className:"position",children:n(s.position)}),s.description&&e.jsx("p",{children:n(s.description)})]},a))]}),e.jsxs("section",{className:"resume-section",children:[e.jsx("h2",{children:"Skills"}),e.jsxs("div",{className:"skills-grid",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Programming:"})," ",r.join(", ")]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Technologies:"})," ",t.join(", ")]})]})]})]}),e.jsx(m,{}),e.jsx("style",{children:`
        .classic-resume-view {
          height: 100vh;
          overflow-y: auto;
          background: #e0e0e0;
          padding: 2rem;
          box-sizing: border-box;
        }
        .resume-paper {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 3rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          font-family: 'Georgia', serif;
          color: #333;
          margin-bottom: 2rem;
        }
        .resume-header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
        }
        .resume-header h1 {
          font-size: 2.5rem;
          margin: 0;
          letter-spacing: 0.1em;
        }
        .resume-header .title {
          font-size: 1.1rem;
          color: #666;
          margin: 0.5rem 0;
        }
        .contact-info {
          font-size: 0.9rem;
          color: #666;
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
        .resume-section {
          margin-bottom: 2rem;
        }
        .resume-section h2 {
          font-size: 1.2rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 1px solid #ccc;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        .resume-item {
          margin-bottom: 1.5rem;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .item-header span {
          color: #666;
          font-size: 0.9rem;
        }
        .position {
          font-style: italic;
          color: #555;
          margin: 0.25rem 0;
        }
        .skills-grid {
          display: grid;
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .resume-paper {
            padding: 1.5rem;
          }
          .item-header {
            flex-direction: column;
          }
        }
      `})]})}export{d as default};
