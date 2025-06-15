const token = "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";
const username = "zura-stpflo";
const repo = "dtbs_number";
const path = "db.json";
const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;

let data = [];

// Fungsi menampilkan notifikasi
function showNotification(message, isSuccess = true) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.backgroundColor = isSuccess ? "#4CAF50" : "#FF5733";
  notification.style.color = "#fff";
  notification.style.padding = "10px";
  notification.style.marginTop = "10px";
  notification.style.borderRadius = "5px";
  notification.style.textAlign = "center";
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Memuat data dari GitHub
async function loadData() {
  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `token ${token}`,
    },
  });

  const result = await response.json();
  const content = atob(result.content);
  data = JSON.parse(content);
  renderTable(data);
}

// Menampilkan data ke tabel
function renderTable(items) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";
  items.forEach((item, index) => {
    const row = `
      <tr>
        <td>${item.nomor}</td>
        <td>${item.status}</td>
        <td>
          <button onclick="deleteNumber('${item.nomor}')" style="background:#e74c3c;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">
            Hapus
          </button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Filter pencarian
document.getElementById("search").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = data.filter(d => d.nomor.includes(keyword));
  renderTable(filtered);
});

// Mendapatkan SHA saat ini (dibutuhkan untuk update GitHub)
async function getCurrentSha() {
  const res = await fetch(apiUrl, {
    headers: {
      Authorization: `token ${token}`,
    },
  });
  const json = await res.json();
  return json.sha;
}

// Fungsi untuk menambahkan data
async function addData() {
  const newNumber = document.getElementById("newNumber").value.trim();

  // Validasi format
  if (!/^628\d{6,14}$/.test(newNumber)) {
    showNotification("⚠️ Perintah salah, masukkan nomor berawalan 628xx", false);
    return;
  }

  // Cek apakah nomor sudah ada
  const exists = data.some(entry => entry.nomor === newNumber);
  if (exists) {
    showNotification("⚠️ Nomor sudah terdaftar", false);
    return;
  }

  // Tambahkan ke data
  data.push({ nomor: newNumber, status: "active" });
  const content = btoa(JSON.stringify(data, null, 2));
  const sha = await getCurrentSha();

  // Update ke GitHub
  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Menambahkan nomor ${newNumber}`,
      content: content,
      sha: sha,
    }),
  });

  if (response.ok) {
    showNotification("✅ Nomor berhasil terdaftar", true);
    document.getElementById("newNumber").value = "";
    loadData();
  } else {
    showNotification("❌ Gagal mendaftarkan nomor", false);
  }
}

async function deleteNumber(nomorToDelete) {
  const confirmed = confirm(`Yakin ingin menghapus nomor ${nomorToDelete}?`);
  if (!confirmed) return;

  // Hapus dari array
  data = data.filter(item => item.nomor !== nomorToDelete);

  // Encode ulang data dan SHA
  const content = btoa(JSON.stringify(data, null, 2));
  const sha = await getCurrentSha();

  // Push update ke GitHub
  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Menghapus nomor ${nomorToDelete}`,
      content: content,
      sha: sha,
    }),
  });

  if (response.ok) {
    showNotification("✅ Nomor berhasil dihapus");
    loadData();
  } else {
    showNotification("❌ Gagal menghapus nomor", false);
  }
}

// Load data saat pertama kali
loadData();
