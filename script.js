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
