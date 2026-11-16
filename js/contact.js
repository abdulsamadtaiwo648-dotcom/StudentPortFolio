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

    // Simulate sending (loading state)
    var submitBtn = document.getElementById('submitContactBtn');
    submitBtn.disabled  = true;
    submitBtn.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" style="animation:spin 1s linear infinite;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Sending...
    `;

    // Simulate network delay then show success
    setTimeout(function() {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        Send Message
      `;
      showFormSuccess();
    }, 1500);
  });

  // "Send Another" button
  if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener('click', resetToForm);
  }

  // Real-time validation
  initRealTimeValidation();
})();
