const contactForm = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");
const destinationEmail = "me@balongsupnet.ca";
const projectToggles = document.querySelectorAll(".project-toggle");
const revealSections = document.querySelectorAll(".reveal-section:not(#hero)");
const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function markPageReady() {
  if (prefersReducedMotion.matches) {
    document.body.classList.add("page-ready");
    revealSections.forEach((section) => section.classList.add("is-visible"));
    return;
  }

  window.requestAnimationFrame(() => {
    document.body.classList.add("page-ready");
  });
}

function setActiveNavLink(id) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function animateProjectDetails(details, expand) {
  if (!details) {
    return;
  }

  if (prefersReducedMotion.matches) {
    details.hidden = !expand;
    details.classList.toggle("is-open", expand);
    return;
  }

  if (expand) {
    details.hidden = false;
    window.requestAnimationFrame(() => {
      details.classList.add("is-open");
    });
    return;
  }

  const handleTransitionEnd = (event) => {
    if (event.propertyName !== "grid-template-rows") {
      return;
    }

    details.hidden = true;
    details.removeEventListener("transitionend", handleTransitionEnd);
  };

  details.addEventListener("transitionend", handleTransitionEnd);
  details.classList.remove("is-open");
}

function updateToggleLabel(toggle, expanded) {
  toggle.textContent = expanded ? "Hide More Information" : "View More Information";
}

projectToggles.forEach((toggle) => {
  const details = document.getElementById(toggle.getAttribute("aria-controls"));
  const expanded = toggle.getAttribute("aria-expanded") === "true";

  if (details) {
    details.hidden = !expanded;
    details.classList.toggle("is-open", expanded);
  }
  updateToggleLabel(toggle, expanded);
  toggle.addEventListener("click", () => {
    const controlledDetails = document.getElementById(toggle.getAttribute("aria-controls"));
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    const nextExpanded = !expanded;

    toggle.setAttribute("aria-expanded", String(nextExpanded));
    updateToggleLabel(toggle, nextExpanded);
    animateProjectDetails(controlledDetails, nextExpanded);
  });
});

if (contactForm) {
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
    formNote.textContent = "Your email app should now open with the message pre-filled to me@balongsupnet.ca.";
  });
}

if (!prefersReducedMotion.matches && "IntersectionObserver" in window) {
  // Reveal sections a little early so quick scrolling does not leave content lagging behind.
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.01,
      rootMargin: "0px 0px 18% 0px",
    }
  );

  revealSections.forEach((section) => {
    section.style.setProperty("--section-delay", "0s");
    revealObserver.observe(section);
  });
} else {
  revealSections.forEach((section) => section.classList.add("is-visible"));
}

if ("IntersectionObserver" in window) {
  // Keep the current section visible in the nav as the user scrolls.
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries.length > 0) {
        setActiveNavLink(visibleEntries[0].target.id);
      }
    },
    {
      threshold: [0.3, 0.55, 0.75],
      rootMargin: "-20% 0px -55% 0px",
    }
  );

  navLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) {
      sectionObserver.observe(section);
    }
  });
}

prefersReducedMotion.addEventListener("change", () => {
  if (prefersReducedMotion.matches) {
    revealSections.forEach((section) => section.classList.add("is-visible"));
  }
});

markPageReady();
setActiveNavLink("about");
