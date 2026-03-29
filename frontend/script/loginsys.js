document.addEventListener( "DOMContentLoaded", function () {
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

// Toggle Forms
loginBtn.addEventListener("click", function ()  {
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
});

registerBtn.addEventListener("click", function () {
    registerForm.classList.add("active");
    loginForm.classList.remove("active");
  });
});

// REGISTER USER
registerForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  const user = {
    name,
    email,
    password
  };

  localStorage.setItem("user", JSON.stringify(user));
  registerMessage.textContent = "Registration Successful!";
  registerForm.reset();

   // Make message disappear after 3 seconds
  setTimeout(function() {
    registerMessage.textContent = "";
  }, 2000);

  // Redirect after 3 seconds
  setTimeout(function(){
    window.location.href = "a.mstarts.html";
  }, 3000);

});

// LOGIN USER
loginForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const remember = document.getElementById("rememberMe").checked;

  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (storedUser && storedUser.email === email && storedUser.password === password) {
    loginMessage.style.color = "green";
    loginMessage.textContent = "Login Successful!";
    loginForm.reset();

     // Make message disappear after 3 seconds
  setTimeout(function() {
    loginMessage.textContent = "";
  }, 2000);

  // Redirect after 3 seconds
  setTimeout(function(){
    window.location.href = "a.mstarts.html";
  }, 3000);

    if (remember) {
      localStorage.setItem("rememberedUser", JSON.stringify(storedUser));
    } else {
      localStorage.removeItem("rememberedUser");
    }

  } else {
    loginMessage.style.color = "red";
    loginMessage.textContent = "Invalid email or password";
    // Make message disappear after 3 seconds
  setTimeout(function() {
    loginMessage.textContent = "";
  }, 2000);
  }
});

// AUTO FILL IF REMEMBERED
window.onload = function() {
  const rememberedUser = JSON.parse(localStorage.getItem("rememberedUser"));

  if (rememberedUser) {
    document.getElementById("loginEmail").value = rememberedUser.email;
    document.getElementById("loginPassword").value = rememberedUser.password;
    document.getElementById("rememberMe").checked = true;
  }
};