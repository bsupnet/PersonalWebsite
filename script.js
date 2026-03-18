const projectToggles = document.querySelectorAll(".project-toggle");

projectToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const details = toggle.nextElementSibling;
    const expanded = toggle.getAttribute("aria-expanded") === "true";

    toggle.setAttribute("aria-expanded", String(!expanded));
    toggle.textContent = expanded ? "View Details" : "Hide Details";
    details.hidden = expanded;
  });
});

const contactForm = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");
const destinationEmail = "balong.supnet@example.com";

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const name = formData.get("name")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim() || "";
  const message = formData.get("message")?.toString().trim() || "";

  const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  );

  window.location.href = `mailto:${destinationEmail}?subject=${subject}&body=${body}`;
  formNote.textContent = "Your email app should now open with the message pre-filled.";
});
