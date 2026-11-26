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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(form.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data,
      signal: controller.signal
    });
    if (!response.ok || response.redirected) {
      throw new Error("Formspree did not accept the submission");
    }

    const result = await response.json();
    const hasErrors = Array.isArray(result?.errors) ? result.errors.length > 0 : Boolean(result?.errors);
    const accepted = result?.ok === true || typeof result?.next === "string";
    if (!accepted || result?.ok === false || result?.error || hasErrors) {
      throw new Error("Formspree did not confirm the submission");
    }

    form.reset();
    showFormStatus("success", "Děkuji za poptávku! Ozvu se vám co nejdříve.");
  } catch {
    showFormStatus("error", errorMessage);
  } finally {
    clearTimeout(timeout);
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
