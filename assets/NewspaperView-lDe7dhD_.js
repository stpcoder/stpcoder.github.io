import{j as e}from"./index-DlKeVoc_.js";import{r as s,S as m}from"./StyleSwitcher-8J3P6NCJ.js";const n=(a,t="en")=>typeof a=="string"?a:a&&typeof a=="object"&&(a[t]||a.en||a.ko)||"",o=a=>a?.filter(t=>t.featured!==!1)||[];function h(){const a=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),t=s.skills?.programming?.map(r=>r.name)||[],c=s.skills?.technologies?.map(r=>r.name)||[],l=[`${n(s.personal.name)} wins Kakao AI TOP 100 Grand Prize`,'Featured in KBS Documentary "Nobel Week"',"Excellence Award at SK Hynix internship presentation","K-Startup 2023 Excellence Award (Minister of National Defense)"];return e.jsxs("div",{className:"newspaper-view",children:[e.jsxs("div",{className:"breaking-ticker",children:[e.jsx("span",{className:"breaking-label",children:"BREAKING"}),e.jsx("div",{className:"ticker-wrapper",children:e.jsxs("div",{className:"ticker-content",children:[l.map((r,i)=>e.jsxs("span",{className:"ticker-item",children:[r,e.jsx("span",{className:"ticker-separator",children:"•"})]},i)),l.map((r,i)=>e.jsxs("span",{className:"ticker-item",children:[r,e.jsx("span",{className:"ticker-separator",children:"•"})]},`dup-${i}`))]})})]}),e.jsxs("header",{className:"newspaper-header",children:[e.jsx("div",{className:"newspaper-date",children:a}),e.jsx("h1",{className:"newspaper-title",children:"THE PORTFOLIO TIMES"}),e.jsx("div",{className:"newspaper-tagline",children:"All the news that's fit to code"})]}),e.jsxs("main",{className:"newspaper-content",children:[e.jsxs("article",{className:"headline-article",children:[e.jsx("span",{className:"exclusive-badge",children:"EXCLUSIVE"}),e.jsxs("h2",{children:["BREAKING: ",n(s.personal.name)," Revolutionizes Tech Industry"]}),e.jsx("p",{className:"byline",children:"By Our Technology Correspondent"}),e.jsxs("p",{children:[n(s.personal.title)," based in ",n(s.personal.location)," has been making waves in the technology sector with groundbreaking work in AI and software development."]}),e.jsx("p",{className:"article-continue",children:n(s.about)})]}),e.jsxs("aside",{className:"sidebar",children:[e.jsxs("div",{className:"sidebar-section",children:[e.jsx("h3",{children:"EDUCATION"}),o(s.education).map((r,i)=>e.jsxs("p",{children:[e.jsx("strong",{children:n(r.institution)}),e.jsx("br",{}),n(r.degree)]},i))]}),e.jsxs("div",{className:"sidebar-section",children:[e.jsx("h3",{children:"EXPERIENCE"}),o(s.experience).slice(0,3).map((r,i)=>e.jsxs("div",{className:"sidebar-item",children:[e.jsx("strong",{children:n(r.company)}),e.jsx("span",{className:"sidebar-role",children:n(r.position)})]},i))]}),e.jsxs("div",{className:"sidebar-section",children:[e.jsx("h3",{children:"CONTACT"}),e.jsx("p",{children:s.personal.email})]})]}),e.jsxs("article",{className:"secondary-article",children:[e.jsx("h3",{children:"Skills & Expertise"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Languages:"})," ",t.join(", ")]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Technologies:"})," ",c.join(", ")]})]}),e.jsxs("section",{className:"awards-section",children:[e.jsx("h3",{children:"AWARDS & ACHIEVEMENTS"}),e.jsx("div",{className:"awards-grid",children:s.awards?.map(r=>o(r.items).slice(0,2).map((i,d)=>e.jsxs("div",{className:"award-card",children:[e.jsx("span",{className:"award-year",children:i.year}),e.jsx("h4",{children:n(i.title)}),e.jsx("p",{children:n(i.organization)})]},`${r.category}-${d}`)))})]})]}),e.jsx(m,{}),e.jsx("style",{children:`
        .newspaper-view {
          min-height: 100vh;
          background: #f4f1ea;
          font-family: 'Times New Roman', Georgia, serif;
        }

        /* Breaking News Ticker */
        .breaking-ticker {
          background: #c00000;
          display: flex;
          align-items: center;
          overflow: hidden;
          height: 40px;
        }
        .breaking-label {
          background: #fff;
          color: #c00000;
          padding: 0.5rem 1rem;
          font-weight: 900;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          flex-shrink: 0;
          text-transform: uppercase;
          font-family: Arial, sans-serif;
        }
        .ticker-wrapper {
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        .ticker-content {
          display: flex;
          white-space: nowrap;
          animation: ticker 30s linear infinite;
        }
        .ticker-item {
          color: white;
          font-size: 0.9rem;
          padding: 0 0.5rem;
          font-family: Arial, sans-serif;
        }
        .ticker-separator {
          margin: 0 1rem;
          opacity: 0.7;
        }
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .newspaper-header {
          text-align: center;
          border-bottom: 3px double #000;
          padding: 1.5rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          background: #f4f1ea;
        }
        .newspaper-date {
          font-size: 0.9rem;
          color: #666;
        }
        .newspaper-title {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          margin: 0.5rem 0;
        }
        .newspaper-tagline {
          font-style: italic;
          color: #666;
        }
        .newspaper-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }
        .headline-article {
          position: relative;
        }
        .exclusive-badge {
          display: inline-block;
          background: #c00000;
          color: white;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          font-family: Arial, sans-serif;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }
        .headline-article h2 {
          font-size: 2rem;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .byline {
          font-style: italic;
          color: #666;
          margin-bottom: 1rem;
        }
        .article-continue {
          margin-top: 1rem;
          line-height: 1.8;
          color: #333;
        }
        .sidebar {
          border-left: 1px solid #ccc;
          padding-left: 1.5rem;
        }
        .sidebar-section {
          margin-bottom: 2rem;
        }
        .sidebar-section h3 {
          font-size: 1rem;
          border-bottom: 2px solid #000;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        .sidebar-item {
          margin-bottom: 0.75rem;
        }
        .sidebar-role {
          display: block;
          font-size: 0.9rem;
          color: #555;
          font-style: italic;
        }
        .secondary-article {
          grid-column: span 2;
          border-top: 1px solid #ccc;
          padding-top: 1.5rem;
          columns: 2;
          column-gap: 2rem;
        }
        .secondary-article h3 {
          column-span: all;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        /* Awards Section */
        .awards-section {
          grid-column: span 2;
          border-top: 1px solid #ccc;
          padding-top: 1.5rem;
          margin-top: 1rem;
        }
        .awards-section h3 {
          font-size: 1.25rem;
          border-bottom: 2px solid #000;
          padding-bottom: 0.5rem;
          margin-bottom: 1.5rem;
          display: inline-block;
        }
        .awards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .award-card {
          background: #fff;
          padding: 1.25rem;
          border: 1px solid #ddd;
          position: relative;
        }
        .award-year {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: #000;
          color: #fff;
          padding: 0.15rem 0.5rem;
          font-size: 0.75rem;
          font-family: Arial, sans-serif;
        }
        .award-card h4 {
          font-size: 0.95rem;
          margin: 0 0 0.5rem;
          line-height: 1.4;
          padding-right: 3rem;
        }
        .award-card p {
          font-size: 0.85rem;
          color: #666;
          margin: 0;
        }

        @media (max-width: 768px) {
          .newspaper-title {
            font-size: 2rem;
          }
          .newspaper-content {
            grid-template-columns: 1fr;
            padding: 1rem;
          }
          .sidebar {
            border-left: none;
            border-top: 1px solid #ccc;
            padding-left: 0;
            padding-top: 1.5rem;
          }
          .secondary-article {
            columns: 1;
          }
          .awards-grid {
            grid-template-columns: 1fr;
          }
          .breaking-ticker {
            height: 36px;
          }
          .breaking-label {
            font-size: 0.75rem;
            padding: 0.4rem 0.75rem;
          }
          .ticker-item {
            font-size: 0.8rem;
          }
        }
      `})]})}export{h as default};
