const contactForm = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");
const destinationEmail = "me@balongsupnet.ca";
const projectToggles = document.querySelectorAll(".project-toggle");
const projectImageButtons = document.querySelectorAll(".project-image-button");
const revealSections = document.querySelectorAll(".reveal-section:not(#hero)");
const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const imageModal = document.getElementById("image-modal");
const imageModalMedia = document.getElementById("image-modal-media");
const imageModalTitle = document.getElementById("image-modal-title");
const imageModalDescription = document.getElementById("image-modal-description");
const imageModalClose = document.getElementById("image-modal-close");
let lastImageTrigger = null;

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

function openImageModal(trigger) {
  if (!imageModal || !imageModalMedia || !imageModalTitle || !imageModalDescription) {
    return;
  }

  lastImageTrigger = trigger;
  imageModalMedia.src = trigger.dataset.modalImage || "";
  imageModalMedia.alt = trigger.dataset.modalAlt || "";
  imageModalTitle.textContent = trigger.dataset.modalTitle || "Project Visual";
  imageModalDescription.textContent = trigger.dataset.modalDescription || "";
  imageModal.hidden = false;
  imageModal.setAttribute("aria-hidden", "false");

  if (prefersReducedMotion.matches) {
    imageModal.classList.add("is-open");
  } else {
    window.requestAnimationFrame(() => {
      imageModal.classList.add("is-open");
    });
  }

  document.body.classList.add("modal-open");
  imageModalClose?.focus();
}

function closeImageModal() {
  if (!imageModal) {
    return;
  }

  const finishClose = () => {
    imageModal.hidden = true;
    imageModal.setAttribute("aria-hidden", "true");
    imageModalMedia.removeAttribute("src");
    if (lastImageTrigger) {
      lastImageTrigger.focus();
    }
  };

  document.body.classList.remove("modal-open");

  if (prefersReducedMotion.matches) {
    imageModal.classList.remove("is-open");
    finishClose();
    return;
  }

  const handleTransitionEnd = (event) => {
    if (event.target !== imageModal.querySelector(".image-modal-dialog") || event.propertyName !== "transform") {
      return;
    }

    imageModal.removeEventListener("transitionend", handleTransitionEnd, true);
    finishClose();
  };

  imageModal.addEventListener("transitionend", handleTransitionEnd, true);
  imageModal.classList.remove("is-open");
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

projectImageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openImageModal(button);
  });
});

imageModalClose?.addEventListener("click", closeImageModal);

imageModal?.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.hasAttribute("data-modal-close")) {
    closeImageModal();
  }
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && imageModal && !imageModal.hidden) {
    closeImageModal();
  }
});

markPageReady();
setActiveNavLink("about");
