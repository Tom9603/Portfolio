/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// FORMULAIRE CONTACT /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault(); 

    const form = this;
    const msg = document.getElementById("formMessage");

    fetch(form.action, {
        method: "POST",
        body: new FormData(form),
    })
    .then(() => {
        msg.textContent = "Votre message a bien été envoyé.";
        msg.style.opacity = "1";
        form.reset();

        setTimeout(() => {
            msg.style.opacity = "0";
        }, 2000);
    })
    .catch(() => {
        msg.textContent = "Une erreur est survenue. Veuillez réessayer.";
        msg.style.opacity = "1";

        setTimeout(() => {
            msg.style.opacity = "0";
        }, 3000);
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// BACK TO TOP /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("topBtn").onclick = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// DOWNLOAD CV /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("cvBtn").onclick = () => {
    window.open("/documents/CV_Tom_Ochietti.pdf", "_blank");
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// DARK MODE + SAVE ///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

const themeBtn = document.getElementById("themeToggle");

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    themeBtn.classList.add("btn-active");
}

themeBtn.onclick = () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);

    if (isDark) {
        themeBtn.classList.add("btn-active");
    } else {
        themeBtn.classList.remove("btn-active");
    }
};

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
////////////////////////////////////////////// MODALS ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

document.querySelectorAll('.link-modal').forEach(link => {
    link.addEventListener('click', () => {
        const modalId = "modal-" + link.dataset.modal;
        document.getElementById(modalId).style.display = 'flex';
    });
});

document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = "modal-" + btn.dataset.close;
        document.getElementById("modal-" + btn.dataset.close).style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) modal.style.display = 'none';
    });
});
