const form = document.querySelector("#poptavka");
const emailLink = document.querySelector("#primy-email");
const restoreHint = document.querySelector("#obnoveni-poptavky");
const restoreButton = restoreHint.querySelector("button");
const nameField = form.elements.namedItem("jmeno");
const messageField = form.elements.namedItem("zprava");
let previousFields = null;

function dismissRestore() {
  previousFields = null;
  restoreHint.hidden = true;
}

form.hidden = false;
form.addEventListener("input", dismissRestore);

restoreButton.addEventListener("click", () => {
  if (!previousFields) return;

  nameField.value = previousFields.name;
  messageField.value = previousFields.message;
  dismissRestore();
  messageField.focus();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameField.value.trim();
  const inquiry = messageField.value.trim();

  if (!name || !inquiry) {
    const field = name ? messageField : nameField;
    field.value = "";
    field.reportValidity();
    return;
  }

  const body = `Dobrý den,\r\n\r\n${inquiry}\r\n\r\n${name}`;
  window.location.href = emailLink.href + "&body=" + encodeURIComponent(body);

  previousFields = { name: nameField.value, message: messageField.value };
  form.reset();
  restoreHint.hidden = false;
});

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
