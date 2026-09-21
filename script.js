// Empeche les liens d'ancre de modifier l'URL : si le hash reste dans l'URL,
// le navigateur y scrolle au refresh (scrollRestoration ne couvre pas ce cas).
// #a-propos a son propre handler plus bas, on le saute ici.
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var hash = link.getAttribute('href');
    if (!hash || hash === '#' || hash === '#a-propos') return;
    link.addEventListener('click', function (e) {
        e.preventDefault();
        // Accueil : scroll au vrai y=0, pas au debut de la section (scroll-margin-top l'en eloignerait)
        if (hash === '#accueil') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        var target = document.querySelector(hash);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Retire la classe preload apres le premier rendu pour reactiver les transitions de theme
requestAnimationFrame(() => requestAnimationFrame(() => {
    document.documentElement.classList.remove("preload");
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// FORMULAIRE CONTACT /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault(); 

    const form = this;
    const msg = document.getElementById("formMessage");
    // La page anglaise fournit ses textes via data-msg-* ; defauts en francais
    const successText = form.dataset.msgSuccess || "Votre message a bien été envoyé.";
    const errorText = form.dataset.msgError || "Une erreur est survenue. Veuillez réessayer.";

    fetch(form.action, {
        method: "POST",
        body: new FormData(form),
    })
    .then(() => {
        msg.textContent = successText;
        msg.style.opacity = "1";
        form.reset();

        setTimeout(() => {
            msg.style.opacity = "0";
            // vide apres le fondu : un message invisible garderait
            // sa place sous le bouton (regle .form-message:empty)
            setTimeout(() => { msg.textContent = ""; }, 450);
        }, 5000);
    })
    .catch(() => {
        msg.textContent = errorText;
        msg.style.opacity = "1";

        setTimeout(() => {
            msg.style.opacity = "0";
            setTimeout(() => { msg.textContent = ""; }, 450);
        }, 5000);
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////// PRESELECTION DE L'OFFRE DEPUIS LES CTA ////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Les boutons des cartes tarifs preremplissent le select du formulaire
document.querySelectorAll('[data-offer]').forEach(link => {
    link.addEventListener('click', () => {
        const select = document.getElementById('offer');
        if (select) select.value = link.dataset.offer;
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// BACK TO TOP /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

const topBtn = document.getElementById("topBtn");
topBtn.onclick = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

// N'apparait qu'une fois la page reellement scrollee
function toggleTopBtn() {
    topBtn.classList.toggle("is-visible", window.scrollY > 400);
}
window.addEventListener("scroll", toggleTopBtn, { passive: true });
toggleTopBtn();

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// HERO SCROLL /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Scroll vers l'image : on utilise offsetTop du banner (position dans le layout CSS)
// plutot que getBoundingClientRect, qui peut etre instable sur iOS Safari quand la
// barre d'adresse se replie en meme temps que le scroll demarre.
function scrollToDevBanner() {
    const banner = document.getElementById('dev-banner');
    if (!banner) return;
    const headerH = document.querySelector('header')?.offsetHeight ?? 0;
    window.scrollTo({ top: banner.offsetTop - headerH, behavior: 'smooth' });
}

const heroScroll = document.getElementById('heroScroll');
if (heroScroll) {
    heroScroll.addEventListener('click', scrollToDevBanner);
}

// "À propos" dans nav/tabbar : scroll jusqu'à l'image
document.querySelectorAll('a[href="#a-propos"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        scrollToDevBanner();
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// STACK MARQUEE /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Duplique les items pour une boucle infinie sans raccord visible
(function initStackMarquee() {
    const track = document.querySelector('.stack-grid');
    if (!track) return;
    const originalCount = track.children.length;
    track.innerHTML += track.innerHTML;
    // Les clones sont purement decoratifs : invisibles aux lecteurs
    // d'ecran et exclus de la navigation clavier (sinon tout est double)
    [...track.children].slice(originalCount).forEach(clone => {
        clone.setAttribute('aria-hidden', 'true');
        clone.tabIndex = -1;
    });
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// SCROLL ANIMATIONS //////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

(function initScrollAnimations() {
    const singleTargets = [
        ...document.querySelectorAll('section:not(.hero) h2'),
        ...document.querySelectorAll('.about-text'),
        ...document.querySelectorAll('.who'),
        ...document.querySelectorAll('.maintenance-banner'),
        ...document.querySelectorAll('.projects-banner'),
        ...document.querySelectorAll('.contact-aside'),
        document.querySelector('.contact-form'),
    ].filter(Boolean);

    singleTargets.forEach(el => el.setAttribute('data-animate', ''));

    const staggerGroups = [
        { selector: '.who-grid .who-item',          delay: 0.10 },
        { selector: '.price-grid .price-item',      delay: 0.12 },
        { selector: '.projects-grid .project-card', delay: 0.12 },
    ];

    staggerGroups.forEach(({ selector, delay }) => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.setAttribute('data-animate', '');
            el.style.transitionDelay = `${i * delay}s`;
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// DARK MODE + SAVE ///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

const themeBtn = document.getElementById("themeToggle");

// Sombre par defaut : la classe est posee dans le HTML et un script
// inline en tete de body la retire si l'utilisateur a choisi le clair.
// Ici on ne synchronise que l'etat du bouton.
const isDarkInit = document.body.classList.contains("dark-mode");
themeBtn.classList.toggle("btn-active", isDarkInit);
themeBtn.setAttribute("aria-pressed", isDarkInit);

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
    themeBtn.classList.toggle("btn-active", isDark);
    themeBtn.setAttribute("aria-pressed", isDark);
}

themeBtn.onclick = toggleTheme;

// Meme bascule depuis le tiroir mobile
const drawerThemeBtn = document.getElementById("drawerThemeBtn");
if (drawerThemeBtn) drawerThemeBtn.onclick = toggleTheme;

/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// LANG TOGGLE ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

const langBtn = document.getElementById("langBtn");

if (langBtn) {
    const path = window.location.pathname;

    if (path.includes("/en")) {
        langBtn.classList.add("btn-active");
        langBtn.title = "Passer en français";
    } else {
        langBtn.classList.remove("btn-active");
        langBtn.title = "Switch to English";
    }

    langBtn.onclick = () => {
        if (path.includes("/en")) {
            window.location.href = "/";
        } else {
            window.location.href = "/en/";
        }
    };
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// TIROIR MOBILE (DRAWER) ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

(function initDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-drawer-overlay');
    if (!drawer || !overlay) return;
    const openBtn = document.querySelector('[data-drawer-open]');

    function open() {
        overlay.hidden = false;
        requestAnimationFrame(() => {
            document.body.classList.add('drawer-open');
            drawer.classList.add('is-open');
            overlay.classList.add('is-open');
        });
        drawer.setAttribute('aria-hidden', 'false');
        // inert : ferme, le tiroir est exclu du focus clavier et des
        // lecteurs d'ecran ; ouvert, il redevient utilisable
        drawer.inert = false;
        if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    }

    function close() {
        document.body.classList.remove('drawer-open');
        drawer.classList.remove('is-open');
        overlay.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        drawer.inert = true;
        if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
        setTimeout(() => { overlay.hidden = true; }, 320);
    }

    // Le bouton Menu ouvre, ou referme si le tiroir est deja ouvert
    if (openBtn) openBtn.addEventListener('click', () => {
        drawer.classList.contains('is-open') ? close() : open();
    });

    // Fermeture : voile (des le toucher), croix et liens du tiroir
    overlay.addEventListener('pointerdown', close);
    overlay.addEventListener('click', close);
    drawer.querySelectorAll('[data-drawer-close], a').forEach(el => {
        const isAnchor = el.tagName === 'A' && el.hash && el.pathname === location.pathname;
        const isPageNav = el.tagName === 'A' && !isAnchor;

        // CV et version anglaise : navigation native au click, fermer
        // pendant le tap annulerait la navigation sur iOS
        if (isPageNav) {
            el.addEventListener('click', close);
            return;
        }

        // Croix et ancres : fermeture des le toucher, comme le voile
        // (iOS mange parfois le click qui suit un premier tap)
        el.addEventListener('pointerdown', () => {
            close();
            if (isAnchor) {
                const target = document.querySelector(el.hash);
                if (target) setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth' });
                }, 90);
            }
        });
        el.addEventListener('click', close);
    });

    // La croix vit pres du bord haut de l'ecran, ou iOS avale parfois
    // le tap : tout le bandeau du logo sert de zone de fermeture de secours
    const head = drawer.querySelector('.mobile-drawer__head');
    if (head) head.addEventListener('pointerdown', close);

    // Filet de securite iOS : tout tap hors du tiroir le ferme,
    // meme si le voile n'a pas recu l'evenement
    document.addEventListener('click', (e) => {
        if (!drawer.classList.contains('is-open')) return;
        if (drawer.contains(e.target)) return;
        if (openBtn && openBtn.contains(e.target)) return;
        close();
    }, true);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// CARROUSELS MOBILE (tarifs + projets) ////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

function initCarousel(selector) {
    // Carrousel uniquement en mobile (la grille classique reste en desktop)
    if (!window.matchMedia('(max-width: 768px)').matches) return;

    const grid = document.querySelector(selector);
    if (!grid || grid.children.length < 2) return;
    const items = [...grid.children];

    // Points indicateurs
    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    items.forEach((item, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dots__dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Aller à l\'élément ' + (i + 1));
        dot.addEventListener('click', () => {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
        dots.appendChild(dot);
    });
    grid.insertAdjacentElement('afterend', dots);

    // Point actif suivant la position de scroll
    grid.addEventListener('scroll', () => {
        const step = grid.scrollWidth / items.length;
        const index = Math.min(items.length - 1, Math.round(grid.scrollLeft / step));
        dots.querySelectorAll('.carousel-dots__dot').forEach((d, i) => {
            d.classList.toggle('active', i === index);
        });
    }, { passive: true });

    // Les cartes hors viewport horizontal n'intersectent pas : on les revele
    // toutes ensemble des que le carrousel entre a l'ecran
    const io = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
            items.forEach(el => {
                el.style.transitionDelay = '';
                el.classList.add('visible');
            });
            io.disconnect();
        }
    }, { threshold: 0.1 });
    io.observe(grid);
}

initCarousel('.price-grid');
initCarousel('.projects-grid');

/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// MODALS ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Bouton qui a ouvert la modale : le focus y retourne a la fermeture
let modalOpener = null;

function openModal(modal, opener) {
    modalOpener = opener || null;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';
    // Focus dans la boite (tabindex="-1") : lecture d'ecran et Escape operationnels
    const content = modal.querySelector('.modal-content');
    if (content) content.focus();
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    if (modalOpener) {
        modalOpener.focus();
        modalOpener = null;
    }
}

document.querySelectorAll('.link-modal').forEach(link => {
    link.addEventListener('click', () => {
        const modal = document.getElementById("modal-" + link.dataset.modal);
        openModal(modal, link);
    });
});

document.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = document.getElementById('modal-' + btn.dataset.modal);
        if (modal) openModal(modal, btn);
    });
});

document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal(document.getElementById("modal-" + btn.dataset.close));
    });
});

window.addEventListener('click', (e) => {
    document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) closeModal(modal);
    });
});

// Escape ferme la modale ouverte
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal').forEach(modal => {
        if (modal.style.display === 'flex') closeModal(modal);
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////// MENU SECTION ACTIVE /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Menu actif au scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const menuLinks = document.querySelectorAll('.menu ul li a, .mobile-tabbar a');
    
    let current = '';
    
    // Point de lecture : le tiers haut de l'ecran, pas son bord superieur.
    // Avec le bord, une section restait "active" alors qu'on regardait
    // deja la suivante (son sommet trainait encore en haut du viewport).
    const probe = window.scrollY + window.innerHeight * 0.35;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        // Actif uniquement si le point de lecture est DANS la section :
        // au-dessus d'une zone non reperee, tout se deselectionne
        if (probe >= sectionTop && probe < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    menuLinks.forEach(link => {
        link.classList.remove('active');

        // Si le lien correspond à la section actuelle, ajoute la classe active
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }

        // Cas spécial pour "Accueil" quand on est tout en haut
        if (window.scrollY < 300 && link.getAttribute('href') === '#accueil') {
            link.classList.add('active');
        }

        // L'etat visuel est aussi annonce aux lecteurs d'ecran
        if (link.classList.contains('active')) {
            link.setAttribute('aria-current', 'true');
        } else {
            link.removeAttribute('aria-current');
        }
    });
});

// Tap sur la barre du bas : l'item tape devient actif tout de suite,
// sans attendre que le scroll rattrape la section visee
document.querySelectorAll('.mobile-tabbar a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelectorAll('.menu ul li a, .mobile-tabbar a')
            .forEach(l => {
                l.classList.remove('active');
                l.removeAttribute('aria-current');
            });
        link.classList.add('active');
        link.setAttribute('aria-current', 'true');
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// TRUNCATION PROJETS /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Si la description d'une carte depasse 3 lignes (line-clamp CSS),
// on injecte un bouton "Afficher plus / Reduire" entre le texte et les tags
document.querySelectorAll('.project-card').forEach(card => {
    const p = card.querySelector('.project-content p');
    if (!p) return;
    if (p.scrollHeight <= p.clientHeight) return;

    const btn = document.createElement('button');
    btn.className = 'project-read-more';
    btn.textContent = 'Afficher plus';
    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', () => {
        const expanded = p.classList.toggle('expanded');
        btn.textContent = expanded ? 'Réduire' : 'Afficher plus';
        btn.setAttribute('aria-expanded', String(expanded));
    });

    p.after(btn);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// MICROSOFT CLARITY ///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

const CLARITY_ID = 'x7mkbb1x1k';

function loadClarity() {
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,"clarity","script",CLARITY_ID);
}

document.addEventListener('DOMContentLoaded', function() {
    const consent = localStorage.getItem('clarity_consent');
    if (consent === 'accepted') { loadClarity(); return; }
    if (consent === 'refused') return;

    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    banner.removeAttribute('hidden');

    document.getElementById('cookie-accept').addEventListener('click', () => {
        localStorage.setItem('clarity_consent', 'accepted');
        banner.hidden = true;
        loadClarity();
    });

    document.getElementById('cookie-refuse').addEventListener('click', () => {
        localStorage.setItem('clarity_consent', 'refused');
        banner.hidden = true;
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// SCROLL REVEAL ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

(function () {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
        observer.observe(el);
    });
})();

// Process steps : force ouverture sur desktop, accordéon sur mobile
(function () {
    var steps = document.querySelectorAll('details.process-step');
    if (!steps.length) return;
    function syncOpen() {
        var open = window.innerWidth > 480;
        steps.forEach(function (d) { d.open = open; });
    }
    syncOpen();
    window.addEventListener('resize', syncOpen);
})();


/* ============================================================
   Fond "Ribbon Glow" du hero (adapte d'Originkit, WebGL2 vanilla).
   Deux passes : field (rendu du ruban en demi-resolution) puis finish
   (compositing sur le fond + tonemapping + tramage). Theme-aware :
   fond sombre en dark, clair en light (mode "paper" de l'effet).
   ============================================================ */
(function () {
  var canvas = document.querySelector(".ribbon-bg");
  if (!canvas) return;
  var gl = canvas.getContext("webgl2", { antialias: false, alpha: false, depth: false, stencil: false });
  if (!gl) return;

  var MAX_DPR = 2;

  var VERT_SRC =
    "#version 300 es\n" +
    "const vec2 P[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\n" +
    "void main() { gl_Position = vec4(P[gl_VertexID], 0.0, 1.0); }\n";

  var FIELD_SRC =
    "#version 300 es\n" +
    "precision highp float;\n" +
    "uniform vec2 uRes; uniform float uTime; uniform vec3 uC1; uniform vec3 uC2;\n" +
    "uniform float uSize; uniform float uAngle; uniform vec2 uMouse; uniform float uOn;\n" +
    "uniform float uReach; uniform vec2 uVel; out vec4 o;\n" +
    "const float TAU = 6.28318530718;\n" +
    "const float LAYERS = 84.0;\n" +
    "const float TWIST = 1.250;\n" +
    "const float DRAG = 0.180;\n" +
    "const float GAIN = 0.62;\n" +
    "const vec2 CENTRE = vec2(-0.62, 0.24);\n" +
    "const float TILT = 0.6;\n" +
    "const float ZOOM = 1.05;\n" +
    "const float THETA = 2.13;\n" +
    "const float SHEAR = 0.963;\n" +
    "const float SHRINK = 0.953;\n" +
    "const vec2 WARP_FREQ = vec2(0.42, 2.4);\n" +
    "const vec2 WARP_AMP = vec2(0.13, 0.027);\n" +
    "const vec2 ASPECT = vec2(2.1, 0.17);\n" +
    "const float OFFSET = 0.36;\n" +
    "const float GLOW = 0.0021;\n" +
    "const float SOFT = 0.0019;\n" +
    "const float FALLOFF = 0.37;\n" +
    "const float PHASE = 12.0;\n" +
    "const float CYCLE = 0.16;\n" +
    "const float HUE_TRAVEL = 2.0;\n" +
    "mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }\n" +
    "void main() {\n" +
    "  vec2 R = uRes;\n" +
    "  vec2 pos = (gl_FragCoord.xy - 0.5 * R) / R.y;\n" +
    "  vec2 d = pos - uMouse;\n" +
    "  float w = uOn * exp(-dot(d, d) / (uReach * uReach));\n" +
    "  if (w > 1e-4) pos = uMouse + rot(w * TWIST) * d * (1.0 - 0.3 * min(w, 1.0)) - uVel * min(w, 1.0) * DRAG;\n" +
    "  pos = rot(uAngle) * pos / uSize;\n" +
    "  float t = uTime * 0.49 + PHASE;\n" +
    "  float breath = (-sin(uTime * 0.735) + sin(uTime * 0.49 + 1.0)) * 0.25 + 0.5;\n" +
    "  vec2 u = rot(TILT) * ((pos - CENTRE) * (ZOOM - breath * 0.085));\n" +
    "  mat2 fold = mat2(cos(THETA), sin(THETA), -SHEAR, cos(THETA));\n" +
    "  vec3 col = vec3(0.0);\n" +
    "  for (float i = 1.0; i <= LAYERS; i += 1.0) {\n" +
    "    u.x -= sin(u.y * WARP_FREQ.x + t + i * 0.007) * WARP_AMP.x;\n" +
    "    u.y -= sin(u.x * WARP_FREQ.y - t + i * 0.02) * WARP_AMP.y;\n" +
    "    u = fold * u * SHRINK;\n" +
    "    vec2 q = (u - vec2(OFFSET + breath * 0.1, 0.0)) * ASPECT;\n" +
    "    float g = GLOW / (dot(q, q) + SOFT) * (0.25 + breath * 0.4);\n" +
    "    float r = length(u);\n" +
    "    float kk = sin(i * CYCLE + t * 1.2 + r * HUE_TRAVEL) * 0.5 + 0.5;\n" +
    "    col += g * mix(uC1, uC2, kk) * (0.62 + 0.5 * kk) * exp2(-r * FALLOFF);\n" +
    "  }\n" +
    "  vec3 x = max(col * GAIN, 0.0);\n" +
    "  col = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);\n" +
    "  col = pow(clamp(col, 0.0, 1.0), vec3(0.85, 0.92, 0.98));\n" +
    "  col *= 1.0 - smoothstep(0.5, 1.6, length(pos)) * 0.07;\n" +
    "  o = vec4(col, 1.0);\n" +
    "}\n";

  var FINISH_SRC =
    "#version 300 es\n" +
    "precision highp float;\n" +
    "uniform sampler2D uField; uniform vec2 uRes; uniform float uTime; uniform vec3 uBg; uniform float uPaper; out vec4 o;\n" +
    "float ign(vec2 p, float f) { p += 5.588238 * mod(f, 64.0); return fract(52.9829189 * fract(0.06711056 * p.x + 0.00583715 * p.y)); }\n" +
    "void main() {\n" +
    "  vec2 frag = gl_FragCoord.xy;\n" +
    "  vec3 L = max(texture(uField, frag / uRes).rgb, 0.0);\n" +
    "  vec3 dark = uBg + L * (1.0 - uBg);\n" +
    "  float strength = clamp(max(L.r, max(L.g, L.b)), 0.0, 1.0);\n" +
    "  vec3 paper = uBg * (1.0 - strength) + L * 0.96;\n" +
    "  vec3 col = mix(dark, paper, uPaper);\n" +
    "  col += (ign(frag, floor(uTime * 24.0)) - 0.5) / 255.0;\n" +
    "  o = vec4(clamp(col, 0.0, 1.0), 1.0);\n" +
    "}\n";

  function compile(type, src, label) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error("RibbonGlow " + label + " shader:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh); return null;
    }
    return sh;
  }
  function linkProg(fragSrc, label) {
    var vs = compile(gl.VERTEX_SHADER, VERT_SRC, label);
    var fs = compile(gl.FRAGMENT_SHADER, fragSrc, label);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("RibbonGlow " + label + " link:", gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog); return null;
    }
    return prog;
  }

  var field = linkProg(FIELD_SRC, "field");
  var finish = linkProg(FINISH_SRC, "finish");
  if (!field || !finish) return;

  function locs(prog, names) {
    var o = {}; for (var i = 0; i < names.length; i++) o[names[i]] = gl.getUniformLocation(prog, names[i]); return o;
  }
  var uf = locs(field, ["uRes", "uTime", "uC1", "uC2", "uSize", "uAngle", "uMouse", "uOn", "uReach", "uVel"]);
  var un = locs(finish, ["uField", "uRes", "uTime", "uBg", "uPaper"]);

  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Framebuffer demi-resolution pour la passe "field"
  var fbo = gl.createFramebuffer();
  var tex = null, fw = 0, fh = 0;
  var half = !!gl.getExtension("EXT_color_buffer_float");
  function resizeTarget(nw, nh) {
    if (nw === fw && nh === fh && tex) return;
    for (var attempt = 0; attempt < 2; attempt++) {
      if (tex) gl.deleteTexture(tex);
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, half ? gl.RGBA16F : gl.RGBA8, nw, nh, 0, gl.RGBA, half ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      if (ok || !half) break;
      half = false;
    }
    fw = nw; fh = nh;
  }

  // Suivi du pointeur (le ruban se tord pres du curseur)
  var ptr = { tx: 0, ty: 0, inside: false };
  function readPtr(e) {
    var r = canvas.getBoundingClientRect();
    var sx = canvas.offsetWidth / (r.width || 1);
    var sy = canvas.offsetHeight / (r.height || 1);
    ptr.tx = (e.clientX - r.left) * sx;
    ptr.ty = (e.clientY - r.top) * sy;
    ptr.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }
  window.addEventListener("pointermove", readPtr, { passive: true });
  window.addEventListener("pointerdown", readPtr, { passive: true });
  document.addEventListener("pointerout", function (e) { if (!e.relatedTarget) ptr.inside = false; });

  // Couleurs (preset "base") ; fond selon le theme
  var C1 = [0x2f / 255, 0xd3 / 255, 0xf2 / 255]; // #2FD3F2 cyan
  var C2 = [0x7b / 255, 0x61 / 255, 0xff / 255]; // #7B61FF violet
  var BG_DARK = [0x0b / 255, 0x0a / 255, 0x10 / 255];  // #0B0A10
  var BG_LIGHT = [0xf3 / 255, 0xf3 / 255, 0xf5 / 255]; // #F3F3F5
  var SPEED = 1.0, SIZE = 1.0, ANGLE = -Math.PI, HOVER = 1.0, REACH = 240;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mx = 0, my = 0, vx = 0, vy = 0, on = 0, clock = 0, last = -1, raf = 0, running = true;

  function clampN(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function draw(now) {
    var dt = last < 0 ? 0 : clampN((now - last) / 1000, 0, 0.05);
    last = now;
    clock = (clock + dt * SPEED) % 3600;

    var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    var cw = canvas.clientWidth || 1200;
    var ch = canvas.clientHeight || 800;
    var bw = Math.max(1, Math.round(cw * dpr));
    var bh = Math.max(1, Math.round(ch * dpr));
    if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
    resizeTarget(Math.max(1, Math.round(bw / 2)), Math.max(1, Math.round(bh / 2)));

    var present = ptr.inside ? 1 : 0;
    if (present && on < 0.02) { mx = ptr.tx; my = ptr.ty; }
    on += (present - on) * (1 - Math.exp(-dt * 5));
    var kk = 1 - Math.exp(-dt * 16);
    var nx = mx + (ptr.tx - mx) * kk;
    var ny = my + (ptr.ty - my) * kk;
    if (dt > 0) {
      var kv = 1 - Math.exp(-dt * 8);
      vx += ((nx - mx) / dt - vx) * kv;
      vy += ((ny - my) / dt - vy) * kv;
    }
    mx = nx; my = ny;
    var vLen = Math.hypot(vx, vy) / ch;
    var vCap = vLen > 3 ? 3 / vLen : 1;

    var isDark = document.body.classList.contains("dark-mode");
    var bg = isDark ? BG_DARK : BG_LIGHT;
    var bgLum = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2];

    // Passe 1 : field -> FBO demi-res
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, fw, fh);
    gl.useProgram(field);
    gl.uniform2f(uf.uRes, fw, fh);
    gl.uniform1f(uf.uTime, clock);
    gl.uniform3f(uf.uC1, C1[0], C1[1], C1[2]);
    gl.uniform3f(uf.uC2, C2[0], C2[1], C2[2]);
    gl.uniform1f(uf.uSize, SIZE);
    gl.uniform1f(uf.uAngle, ANGLE);
    gl.uniform2f(uf.uMouse, (mx - cw / 2) / ch, (ch / 2 - my) / ch);
    gl.uniform1f(uf.uOn, on * HOVER);
    gl.uniform1f(uf.uReach, REACH / ch);
    gl.uniform2f(uf.uVel, (vx / ch) * vCap, (-vy / ch) * vCap);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Passe 2 : finish -> ecran
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, bw, bh);
    gl.useProgram(finish);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(un.uField, 0);
    gl.uniform2f(un.uRes, bw, bh);
    gl.uniform1f(un.uTime, clock);
    gl.uniform3f(un.uBg, bg[0], bg[1], bg[2]);
    gl.uniform1f(un.uPaper, clampN((bgLum - 0.35) / 0.3, 0, 1));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    draw(now);
  }

  if (reduce) {
    draw(performance.now()); // rendu statique unique
  } else {
    raf = requestAnimationFrame(frame);
    var hero = canvas.closest(".hero");
    if ("IntersectionObserver" in window && hero) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { if (!running) { running = true; last = -1; raf = requestAnimationFrame(frame); } }
          else { running = false; if (raf) cancelAnimationFrame(raf); }
        });
      }).observe(hero);
    }
  }
})();
