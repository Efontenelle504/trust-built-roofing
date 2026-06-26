(() => {
  document.documentElement.classList.add("js-enhanced");

  const beforeAfterSlides = [
    { image: "trust-built-assets/trust-built-roof-jobsite.webp", alt: "Organized roofing jobsite with roof materials staged neatly", label: "Prepared Jobsite" },
    { image: "trust-built-assets/trust-built-completed-roof.webp", alt: "Completed residential roof with clean shingle lines", label: "Completed Roof" },
    { image: "trust-built-assets/trust-built-storm-damage-detail.webp", alt: "Close detail of storm damage on residential shingles", label: "Storm Damage Detail" }
  ];

  const leadFormSteps = [
    { label: "Service area", title: "Check estimate availability in your ZIP", description: "We confirm local availability before asking for contact details.", cta: "Check ZIP" },
    { label: "Roof needs", title: "Tell us what is happening with the roof", description: "Choose the basics so the estimate specialist knows what to prepare for.", cta: "Continue" },
    { label: "Project timing", title: "Share the roof type and timing", description: "This helps route your request to the right roofing team.", cta: "Continue" },
    { label: "Contact", title: "Where should we send the estimate follow-up?", description: "We only use this to follow up on your roofing estimate request.", cta: "Review Request" },
    { label: "Review", title: "Review and send your estimate request", description: "No obligation. A Trust Built Roofing Co. specialist will contact you about next steps.", cta: "Send Estimate Request" }
  ];

  const homeownerOptions = ["Yes", "No"];
  const roofNeedOptions = ["Leaks or water stains", "Missing or damaged shingles", "Storm or hail damage", "Aging roof or repeated repairs", "Comparing material options"];
  const roofTypeOptions = ["Asphalt shingle", "Metal", "Tile", "Flat or low-slope", "Not sure"];
  const timelineOptions = ["As soon as possible", "This month", "1-3 months", "Just researching"];
  const trustLeadPhone = "(504) 285-7707";
  const trustLeadPhoneHref = "tel:5042857707";
  const fieldSteps = { zipCode: 0, homeowner: 1, roofNeeds: 1, roofType: 2, timeline: 2, name: 3, phone: 3, email: 3, notes: 4, consent: 4, website: 4 };

  // === LEAD ENDPOINT CONFIG ===========================================
  // Use a GoHighLevel Workflow Inbound Webhook URL. Do not put private
  // HighLevel API tokens in this static file; browser users can see them.
  const TRUST_GHL_WEBHOOK_URL = "";
  // Fallback when no GHL webhook is set AND the site is deployed on Netlify:
  // leads are captured by Netlify Forms (dashboard + email notification).
  const TRUST_NETLIFY_FORM = "roof-estimate";
  // ====================================================================

  const root = document.getElementById("trust-modal-root");
  let beforeAfterIndex = 0;
  let activeFaq = 0;
  let modalOpen = false;
  let submitting = false;
  let focusModalNext = false;
  let success = false;
  let status = "";
  let step = 0;
  let errors = {};
  let lastFocused = null;
  let formData = createInitialLeadFormData();

  function createInitialLeadFormData() {
    return {
      homeowner: "",
      roofNeeds: [],
      roofType: "",
      timeline: "",
      zipCode: "",
      name: "",
      phone: "",
      email: "",
      notes: "",
      consent: false,
      website: ""
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function hasValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function hasValidPhone(value) {
    return value.replace(/\D/g, "").length >= 10;
  }

  function hasValidZipCode(value) {
    return /^\d{5}(?:-\d{4})?$/.test(value.trim());
  }

  function validateStep(targetStep) {
    const next = {};
    if (targetStep === 0 && !hasValidZipCode(formData.zipCode)) next.zipCode = "Enter a valid 5 digit ZIP code.";
    if (targetStep === 1) {
      if (!formData.homeowner) next.homeowner = "Choose whether you own the home.";
      if (formData.roofNeeds.length === 0) next.roofNeeds = "Choose at least one roofing concern.";
    }
    if (targetStep === 2) {
      if (!formData.roofType) next.roofType = "Choose your current roof type.";
      if (!formData.timeline) next.timeline = "Choose a project timeline.";
    }
    if (targetStep === 3) {
      if (formData.name.trim().length < 2) next.name = "Enter your name.";
      if (!hasValidPhone(formData.phone)) next.phone = "Enter a valid phone number.";
      if (!hasValidEmail(formData.email)) next.email = "Enter a valid email address.";
    }
    if (targetStep === 4 && !formData.consent) next.consent = "Confirm that Trust Built Roofing Co. may contact you about the estimate.";
    return next;
  }

  function validateAll() {
    return leadFormSteps.reduce((all, _, index) => Object.assign(all, validateStep(index)), {});
  }

  function firstErrorStep(nextErrors) {
    const field = Object.keys(nextErrors)[0];
    return field ? fieldSteps[field] : -1;
  }

  function errorText(field) {
    return errors[field] ? '<p class="trust-modal__field-error" id="trust-lead-' + field + '-error" role="alert">' + escapeHtml(errors[field]) + "</p>" : "";
  }

  function describedBy(field, helperId) {
    const ids = [];
    if (helperId) ids.push(helperId);
    if (errors[field]) ids.push("trust-lead-" + field + "-error");
    return ids.length ? ' aria-describedby="' + ids.join(" ") + '"' : "";
  }

  function ariaInvalid(field) {
    return errors[field] ? ' aria-invalid="true"' : "";
  }

  function choice(name, value, checked, type) {
    return '<label class="trust-modal__choice" data-selected="' + (checked ? "true" : "false") + '">' +
      '<input ' + (checked ? "checked " : "") + 'name="' + name + '" value="' + escapeHtml(value) + '" type="' + type + '">' +
      '<span class="trust-modal__choice-mark" aria-hidden="true"></span><span>' + escapeHtml(value) + "</span></label>";
  }

  function renderStepFields() {
    if (step === 0) {
      return '<label class="trust-modal__field"><span>ZIP code *</span><input class="trust-modal__input trust-modal__zip" name="zipCode" inputmode="numeric" maxlength="10" autocomplete="postal-code" value="' + escapeHtml(formData.zipCode) + '"' + describedBy("zipCode", "trust-zip-help") + ariaInvalid("zipCode") + '><small id="trust-zip-help">Used only to confirm local roofing estimate availability.</small>' + errorText("zipCode") + "</label>";
    }

    if (step === 1) {
      return '<div class="trust-modal__field-grid"><fieldset' + describedBy("homeowner") + ariaInvalid("homeowner") + '><legend>Do you own the home? *</legend><div class="trust-modal__choice-list trust-modal__choice-list--split">' +
        homeownerOptions.map((option) => choice("homeowner", option, formData.homeowner === option, "radio")).join("") +
        "</div>" + errorText("homeowner") + '</fieldset><fieldset' + describedBy("roofNeeds") + ariaInvalid("roofNeeds") + '><legend>What do you need help with? *</legend><div class="trust-modal__choice-list">' +
        roofNeedOptions.map((option) => choice("roofNeeds", option, formData.roofNeeds.includes(option), "checkbox")).join("") +
        "</div>" + errorText("roofNeeds") + "</fieldset></div>";
    }

    if (step === 2) {
      return '<div class="trust-modal__field-grid"><label class="trust-modal__field"><span>What type of roof do you have now? *</span><select class="trust-modal__input" name="roofType"' + describedBy("roofType") + ariaInvalid("roofType") + '><option value="">Select one</option>' +
        roofTypeOptions.map((option) => '<option value="' + escapeHtml(option) + '"' + (formData.roofType === option ? " selected" : "") + ">" + escapeHtml(option) + "</option>").join("") +
        "</select>" + errorText("roofType") + '</label><fieldset' + describedBy("timeline") + ariaInvalid("timeline") + '><legend>When are you hoping to start? *</legend><div class="trust-modal__choice-list">' +
        timelineOptions.map((option) => choice("timeline", option, formData.timeline === option, "radio")).join("") +
        "</div>" + errorText("timeline") + "</fieldset></div>";
    }

    if (step === 3) {
      return '<div class="trust-modal__field-grid"><label class="trust-modal__field"><span>Name *</span><input class="trust-modal__input" name="name" autocomplete="name" maxlength="100" value="' + escapeHtml(formData.name) + '"' + describedBy("name") + ariaInvalid("name") + ">" + errorText("name") + '</label><label class="trust-modal__field"><span>Phone *</span><input class="trust-modal__input" name="phone" type="tel" autocomplete="tel" maxlength="30" value="' + escapeHtml(formData.phone) + '"' + describedBy("phone", "trust-phone-help") + ariaInvalid("phone") + '><small id="trust-phone-help">We may call or text to schedule your estimate.</small>' + errorText("phone") + '</label><label class="trust-modal__field"><span>Email *</span><input class="trust-modal__input" name="email" type="email" autocomplete="email" maxlength="120" value="' + escapeHtml(formData.email) + '"' + describedBy("email") + ariaInvalid("email") + ">" + errorText("email") + "</label></div>";
    }

    return '<div class="trust-modal__field-grid"><div class="trust-modal__summary" aria-label="Estimate request summary">' +
      summaryRow("ZIP", formData.zipCode || "Not entered", 0) +
      summaryRow("Roof concern", formData.roofNeeds.length ? formData.roofNeeds.join(", ") : "Not selected", 1) +
      summaryRow("Timing", formData.timeline || "Not selected", 2) +
      summaryRow("Contact", formData.name || "Not entered", 3) +
      '</div><label class="trust-modal__field"><span>Anything else we should know?</span><textarea class="trust-modal__input trust-modal__textarea" name="notes" maxlength="1000">' + escapeHtml(formData.notes) + '</textarea></label><label class="trust-modal__field"><span>Attach roof photos</span><input class="trust-modal__input" name="photos" type="file" accept="image/*" multiple><small>Photos are optional, but they help make the follow-up call more specific.</small></label><label class="trust-modal__choice trust-modal__consent" data-selected="' + (formData.consent ? "true" : "false") + '"><input name="consent" type="checkbox" ' + (formData.consent ? "checked " : "") + describedBy("consent") + ariaInvalid("consent") + '><span class="trust-modal__choice-mark" aria-hidden="true"></span><span>I agree that Trust Built Roofing Co. may call, email, or text me about my roofing estimate request.</span></label>' + errorText("consent") + "</div>";
  }

  function summaryRow(label, value, targetStep) {
    return "<div><span>" + escapeHtml(label) + "</span><strong>" + escapeHtml(value) + '</strong><button type="button" data-go-step="' + targetStep + '">Edit</button></div>';
  }

  function renderStatus() {
    if (!status) return "";
    return '<div class="trust-modal__status trust-modal__status--error" aria-live="polite" role="alert"><p>' + escapeHtml(status) + '</p><div><a href="' + trustLeadPhoneHref + '">Call ' + trustLeadPhone + '</a><button type="button" data-clear-status>Try again</button></div></div>';
  }

  function renderErrorList() {
    const messages = Object.values(errors);
    if (messages.length <= 1) return "";
    return '<ul class="trust-modal__errors" aria-live="polite">' + messages.map((message) => "<li>" + escapeHtml(message) + "</li>").join("") + "</ul>";
  }

  function modalHtml() {
    const currentStep = leadFormSteps[step];
    const progress = Math.round(((step + 1) / leadFormSteps.length) * 100);
    const stepList = leadFormSteps.map((item, index) => {
      const state = index === step ? "active" : index < step ? "complete" : "upcoming";
      return '<li data-state="' + state + '"><span>' + (index + 1) + "</span>" + escapeHtml(item.label) + "</li>";
    }).join("");

    if (success) {
      return '<div class="trust-modal" role="dialog" aria-modal="true" aria-labelledby="trust-lead-form-title" aria-describedby="trust-lead-form-description"><div class="trust-modal__panel"><aside class="trust-modal__rail" aria-label="Estimate request details"><p class="trust-modal__eyebrow">Free roof estimate</p><h2 id="trust-lead-form-title">Check roof estimate eligibility</h2><p id="trust-lead-form-description">Confirm your ZIP and roof needs in about 60 seconds. No obligation.</p><ul class="trust-modal__trust-list"><li>South Louisiana and Mississippi</li><li>Photo-informed estimate requests</li><li>Repair, replacement, and storm damage</li></ul><ol class="trust-modal__step-list" aria-label="Estimate request steps">' + stepList + '</ol><a class="trust-modal__phone" href="' + trustLeadPhoneHref + '">Call ' + trustLeadPhone + '</a></aside><div class="trust-modal__body"><button class="trust-modal__close" type="button" aria-label="Close estimate form">' + closeIcon() + '</button><div class="trust-modal__success" role="status" aria-live="polite"><p class="trust-modal__eyebrow">Request sent</p><h3>Thanks, your request is on its way.</h3><p>A Trust Built Roofing Co. specialist will reach out shortly about your roof estimate. Prefer to talk now? Give us a call.</p><div class="trust-modal__success-actions"><a class="trust-modal__primary-link" href="' + trustLeadPhoneHref + '">Call ' + trustLeadPhone + '</a><button class="trust-modal__secondary" type="button" data-close-modal>Close</button></div></div></div></div></div>';
    }

    return '<div class="trust-modal" role="dialog" aria-modal="true" aria-labelledby="trust-lead-form-title" aria-describedby="trust-lead-form-description"><div class="trust-modal__panel"><aside class="trust-modal__rail" aria-label="Estimate request details"><p class="trust-modal__eyebrow">Free roof estimate</p><h2 id="trust-lead-form-title">Check roof estimate eligibility</h2><p id="trust-lead-form-description">Confirm your ZIP and roof needs in about 60 seconds. No obligation.</p><ul class="trust-modal__trust-list"><li>South Louisiana and Mississippi</li><li>Photo-informed estimate requests</li><li>Repair, replacement, and storm damage</li></ul><ol class="trust-modal__step-list" aria-label="Estimate request steps">' + stepList + '</ol><a class="trust-modal__phone" href="' + trustLeadPhoneHref + '">Call ' + trustLeadPhone + '</a></aside><div class="trust-modal__body"><button class="trust-modal__close" type="button" aria-label="Close estimate form">' + closeIcon() + '</button><form class="trust-modal__form" novalidate><label class="trust-modal__honeypot" aria-hidden="true"><span>Website</span><input autocomplete="off" tabindex="-1" type="text" name="website" value="' + escapeHtml(formData.website) + '"></label><div class="trust-modal__progress" aria-label="Step ' + (step + 1) + " of " + leadFormSteps.length + '"><div><span>' + (step + 1) + " of " + leadFormSteps.length + "</span><strong>" + escapeHtml(currentStep.label) + '</strong></div><div class="trust-modal__progress-track" aria-hidden="true"><span style="transform: scaleX(' + (progress / 100) + ')"></span></div></div><div class="trust-modal__step-copy"><h3>' + escapeHtml(currentStep.title) + "</h3><p>" + escapeHtml(currentStep.description) + "</p></div>" + renderStepFields() + renderErrorList() + renderStatus() + '<div class="trust-modal__footer"><p>Free estimate. No obligation.</p><div class="trust-modal__actions">' + (step > 0 ? '<button class="trust-modal__secondary" type="button" data-back>Back</button>' : "") + '<button class="trust-modal__primary" type="submit"' + (submitting ? " disabled aria-busy=\"true\"" : "") + ">" + escapeHtml(submitting ? "Sending..." : (step === leadFormSteps.length - 1 ? "Send Estimate Request" : currentStep.cta)) + "</button></div></div></form></div></div></div>";
  }

  function closeIcon() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
  }

  function openModal() {
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalOpen = true;
    success = false;
    submitting = false;
    status = "";
    errors = {};
    step = 0;
    formData = createInitialLeadFormData();
    focusModalNext = true;
    document.body.style.overflow = "hidden";
    renderModal();
  }

  function closeModal() {
    modalOpen = false;
    root.innerHTML = "";
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function renderModal() {
    if (!modalOpen) return;
    root.innerHTML = modalHtml();
    if (focusModalNext) {
      focusModalNext = false;
      const target = root.querySelector(".trust-modal__step-copy h3, .trust-modal__success h3");
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus();
      }
    }
  }

  function encodeForm(data) {
    return Object.keys(data)
      .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  }

  async function submitToNetlify() {
    const body = {
      "form-name": TRUST_NETLIFY_FORM,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      zipCode: formData.zipCode,
      homeowner: formData.homeowner,
      roofNeeds: formData.roofNeeds.join(", "),
      roofType: formData.roofType,
      timeline: formData.timeline,
      notes: formData.notes,
      consent: formData.consent ? "Yes" : "No",
      "bot-field": formData.website || ""
    };
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeForm(body)
    });
    return response.ok;
  }

  async function submitLeadForm() {
    if (submitting) return;
    const currentErrors = validateStep(step);
    if (Object.keys(currentErrors).length > 0) {
      errors = currentErrors;
      status = "";
      renderModal();
      return;
    }
    if (step < leadFormSteps.length - 1) {
      step += 1;
      errors = {};
      status = "";
      focusModalNext = true;
      renderModal();
      return;
    }
    const allErrors = validateAll();
    if (Object.keys(allErrors).length > 0) {
      errors = allErrors;
      const nextStep = firstErrorStep(allErrors);
      if (nextStep >= 0) step = nextStep;
      renderModal();
      return;
    }
    // Honeypot: a filled hidden field means a bot. Show success, send nothing.
    if (formData.website) {
      success = true;
      renderModal();
      return;
    }
    if (!TRUST_GHL_WEBHOOK_URL) {
      // Fallback path: Netlify Forms (works once deployed on Netlify).
      submitting = true;
      errors = {};
      status = "";
      renderModal();
      try {
        const ok = await submitToNetlify();
        submitting = false;
        if (ok) {
          success = true;
          focusModalNext = true;
        } else {
          status = "We could not send your request just now. Please call us and we will take it directly. Your details are safe.";
        }
        renderModal();
      } catch {
        submitting = false;
        status = "We could not send your request just now. Please call us and we will take it directly. Your details are safe.";
        renderModal();
      }
      return;
    }
    submitting = true;
    errors = {};
    status = "";
    renderModal();
    try {
      const photoInput = root.querySelector('input[name="photos"]');
      const photoNames = photoInput && photoInput.files ? Array.from(photoInput.files).map((file) => file.name) : [];
      const payload = {
        source: "trustbuiltroofing.com",
        leadSource: "Website roof estimate form",
        formName: "Trust Built Roofing Co. roof estimate",
        submittedAt: new Date().toISOString(),
        name: formData.name,
        firstName: formData.name.trim().split(/\s+/)[0] || formData.name,
        phone: formData.phone,
        email: formData.email,
        postalCode: formData.zipCode,
        zipCode: formData.zipCode,
        homeowner: formData.homeowner,
        roofNeeds: formData.roofNeeds,
        roofNeedsText: formData.roofNeeds.join(", "),
        roofType: formData.roofType,
        timeline: formData.timeline,
        notes: formData.notes,
        consentToContact: formData.consent,
        roofPhotoNames: photoNames,
        tags: ["website-lead", "roof-estimate", "trust-built-roofing"],
        customData: {
          serviceArea: "South Louisiana and Mississippi",
          consentText: "I agree that Trust Built Roofing Co. may call, email, or text me about my roofing estimate request."
        }
      };
      const response = await fetch(TRUST_GHL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        submitting = false;
        success = true;
        focusModalNext = true;
        renderModal();
      } else {
        throw new Error("Submission rejected");
      }
    } catch {
      submitting = false;
      status = "We could not send your request just now. Please call us and we will take it directly. Your details are safe.";
      renderModal();
    }
  }

  const heroVideo = document.querySelector("[data-hero-video]");
  if (heroVideo) {
    const playlist = (heroVideo.dataset.heroPlaylist || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (playlist.length > 1) {
      heroVideo.loop = false;
      let heroIndex = 0;
      heroVideo.addEventListener("ended", () => {
        heroIndex = (heroIndex + 1) % playlist.length;
        heroVideo.src = playlist[heroIndex];
        heroVideo.play().catch(() => {});
      });
    }
  }

  document.querySelectorAll("[data-open-modal]").forEach((button) => button.addEventListener("click", openModal));

  function updateProjectSlide(nextIndex) {
    beforeAfterIndex = (nextIndex + beforeAfterSlides.length) % beforeAfterSlides.length;
    const currentSlide = beforeAfterSlides[beforeAfterIndex];
    const img = document.querySelector(".trust-before-after img");
    if (img) {
      img.classList.add("is-swapping");
      img.src = currentSlide.image;
      img.alt = currentSlide.alt;
      window.setTimeout(() => img.classList.remove("is-swapping"), 180);
    }
    const label = document.querySelector("[data-project-label]");
    if (label) {
      label.textContent = currentSlide.label;
    }
    document.querySelectorAll("[data-project-slide]").forEach((dot, index) => {
      dot.setAttribute("aria-current", index === beforeAfterIndex ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-before-after]").forEach((button) => {
    button.addEventListener("click", () => {
      updateProjectSlide(beforeAfterIndex + Number(button.dataset.beforeAfter));
    });
  });

  document.querySelectorAll("[data-project-slide]").forEach((button) => {
    button.addEventListener("click", () => {
      updateProjectSlide(Number(button.dataset.projectSlide));
    });
  });

  const revealTargets = document.querySelectorAll(".trust-product-card, .trust-review__card, .trust-feature, .trust-map-block, .trust-before-after, .trust-credentials__list li");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-faq-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.faqIndex);
      activeFaq = activeFaq === index ? -1 : index;
      document.querySelectorAll(".trust-faq-item").forEach((item, itemIndex) => {
        const expanded = activeFaq === itemIndex;
        const body = item.querySelector(".trust-faq-item__body");
        const icon = item.querySelector("svg");
        const itemButton = item.querySelector("button");
        if (body) body.hidden = !expanded;
        if (icon) icon.classList.toggle("is-open", expanded);
        if (itemButton) itemButton.setAttribute("aria-expanded", expanded ? "true" : "false");
      });
    });
  });

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.classList.contains("trust-modal") || target.closest(".trust-modal__close") || target.closest("[data-close-modal]")) {
      closeModal();
      return;
    }

    const primary = target.closest(".trust-modal__primary");
    if (primary) {
      event.preventDefault();
      submitLeadForm();
      return;
    }

    const back = target.closest("[data-back]");
    if (back) {
      step = Math.max(0, step - 1);
      errors = {};
      status = "";
      focusModalNext = true;
      renderModal();
      return;
    }

    const clear = target.closest("[data-clear-status]");
    if (clear) {
      status = "";
      renderModal();
      return;
    }

    const goStep = target.closest("[data-go-step]");
    if (goStep) {
      step = Number(goStep.dataset.goStep);
      errors = {};
      status = "";
      focusModalNext = true;
      renderModal();
    }
  });

  // Store field values WITHOUT re-rendering the modal. Re-rendering on every
  // change rebuilds the DOM mid-interaction, which freezes native <select>
  // pickers on iOS (the "breaks after step 2" bug). Selection styling is shown
  // via CSS :checked, so no re-render is needed here.
  root.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
    if (target.name === "roofNeeds") {
      if (formData.roofNeeds.includes(target.value)) {
        formData.roofNeeds = formData.roofNeeds.filter((item) => item !== target.value);
      } else {
        formData.roofNeeds = formData.roofNeeds.concat(target.value);
      }
      delete errors.roofNeeds;
      status = "";
      return;
    }
    if (target.name === "consent") {
      formData.consent = target.checked;
      delete errors.consent;
      status = "";
      return;
    }
    if (target instanceof HTMLInputElement && target.type === "file") return;
    if (target.name) {
      formData[target.name] = target.value;
      delete errors[target.name];
      status = "";
    }
  });

  root.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (target.name && target.type !== "checkbox" && target.type !== "radio") {
      formData[target.name] = target.value;
      delete errors[target.name];
    }
  });

  root.addEventListener("submit", (event) => {
    event.preventDefault();
    submitLeadForm();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalOpen) closeModal();
  });
})();
