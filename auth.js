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

/* login */

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
    loginButton.textContent = "Giriþ yapýlýyor...";

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
                "Giriþ sýrasýnda bir hata oluþtu."
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
            "API'ye baðlanýlamadý."
        );

    }
    finally {

        loginButton.disabled = false;
        loginButton.textContent = "Giriþ Yap";

    }
}


/* register */

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
            "Þifreler birbiriyle ayný deðil."
        );

        return;
    }

    registerButton.disabled = true;
    registerButton.textContent = "Kayýt oluþturuluyor...";

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
                "Kayýt sýrasýnda bir hata oluþtu."
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
            "API'ye baðlanýlamadý."
        );

    }
    finally {

        registerButton.disabled = false;
        registerButton.textContent = "Kayýt Ol";

    }
}
