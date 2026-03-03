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

    subtitle: "Estudante de Análise e Desenvolvimento de Sistemas, pesquisador e amante da vida. Aprecio a tecnologia e sua inserção na sociedade. Tenho 20 anos e moro em São Paulo - SP",
    pill_1: "Portfólio",
    pill_2: "HTML/CSS/JS",
    pill_3: "Dados ",
    cta_projects: "Ver projetos",
    cta_cv: "Ver currículo",

    featured_title: "Projetos em destaque",
    featured_sub: "Passe o mouse para pré-visualizar.",
    preview_btn: "Pré-visualizar",

    p1_desc: "Jogo estilo snake com ranking e evolução — foco em diversão e UI.",
    p2_desc: "Jogo em desenvolvimento inspirado em jogos mobiles com dificuldade progressiva.",
    p3_desc: "Portal e captura de dados com estrutura organizada e fluxo simples.",
    p4_desc: "Estruturação conceitual de um banco de dados, com documentação e dicionário de dados.",

    cv_title: "Currículo",
    cv_upload: "Enviar PDF do currículo",
    cv_download: "Baixar PDF",
    cv_empty: "Envie um PDF para exibir aqui (ou coloque um arquivo em /assets/cv.pdf).",

    projects_title: "Projetos",
    projects_sub: "Lista completa dos meus projetos finalizados e em desenvolvimento.",
    proj_a: "CRUD com autenticação, validações e banco relacional.",
    proj_b: "Fluxo de telas com foco em clareza, hierarquia e acessibilidade.",

    studies_title: "Estudos / Pesquisas",
    studies_sub: "Lista completa de anotações e estudos realizados.",
    study_a_title: "Python em SGBD",
    study_a_desc: "Funcionamento de um Código Python para analise de política em SGBD.",
    study_b_title: "Silogismo",
    study_b_desc: "Demonstração de um Silogismo Simples em Python.",
    study_c_title: "Modelagem de Dados",
    study_c_desc: "Fundamentos e aplicação da modelagem de dados em um Banco de Dados.",
    study_d_title: "SGBD",
    study_d_desc: "Estudo sobre a importância de sistemas de gerenciamento de banco de dados.",
    study_e_title: "Tabela verdade",
    study_e_desc: "Exemplo de tabela verdade em Python, em um circuito de votação.",

    contact_title: "Contato",


    modal_projects: "Ver seção de projetos",
    modal_close: "Fechar",

    avatar_hint: "Adicione sua foto em /assets",
    search_placeholder: "Pesquisar mais sobre..."
  },

  en: {
    nav_home: "Home",
    nav_cv: "Resume",
    nav_projects: "Projects",
    nav_studies: "Studies",
    nav_contact: "Contact",

    subtitle: "Student of Systems Analysis and Development, researcher, and lover of life. I appreciate technology and its integration into society. I am 20 years old and live in São Paulo - SP.",
    pill_1: "Folder",
    pill_2: "HTML/CSS/JS",
    pill_3: "Data",
    cta_projects: "See projects",
    cta_cv: "See resume",

    featured_title: "Featured projects",
    featured_sub: "Hover to preview.",
    preview_btn: "Preview",

    p1_desc: "A snake-style game with a ranking and progression system — focused on fun and user interface.",
    p2_desc: "A game in development inspired by mobile games with progressive difficulty.",
    p3_desc: "Portal and data capture with an organized structure and simple workflow.",
    p4_desc: "Conceptual structure of a database, with documentation and data dictionary.",

    cv_title: "Resume",
    cv_upload: "Upload PDF resume",
    cv_download: "Download PDF",
    cv_empty: "Upload a PDF to display here (or place a file at /assets/cv.pdf).",

    projects_title: "Projects",
    projects_sub: "Full list of my completed and ongoing projects.",
    proj_a: "CRUD with auth, validations and relational database.",
    proj_b: "Screen flow with focus on clarity, hierarchy and accessibility.",

    studies_title: "Studies / Research",
    studies_sub: "Complete list of notes and studies carried out.",
    study_a_title: "Python in DBMS",
    study_a_desc: "How a Python code works for policy analysis in a DBMS.",
    study_b_title: "Syllogism",
    study_b_desc: "Demonstration of a Simple Syllogism in Python.",
    study_c_title: "Data Modeling",
    study_c_desc: "Fundamentals and application of data modeling in a database.",
    study_d_title: "DBMS",
    study_d_desc: "Study on the importance of database management systems.",
    study_e_title: "Truth table",
    study_e_desc: "Example of a truth table in Python, in a voting circuit.",

    contact_title: "Contact",

    modal_projects: "Go to projects section",
    modal_close: "Close",

    avatar_hint: "Add your photo in /assets",
    search_placeholder: "Search more about..."
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

// ===== Preview modal com screenshots + links =====
const modal = $("#previewModal");
const previewTitle = $("#previewTitle");
const previewText  = $("#previewText");
const previewImage = $("#previewImage");
const previewLinks = $("#previewLinks");
const galleryCount = $("#galleryCount");
const btnPrev = $("#prevShot");
const btnNext = $("#nextShot");

let shots = [];
let idx = 0;

function renderShot(){
  const total = shots.length || 1;
  idx = Math.max(0, Math.min(idx, total - 1));

  const src = shots[idx] || "";
  previewImage.src = src;
  previewImage.style.display = src ? "block" : "none";

  galleryCount.textContent = `${idx + 1}/${total}`;
  btnPrev.disabled = total <= 1;
  btnNext.disabled = total <= 1;
}

function buildLinks(card){
  previewLinks.innerHTML = "";

  const add = (label, url, icon) => {
    if(!url || url === "#") return;
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = `${icon} ${label}`;
    previewLinks.appendChild(a);
  };

  add("GitHub", card.getAttribute("data-github"), "🐙");
  add("Figma",  card.getAttribute("data-figma"),  "🎨");
}

function openFromCard(card){
  const title = card.getAttribute("data-title") || card.querySelector("h3")?.textContent || "Projeto";
  const desc  = card.getAttribute("data-desc")  || card.querySelector("p")?.textContent || "";

  shots = (card.getAttribute("data-shots") || "")
    .split("|").map(s => s.trim()).filter(Boolean);

  idx = 0;

  const lang = localStorage.getItem("lang") || "pt";
  const previewLabel = lang === "en" ? "Preview" : "Pré-visualizar";
  previewTitle.textContent = `${previewLabel} — ${title}`;
  previewText.textContent  = desc;

  buildLinks(card);
  renderShot();

  const btnTestar = document.querySelector("#btnTestar");
  const demo = card.getAttribute("data-demo");

  if(demo){
    btnTestar.href = demo;
    btnTestar.style.display = "inline-flex";
  }else{
    btnTestar.style.display = "none";
  }
  modal.showModal();
}

$$(".card.project .card-overlay").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const card = e.currentTarget.closest(".card.project");
    if(card) openFromCard(card);
  });
});

