document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", register);
    }

});



async function login(event) {

    event.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    const errorMessage =
        document.getElementById("errorMessage");

    const loginButton =
        document.getElementById("loginButton");

    errorMessage.classList.add("d-none");

    loginButton.disabled = true;
    loginButton.textContent = "Giriş yapılıyor...";

    try {

        const response = await fetch(
            `${API_BASE_URL}/Auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {

            showError(
                result.message ||
                "Giriş sırasında bir hata oluştu."
            );

            return;
        }

        localStorage.setItem(
            "token",
            result.data.token
        );

        localStorage.setItem(
            "userId",
            result.data.userId
        );

        localStorage.setItem(
            "fullName",
            result.data.fullName
        );

        localStorage.setItem(
            "email",
            result.data.email
        );

        window.location.href = "index.html";

    }
    catch (error) {

        console.error(error);

        showError(
            "API'ye bağlanılamadı."
        );

    }
    finally {

        loginButton.disabled = false;
        loginButton.textContent = "Giriş Yap";

    }
}



async function register(event) {

    event.preventDefault();

    const fullName =
        document.getElementById("fullName")
            .value
            .trim();

    const email =
        document.getElementById("email")
            .value
            .trim();

    const password =
        document.getElementById("password")
            .value;

    const passwordConfirm =
        document.getElementById("passwordConfirm")
            .value;

    const errorMessage =
        document.getElementById("errorMessage");

    const registerButton =
        document.getElementById("registerButton");

    errorMessage.classList.add("d-none");

    if (password !== passwordConfirm) {

        showError(
            "Şifreler birbiriyle aynı değil."
        );

        return;
    }

    registerButton.disabled = true;
    registerButton.textContent = "Kayıt oluşturuluyor...";

    try {

        const response = await fetch(
            `${API_BASE_URL}/Auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    fullName: fullName,
                    email: email,
                    password: password
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {

            showError(
                result.message ||
                "Kayıt sırasında bir hata oluştu."
            );

            return;
        }

        localStorage.setItem(
            "token",
            result.data.token
        );

        localStorage.setItem(
            "userId",
            result.data.userId
        );

        localStorage.setItem(
            "fullName",
            result.data.fullName
        );

        localStorage.setItem(
            "email",
            result.data.email
        );

        window.location.href = "index.html";

    }
    catch (error) {

        console.error(error);

        showError(
            "API'ye bağlanılamadı."
        );

    }
    finally {

        registerButton.disabled = false;
        registerButton.textContent = "Kayıt Ol";

    }
}

function showError(message) {

    const errorMessage =
        document.getElementById("errorMessage");

    errorMessage.textContent = message;

    errorMessage.classList.remove("d-none");
}