// ============ Helpers ============
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function setTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  $("#btnTheme").textContent = theme === "dark" ? "🌙" : "☀️";
}

function setLang(lang){
  document.documentElement.lang = (lang === "pt") ? "pt-br" : "en";
  localStorage.setItem("lang", lang);
  $("#btnLang").textContent = (lang === "pt") ? "PT" : "EN";

  // Apply translations
  const dict = translations[lang];
  $$("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if(dict[key]) el.textContent = dict[key];
  });

  // Update placeholders
  const search = $("#searchInput");
  search.placeholder = dict.search_placeholder || search.placeholder;
}

// ============ Translations ============
const translations = {
  pt: {
    nav_home: "Home",
    nav_cv: "Currículo",
    nav_projects: "Projetos",
    nav_studies: "Estudos",
    nav_contact: "Contato",

    hello: "Olá, eu sou",
    subtitle: "Estudante de Análise e Desenvolvimento de Sistemas. Curto criar interfaces bonitas, sistemas bem organizados e projetos práticos.",
    pill_1: "Front-end",
    pill_2: "Banco de Dados",
    pill_3: "Projetos acadêmicos",
    cta_projects: "Ver projetos",
    cta_cv: "Ver currículo",

    featured_title: "Projetos em destaque",
    featured_sub: "Passe o mouse para pré-visualizar.",
    preview_btn: "Pré-visualizar",

    p1_desc: "Conceito de logística eco-friendly com foco em experiência e operação.",
    p2_desc: "Portal e captura de dados com estrutura organizada e fluxo simples.",
    p3_desc: "Jogo estilo snake com ranking e evolução — foco em diversão e UI.",

    cv_title: "Visualização do currículo",
    cv_sub: "Aqui você pode exibir seu CV (PDF embutido) ou um resumo em cards.",
    cv_upload: "Enviar PDF do currículo",
    cv_download: "Baixar PDF",
    cv_empty: "Envie um PDF para exibir aqui (ou coloque um arquivo em /assets/cv.pdf).",

    projects_title: "Projetos",
    projects_sub: "Lista completa dos projetos com descrição, stack e links.",
    proj_a: "CRUD com autenticação, validações e banco relacional.",
    proj_b: "Fluxo de telas com foco em clareza, hierarquia e acessibilidade.",

    studies_title: "Estudos / Pesquisas",
    studies_sub: "Coisas que você estudou e quer mostrar (ex: modelagem de dados, DER, normalização).",
    study_a_title: "Modelagem de Banco de Dados",
    study_a_desc: "DER, dicionário de dados, regras de integridade e normalização.",
    study_b_title: "Arquitetura & Organização",
    study_b_desc: "Conceitos de CPU, memória, instruções e fundamentos de sistemas.",

    contact_title: "Contato",
    contact_sub: "Me chama em qualquer um desses canais.",

    modal_projects: "Ver seção de projetos",
    modal_close: "Fechar",

    avatar_hint: "Adicione sua foto em /assets",
    search_placeholder: "Pesquisar (ex: banco, api, css...)"
  },

  en: {
    nav_home: "Home",
    nav_cv: "Resume",
    nav_projects: "Projects",
    nav_studies: "Studies",
    nav_contact: "Contact",

    hello: "Hi, I'm",
    subtitle: "Systems Analysis & Development student. I enjoy building clean interfaces, well-structured systems and practical projects.",
    pill_1: "Front-end",
    pill_2: "Databases",
    pill_3: "Academic projects",
    cta_projects: "See projects",
    cta_cv: "See resume",

    featured_title: "Featured projects",
    featured_sub: "Hover to preview.",
    preview_btn: "Preview",

    p1_desc: "Eco-friendly logistics concept focused on experience and operations.",
    p2_desc: "Portal & data capture with a clean structure and simple flow.",
    p3_desc: "Snake-style game with ranking and progression — UI-focused.",

    cv_title: "Resume viewer",
    cv_sub: "Embed your PDF resume here (or show a structured summary).",
    cv_upload: "Upload PDF resume",
    cv_download: "Download PDF",
    cv_empty: "Upload a PDF to display here (or place a file at /assets/cv.pdf).",

    projects_title: "Projects",
    projects_sub: "Full list with description, stack and links.",
    proj_a: "CRUD with auth, validations and relational database.",
    proj_b: "Screen flow with focus on clarity, hierarchy and accessibility.",

    studies_title: "Studies / Research",
    studies_sub: "What you studied and want to showcase (ERD, normalization, etc.).",
    study_a_title: "Database Modeling",
    study_a_desc: "ERD, data dictionary, integrity rules and normalization.",
    study_b_title: "Computer Architecture",
    study_b_desc: "CPU, memory, instructions and systems fundamentals.",

    contact_title: "Contact",
    contact_sub: "Reach out on any of these channels.",

    modal_projects: "Go to projects section",
    modal_close: "Close",

    avatar_hint: "Add your photo in /assets",
    search_placeholder: "Search (e.g., database, api, css...)"
  }
};

