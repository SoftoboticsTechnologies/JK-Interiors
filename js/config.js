/*
 * Site configuration — edit these values; no other code changes are needed.
 *
 * social: the original website shows Facebook / Twitter / YouTube / Instagram /
 *   LinkedIn buttons but none of them link anywhere (their href is "#" or empty).
 *   Paste a full profile URL to turn the matching icon into a working link.
 *   Icons with an empty URL are shown as non-clickable labels.
 *
 * form: the original contact form posts to a WordPress plugin (SureForms) that
 *   cannot be called from a static site. Set `endpoint` to a form-handling service
 *   URL (e.g. Formspree, Getform, Basin, or your own server) that accepts a POST of
 *   multipart/form-data. When `endpoint` is empty, the form opens the visitor's
 *   email app with the message pre-filled, addressed to `email`.
 */
window.JK_CONFIG = {
  social: {
    facebook: "",
    twitter: "",
    youtube: "",
    instagram: "",
    linkedin: ""
  },
  form: {
    endpoint: "",
    email: "info@jkinteriors.in",
    // Shown after a successful endpoint submission. Set the wording you prefer.
    successMessage: "Thank you! Your message has been sent."
  }
};
