document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", register);
    }

    const forgotPasswordForm =document.getElementById("forgotPasswordForm");

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener(
            "submit",
            forgotPassword
        );
    }

    const resetPasswordForm = document.getElementById("resetPasswordForm");

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener(
            "submit",
            resetPassword
        );
    }

    const verifyEmailPage = document.getElementById("verificationDescription");

    if (verifyEmailPage) {
        verifyEmail();
    }

    initializeAuthValidation();

});



//async function login(event) {

//    event.preventDefault();

//    const email =
//        document
//            .getElementById("email")
//            .value
//            .trim();

//    const password =
//        document
//            .getElementById("password")
//            .value;

//    const errorMessage =
//        document.getElementById("errorMessage");

//    const loginButton =
//        document.getElementById("loginButton");

//    errorMessage.classList.add("d-none");

//    loginButton.disabled = true;
//    loginButton.textContent =
//        "Giriş yapılıyor...";

//    try {

//        const result =
//            await api.post(
//                "/Auth/login",
//                {
//                    email: email,
//                    password: password
//                }
//            );

//        if (!result) {
//            return;
//        }

//        localStorage.setItem(
//            "token",
//            result.data.token
//        );

//        localStorage.setItem(
//            "userId",
//            result.data.userId
//        );

//        localStorage.setItem(
//            "fullName",
//            result.data.fullName
//        );

//        localStorage.setItem(
//            "email",
//            result.data.email
//        );

//        window.location.href =
//            "index.html";

//    }
//    catch (error) {

//        console.error(error);

//        showError(error.message);

//    }
//    finally {

//        loginButton.disabled = false;

//        loginButton.textContent = "Giriş Yap";
//    }
//}

async function login(event) {

    event.preventDefault();

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    const errorMessage =
        document.getElementById("errorMessage");

    const loginButton =
        document.getElementById("loginButton");

    errorMessage.classList.add("d-none");
    errorMessage.textContent = "";

    emailInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");

    /* ========================= */
    /* LOCAL VALIDATION */
    /* ========================= */

    if (!email) {

        emailInput.classList.add("is-invalid");

        showError(
            "Lütfen e-posta adresinizi girin."
        );

        emailInput.focus();

        return;
    }

    if (!isValidEmail(email)) {

        emailInput.classList.add("is-invalid");

        showError(
            "Lütfen geçerli bir e-posta adresi girin."
        );

        emailInput.focus();

        return;
    }

    if (!password) {

        passwordInput.classList.add("is-invalid");

        showError(
            "Lütfen şifrenizi girin."
        );

        passwordInput.focus();

        return;
    }

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

        emailInput.classList.add(
            "is-invalid"
        );

        passwordInput.classList.add(
            "is-invalid"
        );

        showError(
            error.message ||
            "Giriş yapılamadı. Bilgilerinizi kontrol edip tekrar deneyin."
        );

    }
    finally {

        loginButton.disabled = false;

        loginButton.textContent =
            "Giriş Yap";
    }
}



//async function register(event) {

//    event.preventDefault();

//    const fullName =
//        document
//            .getElementById("fullName")
//            .value
//            .trim();

//    const email =
//        document
//            .getElementById("email")
//            .value
//            .trim();

//    const password =
//        document
//            .getElementById("password")
//            .value;

//    const passwordConfirm =
//        document
//            .getElementById("passwordConfirm")
//            .value;

//    const errorMessage =
//        document.getElementById("errorMessage");

//    const registerButton =
//        document.getElementById("registerButton");

//    errorMessage.classList.add("d-none");

//    if (password !== passwordConfirm) {

//        showError(
//            "Şifreler birbiriyle aynı değil."
//        );

//        return;
//    }

//    registerButton.disabled = true;

//    registerButton.textContent =
//        "Kayıt oluşturuluyor...";

//    try {

//        const result =
//            await api.post(
//                "/Auth/register",
//                {
//                    fullName: fullName,
//                    email: email,
//                    password: password
//                }
//            );

//        if (!result) {
//            return;
//        }

//        localStorage.setItem(
//            "token",
//            result.data.token
//        );

//        localStorage.setItem(
//            "userId",
//            result.data.userId
//        );

//        localStorage.setItem(
//            "fullName",
//            result.data.fullName
//        );

//        localStorage.setItem(
//            "email",
//            result.data.email
//        );

