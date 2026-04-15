document.addEventListener("DOMContentLoaded", function () {

  const API = 'http://localhost:3000';

  // Temp store for registration data before OTP verify
  let pendingUser = null;
  let countdownTimer = null;

  // =====================
  // ELEMENTS
  // =====================
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const otpForm = document.getElementById("otpForm");
  const loginMessage = document.getElementById("loginMessage");
  const registerMessage = document.getElementById("registerMessage");
  const otpMessage = document.getElementById("otpMessage");

  // =====================
  // TAB SWITCHING
  // =====================
  function showLogin() {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    otpForm.style.display = "none";
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
  }

  function showRegister() {
    registerForm.style.display = "block";
    loginForm.style.display = "none";
    otpForm.style.display = "none";
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
  }

  function showOtp() {
    otpForm.style.display = "block";
    loginForm.style.display = "none";
    registerForm.style.display = "none";
    document.getElementById("otpSubText").textContent =
      `Enter the 6-digit code sent to ${pendingUser?.email}`;
    startCountdown(60);
    // Focus first OTP box
    document.querySelector(".otp-input").focus();
  }

  loginTab.addEventListener("click", showLogin);
  registerTab.addEventListener("click", showRegister);
  document.getElementById("goToRegister").addEventListener("click", (e) => { e.preventDefault(); showRegister(); });
  document.getElementById("goToLogin").addEventListener("click", (e) => { e.preventDefault(); showLogin(); });
  document.getElementById("backToRegister").addEventListener("click", (e) => { e.preventDefault(); showRegister(); });

  // =====================
  // AUTO FILL REMEMBERED USER
  // =====================
  const rememberedUser = JSON.parse(localStorage.getItem("rememberedUser"));
  if (rememberedUser) {
    document.getElementById("loginEmail").value = rememberedUser.email || "";
    document.getElementById("rememberMe").checked = true;
  }

  // =====================
  // SHOW / HIDE PASSWORD
  // =====================
  function setupPasswordToggle(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    btn.addEventListener("click", function () {
      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
      } else {
        input.type = "password";
        btn.textContent = "👁";
      }
    });
  }

  setupPasswordToggle("loginPassword", "toggleLoginPassword");
  setupPasswordToggle("registerPassword", "toggleRegisterPassword");

  // =====================
  // OTP BOX NAVIGATION
  // =====================
  const otpInputs = document.querySelectorAll(".otp-input");

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, '');
      if (this.value.length === 1) {
        this.classList.add("filled");
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      } else {
        this.classList.remove("filled");
      }
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !this.value && index > 0) {
        otpInputs[index - 1].focus();
        otpInputs[index - 1].value = "";
        otpInputs[index - 1].classList.remove("filled");
      }
    });
  });

  function getOtpValue() {
    return Array.from(otpInputs).map(i => i.value).join('');
  }

  function clearOtpBoxes() {
    otpInputs.forEach(i => {
      i.value = "";
      i.classList.remove("filled");
    });
  }

  // =====================
  // COUNTDOWN TIMER
  // =====================
  function startCountdown(seconds) {
    const countdownText = document.getElementById("countdownText");
    const resendLink = document.getElementById("resendOtp");

    resendLink.style.display = "none";
    countdownText.style.display = "inline";

    let remaining = seconds;
    clearInterval(countdownTimer);

    countdownTimer = setInterval(() => {
      countdownText.textContent = `Resend code in ${remaining}s`;
      remaining--;

      if (remaining < 0) {
        clearInterval(countdownTimer);
        countdownText.style.display = "none";
        resendLink.style.display = "inline";
      }
    }, 1000);
  }

  // =====================
  // REGISTER — SEND OTP
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

    this.disabled = true;
    this.textContent = "Sending code...";

    try {
      const res = await fetch(`${API}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name })
      });

      const data = await res.json();

      if (res.ok) {
        pendingUser = { name, email, password };
        showOtp();
      } else {
        showMsg(registerMessage, data.message || "Failed to send OTP", "error");
      }

    } catch (err) {
      showMsg(registerMessage, "Server not reachable. Start your backend!", "error");
      console.error(err);
    }

    this.disabled = false;
    this.textContent = "Send Verification Code →";
  });

  // =====================
  // RESEND OTP
  // =====================
  document.getElementById("resendOtp").addEventListener("click", async function (e) {
    e.preventDefault();
    if (!pendingUser) return;

    try {
      await fetch(`${API}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingUser.email, name: pendingUser.name })
      });
      clearOtpBoxes();
      startCountdown(60);
      showMsg(otpMessage, "New code sent!", "success");
    } catch (err) {
      showMsg(otpMessage, "Failed to resend. Try again.", "error");
    }
  });

  // =====================
  // VERIFY OTP & CREATE ACCOUNT
  // =====================
  document.getElementById("verifyOtpBtn").addEventListener("click", async function () {
    const otp = getOtpValue();

    if (otp.length < 6) {
      showMsg(otpMessage, "Please enter all 6 digits", "error");
      return;
    }

    if (!pendingUser) {
      showMsg(otpMessage, "Session expired. Please register again.", "error");
      showRegister();
      return;
    }

    this.disabled = true;
    this.textContent = "Verifying...";

    try {
      // Verify OTP
      const verifyRes = await fetch(`${API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingUser.email, otp })
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        showMsg(otpMessage, verifyData.message || "Invalid OTP", "error");
        this.disabled = false;
        this.textContent = "Verify & Create Account →";
        return;
      }

      // OTP verified — now create account
      const signupRes = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingUser)
      });

      const signupData = await signupRes.json();

      if (signupData.message === "Account created successfully!") {
        localStorage.setItem("user", JSON.stringify({ name: pendingUser.name, email: pendingUser.email }));
        showMsg(otpMessage, "Account created! Redirecting...", "success");
        clearInterval(countdownTimer);
        setTimeout(() => window.location.href = "a.mstarts.html", 1500);
      } else {
        showMsg(otpMessage, signupData.message || "Registration failed", "error");
      }

    } catch (err) {
      showMsg(otpMessage, "Server not reachable.", "error");
      console.error(err);
    }

    this.disabled = false;
    this.textContent = "Verify & Create Account →";
  });

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

    this.disabled = true;
    this.textContent = "Logging in...";

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
      console.error(err);
    }

    this.disabled = false;
    this.textContent = "Login →";
  });

  // =====================
  // ENTER KEY SUPPORT
  // =====================
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      if (loginForm.style.display !== "none") {
        document.getElementById("loginBtn").click();
      } else if (registerForm.style.display !== "none") {
        document.getElementById("registerBtn").click();
      } else if (otpForm.style.display !== "none") {
        document.getElementById("verifyOtpBtn").click();
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
    }, 5000);
  }

});