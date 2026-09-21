document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", register);
    }

    const forgotPasswordForm =
        document.getElementById("forgotPasswordForm");

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener(
            "submit",
            forgotPassword
        );
    }

});



async function login(event) {

    event.preventDefault();

    const email =
        document
            .getElementById("email")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;

    const errorMessage =
        document.getElementById("errorMessage");

    const loginButton =
        document.getElementById("loginButton");

    errorMessage.classList.add("d-none");

    loginButton.disabled = true;
    loginButton.textContent =
        "Giriş yapılıyor...";

    try {

        const result =
            await api.post(
                "/Auth/login",
                {
                    email: email,
                    password: password
                }
            );

        if (!result) {
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

        window.location.href =
            "index.html";

    }
    catch (error) {

        console.error(error);

        showError(error.message);

    }
    finally {

        loginButton.disabled = false;

        loginButton.textContent = "Giriş Yap";
    }
}



async function register(event) {

    event.preventDefault();

    const fullName =
        document
            .getElementById("fullName")
            .value
            .trim();

    const email =
        document
            .getElementById("email")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;

    const passwordConfirm =
        document
            .getElementById("passwordConfirm")
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

    registerButton.textContent =
        "Kayıt oluşturuluyor...";

    try {

        const result =
            await api.post(
                "/Auth/register",
                {
                    fullName: fullName,
                    email: email,
                    password: password
                }
            );

        if (!result) {
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

        window.location.href =
            "index.html";

    }
    catch (error) {

        console.error(error);

        showError(error.message);

    }
    finally {

        registerButton.disabled = false;

        registerButton.textContent =
            "Kayıt Ol";
    }
}

function showError(message) {

    const errorMessage =
        document.getElementById("errorMessage");

    errorMessage.textContent = message;

    errorMessage.classList.remove("d-none");
}

async function forgotPassword(event) {

    event.preventDefault();

    const email =
        document
            .getElementById("email")
            .value
            .trim();

    console.log("Forgot Password çalıştı:", email);

    const message =
        document.getElementById("message");

    const button =
        document.getElementById(
            "forgotPasswordButton"
        );

    message.className =
        "alert d-none";

    button.disabled = true;
    button.textContent =
        "Gönderiliyor...";

    try {

        const result =
            await api.post(
                "/User/ForgotPassword",
                {
                    email: email
                }
            );

        if (!result) {
            return;
        }

        message.textContent =
            "Şifre sıfırlama bağlantısı oluşturuldu.";

        message.className =
            "alert alert-success";

    }
    catch (error) {

        console.error(error);

        message.textContent =
            error.message;

        message.className =
            "alert alert-danger";

    }
    finally {

        button.disabled = false;

        button.textContent =
            "Şifre Sıfırlama Linki Gönder";
    }
}