//        window.location.href =
//            "index.html";

//    }
//    catch (error) {

//        console.error(error);

//        showError(error.message);

//    }
//    finally {

//        registerButton.disabled = false;

//        registerButton.textContent =
//            "Kayıt Ol";
//    }
//}

async function register(event) {

    event.preventDefault();

    const fullNameInput =
        document.getElementById("fullName");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const passwordConfirmInput =
        document.getElementById("passwordConfirm");

    const fullName =
        fullNameInput.value.trim();

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    const passwordConfirm =
        passwordConfirmInput.value;

    const errorMessage =
        document.getElementById("errorMessage");

    const registerButton =
        document.getElementById("registerButton");

    errorMessage.classList.add("d-none");
    errorMessage.textContent = "";

    [
        fullNameInput,
        emailInput,
        passwordInput,
        passwordConfirmInput
    ].forEach(input => {

        input.classList.remove(
            "is-invalid"
        );

    });

    /* ========================= */
    /* LOCAL VALIDATION */
    /* ========================= */

    if (!fullName) {

        fullNameInput.classList.add(
            "is-invalid"
        );

        showError(
            "Lütfen ad soyad bilginizi girin."
        );

        fullNameInput.focus();

        return;
    }

    if (!email) {

        emailInput.classList.add(
            "is-invalid"
        );

        showError(
            "Lütfen e-posta adresinizi girin."
        );

        emailInput.focus();

        return;
    }

    if (!isValidEmail(email)) {

        emailInput.classList.add(
            "is-invalid"
        );

        showError(
            "Lütfen geçerli bir e-posta adresi girin."
        );

        emailInput.focus();

        return;
    }

    if (!password) {

        passwordInput.classList.add(
            "is-invalid"
        );

        showError(
            "Lütfen bir şifre oluşturun."
        );

        passwordInput.focus();

        return;
    }

    const passwordValid =
        validatePasswordLive();

    if (!passwordValid) {

        passwordInput.classList.add(
            "is-invalid"
        );

        showError(
            "Şifreniz tüm gereksinimleri karşılamıyor."
        );

        passwordInput.focus();

        return;
    }

    if (!passwordConfirm) {

        passwordConfirmInput.classList.add(
            "is-invalid"
        );

        showError(
            "Lütfen şifrenizi tekrar girin."
        );

        passwordConfirmInput.focus();

        return;
    }

    if (password !== passwordConfirm) {

        passwordConfirmInput.classList.add(
            "is-invalid"
        );

        showError(
            "Şifreler birbiriyle aynı değil."
        );

        passwordConfirmInput.focus();

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

        showError(
            error.message ||
            "Kayıt oluşturulamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin."
        );

    }
    finally {

        registerButton.disabled = false;

        registerButton.textContent =
            "Kayıt Ol";
    }
}

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}

function initializeAuthValidation() {

    const password =
        document.getElementById("password");

    const passwordConfirm =
        document.getElementById(
            "passwordConfirm"
        );

    if (!password || !passwordConfirm) {
        return;
    }

    password.addEventListener(
        "input",
        () => {

            validatePasswordLive();

            validatePasswordConfirmLive();

        }
    );

    passwordConfirm.addEventListener(
        "input",
        () => {

            validatePasswordConfirmLive();

        }
    );
}

function validatePasswordLive() {

    const password =
        document.getElementById("password");

    if (!password) {
        return;
    }

    const value = password.value;

    const lengthValid =
        value.length >= 6;

    const uppercaseValid =
        /[A-ZÇĞİÖŞÜ]/.test(value);

    const lowercaseValid =
        /[a-zçğıöşü]/.test(value);

    const digitValid =
        /[0-9]/.test(value);

    const specialValid =
        /[^A-Za-zÇĞİÖŞÜçğıöşü0-9]/.test(value);

    updatePasswordRequirement(
        "passwordLength",
        lengthValid
    );

    updatePasswordRequirement(
        "passwordUppercase",
        uppercaseValid
    );

    updatePasswordRequirement(
        "passwordLowercase",
        lowercaseValid
    );

    updatePasswordRequirement(
        "passwordDigit",
        digitValid
    );

    updatePasswordRequirement(
        "passwordSpecial",
        specialValid
    );

    return (
        lengthValid &&
        uppercaseValid &&
        lowercaseValid &&
        digitValid &&
        specialValid
    );
}

