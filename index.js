// Navbar Load & Auth

function loadNavbar() {
  return fetch("navbar.html")
    .then(res => res.text())
    .then(data => {
      const navbarDiv = document.getElementById("navbar");
      if (!navbarDiv) return; 
      navbarDiv.innerHTML = data;

      const navbarAuth = document.getElementById("navbarAuth");
      if (!navbarAuth) return;

      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      if (currentUser) {
        const dashboardLink = currentUser.role === "admin"
          ? "admin-dashboard.html"
          : "user-dashboard.html";

        navbarAuth.innerHTML = `
          <div class="dropdown">
            <a class="btn dropdown-toggle" href="#" role="button" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="images/profile-icon.png" alt="Profile" width="30" height="30" class="rounded-circle">
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
              <li><a class="dropdown-item" href="${dashboardLink}">Dashboard</a></li>
              <li><a class="dropdown-item" href="#" id="logoutBtn">Logout</a></li>
            </ul>
          </div>
        `;

        const logoutBtn = document.getElementById("logoutBtn");
        logoutBtn?.addEventListener("click", () => {
          localStorage.removeItem("currentUser");
          window.location.reload();
        });

      } else {
        navbarAuth.innerHTML = `
          <a href="login.html" class="btn me-2" style="background-color: #8abc48; color: white;">Login</a>
          <a href="registration.html" class="btn" style="background-color: #8abc48; color: white;">Register</a>
        `;
      }


   // Smooth Links 

      document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
          link.addEventListener("click", function (e) {
            e.preventDefault();
            document.body.classList.remove("fade-in");
            setTimeout(() => {
              window.location.href = href;
            }, 300);
          });
        }
      });
    });
}


// Load Doctors
async function loadDoctors(limit = null) {
  const container = document.getElementById("doctors-container");
  if (!container) return;

  try {
    const response = await fetch("doctors.json");
    if (!response.ok) throw new Error("Failed to load doctors.json");
    const doctorsFromJson = await response.json();

    const doctorsFromStorage = JSON.parse(localStorage.getItem("doctors")) || [];

    const storageOnlyDoctors = doctorsFromStorage.filter(
      ds => !doctorsFromJson.some(dj => dj.id === ds.id)
    );

    const allDoctors = [...doctorsFromJson, ...storageOnlyDoctors];
    localStorage.setItem("doctors", JSON.stringify(allDoctors));

    container.innerHTML = "";
    let doctorsToRender = allDoctors;

    if (limit) {
      doctorsToRender = allDoctors.slice(0, limit);
    }

    doctorsToRender.forEach(doc => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";

      col.innerHTML = `
        <div class="card h-100 shadow-sm d-flex flex-column">
          <img src="${doc.photo}" class="card-img-top" alt="${doc.name}" style="height: 220px; object-fit: cover;">
          <div class="card-body d-flex flex-column justify-content-center text-center">
            <h5 class="card-title mb-2">${doc.name}</h5>
            <p class="card-text text-muted">${doc.specialization}</p>
          </div>
          <div class="card-footer bg-white border-0 text-center mb-2">
            <a href="doctorDetails.html?id=${doc.id}" class="btn btn-sm btn-success">See Details</a>
          </div>
        </div>
      `;

      container.appendChild(col);
    });



    // See All Doctors button (only on Home page)

    if (limit) {
      const buttonRow = document.createElement("div");
      buttonRow.className = "row mt-3";
      buttonRow.innerHTML = `
        <div class="col text-center">
          <button id="see-all-doctors" class="btn btn-success">
            See All Doctors
          </button>
        </div>
      `;
      container.appendChild(buttonRow);

      const seeAllBtn = document.getElementById("see-all-doctors");
      if (seeAllBtn) {
        seeAllBtn.addEventListener("click", () => {
          document.body.classList.remove("fade-in");
          setTimeout(() => {
            window.location.href = "doctors.html";
          }, 400);
        });
      }
    }

  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="text-danger text-center">Failed to load doctors information.</p>';
  }
}


// Departments Page

async function loadDepartmentsPage() {
  try {
    let doctors = JSON.parse(localStorage.getItem("doctors"));

    if (!doctors || doctors.length === 0) {
      const response = await fetch("doctors.json");
      if (!response.ok) throw new Error("Failed to load doctors data");
      doctors = await response.json();
      localStorage.setItem("doctors", JSON.stringify(doctors));
    }

    const deptDropdown = document.getElementById("departmentDropdown");
    const container = document.getElementById("department-doctors");

    if (!deptDropdown || !container) return;

    const departments = [...new Set(doctors.map((doc) => doc.specialization))];
    deptDropdown.innerHTML = `<option value="all">All Departments</option>`;
    departments.forEach((dept) => {
      const opt = document.createElement("option");
      opt.value = dept;
      opt.textContent = dept;
      deptDropdown.appendChild(opt);
    });

    function renderDoctors(filter = "all") {
      container.innerHTML = "";
      doctors
        .filter((doc) => filter === "all" || doc.specialization === filter)
        .forEach((doc) => {
          const col = document.createElement("div");
          col.className = "col-md-4 mb-4";
          col.innerHTML = `
            <div class="card h-100 shadow-sm d-flex flex-column">
              <img src="${doc.photo}" class="card-img-top" alt="${doc.name}" style="height: 220px; object-fit: cover;">
              <div class="card-body d-flex flex-column justify-content-center text-center">
                <h5 class="card-title mb-2">${doc.name}</h5>
                <p class="card-text text-muted">${doc.specialization}</p>
                <small class="text-muted">${doc.available_days.join(", ")}</small>
              </div>
              <div class="card-footer bg-white border-0 text-center mb-2">
                <a href="doctorDetails.html?id=${doc.id}" class="btn btn-sm" style="background-color: #8ABC48; color: white;">
                  See Details
                </a>
              </div>
            </div>
          `;
          container.appendChild(col);
        });
    }

    renderDoctors();
    deptDropdown.addEventListener("change", (e) => {
      renderDoctors(e.target.value);
    });
  } catch (error) {
    console.error(error);
  }
}

