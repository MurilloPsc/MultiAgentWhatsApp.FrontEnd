// frontend/js/auth.js

function getToken() {
    return localStorage.getItem("token");
}

function logout() {
    localStorage.clear();
    window.location.href = "/login.html";
}

function requireRole(role) {
    const token = getToken();
    const userRole = localStorage.getItem("role");

    if (!token) {
        window.location.href = "/login.html";
        return;
    }

    if (userRole !== role) {
        alert("Acesso não autorizado");
        logout();
    }
}

