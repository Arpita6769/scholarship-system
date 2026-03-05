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

  if (result.role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "student.html";
  }
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

const createForm = document.getElementById("createScholarshipForm");

if (createForm) {
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      amount: document.getElementById("amount").value,
      min_cgpa: document.getElementById("min_cgpa").value,
      max_income: document.getElementById("max_income").value,
      total_seats: document.getElementById("seats").value,
      deadline : document.getElementById("deadline").value,
    };

    const res = await fetch("/api/auth/create-scholarship", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    alert(result.message);
    location.reload();
  });
}

const applicationsList = document.getElementById("applicationsList");

if (applicationsList) {
  fetch("/api/auth/applications", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => res.json())
    .then(data => {
      applicationsList.innerHTML = "";

      if (data.length === 0) {
        applicationsList.innerHTML = "<p>No applications yet.</p>";
        return;
      }

      data.forEach(app => {
        const div = document.createElement("div");
        div.innerHTML = `
          <h3>${app.student_name}</h3>
          <p>Scholarship: ${app.title}</p>
          <p>Status: <strong>${app.status}</strong></p>
          <button onclick="approveApplication(${app.id})">
            Approve
          </button>
          <hr/>
        `;
        applicationsList.appendChild(div);
      });
    });
}