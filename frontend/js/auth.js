const loginForm = document.getElementById("login-form");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const loginError = document.getElementById("login-error");

const validEmail = "admin@tindatrack.com";
const validPassword = "admin123";

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  clearErrors();

  let hasError = false;

  if (email === "") {
    showFieldError(emailInput, emailError, "Email address is required");
    hasError = true;
  }

  if (password === "") {
    showFieldError(passwordInput, passwordError, "Password is required");
    hasError = true;
  }

  if (hasError) {
    return;
  }

  if (email === validEmail && password === validPassword) {
    window.location.href = "pages/dashboard.html";
  } else {
    loginError.textContent = "Incorrect email or password. Please try again";
  }
});

function showFieldError(inputElement, errorElement, message) {
  inputElement.parentElement.classList.add("has-error");
  errorElement.textContent = message;
}

function clearErrors() {
  emailInput.parentElement.classList.remove("has-error");
  passwordInput.parentElement.classList.remove("has-error");

  emailError.textContent = "";
  passwordError.textContent = "";
  loginError.textContent = "";
}

