const form = document.getElementById("loginForm");
const errorBox = document.getElementById("error");

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = form.email.value.trim();
  const password = form.password.value;

  if (!email || !password) {
    showError("Completa el correo y la contraseña.");
    return;
  }

  const response = await fetch("/api/staff/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    window.location.href = "/staff";
    return;
  }

  const body = await response.json().catch(() => ({}));
  showError(typeof body.detail === "string" ? body.detail : "No se pudo iniciar sesión.");
});
