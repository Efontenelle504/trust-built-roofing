(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const siteNav = document.querySelector("[data-site-nav]");
  const dialog = document.querySelector("[data-estimate-dialog]");
  const form = document.querySelector("[data-estimate-form]");
  const formSteps = Array.from(document.querySelectorAll("[data-form-step]"));
  const stepIndicators = Array.from(document.querySelectorAll("[data-step-indicator]"));
  const nextButton = document.querySelector("[data-form-next]");
  const backButton = document.querySelector("[data-form-back]");
  const submitButton = document.querySelector("[data-form-submit]");
  const progressBar = document.querySelector("[data-form-progress]");
  const formStatus = document.querySelector("[data-form-status]");
  const successPanel = document.querySelector("[data-estimate-success]");
  const summary = document.querySelector("[data-estimate-summary]");
  const currentYear = document.querySelector("[data-year]");

  let currentStep = 0;
  let carouselIndex = 0;
  let lastFocusedElement = null;

  const plannerContent = {
    driveway: {
      kicker: "Vehicle-ready surfaces",
      title: "Plan around access, drainage, and load.",
      copy: "A driveway estimate should account for demolition, haul-off, base preparation, thickness, reinforcement, control joints, finish, and how water moves across the property.",
      first: "Existing cracks, settlement, width, slope, and access",
      key: "Repair, partial replacement, or full replacement",
      finish: "Broom, picture-frame border, or decorative accents",
      prep: "High priority",
      bar: "92%"
    },
    patio: {
      kicker: "Outdoor living surfaces",
      title: "Shape the layout around how the space will be used.",
      copy: "Patio planning should consider furniture zones, grill clearances, doors, steps, roof runoff, landscape edges, finish comfort, and a slope that moves water away from the home.",
      first: "Doors, downspouts, yard grade, furniture, and circulation",
      key: "Size, shape, finish, and connection to the home",
      finish: "Broom, smooth border, color, or stamped pattern",
      prep: "Very important",
      bar: "84%"
    },
    slab: {
      kicker: "Purpose-built slabs",
      title: "Match thickness and reinforcement to the intended use.",
      copy: "A shed, workshop, equipment, or addition slab may have different edge, thickening, anchor, vapor, reinforcement, and elevation requirements. The use should be clear before pricing.",
      first: "Structure type, load, utilities, elevation, and access",
      key: "Thickness, reinforcement, edges, and penetrations",
      finish: "Trowel, broom, sealed, or project-specific finish",
      prep: "Critical",
      bar: "96%"
    },
    repair: {
      kicker: "Cause-first evaluation",
      title: "Fix the reason for failure—not just the surface symptom.",
      copy: "Cracking, settlement, scaling, and spalling can have different causes. A repair conversation should look at movement, water, base conditions, age, and whether the surrounding concrete is still sound.",
      first: "Crack pattern, settlement, drainage, age, and prior repairs",
      key: "Patch, lift, partial replacement, or full replacement",
      finish: "Best practical match to surrounding concrete",
      prep: "Depends on cause",
      bar: "76%"
    }
  };

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  function closeMenu() {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
    header?.classList.remove("is-menu-open");
    document.body.classList.remove("menu-open");
  }

  function toggleMenu() {
    if (!menuToggle || !siteNav) return;
    const opening = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(opening));
    siteNav.classList.toggle("is-open", opening);
    header?.classList.toggle("is-menu-open", opening);
    document.body.classList.toggle("menu-open", opening);
  }

  function revealElements() {
    const reveals = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      reveals.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px" });

    reveals.forEach((element) => observer.observe(element));
  }

  function updatePlanner(key) {
    const content = plannerContent[key];
    if (!content) return;

    document.querySelectorAll("[data-planner-tab]").forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.plannerTab === key));
    });

    const fields = {
      "[data-planner-kicker]": content.kicker,
      "[data-planner-title]": content.title,
      "[data-planner-copy]": content.copy,
      "[data-planner-first]": content.first,
      "[data-planner-key]": content.key,
      "[data-planner-finish]": content.finish,
      "[data-planner-prep]": content.prep
    };

    Object.entries(fields).forEach(([selector, value]) => {
      const element = document.querySelector(selector);
      if (element) element.textContent = value;
    });

    const bar = document.querySelector("[data-planner-bar]");
    if (bar) bar.style.width = content.bar;
  }

  function showSlide(index) {
    const slides = Array.from(document.querySelectorAll("[data-slide]"));
    if (!slides.length) return;

    carouselIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === carouselIndex;
      slide.hidden = !active;
      slide.classList.toggle("is-active", active);
    });

    document.querySelectorAll("[data-carousel-dot]").forEach((dot, dotIndex) => {
      dot.setAttribute("aria-selected", String(dotIndex === carouselIndex));
    });

    const count = document.querySelector("[data-slide-count]");
    if (count) count.textContent = String(carouselIndex + 1).padStart(2, "0");
  }

  function setupAccordion() {
    document.querySelectorAll(".accordion-item h3 button").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".accordion-item");
        const body = item?.querySelector(".accordion-item__body");
        if (!item || !body) return;

        const opening = !item.classList.contains("is-open");
        document.querySelectorAll(".accordion-item").forEach((otherItem) => {
          const otherButton = otherItem.querySelector("h3 button");
          const otherBody = otherItem.querySelector(".accordion-item__body");
          otherItem.classList.remove("is-open");
          otherButton?.setAttribute("aria-expanded", "false");
          if (otherBody) otherBody.hidden = true;
        });

        if (opening) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
          body.hidden = false;
        }
      });
    });
  }

  function openEstimate(prefill = "") {
    if (!dialog) return;
    lastFocusedElement = document.activeElement;
    closeMenu();

    if (prefill && form) {
      const radio = Array.from(form.elements.projectType || []).find((input) => input.value === prefill);
      if (radio) radio.checked = true;
    }

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }

    document.body.classList.add("dialog-open");
    window.setTimeout(() => {
      const firstInput = formSteps[currentStep]?.querySelector("input, select, textarea, button");
      firstInput?.focus();
    }, 50);
  }

  function closeEstimate() {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    document.body.classList.remove("dialog-open");
    lastFocusedElement?.focus?.();
  }

  function getRadioValue(name) {
    if (!form) return "";
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : "";
  }

  function validateCurrentStep() {
    if (!form) return false;
    const step = formSteps[currentStep];
    const error = step?.querySelector("[data-step-error]");
    if (error) error.textContent = "";

    if (currentStep === 0) {
      const projectType = getRadioValue("projectType");
      const zip = String(form.elements.zipCode?.value || "").trim();
      if (!projectType) {
        if (error) error.textContent = "Choose a project type to continue.";
        return false;
      }
      if (!/^\d{5}(?:-\d{4})?$/.test(zip)) {
        if (error) error.textContent = "Enter a valid 5-digit ZIP code.";
        form.elements.zipCode?.focus();
        return false;
      }
    }

    if (currentStep === 1 && !form.elements.propertyType?.value) {
      if (error) error.textContent = "Choose the property type to continue.";
      form.elements.propertyType?.focus();
      return false;
    }

    if (currentStep === 2 && !getRadioValue("timeline")) {
      if (error) error.textContent = "Choose an ideal start timing to continue.";
      return false;
    }

    if (currentStep === 3) {
      const name = String(form.elements.name?.value || "").trim();
      const phone = String(form.elements.phone?.value || "").replace(/\D/g, "");
      const email = String(form.elements.email?.value || "").trim();
      const consent = form.elements.consent?.checked;

      if (name.length < 2) {
        if (error) error.textContent = "Enter your name.";
        form.elements.name?.focus();
        return false;
      }
      if (phone.length < 10) {
        if (error) error.textContent = "Enter a valid phone number.";
        form.elements.phone?.focus();
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (error) error.textContent = "Enter a valid email address.";
        form.elements.email?.focus();
        return false;
      }
      if (!consent) {
        if (error) error.textContent = "Confirm that we may contact you about this request.";
        return false;
      }
    }

    return true;
  }

  function buildSummary() {
    if (!summary || !form) return;
    const values = [
      ["Project", getRadioValue("projectType") || "Not selected"],
      ["ZIP", String(form.elements.zipCode?.value || "") || "Not entered"],
      ["Property", String(form.elements.propertyType?.value || "") || "Not selected"],
      ["Timing", getRadioValue("timeline") || "Not selected"]
    ];

    summary.innerHTML = values.map(([label, value]) => (
      `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
    )).join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showFormStep(index) {
    currentStep = Math.max(0, Math.min(index, formSteps.length - 1));

    formSteps.forEach((step, stepIndex) => {
      const active = stepIndex === currentStep;
      step.hidden = !active;
      step.classList.toggle("is-active", active);
    });

    stepIndicators.forEach((indicator, indicatorIndex) => {
      indicator.classList.toggle("is-active", indicatorIndex === currentStep);
      indicator.classList.toggle("is-complete", indicatorIndex < currentStep);
    });

    if (progressBar) progressBar.style.width = `${((currentStep + 1) / formSteps.length) * 100}%`;
    if (backButton) backButton.hidden = currentStep === 0;
    if (nextButton) nextButton.hidden = currentStep === formSteps.length - 1;
    if (submitButton) submitButton.hidden = currentStep !== formSteps.length - 1;
    if (formStatus) formStatus.textContent = "";

    if (currentStep === formSteps.length - 1) buildSummary();

    const main = dialog?.querySelector(".estimate-dialog__main");
    if (main) main.scrollTop = 0;

    window.setTimeout(() => {
      const heading = formSteps[currentStep]?.querySelector("h3");
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
    }, 30);
  }

  function encodeFormData(formData) {
    return new URLSearchParams(Array.from(formData.entries()).map(([key, value]) => [key, String(value)])).toString();
  }

  async function submitEstimate(event) {
    event.preventDefault();
    if (!form || !validateCurrentStep()) return;

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    if (formStatus) formStatus.textContent = "";

    const formData = new FormData(form);
    const siteConditions = Array.from(form.querySelectorAll('input[name="siteConditions"]:checked')).map((input) => input.value);
    formData.delete("siteConditions");
    formData.set("siteConditions", siteConditions.join(", "));

    try {
      const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.protocol === "file:";
      if (!isLocal) {
        const response = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encodeFormData(formData)
        });
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      }

      form.hidden = true;
      successPanel.hidden = false;
      successPanel.querySelector("h3")?.focus?.();
    } catch (error) {
      console.error(error);
      if (formStatus) formStatus.textContent = "We could not send the request. Please call (504) 285-7707 or try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send estimate request";
    }
  }

  function resetEstimateForm() {
    if (!form || !successPanel) return;
    form.reset();
    form.hidden = false;
    successPanel.hidden = true;
    showFormStep(0);
  }

  window.addEventListener("scroll", setHeaderState, { passive: true });
  setHeaderState();
  revealElements();
  setupAccordion();
  showSlide(0);

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  menuToggle?.addEventListener("click", toggleMenu);
  siteNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.querySelectorAll("[data-planner-tab]").forEach((button) => {
    button.addEventListener("click", () => updatePlanner(button.dataset.plannerTab));
  });

  document.querySelector("[data-carousel-prev]")?.addEventListener("click", () => showSlide(carouselIndex - 1));
  document.querySelector("[data-carousel-next]")?.addEventListener("click", () => showSlide(carouselIndex + 1));
  document.querySelectorAll("[data-carousel-dot]").forEach((dot) => {
    dot.addEventListener("click", () => showSlide(Number(dot.dataset.carouselDot)));
  });

  document.querySelectorAll("[data-open-estimate]").forEach((button) => {
    button.addEventListener("click", () => openEstimate(button.dataset.projectPrefill || ""));
  });

  document.querySelectorAll("[data-close-estimate]").forEach((button) => {
    button.addEventListener("click", closeEstimate);
  });

  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeEstimate();
  });

  dialog?.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    if (successPanel && !successPanel.hidden) resetEstimateForm();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNav?.classList.contains("is-open")) closeMenu();
  });

  nextButton?.addEventListener("click", () => {
    if (validateCurrentStep()) showFormStep(currentStep + 1);
  });

  backButton?.addEventListener("click", () => showFormStep(currentStep - 1));
  form?.addEventListener("submit", submitEstimate);

  form?.addEventListener("change", (event) => {
    const target = event.target;
    if (target?.matches?.('input[name="projectType"]')) {
      const error = formSteps[0]?.querySelector("[data-step-error]");
      if (error) error.textContent = "";
    }
  });
})();
