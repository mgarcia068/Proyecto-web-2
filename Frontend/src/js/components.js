// USO: agregar en cada HTML, antes del cierre de </body>:
//   <div id="navbar-placeholder"></div>   ← al inicio del body
//   <div id="footer-placeholder"></div>   ← al final del body
//   <script src="js/components.js"></script>

const isLanding =
  window.location.pathname === "/" ||
  window.location.pathname.endsWith("index.html");

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
}

function normalizeRole(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "candidato" || normalized === "cliente") return "candidato";
  if (normalized === "empresa") return "empresa";
  return "";
}

function getCurrentUser() {
  const raw = localStorage.getItem("ApplyAI.currentUser");
  if (!raw) return null;
  const parsed = safeJsonParse(raw, null);
  if (!parsed || typeof parsed !== "object") return null;

  const email = String(parsed.email || "").trim().toLowerCase();
  const role = normalizeRole(parsed.role);
  const fullName = String(parsed.fullName || "").trim();

  if (!email || !role) return null;
  return { email, role, fullName };
}

function updateNavbarActions() {
  const actions = document.querySelector(".navbar__actions");
  if (!actions) return;

  const user = getCurrentUser();
  if (!user) {
    actions.innerHTML = `
      <a href="login.html" class="btn btn--ghost btn--sm">Iniciar sesion</a>
      <a href="register.html" class="btn btn--primary btn--sm">Registrarse</a>
    `;
    return;
  }

  if (user.role === "candidato") {
    actions.innerHTML = `
      <a href="dashboard-candidato.html" class="btn btn--ghost btn--sm">Postulaciones</a>
      <a href="perfil-candidato.html" class="btn btn--primary btn--sm">Mi perfil</a>
    `;
    return;
  }

  // empresa
  actions.innerHTML = `
    <a href="dashboard-empresa.html" class="btn btn--primary btn--sm">Mi panel</a>
  `;
}

async function loadComponent(url, placeholderId) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo cargar ${url}`);
    placeholder.outerHTML = await res.text();
  } catch (err) {
    console.warn("[ApplyAI] componente no encontrado:", url, err);
  }
}

function initNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  if (!isLanding) {
    navbar.classList.add("solid");
    return;
  }

  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function markActiveLink() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll(".navbar__actions a");

  links.forEach((link) => {
    const linkPath = new URL(link.href).pathname;
    if (linkPath === currentPath) {
      link.classList.add("active");
    }
  });
}

async function init() {
  await loadComponent("components/navbar.html", "navbar-placeholder");
  await loadComponent("components/footer.html", "footer-placeholder");

  initNavbar();
  updateNavbarActions();
  markActiveLink();
}

document.addEventListener("DOMContentLoaded", init);
