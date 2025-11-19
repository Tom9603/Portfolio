/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// FORMULAIRE CONTACT /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Empêche le rechargement

    const form = this;

    fetch(form.action, {
        method: "POST",
        body: new FormData(form),
    })
    .then(() => {
        document.getElementById("formMessage").textContent = "Votre message a bien été envoyé.";
        document.getElementById("formMessage").style.display = "block";
        form.reset(); // Réinitialise le formulaire
    })
    .catch(() => {
        document.getElementById("formMessage").textContent = "Une erreur est survenue. Veuillez réessayer";
        document.getElementById("formMessage").style.display = "block";
    });
});