function updatePasswordRequirement(
    elementId,
    valid
) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    const icon =
        element.querySelector(".requirement-icon");

    if (valid) {

        element.classList.remove(
            "text-danger"
        );

        element.classList.add(
            "text-success"
        );

        icon.textContent = "✓";

    }
    else {

        element.classList.remove(
            "text-success"
        );

        element.classList.add(
            "text-danger"
        );

        icon.textContent = "✕";
    }
}

function validatePasswordConfirmLive() {

    const password =
        document.getElementById("password");

    const passwordConfirm =
        document.getElementById(
            "passwordConfirm"
        );

    const passwordConfirmHint =
        document.getElementById(
            "passwordConfirmHint"
        );

    if (
        !password ||
        !passwordConfirm ||
        !passwordConfirmHint
    ) {
        return;
    }

    if (!passwordConfirm.value) {

        passwordConfirmHint.textContent =
            "";

        return;
    }

    if (
        password.value ===
        passwordConfirm.value
    ) {

        passwordConfirmHint.textContent =
            "✓ Şifreler eşleşiyor.";

        passwordConfirmHint.className =
            "form-text text-success";

    }
    else {

        passwordConfirmHint.textContent =
            "✕ Şifreler eşleşmiyor.";

        passwordConfirmHint.className =
            "form-text text-danger";
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
            "Şifre sıfırlama bağlantısı email adresinize gönderildi.";

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

async function resetPassword(event) {

    event.preventDefault();

    const params =
        new URLSearchParams(
            window.location.search
        );

    const email =
        params.get("email");

    const token =
        params.get("token");

    const newPassword =
        document
            .getElementById("newPassword")
            .value;

    const newPasswordConfirm =
        document
            .getElementById("newPasswordConfirm")
            .value;

    const message =
        document.getElementById("message");

    const button =
        document.getElementById(
            "resetPasswordButton"
        );

    message.className =
        "alert d-none";

    if (!email || !token) {

        message.textContent =
            "Şifre sıfırlama bağlantısı geçersiz veya eksik.";

        message.className =
            "alert alert-danger";

        return;
    }

    if (newPassword !== newPasswordConfirm) {

        message.textContent =
            "Şifreler birbiriyle aynı değil.";

        message.className =
            "alert alert-danger";

        return;
    }

    button.disabled = true;

    button.textContent =
        "Güncelleniyor...";

    try {

        const result =
            await api.post(
                "/User/ResetPassword",
                {
                    email: email,
                    token: token,
                    newPassword: newPassword
                }
            );

        if (!result) {
            return;
        }

        message.textContent =
            "Şifreniz başarıyla güncellendi. Giriş ekranına yönlendiriliyorsunuz...";

        message.className =
            "alert alert-success";

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1500);

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
            "Şifremi Güncelle";
    }
}


async function verifyEmail() {

    //const params =
    //    new URLSearchParams(
    //        window.location.search
    //    );

    //const email =
    //    params.get("email");

    //const token =
    //    params.get("token");
    const params =
        new URLSearchParams(
            window.location.hash.substring(1)
        );

    const email =
        params.get("email");

    const token =
        params.get("token");

    const message =
        document.getElementById("message");

    const description =
        document.getElementById(
            "verificationDescription"
        );

    const actions =
        document.getElementById(
            "verificationActions"
        );

    if (!email || !token) {

        description.textContent =
            "Doğrulama bağlantısı geçersiz.";

        message.textContent =
            "Email doğrulama bağlantısı eksik veya hatalı.";

        message.className =
            "alert alert-danger";

        actions.classList.remove("d-none");

        return;
    }

    try {

        const result =
            await api.post(
                "/User/ConfirmEmail",
                {
                    email: email,
                    token: token
                }
            );

        if (!result) {
            return;
        }

        description.textContent =
            "Email adresiniz doğrulandı.";

        message.textContent =
            "Email adresiniz başarıyla doğrulandı.";

        message.className =
            "alert alert-success";

        actions.classList.remove("d-none");

    }
    catch (error) {

        console.error(error);

        description.textContent =
            "Email doğrulama başarısız.";

        message.textContent =
            error.message;

        message.className =
            "alert alert-danger";

        actions.classList.remove("d-none");
    }
}