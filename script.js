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
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");

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

/* Card spotlight and restrained tilt */
function attachCardEffects(card) {
  let frame = null;
  let point = null;

  card.addEventListener("pointermove", event => {
    if (
      event.pointerType !== "mouse" ||
      !finePointer.matches ||
      motionPreference.matches
    ) return;

    point = { x: event.clientX, y: event.clientY };
    if (frame !== null) return;

    frame = requestAnimationFrame(() => {
      frame = null;

      const bounds = card.getBoundingClientRect();
      const x = point.x - bounds.left;
      const y = point.y - bounds.top;

      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
      card.style.setProperty(
        "--rx",
        `${-(y / bounds.height - 0.5) * 3}deg`
      );
      card.style.setProperty(
        "--ry",
        `${(x / bounds.width - 0.5) * 3}deg`
      );
    });
  });

  card.addEventListener("pointerleave", () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
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

  visible.forEach(project => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "project-card reveal";
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
    card.append(top, title, description, tags, bottom);

    card.addEventListener("click", () => {
      lastProjectButton = card;
      openProject(project);
    });

    attachCardEffects(card);
    grid.append(card);
  });

  $("#project-count").textContent =
    `${visible.length} projects shown${category === "All" ? "" : ` in ${category}`}.`;

  observeReveals(grid);
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
}

$("#close-dialog").addEventListener("click", () => dialog.close());

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
  ) dialog.close();
});

$("#dialog-contact").addEventListener("click", event => {
  event.preventDefault();
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

/* Smooth cursor ring; normal system cursor remains available */
const ring = $(".cursor-ring");
let cursorFrame = null;
let targetX = 0;
let targetY = 0;
let ringX = 0;
let ringY = 0;
let cursorVisible = false;

function cursorAllowed() {
  return finePointer.matches && !motionPreference.matches;
}

function stopCursor() {
  if (cursorFrame !== null) cancelAnimationFrame(cursorFrame);
  cursorFrame = null;
  cursorVisible = false;
  ring.style.opacity = "0";
  ring.classList.remove("active", "pressed");
}

function animateCursor() {
  cursorFrame = null;
  if (!cursorAllowed() || !cursorVisible) return;

  ringX += (targetX - ringX) * 0.22;
  ringY += (targetY - ringY) * 0.22;

  ring.style.transform =
    `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

  if (
    Math.abs(targetX - ringX) > 0.15 ||
    Math.abs(targetY - ringY) > 0.15
  ) {
    cursorFrame = requestAnimationFrame(animateCursor);
  }
}

document.addEventListener("pointermove", event => {
  if (event.pointerType !== "mouse" || !cursorAllowed()) return;

  targetX = event.clientX;
  targetY = event.clientY;

  if (!cursorVisible) {
    ringX = targetX;
    ringY = targetY;
    cursorVisible = true;
  }

  ring.style.opacity = "1";

  ring.classList.toggle(
    "active",
    Boolean(event.target.closest("a, button, input, textarea, select, summary"))
  );

  if (cursorFrame === null) {
    cursorFrame = requestAnimationFrame(animateCursor);
  }
}, { passive: true });

document.addEventListener("pointerdown", event => {
  if (event.pointerType === "mouse" && cursorAllowed()) {
    ring.classList.add("pressed");
  }
});

document.addEventListener("pointerup", () => {
  ring.classList.remove("pressed");
});

document.documentElement.addEventListener("pointerleave", stopCursor);
addEventListener("blur", stopCursor);
finePointer.addEventListener("change", stopCursor);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopCursor();
});

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
  stopCursor();

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
