/* Contact form: client-side validation (using the original site's messages)
   and submission. See js/config.js for how submission is delivered. */
(function () {
  "use strict";

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  var settings = (window.JK_CONFIG && window.JK_CONFIG.form) || {};
  var errorBox = form.querySelector(".form-message--error");
  var successBox = form.querySelector(".form-message--success");
  var submitBtn = form.querySelector("button[type=submit]");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var MSG_REQUIRED = "This field is required.";
  var MSG_EMAIL = "Enter a valid email address.";

  function setError(field, message) {
    var wrap = field.closest(".field");
    var out = wrap.querySelector(".field__error");
    if (message) {
      wrap.classList.add("has-error");
      field.setAttribute("aria-invalid", "true");
      out.textContent = message;
    } else {
      wrap.classList.remove("has-error");
      field.removeAttribute("aria-invalid");
      out.textContent = "";
    }
  }

  function validateField(field) {
    var value = field.value.trim();
    if (field.required && !value) {
      setError(field, MSG_REQUIRED);
      return false;
    }
    if (field.type === "email" && value && !EMAIL_RE.test(value)) {
      setError(field, MSG_EMAIL);
      return false;
    }
    setError(field, "");
    return true;
  }

  var fields = Array.prototype.slice.call(form.querySelectorAll(".field__input"));
  fields.forEach(function (field) {
    field.addEventListener("blur", function () {
      if (field.value.trim() || field.closest(".field").classList.contains("has-error")) validateField(field);
    });
    field.addEventListener("input", function () {
      if (field.closest(".field").classList.contains("has-error")) validateField(field);
    });
  });

  function show(box, visible) { if (box) box.classList.toggle("is-visible", visible); }

  function value(name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : "";
  }

  function openMailClient() {
    var subject = value("subject");
    var body = "Name: " + value("name") + "\nEmail: " + value("email") + "\n\n" + value("message");
    window.location.href = "mailto:" + (settings.email || "info@jkinteriors.in") +
      "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    show(errorBox, false);
    show(successBox, false);

    var firstInvalid = null;
    fields.forEach(function (f) {
      if (!validateField(f) && !firstInvalid) firstInvalid = f;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Honeypot: bots fill hidden fields, people don't.
    var trap = form.querySelector('[name="company_website"]');
    if (trap && trap.value) return;

    if (!settings.endpoint) {
      openMailClient();
      return;
    }

    submitBtn.disabled = true;
    fetch(settings.endpoint, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        if (successBox) {
          successBox.textContent = settings.successMessage || "";
          show(successBox, !!settings.successMessage);
        }
      })
      .catch(function () {
        show(errorBox, true);
      })
      .then(function () {
        submitBtn.disabled = false;
      });
  });
})();