// ============ Theme + Lang init ============
const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);

const savedLang = localStorage.getItem("lang") || "pt";
setLang(savedLang);

// Buttons
$("#btnTheme").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

$("#btnLang").addEventListener("click", () => {
  const current = localStorage.getItem("lang") || "pt";
  setLang(current === "pt" ? "en" : "pt");
});

// ============ Preview modal ============
const modal = $("#previewModal");
const previewTitle = $("#previewTitle");
const previewText = $("#previewText");

function openPreview(name){
  previewTitle.textContent = `${(localStorage.getItem("lang") === "en") ? "Preview" : "Pré-visualizar"} — ${name}`;
  previewText.textContent = (localStorage.getItem("lang") === "en")
    ? "You can put screenshots, a full description, technologies and links here."
    : "Aqui você pode colocar screenshots, descrição completa, tecnologias e links do projeto.";
  modal.showModal();
}

$$(".card-overlay").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const name = e.currentTarget.getAttribute("data-preview") || "Projeto";
    openPreview(name);
  });
});

$("#closeModal").addEventListener("click", () => modal.close());
$("#modalClose").addEventListener("click", () => modal.close());

// Close on ESC already works; close on backdrop click:
modal.addEventListener("click", (e) => {
  const rect = modal.getBoundingClientRect();
  const clickedInside =
    e.clientX >= rect.left && e.clientX <= rect.right &&
    e.clientY >= rect.top && e.clientY <= rect.bottom;
  // dialog click detection is tricky; easiest: if target is dialog, close
  if(e.target === modal) modal.close();
});

// ============ Search (filter by keywords) ============
function normalize(s){ return (s || "").toLowerCase().trim(); }

function filterCards(query){
  const q = normalize(query);

  const targets = [
    ...$$(".project"),
    ...$$(".list-card")
  ];

  targets.forEach(el => {
    const tags = normalize(el.getAttribute("data-tags"));
    const title = normalize(el.getAttribute("data-title")) || normalize(el.querySelector("h3")?.textContent);
    const text = normalize(el.textContent);

    const match = !q || tags.includes(q) || title.includes(q) || text.includes(q);
    el.style.display = match ? "" : "none";
  });
}

$("#searchInput").addEventListener("input", (e) => {
  filterCards(e.target.value);
});

$("#btnSearch").addEventListener("click", () => {
  $("#searchInput").focus();
});

// ============ CV embed (no new tab) ============
const cvFrame = $("#cvFrame");
const cvEmpty = $("#cvEmpty");
const cvFile = $("#cvFile");
const cvDownload = $("#cvDownload");

function loadDefaultCV(){
  // If you place assets/cv.pdf it will load
  fetch("assets/cv.pdf", { method:"HEAD" })
    .then(res => {
      if(res.ok){
        cvFrame.src = "assets/cv.pdf";
        cvEmpty.style.display = "none";
        cvDownload.href = "assets/cv.pdf";
        cvDownload.setAttribute("aria-disabled", "false");
      }
    })
    .catch(()=>{ /* ignore */});
}

cvFile.addEventListener("change", () => {
  const file = cvFile.files?.[0];
  if(!file) return;

  const url = URL.createObjectURL(file);
  cvFrame.src = url;
  cvEmpty.style.display = "none";

  cvDownload.href = url;
  cvDownload.setAttribute("aria-disabled", "false");
});

loadDefaultCV();

// ============ Year ============
$("#year").textContent = new Date().getFullYear();