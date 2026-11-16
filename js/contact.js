/* ===================================================
   contact.js – Contact Form Validation
   COS 106 Term Project | Abdulsamad Taiwo
   ===================================================
   Demonstrates:
   ✓ Form validation (empty check, email regex, phone digits)
   ✓ Event handling
   ✓ DOM manipulation
   ✓ Dynamic error/success feedback
   =================================================== */

// ── Validation helpers ──

/**
 * Check if a string is empty (after trimming whitespace)
 * @param {string} value
 * @returns {boolean}
 */
function isEmpty(value) {
  return value.trim() === '';
}

/**
 * Validate an email address using regex
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate a phone number – must contain only digits and be at least 7 chars
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  var phoneRegex = /^\d{7,15}$/;
  return phoneRegex.test(phone.trim().replace(/\s+/g, ''));
}

// ── Show an error on a field ──
function showError(inputId, errorId, message) {
  var input = document.getElementById(inputId);
  var error = document.getElementById(errorId);
  if (!input || !error) return;

  input.style.borderColor = 'var(--danger)';
  input.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.15)';

  if (message) error.textContent = message;
  error.classList.add('visible');
}

// ── Clear an error on a field ──
function clearError(inputId, errorId) {
  var input = document.getElementById(inputId);
  var error = document.getElementById(errorId);
  if (!input || !error) return;

  input.style.borderColor = '';
  input.style.boxShadow   = '';
  error.classList.remove('visible');
}

// ── Mark a field as valid ──
function showSuccess(inputId) {
  var input = document.getElementById(inputId);
  if (!input) return;
  input.style.borderColor = 'var(--success)';
  input.style.boxShadow   = '0 0 0 3px rgba(34,197,94,0.1)';
}

// ── Validate all fields and return true if valid ──
function validateContactForm() {
  var name    = document.getElementById('contactName').value;
  var email   = document.getElementById('contactEmail').value;
  var phone   = document.getElementById('contactPhone').value;
  var message = document.getElementById('contactMessage').value;
  var valid   = true;

  // Clear all errors first
  var fields = [
    { input: 'contactName',    error: 'nameError' },
    { input: 'contactEmail',   error: 'emailError' },
    { input: 'contactPhone',   error: 'phoneError' },
    { input: 'contactMessage', error: 'messageError' }
  ];
  fields.forEach(function(f) { clearError(f.input, f.error); });

  // ── Validate Name ──
  if (isEmpty(name)) {
    showError('contactName', 'nameError', 'Please enter your full name.');
    valid = false;
  } else if (name.trim().length < 2) {
    showError('contactName', 'nameError', 'Name must be at least 2 characters.');
    valid = false;
  } else {
    showSuccess('contactName');
  }

  // ── Validate Email ──
  if (isEmpty(email)) {
    showError('contactEmail', 'emailError', 'Please enter your email address.');
    valid = false;
  } else if (!isValidEmail(email)) {
    showError('contactEmail', 'emailError', 'Please enter a valid email (e.g. name@example.com).');
    valid = false;
  } else {
    showSuccess('contactEmail');
  }

  // ── Validate Phone ──
  if (isEmpty(phone)) {
    showError('contactPhone', 'phoneError', 'Please enter your phone number.');
    valid = false;
  } else if (!isValidPhone(phone)) {
    showError('contactPhone', 'phoneError', 'Phone must contain digits only (7–15 digits).');
    valid = false;
  } else {
    showSuccess('contactPhone');
  }

  // ── Validate Message ──
  if (isEmpty(message)) {
    showError('contactMessage', 'messageError', 'Please enter your message.');
    valid = false;
  } else if (message.trim().length < 10) {
    showError('contactMessage', 'messageError', 'Message is too short (min. 10 characters).');
    valid = false;
  } else {
    showSuccess('contactMessage');
  }

  return valid;
}

// ── Show success state ──
function showFormSuccess() {
  var form    = document.getElementById('contactForm');
  var success = document.getElementById('formSuccess');
  if (!form || !success) return;

  form.style.display    = 'none';
  success.style.display = 'block';
}

// ── Reset to form state ──
function resetToForm() {
  var form    = document.getElementById('contactForm');
  var success = document.getElementById('formSuccess');
  if (!form || !success) return;

  form.style.display    = 'block';
  success.style.display = 'none';

  // Clear all visual states
  var inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(function(input) {
    input.value = '';
    input.style.borderColor = '';
    input.style.boxShadow = '';
  });

  var errors = form.querySelectorAll('.form-error');
  errors.forEach(function(e) { e.classList.remove('visible'); });
}

// ── Real-time input validation ──
function initRealTimeValidation() {
  var config = [
    { id: 'contactName',    errorId: 'nameError' },
    { id: 'contactEmail',   errorId: 'emailError' },
    { id: 'contactPhone',   errorId: 'phoneError' },
    { id: 'contactMessage', errorId: 'messageError' }
  ];

  config.forEach(function(field) {
    var input = document.getElementById(field.id);
    if (!input) return;

    input.addEventListener('input', function() {
      // Once a field is showing an error, re-check it on every keystroke so the
      // error clears as soon as the value is valid. Clearing it only on blur moved
      // the Send button just as it was being clicked, and the click was lost.
      var errorEl = document.getElementById(field.errorId);
      if (errorEl && errorEl.classList.contains('visible')) {
        validateField(field.id, field.errorId);
        return;
      }

      // Only validate if field has been touched
      var value = input.value;
      if (!value) {
        clearError(field.id, field.errorId);
        return;
      }

      if (field.id === 'contactEmail' && value.length > 3) {
        if (isValidEmail(value)) {
          clearError(field.id, field.errorId);
          showSuccess(field.id);
        }
      } else if (field.id === 'contactPhone' && value.length > 0) {
        if (isValidPhone(value)) {
          clearError(field.id, field.errorId);
          showSuccess(field.id);
        }
      }
    });

    input.addEventListener('blur', function() {
      // Full validation on blur
      validateField(field.id, field.errorId);
    });
  });
}

// ── Validate a single field ──
function validateField(inputId, errorId) {
  var input = document.getElementById(inputId);
  if (!input) return;
  var value = input.value;

  if (inputId === 'contactName') {
    if (isEmpty(value)) { showError(inputId, errorId, 'Name is required.'); return; }
    if (value.trim().length < 2) { showError(inputId, errorId, 'Name must be at least 2 characters.'); return; }
    clearError(inputId, errorId);
    showSuccess(inputId);
  }

  if (inputId === 'contactEmail') {
    if (isEmpty(value)) { showError(inputId, errorId, 'Email is required.'); return; }
    if (!isValidEmail(value)) { showError(inputId, errorId, 'Enter a valid email address.'); return; }
    clearError(inputId, errorId);
    showSuccess(inputId);
  }

  if (inputId === 'contactPhone') {
    if (isEmpty(value)) { showError(inputId, errorId, 'Phone number is required.'); return; }
    if (!isValidPhone(value)) { showError(inputId, errorId, 'Digits only, 7–15 characters.'); return; }
    clearError(inputId, errorId);
    showSuccess(inputId);
  }

  if (inputId === 'contactMessage') {
    if (isEmpty(value)) { showError(inputId, errorId, 'Message is required.'); return; }
    if (value.trim().length < 10) { showError(inputId, errorId, 'Message is too short.'); return; }
    clearError(inputId, errorId);
    showSuccess(inputId);
  }
}

// ── Initialise contact form ──
(function initContactForm() {
  var form = document.getElementById('contactForm');
  var sendAnotherBtn = document.getElementById('sendAnotherBtn');

  if (!form) return;

  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (!validateContactForm()) return;

    // Open the visitor's email app with the message filled in.
    // There is no server behind this form, so the email app does the sending.
    var name    = document.getElementById('contactName').value.trim();
    var email   = document.getElementById('contactEmail').value.trim();
    var phone   = document.getElementById('contactPhone').value.trim();
    var subject = document.getElementById('contactSubject').value.trim();
    var message = document.getElementById('contactMessage').value.trim();

    var body = message + '\n\n' + name + '\n' + email + '\n' + phone;
    window.location.href = 'mailto:abdulsamadtaiwo@miva.edu.ng' +
      '?subject=' + encodeURIComponent(subject || ('Portfolio message from ' + name)) +
      '&body=' + encodeURIComponent(body);

    showFormSuccess();
  });

  // "Send Another" button
  if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener('click', resetToForm);
  }

  // Real-time validation
  initRealTimeValidation();
})();
