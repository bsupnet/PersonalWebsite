const contactForm = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");
const destinationEmail = "supnetbalong@outlook.com";
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

  const finishAnimation = () => {
    details.style.height = expand ? "auto" : "";
    details.style.overflow = "";
    details.style.transition = "";

    if (!expand) {
      details.hidden = true;
      details.classList.remove("is-open");
    }
  };

  details.hidden = false;
  const startHeight = expand ? 0 : details.scrollHeight;

  if (expand) {
    details.classList.add("is-open");
  } else {
    details.classList.remove("is-open");
  }

  const endHeight = expand ? details.scrollHeight : 0;

  details.style.overflow = "hidden";
  details.style.height = `${startHeight}px`;
  details.style.transition = "height 0.45s cubic-bezier(0.22, 1, 0.36, 1)";

  window.requestAnimationFrame(() => {
    details.style.height = `${endHeight}px`;
  });

  const handleTransitionEnd = (event) => {
    if (event.propertyName !== "height") {
      return;
    }

    details.removeEventListener("transitionend", handleTransitionEnd);
    finishAnimation();
  };

  details.addEventListener("transitionend", handleTransitionEnd);
}

projectToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const details = toggle.nextElementSibling;
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    const nextExpanded = !expanded;

    toggle.setAttribute("aria-expanded", String(nextExpanded));
    toggle.textContent = nextExpanded ? "Hide Details" : "View Details";
    animateProjectDetails(details, nextExpanded);
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
    formNote.textContent = "Your email app should now open with the message pre-filled.";
  });
}

if (!prefersReducedMotion.matches && "IntersectionObserver" in window) {
  // Reveal content sections as they enter the viewport for a lighter scroll experience.
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
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealSections.forEach((section, index) => {
    section.style.setProperty("--section-delay", `${Math.min(index * 0.04, 0.12)}s`);
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
