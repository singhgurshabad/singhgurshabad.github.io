"use strict";

const projects = [
  {
    title: "ScholarChat",
    category: "AI / ML",
    status: "Personal project",
    description:
      "A local AI research assistant for academic PDFs, with semantic search, paper Q&A, summaries, and comparisons.",
    tags: ["Python", "RAG", "Streamlit", "Ollama"],
    implementation:
      "Document chunking and embeddings with SentenceTransformers, cosine-similarity ranking, and context retrieval for Llama 3.1 through Ollama. The Streamlit interface supports multiple papers and exploration of supporting text passages.",
    scope:
      "Designed to run locally without external LLM API calls. Generated responses should be assessed against retrieved passages and original papers.",
    url: "https://github.com/singhgurshabad/ScholarChat"
  },
  {
    title: "D-Rally",
    category: "Research",
    status: "Active · Marghetis Lab",
    description:
      "Computer-vision workflows for analyzing rally footage and driver–co-driver coordination.",
    tags: ["Python", "DeepLabCut", "Pose estimation"],
    implementation:
      "I lead the project and work on model replication, frame-level comparison of pose predictions, and research-corpus organization. Metadata includes visibility, camera position, road context, and co-driver audio.",
    scope:
      "Replication testing established agreement on a 1,801-frame video. Low-confidence predictions need quality control. Matching outputs checks reproducibility rather than proving tracking accuracy."
  },
  {
    title: "Connect-N",
    category: "Software",
    status: "CS 30 course project",
    description:
      "A configurable Connect 4, 5, and 6 game with a Minimax AI opponent and real-time graphics.",
    tags: ["C++", "Minimax", "OpenGL", "GLUT"],
    implementation:
      "Depth-limited Minimax, configurable board dimensions, player-versus-player and player-versus-AI modes, and a mouse-driven OpenGL/GLUT interface.",
    scope:
      "A course project combining game-tree search, modular object-oriented programming, and interactive graphics."
  },
  {
    title: "Smart Medication Monitor",
    category: "Systems",
    status: "Prototype · Team No Signal",
    description:
      "A connected pill-bottle prototype using weight measurements, motion context, and BLE communication.",
    tags: ["Embedded C++", "BLE", "HX711", "Sensors"],
    implementation:
      "Our design combines a Seeed XIAO MG24 Sense with a load cell, HX711 amplifier, optional IMU context, and a 3D-printed weighing platform.",
    scope:
      "In development for CSE 157. Calibration and single-pill resolution remain prototype questions. Bottle movement or opening does not confirm ingestion."
  },
  {
    title: "Portal 2 Spatial Reasoning",
    category: "Research",
    status: "Research in progress",
    description:
      "Examining coordination through language, perspective, and shared frames of reference.",
    tags: ["Spatial cognition", "Behavioral analysis"],
    implementation:
      "Study dialogue and player movement around shifts in frames of reference, using gameplay examples to analyze interpretation of directions and collaborative action.",
    scope:
      "An ongoing project titled Collaborative Spatial Reasoning in 4D Space. The computational analysis pipeline is being developed."
  },
  {
    title: "Planet X",
    category: "Software",
    status: "NASA Space Apps · 2025",
    description:
      "An educational farming simulator connecting environmental information with agricultural decisions.",
    tags: ["Unity", "C#", "NASA data"],
    implementation:
      "Developed with Unity and C#. NASA satellite data is integrated into an in-game information tab explaining environmental factors affecting crop growth.",
    scope:
      "A collaborative hackathon project for NASA Space Apps Challenge 2025."
  },
  {
    title: "Bolo Punjabi",
    category: "Software",
    status: "Personal project · 2024",
    description:
      "A mobile application for learning Punjabi alphabets, numbers, and vocabulary.",
    tags: ["React Native", "JavaScript", "Mobile"],
    implementation:
      "A React Native interface presenting Gurmukhi alphabets, pronunciation guides, Punjabi numbers with English equivalents, and common vocabulary.",
    scope:
      "A language-learning project connecting mobile development with Punjabi language preservation."
  },
  {
    title: "Sundar Gutka",
    category: "Software",
    status: "Personal project · 2022",
    description:
      "An independently developed mobile app presenting Sikh literature in Punjabi and English.",
    tags: ["React Native", "Bilingual content"],
    implementation:
      "Built a React Native reading experience organized around Punjabi and English Sikh literature.",
    scope:
      "An independent mobile project combining software development with bilingual reading."
  }
];

const $ = selector => document.querySelector(selector);
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");

const grid = $("#project-grid");
const filters = $("#filters");
const dialog = $("#project-dialog");

let category = "All";
let lastProjectButton = null;
let revealObserver = null;

/* Scroll reveals */
if ("IntersectionObserver" in window) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove("pending");
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
}

