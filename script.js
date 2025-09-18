// ============================
// DARK MODE TOGGLE
// ============================
function toggleDarkMode() {
  const isDark = document.body.classList.contains("dark-mode");
  if (isDark) {
    document.body.classList.replace("dark-mode", "light-mode");
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.replace("light-mode", "dark-mode");
    localStorage.setItem("theme", "dark");
  }

  // Also sync toggle checkbox if exists
  const toggleSwitch = document.getElementById("darkModeToggle");
  if (toggleSwitch) toggleSwitch.checked = !isDark;
}

// Apply saved theme on load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.classList.add(savedTheme + "-mode");

  const toggleSwitch = document.getElementById("darkModeToggle");
  if (toggleSwitch) toggleSwitch.checked = savedTheme === "dark";

  // Load saved note if exists
  const noteInput = document.getElementById("noteInput");
  if (noteInput) {
    const savedNote = localStorage.getItem("studentNote");
    if (savedNote) {
      noteInput.value = savedNote;
    }
  }
});

// ============================
// NOTE SECTION
// ============================
function saveNote() {
  const note = document.getElementById("noteInput").value;
  localStorage.setItem("studentNote", note);

  const msg = document.getElementById("saveMessage");
  if (msg) {
    msg.style.display = "block";
    setTimeout(() => msg.style.display = "none", 2000);
  }
}

function clearNote() {
  const noteInput = document.getElementById("noteInput");
  if (noteInput) noteInput.value = "";
  localStorage.removeItem("studentNote");
}

// ============================
// ATTENDANCE TRACKER
// ============================
const attendanceForm = document.getElementById("attendanceForm");
if (attendanceForm) {
  attendanceForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const attended = parseInt(document.getElementById("classesAttended").value);
    const missed = parseInt(document.getElementById("classesMissed").value);
    const total = attended + missed;

    if (isNaN(attended) || isNaN(missed) || total === 0) {
      alert("Please enter valid attendance data.");
      return;
    }

    const percentage = Math.round((attended / total) * 100);
    document.getElementById("attendancePercentage").textContent = `${percentage}%`;

    const progressBar = document.getElementById("attendanceProgressBar");
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute("aria-valuenow", percentage);

    if (percentage >= 75) {
      progressBar.className = "progress-bar bg-success";
    } else if (percentage >= 50) {
      progressBar.className = "progress-bar bg-warning";
    } else {
      progressBar.className = "progress-bar bg-danger";
    }

    document.getElementById("attendanceResult").style.display = "block";
  });
}

// ============================
// CONTACT FORM HANDLER
// ============================
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    document.getElementById("contactResponse").style.display = "block";
    setTimeout(() => {
      document.getElementById("contactResponse").style.display = "none";
      contactForm.reset();
    }, 3000);
  });
}

// ============================
// PERCENTAGE CALCULATOR
// ============================
const percentageForm = document.getElementById("percentageForm");
if (percentageForm) {
  percentageForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const obtained = parseFloat(document.getElementById("marksObtained").value);
    const total = parseFloat(document.getElementById("totalMarks").value);

    if (isNaN(obtained) || isNaN(total) || total <= 0) {
      alert("Enter valid marks.");
      return;
    }

    const result = ((obtained / total) * 100).toFixed(2);
    const resultBox = document.getElementById("percentageResult");
    resultBox.innerText = `🎯 Percentage: ${result}%`;
    resultBox.style.display = "block";
  });
}
