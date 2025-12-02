// DARK MODE TOGGLE
document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("darkToggle");

    toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        // Change button text depending on mode
        if (document.body.classList.contains("dark-mode")) {
            toggleBtn.textContent = "☀️ Go to Light Mode";
        } else {
            toggleBtn.textContent = "🌙 Go to Dark Mode";
        }
    });
});
