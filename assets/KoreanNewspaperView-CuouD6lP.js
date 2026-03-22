import{b as p,j as e}from"./index-DlKeVoc_.js";import{r as i,S as k}from"./StyleSwitcher-8J3P6NCJ.js";const r=(a,t="ko")=>typeof a=="string"?a:a&&typeof a=="object"&&(a[t]||a.ko||a.en)||"",o=a=>a?.filter(t=>t.featured!==!1)||[];function x(){const[a,t]=p.useState("all"),c=new Date().toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"long"}),d=[{id:"all",name:"전체"},{id:"profile",name:"인물"},{id:"education",name:"학력"},{id:"career",name:"경력"},{id:"projects",name:"프로젝트"},{id:"skills",name:"기술"}],l=i.skills?.programming?.map(n=>n.name)||[],m=i.skills?.technologies?.map(n=>n.name)||[];return e.jsxs("div",{className:"kn-view",children:[e.jsx("div",{className:"kn-top-bar",children:e.jsxs("div",{className:"kn-top-content",children:[e.jsx("span",{className:"kn-date",children:c}),e.jsxs("div",{className:"kn-top-links",children:[e.jsx("a",{href:`mailto:${i.personal.email}`,children:"문의"}),e.jsx("span",{children:"|"}),e.jsx("a",{href:"#",children:"구독"})]})]})}),e.jsx("header",{className:"kn-header",children:e.jsxs("div",{className:"kn-header-content",children:[e.jsx("h1",{className:"kn-logo",children:"포트폴리오 데일리"}),e.jsx("p",{className:"kn-tagline",children:"기술과 혁신의 최전선"})]})}),e.jsx("nav",{className:"kn-nav",children:e.jsx("div",{className:"kn-nav-content",children:d.map(n=>e.jsx("button",{className:`kn-nav-item ${a===n.id?"active":""}`,onClick:()=>t(n.id),children:n.name},n.id))})}),e.jsxs("div",{className:"kn-ticker",children:[e.jsx("span",{className:"kn-ticker-label",children:"속보"}),e.jsx("div",{className:"kn-ticker-content",children:e.jsxs("span",{children:[r(i.personal.name),", ",r(i.personal.title),"로서 기술 혁신 주도 중"]})})]}),e.jsx("main",{className:"kn-main",children:e.jsxs("div",{className:"kn-container",children:[e.jsxs("section",{className:"kn-hero",children:[e.jsxs("article",{className:"kn-hero-article",children:[e.jsx("span",{className:"kn-badge",children:"단독"}),e.jsxs("h2",{className:"kn-hero-title",children:['"',r(i.personal.name),'" 개발자, AI 시대 새로운 기술 패러다임 제시']}),e.jsxs("p",{className:"kn-hero-summary",children:[r(i.personal.location)," 기반의 ",r(i.personal.title),"가 최신 기술 트렌드를 이끌며 혁신적인 프로젝트를 진행 중이다. 다양한 기술 스택을 활용한 솔루션 개발에 주력하고 있다."]}),e.jsxs("div",{className:"kn-hero-meta",children:[e.jsx("span",{className:"kn-reporter",children:"기술부 기자"}),e.jsx("span",{className:"kn-time",children:"오늘"})]})]}),e.jsxs("aside",{className:"kn-side-headlines",children:[e.jsx("h3",{className:"kn-section-title",children:"오늘의 주요 기사"}),e.jsxs("ul",{className:"kn-headline-list",children:[e.jsx("li",{children:e.jsxs("a",{href:"#education",children:[e.jsx("span",{className:"kn-category-tag",children:"학력"}),r(o(i.education)[0]?.institution),"에서 ",r(o(i.education)[0]?.degree)," 취득"]})}),e.jsx("li",{children:e.jsxs("a",{href:"#experience",children:[e.jsx("span",{className:"kn-category-tag",children:"경력"}),r(o(i.experience)[0]?.company),"에서 ",r(o(i.experience)[0]?.position)," 역임"]})}),e.jsx("li",{children:e.jsxs("a",{href:"#skills",children:[e.jsx("span",{className:"kn-category-tag",children:"기술"}),l.slice(0,3).join(", ")," 등 다양한 기술 보유"]})})]})]})]}),e.jsxs("div",{className:"kn-grid",children:[e.jsxs("section",{className:"kn-section",id:"education",children:[e.jsxs("h3",{className:"kn-section-header",children:[e.jsx("span",{className:"kn-section-icon",children:"🎓"}),"학력"]}),e.jsx("div",{className:"kn-article-list",children:o(i.education).map((n,s)=>e.jsxs("article",{className:"kn-article-card",children:[e.jsx("h4",{children:r(n.institution)}),e.jsx("p",{children:r(n.degree)}),e.jsx("span",{className:"kn-period",children:n.period})]},s))})]}),e.jsxs("section",{className:"kn-section",id:"experience",children:[e.jsxs("h3",{className:"kn-section-header",children:[e.jsx("span",{className:"kn-section-icon",children:"💼"}),"경력"]}),e.jsx("div",{className:"kn-article-list",children:o(i.experience).map((n,s)=>e.jsxs("article",{className:"kn-article-card",children:[e.jsx("h4",{children:r(n.company)}),e.jsx("p",{className:"kn-position",children:r(n.position)}),e.jsx("span",{className:"kn-period",children:n.period}),n.description&&e.jsx("p",{className:"kn-description",children:r(n.description)})]},s))})]}),e.jsxs("section",{className:"kn-section kn-section-wide",id:"skills",children:[e.jsxs("h3",{className:"kn-section-header",children:[e.jsx("span",{className:"kn-section-icon",children:"🛠️"}),"보유 기술"]}),e.jsxs("div",{className:"kn-skills-grid",children:[e.jsxs("div",{className:"kn-skill-group",children:[e.jsx("h5",{children:"프로그래밍"}),e.jsx("div",{className:"kn-skill-tags",children:l.map((n,s)=>e.jsx("span",{className:"kn-skill-tag",children:n},s))})]}),e.jsxs("div",{className:"kn-skill-group",children:[e.jsx("h5",{children:"기술 스택"}),e.jsx("div",{className:"kn-skill-tags",children:m.map((n,s)=>e.jsx("span",{className:"kn-skill-tag",children:n},s))})]})]})]})]}),e.jsx("footer",{className:"kn-footer",children:e.jsxs("div",{className:"kn-footer-content",children:[e.jsxs("div",{className:"kn-footer-info",children:[e.jsx("h4",{children:"포트폴리오 데일리"}),e.jsxs("p",{children:["연락처: ",i.personal.email]}),e.jsxs("p",{children:["위치: ",r(i.personal.location)]})]}),e.jsx("div",{className:"kn-footer-copy",children:e.jsx("p",{children:"© 2024 포트폴리오 데일리. All rights reserved."})})]})})]})}),e.jsx(k,{}),e.jsx("style",{children:`
        .kn-view {
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          background: #f5f5f5;
          font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
          color: #333;
        }

        /* Top Bar */
        .kn-top-bar {
          background: #1a1a2e;
          color: #fff;
          font-size: 0.8rem;
          padding: 0.5rem 0;
        }
        .kn-top-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .kn-date {
          color: rgba(255,255,255,0.7);
        }
        .kn-top-links a {
          color: rgba(255,255,255,0.9);
          text-decoration: none;
          margin: 0 0.5rem;
        }
        .kn-top-links a:hover {
          text-decoration: underline;
        }
        .kn-top-links span {
          color: rgba(255,255,255,0.3);
        }

        /* Header */
        .kn-header {
          background: #fff;
          border-bottom: 1px solid #e0e0e0;
          padding: 1.5rem 0;
        }
        .kn-header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          text-align: center;
        }
        .kn-logo {
          font-size: 2.5rem;
          font-weight: 900;
          color: #1a1a2e;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .kn-tagline {
          color: #666;
          font-size: 0.9rem;
          margin: 0.25rem 0 0;
        }

        /* Navigation */
        .kn-nav {
          background: #fff;
          border-bottom: 2px solid #1a1a2e;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .kn-nav-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          gap: 0;
        }
        .kn-nav-item {
          background: none;
          border: none;
          padding: 1rem 1.5rem;
          font-size: 0.95rem;
          color: #333;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          font-family: inherit;
        }
        .kn-nav-item:hover {
          background: #f5f5f5;
          color: #0066cc;
        }
        .kn-nav-item.active {
          color: #0066cc;
          border-bottom-color: #0066cc;
          font-weight: 600;
        }

        /* Ticker */
        .kn-ticker {
          background: #fff;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .kn-ticker-label {
          background: #c00000;
          color: #fff;
          padding: 0.25rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 700;
          margin-right: 1rem;
        }
        .kn-ticker-content {
          color: #333;
          font-size: 0.9rem;
        }

        /* Main */
        .kn-main {
          padding: 2rem 0;
        }
        .kn-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Hero */
        .kn-hero {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .kn-hero-article {
          background: #fff;
          padding: 2rem;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .kn-badge {
          display: inline-block;
          background: #0066cc;
          color: #fff;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .kn-hero-title {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1.4;
          margin: 0 0 1rem;
          color: #1a1a2e;
        }
        .kn-hero-summary {
          color: #555;
          line-height: 1.8;
          margin: 0 0 1rem;
        }
        .kn-hero-meta {
          display: flex;
          gap: 1rem;
          color: #888;
          font-size: 0.85rem;
        }

        /* Side Headlines */
        .kn-side-headlines {
          background: #fff;
          padding: 1.5rem;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .kn-section-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #1a1a2e;
        }
        .kn-headline-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .kn-headline-list li {
          padding: 0.75rem 0;
          border-bottom: 1px solid #eee;
        }
        .kn-headline-list li:last-child {
          border-bottom: none;
        }
        .kn-headline-list a {
          color: #333;
          text-decoration: none;
          font-size: 0.9rem;
          line-height: 1.5;
          display: block;
        }
        .kn-headline-list a:hover {
          color: #0066cc;
        }
        .kn-category-tag {
          display: inline-block;
          background: #f0f0f0;
          color: #666;
          padding: 0.15rem 0.5rem;
          font-size: 0.7rem;
          margin-right: 0.5rem;
          border-radius: 2px;
        }

        /* Grid */
        .kn-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        .kn-section {
          background: #fff;
          padding: 1.5rem;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .kn-section-wide {
          grid-column: span 2;
        }
        .kn-section-header {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #1a1a2e;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .kn-section-icon {
          font-size: 1.2rem;
        }

        /* Article Cards */
        .kn-article-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .kn-article-card {
          padding: 1rem;
          background: #fafafa;
          border-radius: 4px;
          border-left: 3px solid #0066cc;
        }
        .kn-article-card h4 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
          color: #1a1a2e;
        }
        .kn-article-card p {
          margin: 0;
          color: #555;
          font-size: 0.9rem;
        }
        .kn-position {
          color: #0066cc !important;
          font-weight: 500;
        }
        .kn-period {
          display: block;
          color: #888;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }
        .kn-description {
          margin-top: 0.75rem !important;
          line-height: 1.6;
        }

        /* Skills */
        .kn-skills-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        .kn-skill-group h5 {
          font-size: 0.9rem;
          color: #666;
          margin: 0 0 0.75rem;
          font-weight: 600;
        }
        .kn-skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .kn-skill-tag {
          background: #e8f0fe;
          color: #0066cc;
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
          border-radius: 3px;
        }

        /* Footer */
        .kn-footer {
          margin-top: 3rem;
          background: #1a1a2e;
          color: #fff;
          padding: 2rem;
          border-radius: 4px;
        }
        .kn-footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .kn-footer-info h4 {
          margin: 0 0 0.5rem;
          font-size: 1.2rem;
        }
        .kn-footer-info p {
          margin: 0.25rem 0;
          color: rgba(255,255,255,0.7);
          font-size: 0.85rem;
        }
        .kn-footer-copy p {
          margin: 0;
          color: rgba(255,255,255,0.5);
          font-size: 0.8rem;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .kn-hero {
            grid-template-columns: 1fr;
          }
          .kn-grid {
            grid-template-columns: 1fr;
          }
          .kn-section-wide {
            grid-column: span 1;
          }
          .kn-skills-grid {
            grid-template-columns: 1fr;
          }
          .kn-footer-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
        }
        @media (max-width: 600px) {
          .kn-logo {
            font-size: 1.8rem;
          }
          .kn-nav-content {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .kn-nav-item {
            padding: 0.75rem 1rem;
            white-space: nowrap;
          }
          .kn-hero-title {
            font-size: 1.3rem;
          }
        }
      `})]})}export{x as default};
