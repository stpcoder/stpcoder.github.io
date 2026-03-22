import{b as p,j as a}from"./index-qKePu0kD.js";import{r as o,S as D}from"./StyleSwitcher-CSZnpS98.js";const r=(i,d="en")=>typeof i=="string"?i:i&&typeof i=="object"&&(i[d]||i.en||i.ko)||"",m=i=>i?.filter(d=>d.featured!==!1)||[],R=[{cmd:"/help",desc:"Show available commands"},{cmd:"/about",desc:"About me"},{cmd:"/education",desc:"Education history"},{cmd:"/experience",desc:"Work experience"},{cmd:"/skills",desc:"Technical skills"},{cmd:"/projects",desc:"Featured projects"},{cmd:"/awards",desc:"Awards & achievements"},{cmd:"/contact",desc:"Contact information"},{cmd:"/all",desc:"Show everything"},{cmd:"/clear",desc:"Clear terminal"}];function O(){const[i,d]=p.useState([{type:"system",text:"Welcome to TaehoOS v2.0"},{type:"system",text:"Type /help for available commands"},{type:"prompt",text:""}]),[g,h]=p.useState(""),[f,T]=p.useState([]),[x,y]=p.useState(-1),[c,b]=p.useState([]),[j,$]=p.useState(0),E=p.useRef(null),w=p.useRef(null),v=o.skills?.programming?.map(t=>t.name)||[],N=o.skills?.technologies?.map(t=>t.name)||[];p.useEffect(()=>{if(g.startsWith("/")){const t=R.filter(n=>n.cmd.toLowerCase().startsWith(g.toLowerCase()));b(t),$(0)}else b([])},[g]),p.useEffect(()=>{w.current&&(w.current.scrollTop=w.current.scrollHeight)},[i]);const S=()=>{E.current?.focus()},C=t=>{const n=t.trim().toLowerCase();n&&(T(l=>[...l,t]),y(-1)),d(l=>[...l.slice(0,-1),{type:"command",text:t}]);let e=[];switch(n){case"/help":case"help":e=["📚 Available Commands:","─────────────────────────────────","/about      - About me","/education  - Education history","/experience - Work experience","/skills     - Technical skills","/projects   - Featured projects","/awards     - Awards & achievements","/contact    - Contact information","/all        - Show everything","/clear      - Clear terminal","─────────────────────────────────","Tip: Type / to see suggestions"];break;case"/about":case"about":e=["┌─ ABOUT ─────────────────────────",`│ Name: ${r(o.personal.name)}`,`│ Title: ${r(o.personal.title)}`,`│ Location: ${r(o.personal.location)}`,"└─────────────────────────────────","",r(o.about)];break;case"/education":case"education":e=["┌─ EDUCATION ──────────────────────"],m(o.education).forEach((s,u)=>{e.push(`│ ${r(s.institution)}`),e.push(`│ ${r(s.degree)}`),e.push(`│ ${s.period}`),u<m(o.education).length-1&&e.push("│")}),e.push("└───────────────────────────────────");break;case"/experience":case"experience":e=["┌─ EXPERIENCE ─────────────────────"],m(o.experience).forEach((s,u)=>{e.push(`│ 💼 ${r(s.company)}`),e.push(`│    ${r(s.position)}`),e.push(`│    ${s.period}`),s.description&&r(s.description).split(`
`).forEach(I=>{e.push(`│    → ${I}`)}),u<m(o.experience).length-1&&e.push("│")}),e.push("└───────────────────────────────────");break;case"/skills":case"skills":e=["┌─ TECHNICAL SKILLS ───────────────","│","│ 💻 Programming Languages:",`│    ${v.join(", ")}`,"│","│ 🛠️ Technologies & Tools:",`│    ${N.join(", ")}`,"│","└───────────────────────────────────"];break;case"/projects":case"projects":e=["┌─ FEATURED PROJECTS ──────────────"];const l=m(o.projects||[]);l.forEach((s,u)=>{e.push(`│ 🚀 ${r(s.title)}`),s.description&&e.push(`│    ${r(s.description).substring(0,60)}...`),s.technologies&&e.push(`│    Tech: ${s.technologies.slice(0,4).join(", ")}`),u<l.length-1&&e.push("│")}),l.length===0&&e.push("│ No featured projects found."),e.push("└───────────────────────────────────");break;case"/awards":case"awards":e=["┌─ AWARDS & ACHIEVEMENTS ──────────"],o.awards?.forEach(s=>{const u=m(s.items);u.length>0&&(e.push(`│ 📁 ${r(s.category)}`),u.forEach(k=>{e.push(`│    🏆 ${r(k.title)}`),e.push(`│       ${r(k.organization)} (${k.year})`)}),e.push("│"))}),e.push("└───────────────────────────────────");break;case"/contact":case"contact":e=["┌─ CONTACT ────────────────────────",`│ 📧 Email: ${o.personal.email}`,`│ 🔗 GitHub: ${o.personal.github}`,`│ 💼 LinkedIn: ${o.personal.linkedin}`,`│ 🌐 Portfolio: ${o.personal.portfolio}`,"└───────────────────────────────────"];break;case"/all":case"all":e=["═══════════════════════════════════","         FULL RESUME OUTPUT        ","═══════════════════════════════════",""],e.push(`Name: ${r(o.personal.name)}`),e.push(`Title: ${r(o.personal.title)}`),e.push(`Location: ${r(o.personal.location)}`),e.push(""),e.push("--- EDUCATION ---"),m(o.education).forEach(s=>{e.push(`• ${r(s.institution)} - ${r(s.degree)} (${s.period})`)}),e.push(""),e.push("--- EXPERIENCE ---"),m(o.experience).forEach(s=>{e.push(`• ${r(s.company)} - ${r(s.position)} (${s.period})`)}),e.push(""),e.push("--- SKILLS ---"),e.push(`Languages: ${v.join(", ")}`),e.push(`Technologies: ${N.join(", ")}`),e.push(""),e.push("═══════════════════════════════════");break;case"/clear":case"clear":d([{type:"system",text:"Terminal cleared."},{type:"prompt",text:""}]);return;case"":d(s=>[...s,{type:"prompt",text:""}]);return;default:e=[`Command not found: ${t}`,"Type /help for available commands"]}d(l=>[...l,...e.map(s=>({type:"output",text:s})),{type:"prompt",text:""}])},A=t=>{if(c.length>0){if(t.key==="Tab"||t.key==="Enter"&&c.length>0&&g!==c[j]?.cmd){t.preventDefault(),h(c[j].cmd),b([]);return}if(t.key==="ArrowDown"){t.preventDefault(),$(n=>n<c.length-1?n+1:n);return}if(t.key==="ArrowUp"&&c.length>0){t.preventDefault(),$(n=>n>0?n-1:0);return}if(t.key==="Escape"){b([]);return}}if(t.key==="Enter")b([]),C(g),h("");else if(t.key==="ArrowUp"&&c.length===0){if(t.preventDefault(),f.length>0){const n=x<f.length-1?x+1:x;y(n),h(f[f.length-1-n]||"")}}else if(t.key==="ArrowDown"&&c.length===0)if(t.preventDefault(),x>0){const n=x-1;y(n),h(f[f.length-1-n]||"")}else x===0&&(y(-1),h(""))},L=t=>{h(t),b([]),E.current?.focus()};return a.jsxs("div",{className:"terminal-view",onClick:S,children:[a.jsxs("div",{className:"terminal-window",children:[a.jsxs("div",{className:"terminal-header",children:[a.jsxs("div",{className:"terminal-buttons",children:[a.jsx("span",{className:"terminal-btn red"}),a.jsx("span",{className:"terminal-btn yellow"}),a.jsx("span",{className:"terminal-btn green"})]}),a.jsx("span",{className:"terminal-title",children:"taeho@portfolio ~ zsh"})]}),a.jsx("div",{className:"terminal-body",ref:w,children:i.map((t,n)=>t.type==="system"?a.jsx("p",{className:"system",children:t.text},n):t.type==="command"?a.jsxs("p",{children:[a.jsx("span",{className:"prompt",children:"$"})," ",t.text]},n):t.type==="output"?a.jsx("p",{className:"output",children:t.text},n):t.type==="prompt"?a.jsxs("div",{className:"input-wrapper",children:[a.jsxs("div",{className:"input-line",children:[a.jsx("span",{className:"prompt",children:"$"}),a.jsx("input",{ref:n===i.length-1?E:null,type:"text",value:n===i.length-1?g:"",onChange:e=>h(e.target.value),onKeyDown:A,className:"terminal-input",autoFocus:!0,spellCheck:!1})]}),n===i.length-1&&c.length>0&&a.jsx("div",{className:"suggestions",children:c.map((e,l)=>a.jsxs("div",{className:`suggestion-item ${l===j?"selected":""}`,onClick:()=>L(e.cmd),children:[a.jsx("span",{className:"suggestion-cmd",children:e.cmd}),a.jsx("span",{className:"suggestion-desc",children:e.desc})]},e.cmd))})]},n):null)})]}),a.jsx(D,{}),a.jsx("style",{children:`
        .terminal-view {
          min-height: 100vh;
          background: #1a1a2e;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
        }
        .terminal-window {
          width: 100%;
          max-width: 900px;
          height: 80vh;
          background: #0d0d0d;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
        }
        .terminal-header {
          background: #2d2d2d;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .terminal-buttons {
          display: flex;
          gap: 8px;
        }
        .terminal-btn {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .terminal-btn.red { background: #ff5f56; }
        .terminal-btn.yellow { background: #ffbd2e; }
        .terminal-btn.green { background: #27c93f; }
        .terminal-title {
          color: #888;
          font-size: 13px;
        }
        .terminal-body {
          flex: 1;
          padding: 20px;
          color: #00ff00;
          font-size: 14px;
          line-height: 1.6;
          overflow-y: auto;
          cursor: text;
        }
        .terminal-body p {
          margin: 0;
          padding: 2px 0;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .prompt {
          color: #00ff00;
          margin-right: 8px;
        }
        .output {
          color: #ccc;
          padding-left: 0;
        }
        .system {
          color: #888;
          font-style: italic;
        }
        .input-wrapper {
          position: relative;
        }
        .input-line {
          display: flex;
          align-items: center;
        }
        .terminal-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #00ff00;
          font-family: inherit;
          font-size: inherit;
          outline: none;
          caret-color: #00ff00;
        }
        .terminal-input::selection {
          background: rgba(0, 255, 0, 0.3);
        }

        /* Suggestions */
        .suggestions {
          margin-top: 4px;
          margin-left: 20px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          overflow: hidden;
          max-width: 400px;
        }
        .suggestion-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 12px;
          cursor: pointer;
          transition: background 0.1s;
        }
        .suggestion-item:hover,
        .suggestion-item.selected {
          background: #2a2a2a;
        }
        .suggestion-cmd {
          color: #888;
          font-weight: 500;
        }
        .suggestion-item.selected .suggestion-cmd,
        .suggestion-item:hover .suggestion-cmd {
          color: #00ff00;
        }
        .suggestion-desc {
          color: #555;
          font-size: 0.85em;
          margin-left: 1rem;
        }

        /* Scrollbar */
        .terminal-body::-webkit-scrollbar {
          width: 8px;
        }
        .terminal-body::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        .terminal-body::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 4px;
        }
        .terminal-body::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        @media (max-width: 768px) {
          .terminal-window {
            height: 85vh;
          }
          .terminal-body {
            font-size: 12px;
            padding: 12px;
          }
          .suggestions {
            max-width: 100%;
          }
        }
      `})]})}export{O as default};