// Appointment Dropdowns

let doctorsData = [];
async function initAppointmentDropdowns() {
  const deptDropdown = document.getElementById("departmentDropdown");
  const doctorDropdown = document.getElementById("doctorDropdown");
  const dayDropdown = document.getElementById("dayDropdown");

  if (!(deptDropdown || doctorDropdown || dayDropdown)) return;

  const res = await fetch("doctors.json");
  doctorsData = await res.json();

  if (deptDropdown) {
    deptDropdown.innerHTML = `<option value="">Select Department</option>`;
    [...new Set(doctorsData.map((doc) => doc.specialization))].forEach(
      (dept) => {
        const opt = document.createElement("option");
        opt.value = dept;
        opt.textContent = dept;
        deptDropdown.appendChild(opt);
      }
    );

    deptDropdown.addEventListener("change", function () {
      const selectedDept = this.value;
      doctorDropdown.innerHTML = '<option value="">Select Doctor</option>';
      dayDropdown.innerHTML = '<option value="">Select Day</option>';
      dayDropdown.disabled = true;

      if (!selectedDept) {
        doctorDropdown.disabled = true;
        return;
      }

      const filteredDoctors = doctorsData.filter(
        (doc) => doc.specialization === selectedDept
      );
      filteredDoctors.forEach((doc) => {
        const opt = document.createElement("option");
        opt.value = doc.id;
        opt.textContent = doc.name;
        doctorDropdown.appendChild(opt);
      });
      doctorDropdown.disabled = false;
    });
  }

  if (doctorDropdown) {
    doctorDropdown.addEventListener("change", function () {
      const doctorId = parseInt(this.value);
      dayDropdown.innerHTML = '<option value="">Select Day</option>';

      if (!doctorId) {
        dayDropdown.disabled = true;
        return;
      }

      const doctor = doctorsData.find((doc) => doc.id === doctorId);
      doctor.available_days.forEach((day) => {
        const opt = document.createElement("option");
        opt.value = day;
        opt.textContent = day;
        dayDropdown.appendChild(opt);
      });

      dayDropdown.disabled = false;
    });
  }
}

// Submit Appointment

function initAppointmentSubmit() {
  const submitBtn = document.getElementById("submitAppointment");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", function () {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const patientName = document.getElementById("patientName").value.trim();
    const patientPhone = document.getElementById("patientPhone").value.trim();
    const doctorId = parseInt(document.getElementById("doctorDropdown").value);
    const day = document.getElementById("dayDropdown").value;

    if (!patientName || !patientPhone || !doctorId || !day) {
      alert("Please fill all fields!");
      return;
    }

    const doctor = doctorsData.find((doc) => doc.id === doctorId);
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    appointments.push({
      id: Date.now(),
      patientName,
      patientEmail: currentUser ? currentUser.email : "",
      patientPhone,
      doctorId,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      day,
    });

    localStorage.setItem("appointments", JSON.stringify(appointments));

    const msg = document.getElementById("successMsg");
    if (msg) msg.style.display = "block";

    setTimeout(() => (window.location.href = "index.html"), 2000);
  });
}



// Registration & Login Forms


function initAuthForms() {
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const users = JSON.parse(localStorage.getItem("users")) || [];

      if (form.id === "registerForm") {
        const fullname = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!fullname || !email || !phone || !password) {
          alert("Please fill all fields!");
          return;
        }

        if (users.some((user) => user.email === email)) {
          alert("Email already registered. Try login.");
          return;
        }

        const newUser = {
          id: Date.now(),
          role: "patient",
          name: fullname,
          email,
          phone,
          password,
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        alert("Registration successful! You can now login.");
        window.location.href = "login.html";
      } else if (form.id === "loginForm") {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        const user = users.find(
          (u) => u.email === email && u.password === password
        );
        if (!user) {
          alert("Invalid email or password!");
          return;
        }

        localStorage.setItem("currentUser", JSON.stringify(user));
        if (user.role === "admin")
          window.location.href = "index.html";
        else if (user.role === "doctor")
          window.location.href = "doctor-dashboard.html";
        else window.location.href = "index.html";
      }
    });
  });
}


// Initialize Everything

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");

  loadNavbar();

  if (document.getElementById("doctors-container")) {
    if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
      loadDoctors(6);
    } else if (window.location.pathname.endsWith("doctors.html")) {
      loadDoctors();
    }
  }

  if (
    document.getElementById("departmentDropdown") &&
    document.getElementById("department-doctors")
  ) {
    loadDepartmentsPage();
  }

  initAppointmentDropdowns();
  initAppointmentSubmit();
  initAuthForms();
});