btnPrev.addEventListener("click", () => { idx--; renderShot(); });
btnNext.addEventListener("click", () => { idx++; renderShot(); });

$("#closeModal").addEventListener("click", () => modal.close());
$("#modalClose")?.addEventListener("click", () => modal.close());

const goProjectsBtn = document.querySelector("#modalGoProjects");

goProjectsBtn?.addEventListener("click", (e) => {
  e.preventDefault();

  // Fecha o modal
  modal.close();

  // Espera o fechamento renderizar e então rola
  setTimeout(() => {
    const target = document.querySelector("#projects");
    if (!target) {
      console.log("Não achei #projects. Confere o id da seção de projetos.");
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 300);
});

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

$("#btnSearch")?.addEventListener("click", () => {
  $("#searchInput").focus();
});

// ============ Year ============
$("#year").textContent = new Date().getFullYear();

const navRail = document.querySelector(".nav-rail");
const toggle = document.querySelector(".menu-toggle");

if (navRail && toggle) {

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    navRail.classList.toggle("active");
    toggle.classList.toggle("active");
  });

  document.querySelectorAll(".nav a").forEach(link => {
    link.addEventListener("click", () => {
      navRail.classList.remove("active");
      toggle.classList.remove("active");
    });
  });

  document.addEventListener("click", (e) => {
    if (!navRail.contains(e.target) && !toggle.contains(e.target)) {
      navRail.classList.remove("active");
      toggle.classList.remove("active");
    }
  });

}

// Abrir / fechar botão
toggle.addEventListener("click", (e) => {
  e.stopPropagation();
  navRail.classList.toggle("active");
  toggle.classList.toggle("active");
});

// Fechar ao clicar em link
document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    navRail.classList.remove("active");
    toggle.classList.remove("active");
  });
});

// Fechar ao clicar fora
document.addEventListener("click", (e) => {
  if (!navRail.contains(e.target) && !toggle.contains(e.target)) {
    navRail.classList.remove("active");
    toggle.classList.remove("active");
  }
});