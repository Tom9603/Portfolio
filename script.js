// Toujours revenir en haut a chaque rechargement
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
// pageshow se declenche APRES la restauration de scroll du navigateur (contrairement a load)
// Les setTimeout couvrent les navigateurs qui restaurent de facon asynchrone
window.addEventListener('pageshow', function () {
    window.scrollTo(0, 0);
    // Libere le scroll bloque dans le head (empeche le flash haut-bas-haut)
    document.documentElement.style.overflow = '';
    setTimeout(function () { window.scrollTo(0, 0); }, 0);
    setTimeout(function () { window.scrollTo(0, 0); }, 100);
});

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
    modal.style.display = 'flex';
    // Focus dans la boite (tabindex="-1") : lecture d'ecran et Escape operationnels
    const content = modal.querySelector('.modal-content');
    if (content) content.focus();
}

function closeModal(modal) {
    modal.style.display = 'none';
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
