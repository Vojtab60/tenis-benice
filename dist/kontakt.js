(() => {
  const contact = document.querySelector("#kontakt");
  const form = document.querySelector("#poptavka");
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

  const endpoint = form.getAttribute("action");
  if (!endpoint || !/^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(endpoint)) return;

  document.querySelectorAll("[data-inquiry-link]").forEach((link) => {
    link.href = "#poptavka";
  });

  const contactField = form.elements.namedItem("kontakt");
  const nameField = form.elements.namedItem("name");
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector(".form-status");

  function showStatus(kind, message) {
    status.dataset.kind = kind;
    status.textContent = message;
  }

  function validateContact() {
    const value = contactField.value.trim();
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const digits = value.replace(/\D/g, "");
    const phone = /^\+?[\d\s().-]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
    contactField.setCustomValidity(email || phone ? "" : "Zadejte platný e-mail nebo telefon.");
    return email ? "email" : "phone";
  }

  contactField.addEventListener("input", () => contactField.setCustomValidity(""));
  nameField.addEventListener("input", () => nameField.setCustomValidity(""));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (button.disabled) return;

    nameField.setCustomValidity(nameField.value.trim() ? "" : "Doplňte jméno a příjmení.");
    const contactType = validateContact();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    data.set("name", nameField.value.trim());
    data.delete("kontakt");
    data.set(contactType, contactField.value.trim());
    button.disabled = true;
    showStatus("pending", "Odesílám poptávku…");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
        signal: controller.signal
      });
      if (response.status === 429) {
        showStatus("error", "Formulář teď přijímá příliš mnoho zpráv. Zkuste to za chvíli nebo mi zavolejte.");
        return;
      }

      const result = await response.json();
      if (!response.ok || result?.error || result?.errors || typeof result?.next !== "string") {
        throw new Error("Submission not accepted");
      }

      form.reset();
      showStatus("success", "Děkuji za poptávku. Ozvu se vám co nejdříve a domluvíme se na podrobnostech.");
    } catch {
      showStatus("error", "Odeslání se nepodařilo potvrdit. Zkuste to znovu nebo mi napište přímo e-mailem.");
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
    }
  });
})();
