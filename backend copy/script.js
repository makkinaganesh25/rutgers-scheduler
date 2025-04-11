document.addEventListener("DOMContentLoaded", function () {
    const sidebarLinks = document.querySelectorAll(".sidebar ul li a");
    const sections = document.querySelectorAll("main section");

    sidebarLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            sections.forEach(section => {
                section.classList.add("hidden");
                if (section.id === targetId) {
                    section.classList.remove("hidden");
                }
            });
        });
    });
});
