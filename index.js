async function loadDoctors() {
  try {
    const response = await fetch("doctors.json");
    if (!response.ok) throw new Error("Failed to load doctors data");
    const doctors = await response.json();

    const container = document.getElementById("doctors-container");
    container.innerHTML = "";

    doctors.forEach((doc) => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";

      col.innerHTML = `
  <div class="card h-100 shadow-sm d-flex flex-column">
    <img src="images/${doc.photo}" 
         class="card-img-top" 
         alt="${doc.name}" 
         style="height: 220px; object-fit: cover;">
    <div class="card-body d-flex flex-column justify-content-center text-center">
      <h5 class="card-title mb-2">${doc.name}</h5>
      <p class="card-text text-muted">${doc.specialization}</p>
    </div>
    <div class="card-footer bg-white border-0 text-center mb-2">
      <a href="doctorDetails.html?id=${doc.id}" 
         class="btn btn-sm" 
         style="background-color: #8ABC48; color: white;">
         See Details
      </a>
    </div>
  </div>
`;

      container.appendChild(col);
    });
  } catch (error) {
    console.error(error);
    document.getElementById("doctors-container").innerHTML =
      '<p class="text-danger text-center">Failed to load doctors information.</p>';
  }
}
// Load doctors on page load
window.addEventListener("DOMContentLoaded", loadDoctors);