function observeReveals(root = document) {
  if (!revealObserver || motionPreference.matches) return;

  root.querySelectorAll(".reveal:not(.visible)").forEach(element => {
    element.classList.add("pending");
    revealObserver.observe(element);
  });
}

function tag(text) {
  const element = document.createElement("span");
  element.className = "tag";
  element.textContent = text;
  return element;
}

/* Project filters */
function renderFilters() {
  ["All", "AI / ML", "Research", "Software", "Systems"].forEach(name => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = name;
    button.setAttribute("aria-pressed", String(name === category));

    button.addEventListener("click", () => {
      category = name;

      filters.querySelectorAll("button").forEach(item => {
        item.setAttribute(
          "aria-pressed",
          String(item.textContent === category)
        );
      });

      renderProjects();
    });

    filters.append(button);
  });
}

function renderProjects() {
  if (revealObserver) {
    grid.querySelectorAll(".reveal").forEach(element => {
      revealObserver.unobserve(element);
    });
  }

  grid.replaceChildren();

  const visible = projects.filter(project =>
    category === "All" || project.category === category
  );

  visible.forEach((project, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "project-card scroll-card";
    card.style.setProperty("--reveal-delay", `${index % 2 * 80}ms`);
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `Read details about ${project.title}`);

    const top = document.createElement("div");
    top.className = "project-top";

    const categoryLabel = document.createElement("span");
    categoryLabel.className = "project-category";
    categoryLabel.textContent = project.category;

    const mark = document.createElement("span");
    mark.className = "project-mark";
    mark.textContent = "+";
    mark.setAttribute("aria-hidden", "true");

    top.append(categoryLabel, mark);

    const title = document.createElement("h3");
    title.textContent = project.title;

    const description = document.createElement("p");
    description.textContent = project.description;

    const tags = document.createElement("div");
    tags.className = "tags";
    project.tags.forEach(text => tags.append(tag(text)));

    const bottom = document.createElement("div");
    bottom.className = "project-bottom";

    const status = document.createElement("span");
    status.textContent = project.status;

    const details = document.createElement("span");
    details.className = "details-label";
    details.textContent = "View details";

    bottom.append(status, details);
    const number = document.createElement("span");
    number.className = "work-number";
    number.textContent = String(projects.indexOf(project) + 1).padStart(2, "0");
    number.setAttribute("aria-hidden", "true");
    const content = document.createElement("div");
    content.className = "work-content";
    content.append(top, title, description, tags, bottom);
    card.append(number, content);
    if (projects.indexOf(project) < 2) {
      const art = document.createElement("div");
      art.className = "work-art " + (project.title === "ScholarChat" ? "art-scholar" : "art-rally");
      art.setAttribute("aria-hidden", "true");
      art.innerHTML = project.title === "ScholarChat"
        ? `<div class="art-caption">SCHOLARCHAT / LOCAL INTELLIGENCE</div><div class="paper-stack"><span>RESEARCH<br>IN CONTEXT.</span><i></i><i></i><i></i></div><div class="art-footnote">DOCUMENT → RETRIEVAL → INSIGHT</div>`
        : `<div class="art-caption">D-RALLY / MOTION STUDIES</div><svg viewBox="0 0 400 200" fill="none"><path d="M0 160L400 80M0 190L400 110M40 200L400 140M0 130L400 50" stroke="currentColor" opacity=".16"/><path d="M110 45L142 65L170 110L225 95L270 140M142 65L115 105L65 115M170 110L145 160L180 190M170 110L215 150L260 175" stroke="currentColor" stroke-width="3"/><path d="M100 35h20v20h-20zM132 55h20v20h-20zM160 100h20v20h-20zM215 85h20v20h-20zM105 95h20v20h-20zM135 150h20v20h-20zM205 140h20v20h-20z" fill="currentColor"/></svg><div class="art-footnote">COMPUTER VISION / HUMAN COORDINATION</div>`;
      card.append(art);
      card.classList.add("featured-work");
    }

    card.addEventListener("click", () => {
      lastProjectButton = card;
      openProject(project);
    });

    grid.append(card);
  });

  $("#project-count").textContent =
    `${visible.length} projects shown${category === "All" ? "" : ` in ${category}`}.`;

  document.dispatchEvent(new Event("motion:refresh"));
}

/* Project dialogs */
function openProject(project) {
  $("#dialog-category").textContent = project.category;
  $("#dialog-title").textContent = project.title;
  $("#dialog-status").textContent = project.status;
  $("#dialog-description").textContent = project.description;
  $("#dialog-implementation").textContent = project.implementation;
  $("#dialog-scope").textContent = project.scope;
  $("#dialog-tags").replaceChildren(...project.tags.map(tag));

  const source = $("#dialog-source");
  source.hidden = !project.url;

  if (project.url) source.href = project.url;
  else source.removeAttribute("href");

  dialog.showModal();
  dialog.scrollTop = 0;
  animateProjectDialog(true);
}

