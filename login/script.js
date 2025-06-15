function checkLogin() {
  const password = document.getElementById("password").value;

  if (password === CONFIG.correctPassword) {
    document.getElementById("error-message").style.color = "green";
    document.getElementById("error-message").textContent = "Berhasil Login ✅";

    setTimeout(() => {
      window.location.href = "Akses"; // redirect ke folder Akses
    }, 1000);

  } else {
    document.getElementById("error-message").style.color = "red";
    document.getElementById("error-message").textContent = "Password Salah ❌ , Tolong Minta Akses Ke Developer t.me/zuraasukalc";
  }
}
