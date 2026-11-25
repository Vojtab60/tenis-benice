const form = document.querySelector("#poptavka");
const emailLink = document.querySelector("#primy-email");

form.hidden = false;

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fields = new FormData(form);
  const name = fields.get("jmeno").trim();
  const inquiry = fields.get("zprava").trim();

  if (!name || !inquiry) {
    const field = form.elements.namedItem(name ? "zprava" : "jmeno");
    field.value = "";
    field.reportValidity();
    return;
  }

  const body = `Dobrý den,\r\n\r\n${inquiry}\r\n\r\n${name}`;
  window.location.href = emailLink.href + "&body=" + encodeURIComponent(body);
});
