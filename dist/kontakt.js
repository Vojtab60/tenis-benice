const form = document.querySelector("#poptavka");
const nameField = form.elements.namedItem("jmeno");
const messageField = form.elements.namedItem("zprava");
const contactFields = [
  nameField,
  form.elements.namedItem("email"),
  form.elements.namedItem("phone"),
  messageField
];
const button = form.querySelector('button[type="submit"]');
const buttonLabel = button.querySelector(".submit-label");
const status = form.querySelector(".form-status");
const errorMessage = "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu nebo mě kontaktujte telefonicky.";
const unconfirmedMessage = "Nepodařilo se ověřit, zda poptávka dorazila. Pokud se vám neozvu, zavolejte mi.";

function showFormStatus(kind, message) {
  status.dataset.kind = kind;
  status.textContent = message;
}

form.addEventListener("input", (event) => event.target.setCustomValidity(""));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (button.disabled) return;

  const name = nameField.value.trim();
  const message = messageField.value.trim();
  nameField.setCustomValidity(name ? "" : "Vyplňte prosím své jméno.");
  messageField.setCustomValidity(message ? "" : "Napište prosím, kdy se vám trénink hodí.");
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  if (data.get("_gotcha")) {
    showFormStatus("error", errorMessage);
    return;
  }
  data.set(nameField.name, name);
  data.set(messageField.name, message);

  button.disabled = true;
  contactFields.forEach((field) => { field.readOnly = true; });
  buttonLabel.textContent = "Odesílám…";
  showFormStatus("pending", "");

  try {
    let response;
    try {
      response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data
      });
    } catch (error) {
      console.warn("Formspree: odpověď se nepodařilo načíst.", error);
      showFormStatus("unconfirmed", unconfirmedMessage);
      return;
    }

    if (!response.ok) {
      console.warn("Formspree: požadavek vrácen se stavem", response.status);
      showFormStatus("error", errorMessage);
      return;
    }

    const contentType = response.headers.get("content-type") || "";
    if (response.redirected || contentType.includes("text/html")) {
      console.warn("Formspree: neočekávaná odpověď.", response.status);
      showFormStatus("unconfirmed", unconfirmedMessage);
      return;
    }

    // Formspree confirms an AJAX submission with a successful HTTP status.
    showFormStatus("success", "Děkuji za poptávku! Ozvu se vám co nejdříve.");
    form.reset();
  } finally {
    contactFields.forEach((field) => { field.readOnly = false; });
    button.disabled = false;
    buttonLabel.textContent = "Odeslat poptávku";
  }
});

form.hidden = false;

(() => {
  const contact = document.querySelector("#kontakt");
  const mobileInquiry = document.querySelector(".mobile-inquiry");

  document.body.classList.add("with-mobile-inquiry");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      mobileInquiry.hidden = entry.isIntersecting;
      document.body.classList.toggle("inquiry-at-contact", entry.isIntersecting);
    });
    observer.observe(contact);
  } else {
    mobileInquiry.hidden = false;
  }
})();
