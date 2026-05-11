const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const fullNameError = document.getElementById("fullName-error");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const loginError = document.getElementById("login-error");
const confirmPasswordError = document.getElementById("confirmPassword-error");

const validEmail = "admin@celsopos.com";
const validPassword = "admin123";

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    clearLoginErrors();

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

    const users = getUsers();

    const registeredUser = users.find(function (user) {
      return user.email === email && user.password === password;
    });
    
    const isDefaultAdmin = email === validEmail && password === validPassword;

    if (registeredUser) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          fullName: registeredUser.fullName,
          email: registeredUser.email
        })
      );
      window.location.href = "pages/dashboard.html";
    
    }else if (isDefaultAdmin) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          fullName: "Admin User",
          email: validEmail
        })
      );
      window.location.href = "pages/dashboard.html";
    
    } else {
      loginError.textContent = "Incorrect email or password. Please try again";
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    clearRegisterErrors();

    let hasError = false;

    if (fullName === "") {
    showFieldError(fullNameInput, fullNameError, "Full name is required");
    hasError = true;
    }

    if (email === "") {
      showFieldError(emailInput, emailError, "Email address is required");
      hasError = true;
    }

    if (password === "") {
      showFieldError(passwordInput, passwordError, "Password is required");
      hasError = true;
    }

    if (confirmPassword === "") {
    showFieldError(confirmPasswordInput, confirmPasswordError, "Password confirmation is required");
    hasError = true;
    }

    if (hasError) {
      return;
    }

    if (!isValidEmail(email)) {
      showFieldError(emailInput, emailError, "Enter a valid email address");
      return;
    }

    if (password.length < 8) {
      showFieldError(passwordInput, passwordError, "Password must be at least 8 characters");
      return;
    }

    if (confirmPassword !== password) {
    showFieldError(confirmPasswordInput, confirmPasswordError, "Passwords do not match");
    return;
    }

    const users = getUsers();

    const emailExists = users.some(function (user) {
      return user.email === email;
    });

    if (emailExists) {
      showFieldError(emailInput, emailError, "This email is already registered");
      return;
    }

    const newUser = {
      fullName: fullName,
      email: email,
      password: password
    };

    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));

    window.location.href = "../../index.html"
  });
}

function getUsers() {
  const users = localStorage.getItem("users");

  if (users === null) {
    return [];
  }

  return JSON.parse(users);
}

function isValidEmail(email) {
  return email.includes("@") && email.includes(".");
}

function showFieldError(inputElement, errorElement, message) {
  inputElement.parentElement.classList.add("has-error");
  errorElement.textContent = message;
}

function clearLoginErrors() {
  emailInput.parentElement.classList.remove("has-error");
  passwordInput.parentElement.classList.remove("has-error");

  emailError.textContent = "";
  passwordError.textContent = "";

  if (loginError) {
    loginError.textContent = "";
  }
}

function clearRegisterErrors() {
  fullNameInput.parentElement.classList.remove("has-error");
  emailInput.parentElement.classList.remove("has-error");
  passwordInput.parentElement.classList.remove("has-error");
  confirmPasswordInput.parentElement.classList.remove("has-error");

  fullNameError.textContent = "";
  emailError.textContent = "";
  passwordError.textContent = "";
  confirmPasswordError.textContent = "";
}

function checkAuth() {
  const currentUser = localStorage.getItem("currentUser");

  if (currentUser === null) {
    window.location.href = "../index.html";
  }
}
