document.addEventListener("DOMContentLoaded", function () {

  const API = 'http://localhost:3000';

  // Elements
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginMessage = document.getElementById("loginMessage");
  const registerMessage = document.getElementById("registerMessage");
  const goToRegister = document.getElementById("goToRegister");
  const goToLogin = document.getElementById("goToLogin");

  // =====================
  // TAB SWITCHING
  // =====================
  function showLogin() {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
  }

  function showRegister() {
    registerForm.style.display = "block";
    loginForm.style.display = "none";
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
  }

  loginTab.addEventListener("click", showLogin);
  registerTab.addEventListener("click", showRegister);
  goToRegister.addEventListener("click", function (e) {
    e.preventDefault();
    showRegister();
  });
  goToLogin.addEventListener("click", function (e) {
    e.preventDefault();
    showLogin();
  });

  // =====================
  // AUTO FILL REMEMBERED USER
  // =====================
  const rememberedUser = JSON.parse(localStorage.getItem("rememberedUser"));
  if (rememberedUser) {
    document.getElementById("loginEmail").value = rememberedUser.email || "";
    document.getElementById("rememberMe").checked = true;
  }

  // =====================
  // LOGIN
  // =====================
  document.getElementById("loginBtn").addEventListener("click", async function () {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const remember = document.getElementById("rememberMe").checked;

    if (!email || !password) {
      showMsg(loginMessage, "Please fill in all fields", "error");
      return;
    }

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({ name: data.name, email }));

        if (remember) {
          localStorage.setItem("rememberedUser", JSON.stringify({ email }));
        } else {
          localStorage.removeItem("rememberedUser");
        }

        showMsg(loginMessage, "Login Successful! Redirecting...", "success");
        setTimeout(() => window.location.href = "a.mstarts.html", 1500);

      } else {
        showMsg(loginMessage, data.message || "Invalid email or password", "error");
      }

    } catch (err) {
      showMsg(loginMessage, "Server not reachable. Start your backend!", "error");
      console.error("Login error:", err);
    }
  });

  // =====================
  // REGISTER
  // =====================
  document.getElementById("registerBtn").addEventListener("click", async function () {
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!name || !email || !password) {
      showMsg(registerMessage, "Please fill in all fields", "error");
      return;
    }

    if (password.length < 6) {
      showMsg(registerMessage, "Password must be at least 6 characters", "error");
      return;
    }

    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (data.message === "Account created successfully!") {
        showMsg(registerMessage, "Account created! Redirecting...", "success");
        localStorage.setItem("user", JSON.stringify({ name, email }));
        setTimeout(() => window.location.href = "a.mstarts.html", 1500);
      } else {
        showMsg(registerMessage, data.message || "Registration failed", "error");
      }

    } catch (err) {
      showMsg(registerMessage, "Server not reachable. Start your backend!", "error");
      console.error("Register error:", err);
    }
  });

  // =====================
  // LOGIN ON ENTER KEY
  // =====================
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      if (loginForm.style.display !== "none") {
        document.getElementById("loginBtn").click();
      } else {
        document.getElementById("registerBtn").click();
      }
    }
  });

  // =====================
  // HELPER
  // =====================
  function showMsg(el, text, type) {
    el.textContent = text;
    el.className = "form-msg " + type;
    setTimeout(() => {
      el.textContent = "";
      el.className = "form-msg";
    }, 4000);
  }

});