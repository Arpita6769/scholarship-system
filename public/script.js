if (window.location.pathname.includes("student.html")) {
  if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
  }
}
// REGISTER
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      roll_no: document.getElementById("roll_no").value,
      cgpa: document.getElementById("cgpa").value,
      family_income: document.getElementById("family_income").value,
    };

    const res = await fetch("api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (res.ok) {
  alert("Registration successful 🎉 Please login.");
  window.location.href = "login.html";
} else {
  alert(result.message);
}
  });
}
console.log("Register button clicked");
// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value,
    };

    const res = await fetch("api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.token) {
      localStorage.setItem("token", result.token);
      alert("Login successful 🎉");
      window.location.href = "student.html";
    } else {
      alert(result.message);
    }
  });
}
// LOAD SCHOLARSHIPS
const scholarshipList = document.getElementById("scholarshipList");

if (scholarshipList) {
  fetch("/api/auth/scholarships", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => res.json())
    .then(data => {
      scholarshipList.innerHTML = "";

      data.forEach(sch => {
        const div = document.createElement("div");
        div.innerHTML = `
          <h3>${sch.title}</h3>
          <p>${sch.description}</p>
          <p>Amount: ${sch.amount}</p>
          <button onclick="applyScholarship(${sch.id})">
            Apply
          </button>
          <hr/>
        `;
        scholarshipList.appendChild(div);
      });
    });
}
function applyScholarship(id) {
  fetch(`/api/auth/apply/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      location.reload();
    });
}

// LOAD MY APPLICATIONS
const myApplicationsDiv = document.getElementById("myApplications");

if (myApplicationsDiv) {
  fetch("/api/auth/my-applications", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => res.json())
    .then(data => {
      myApplicationsDiv.innerHTML = "";

      if (data.length === 0) {
        myApplicationsDiv.innerHTML = "<p>No applications yet.</p>";
        return;
      }

      data.forEach(app => {
        const div = document.createElement("div");
        div.innerHTML = `
          <h3>${app.title}</h3>
          <p>Status: <strong>${app.status}</strong></p>
          <p>Applied At: ${new Date(app.applied_at).toLocaleDateString()}</p>
          <hr/>
        `;
        myApplicationsDiv.appendChild(div);
      });
    });
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
}