let dialogAnimation = null;
let dialogClosing = false;

function animateProjectDialog(opening) {
  dialogAnimation?.cancel();
  if (motionPreference.matches || !lastProjectButton?.isConnected) return null;
  const card = lastProjectButton.getBoundingClientRect();
  const panel = dialog.getBoundingClientRect();
  const origin = {
    opacity: 0,
    transform: `translate(${card.left + card.width / 2 - panel.left - panel.width / 2}px, ${card.top + card.height / 2 - panel.top - panel.height / 2}px) scale(${Math.min(card.width / panel.width, 1)}, ${Math.min(card.height / panel.height, 1)})`,
    borderRadius: "16px"
  };
  const expanded = { opacity: 1, transform: "translate(0, 0) scale(1)", borderRadius: "7px" };
  dialogAnimation = dialog.animate(opening ? [origin, expanded] : [expanded, origin], {
    duration: opening ? 520 : 260,
    easing: opening ? "cubic-bezier(.16,1,.3,1)" : "cubic-bezier(.4,0,1,1)"
  });
  return dialogAnimation;
}

function closeProject() {
  if (dialogClosing || !dialog.open) return;
  dialogClosing = true;
  const animation = animateProjectDialog(false);
  const finish = () => { dialog.close(); dialogClosing = false; };
  if (animation) animation.finished.then(finish, finish);
  else finish();
}

$("#close-dialog").addEventListener("click", closeProject);
dialog.addEventListener("cancel", event => {
  event.preventDefault();
  closeProject();
});

dialog.addEventListener("close", () => {
  if (lastProjectButton?.isConnected) {
    lastProjectButton.focus({ preventScroll: true });
  }
});

dialog.addEventListener("click", event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();

  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  ) closeProject();
});

$("#dialog-contact").addEventListener("click", event => {
  event.preventDefault();
  dialogAnimation?.cancel();
  dialog.close();

  $("#contact").scrollIntoView({
    behavior: motionPreference.matches ? "auto" : "smooth"
  });

  $('#contact-form input[name="name"]').focus({ preventScroll: true });
});

/* Mobile navigation */
const navigation = $("#navigation");
const menu = $("#menu-button");

function closeMenu() {
  navigation.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
  menu.textContent = "Menu";
}

menu.addEventListener("click", () => {
  const open = navigation.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
  menu.textContent = open ? "Close" : "Menu";
});

navigation.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && navigation.classList.contains("open")) {
    closeMenu();
    menu.focus();
  }
});

/* Reading progress and active navigation */
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
let scrollFrame = null;

function updateScrollState() {
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const progress = maxScroll > 0 ? scrollY / maxScroll : 0;

  $(".reading-progress").style.transform =
    `scaleX(${Math.max(0, Math.min(1, progress))})`;

  let active = null;
  sections.forEach(section => {
    if (section.getBoundingClientRect().top <= innerHeight * 0.35) {
      active = section.id;
    }
  });

  navLinks.forEach(link => {
    if (link.getAttribute("href") === `#${active}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function queueScrollUpdate() {
  if (scrollFrame !== null) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = null;
    updateScrollState();
  });
}

addEventListener("scroll", queueScrollUpdate, { passive: true });
addEventListener("resize", queueScrollUpdate);

/* Contact: opens a draft, does not claim to send a message */
$("#contact-form").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);

  const subject = encodeURIComponent(String(data.get("subject")));
  const body = encodeURIComponent(
    `From: ${data.get("name")} <${data.get("email")}>\n\n${data.get("message")}`
  );

  $("#contact-status").textContent =
    "Email draft requested. Send it from your email app. " +
    "If nothing opens, use the direct email link.";

  location.href =
    `mailto:gurshabadsingh@ucmerced.edu?subject=${subject}&body=${body}`;
});

/* Copy email */
$("#copy-email").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("gurshabadsingh@ucmerced.edu");
    $("#copy-status").textContent = "Email address copied.";
  } catch {
    $("#copy-status").textContent =
      "Please select and copy the email address above.";
  }
});

/* Respect changes to reduced-motion settings */
motionPreference.addEventListener("change", event => {
  dialogAnimation?.cancel();

  if (event.matches) {
    revealObserver?.disconnect();

    document.querySelectorAll(".pending").forEach(element => {
      element.classList.remove("pending");
    });

    document.querySelectorAll(".project-card").forEach(card => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  } else {
    observeReveals();
  }
});

$("#year").textContent = new Date().getFullYear();

renderFilters();
renderProjects();
observeReveals();
updateScrollState();
