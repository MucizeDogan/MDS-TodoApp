/* ========================================================= */
/* PROFILE */
/* ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeProfile
);


/* ========================================================= */
/* INIT */
/* ========================================================= */

async function initializeProfile() {

    if (!requireAuthentication()) {
        return;
    }

    initializeTheme();

    initializeAccountSettings();

    initializeProfileEvents();

    await loadProfile();
}


/* ========================================================= */
/* AUTH */
/* ========================================================= */

function requireAuthentication() {

    const token =
        localStorage.getItem("token");

    if (!token) {

        window.location.href =
            "login.html";

        return false;
    }

    return true;
}


/* ========================================================= */
/* THEME */
/* ========================================================= */

function initializeTheme() {

    const darkMode =
        localStorage.getItem("darkMode");

    if (darkMode === "true") {

        document.body.classList.add(
            "dark-mode"
        );
    }
}


/* ========================================================= */
/* ACCOUNT SETTINGS */
/* ========================================================= */

function initializeAccountSettings() {

    const darkModeToggle =
        document.getElementById(
            "darkModeToggle"
        );

    const appNotificationsToggle =
        document.getElementById(
            "appNotificationsToggle"
        );

    const taskRemindersToggle =
        document.getElementById(
            "taskRemindersToggle"
        );

    const emailNotificationsToggle =
        document.getElementById(
            "emailNotificationsToggle"
        );


    /* ------------------------------------------------------- */
    /* Dark Mode */
    /* ------------------------------------------------------- */

    if (darkModeToggle) {

        darkModeToggle.checked =
            localStorage.getItem("darkMode") === "true";

        darkModeToggle.addEventListener(
            "change",
            () => {

                document.body.classList.toggle(
                    "dark-mode",
                    darkModeToggle.checked
                );

                localStorage.setItem(
                    "darkMode",
                    darkModeToggle.checked
                        ? "true"
                        : "false"
                );
            }
        );
    }


    /* ------------------------------------------------------- */
    /* App Notifications */
    /* ------------------------------------------------------- */

    initializeLocalToggle(
        appNotificationsToggle,
        "appNotificationsEnabled",
        true
    );


    /* ------------------------------------------------------- */
    /* Task Reminders */
    /* ------------------------------------------------------- */

    initializeLocalToggle(
        taskRemindersToggle,
        "taskRemindersEnabled",
        true
    );


    /* ------------------------------------------------------- */
    /* Email Notifications */
    /* ------------------------------------------------------- */

    initializeLocalToggle(
        emailNotificationsToggle,
        "emailNotificationsEnabled",
        false
    );


    /* ------------------------------------------------------- */
    /* Change Password */
    /* ------------------------------------------------------- */

    initializeChangePassword();
}


/* ========================================================= */
/* LOCAL STORAGE SETTINGS */
/* ========================================================= */

function initializeLocalToggle(
    element,
    storageKey,
    defaultValue
) {

    if (!element) {
        return;
    }

    const storedValue =
        localStorage.getItem(storageKey);


    if (storedValue === null) {

        element.checked =
            defaultValue;

    } else {

        element.checked =
            storedValue === "true";
    }


    element.addEventListener(
        "change",
        () => {

            localStorage.setItem(
                storageKey,
                element.checked
                    ? "true"
                    : "false"
            );
        }
    );
}

/* ========================================================= */
/* CHANGE PASSWORD */
/* ========================================================= */

function initializeChangePassword() {

    const openButton =
        document.getElementById(
            "changePasswordButton"
        );

    const closeButton =
        document.getElementById(
            "closePasswordModalButton"
        );

    const overlay =
        document.getElementById(
            "passwordModalOverlay"
        );

    const form =
        document.getElementById(
            "changePasswordForm"
        );


    if (openButton) {

        openButton.addEventListener(
            "click",
            openPasswordModal
        );
    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePasswordModal
        );
    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closePasswordModal
        );
    }


    if (form) {

        form.addEventListener(
            "submit",
            submitChangePassword
        );
    }


    initializePasswordVisibility();


    initializePasswordValidation();


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                const modal =
                    document.getElementById(
                        "passwordModal"
                    );

                if (
                    modal?.classList.contains(
                        "active"
                    )
                ) {

                    closePasswordModal();
                }
            }
        }
    );
}


/* ========================================================= */
/* OPEN PASSWORD MODAL */
/* ========================================================= */

function openPasswordModal() {

    const modal =
        document.getElementById(
            "passwordModal"
        );

    const overlay =
        document.getElementById(
            "passwordModalOverlay"
        );


    if (!modal || !overlay) {
        return;
    }


    resetPasswordForm();


    overlay.classList.add(
        "active"
    );

    modal.classList.add(
        "active"
    );


    overlay.setAttribute(
        "aria-hidden",
        "false"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "password-modal-open"
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "currentPassword"
                )
                ?.focus();

        },
        320
    );
}


/* ========================================================= */
/* CLOSE PASSWORD MODAL */
/* ========================================================= */

function closePasswordModal() {

    const modal =
        document.getElementById(
            "passwordModal"
        );

    const overlay =
        document.getElementById(
            "passwordModalOverlay"
        );


    if (!modal || !overlay) {
        return;
    }


    modal.classList.remove(
        "active"
    );

    overlay.classList.remove(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "password-modal-open"
    );
}


/* ========================================================= */
/* RESET PASSWORD FORM */
/* ========================================================= */

function resetPasswordForm() {

    const form =
        document.getElementById(
            "changePasswordForm"
        );


    if (form) {
        form.reset();
    }


    clearPasswordErrors();


    updatePasswordRules(
        "",
        ""
    );
}


/* ========================================================= */
/* PASSWORD VISIBILITY */
/* ========================================================= */

function initializePasswordVisibility() {

    document
        .querySelectorAll(
            ".password-visibility-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const targetId =
                        button.dataset
                            .passwordTarget;

                    const input =
                        document.getElementById(
                            targetId
                        );

                    if (!input) {
                        return;
                    }


                    const icon =
                        button.querySelector(
                            "i"
                        );


                    if (
                        input.type ===
                        "password"
                    ) {

                        input.type =
                            "text";

                        if (icon) {

                            icon.className =
                                "bi bi-eye-slash";
                        }

                        button.setAttribute(
                            "aria-label",
                            "Şifreyi gizle"
                        );

                    } else {

                        input.type =
                            "password";

                        if (icon) {

                            icon.className =
                                "bi bi-eye";
                        }

                        button.setAttribute(
                            "aria-label",
                            "Şifreyi göster"
                        );
                    }
                }
            );
        });
}


/* ========================================================= */
/* PASSWORD VALIDATION */
/* ========================================================= */

function initializePasswordValidation() {

    const newPassword =
        document.getElementById(
            "newPassword"
        );

    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        );


    if (newPassword) {

        newPassword.addEventListener(
            "input",
            () => {

                updatePasswordRules(
                    newPassword.value,
                    confirmPassword?.value || ""
                );
            }
        );
    }


    if (confirmPassword) {

        confirmPassword.addEventListener(
            "input",
            () => {

                updatePasswordRules(
                    newPassword?.value || "",
                    confirmPassword.value
                );
            }
        );
    }
}


/* ========================================================= */
/* UPDATE PASSWORD RULES */
/* ========================================================= */

function updatePasswordRules(
    newPassword,
    confirmPassword
) {

    const lengthRule =
        document.getElementById(
            "passwordLengthRule"
        );

    const matchRule =
        document.getElementById(
            "passwordMatchRule"
        );


    const lengthValid =
        newPassword.length >= 6;

    const matchValid =
        confirmPassword.length > 0 &&
        newPassword === confirmPassword;


    if (lengthRule) {

        lengthRule.classList.toggle(
            "valid",
            lengthValid
        );

        lengthRule.classList.toggle(
            "invalid",
            newPassword.length > 0 &&
            !lengthValid
        );

        const icon =
            lengthRule.querySelector(
                "i"
            );

        if (icon) {

            icon.className =
                lengthValid
                    ? "bi bi-check-circle-fill"
                    : "bi bi-circle";
        }
    }


    if (matchRule) {

        matchRule.classList.toggle(
            "valid",
            matchValid
        );

        matchRule.classList.toggle(
            "invalid",
            confirmPassword.length > 0 &&
            !matchValid
        );

        const icon =
            matchRule.querySelector(
                "i"
            );

        if (icon) {

            icon.className =
                matchValid
                    ? "bi bi-check-circle-fill"
                    : "bi bi-circle";
        }
    }
}


/* ========================================================= */
/* SUBMIT CHANGE PASSWORD */
/* ========================================================= */

async function submitChangePassword(
    event
) {

    event.preventDefault();


    const currentPassword =
        document.getElementById(
            "currentPassword"
        );

    const newPassword =
        document.getElementById(
            "newPassword"
        );

    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        );

    const submitButton =
        document.getElementById(
            "changePasswordSubmitButton"
        );


    if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword ||
        !submitButton
    ) {

        return;
    }


    clearPasswordErrors();


    /* ------------------------------------------------------- */
    /* Current password */
    /* ------------------------------------------------------- */

    if (
        !currentPassword.value.trim()
    ) {

        setPasswordError(
            "currentPasswordError",
            "Mevcut şifrenizi girin.",
            currentPassword
        );

        return;
    }


    /* ------------------------------------------------------- */
    /* New password */
    /* ------------------------------------------------------- */

    if (
        !newPassword.value
    ) {

        setPasswordError(
            "newPasswordError",
            "Yeni şifrenizi girin.",
            newPassword
        );

        return;
    }


    if (
        newPassword.value.length < 6
    ) {

        setPasswordError(
            "newPasswordError",
            "Yeni şifre en az 6 karakter olmalıdır.",
            newPassword
        );

        return;
    }


    /* ------------------------------------------------------- */
    /* Confirm password */
    /* ------------------------------------------------------- */

    if (
        !confirmPassword.value
    ) {

        setPasswordError(
            "confirmPasswordError",
            "Yeni şifrenizi tekrar girin.",
            confirmPassword
        );

        return;
    }


    if (
        newPassword.value !==
        confirmPassword.value
    ) {

        setPasswordError(
            "confirmPasswordError",
            "Şifreler eşleşmiyor.",
            confirmPassword
        );

        return;
    }


    /* ------------------------------------------------------- */
    /* Submit */
    /* ------------------------------------------------------- */

    const originalHtml =
        submitButton.innerHTML;


    submitButton.disabled =
        true;

    submitButton.innerHTML = `
        <span
            class="spinner-border spinner-border-sm"
            role="status">
        </span>

        <span>
            Güncelleniyor...
        </span>
    `;


    try {

        const result =
            await api.post(
                "/User/ChangePassword",
                {
                    currentPassword:
                        currentPassword.value,

                    newPassword:
                        newPassword.value
                }
            );


        if (!result) {
            return;
        }


        closePasswordModal();


        showProfileToast(
            "Şifre güncellendi",
            result.message ||
            "Şifreniz başarıyla değiştirildi.",
            true
        );

    }
    catch (error) {

        console.error(
            "Şifre değiştirme hatası:",
            error
        );


        const message =
            error.message ||
            "Şifre değiştirilemedi.";


        /*
         * Identity'den gelen hata mesajı
         * mevcut şifre veya password policy
         * problemi olabilir.
         */

        if (
            message
                .toLowerCase()
                .includes("password")
        ) {

            setPasswordError(
                "currentPasswordError",
                message,
                currentPassword
            );

        } else {

            setPasswordError(
                "newPasswordError",
                message,
                newPassword
            );
        }

    }
    finally {

        submitButton.disabled =
            false;

        submitButton.innerHTML =
            originalHtml;
    }
}


/* ========================================================= */
/* PASSWORD ERROR */
/* ========================================================= */

function setPasswordError(
    errorId,
    message,
    input
) {

    const errorElement =
        document.getElementById(
            errorId
        );


    if (errorElement) {

        errorElement.textContent =
            message;
    }


    if (input) {

        input.classList.add(
            "input-error"
        );

        input.focus();
    }
}


/* ========================================================= */
/* CLEAR PASSWORD ERRORS */
/* ========================================================= */

function clearPasswordErrors() {

    document
        .querySelectorAll(
            ".password-field-error"
        )
        .forEach(element => {

            element.textContent = "";
        });


    document
        .querySelectorAll(
            ".password-modern-input"
        )
        .forEach(input => {

            input.classList.remove(
                "input-error"
            );
        });
}


/* ========================================================= */
/* EVENTS */
/* ========================================================= */

function initializeProfileEvents() {

    const form =
        document.getElementById(
            "profileForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        saveProfile
    );

    const resendButton =
        document.getElementById(
            "resendEmailConfirmationButton"
        );

    if (resendButton) {

        resendButton.addEventListener(
            "click",
            resendEmailConfirmation
        );
    }
}


/* ========================================================= */
/* LOAD PROFILE */
/* ========================================================= */

async function loadProfile() {

    try {

        const result =
            await api.get(
                "/User/Profile"
            );


        if (!result) {
            return;
        }


        const profile =
            result.data;


        if (!profile) {
            return;
        }


        renderProfile(profile);

    }
    catch (error) {

        console.error(
            "Profil yüklenirken hata:",
            error
        );


        showProfileToast(
            "Hata",
            error.message ||
            "Profil bilgileri yüklenemedi.",
            false
        );
    }
}


/* ========================================================= */
/* RENDER PROFILE */
/* ========================================================= */

function renderProfile(profile) {

    const fullName =
        profile.fullName ||
        "Kullanıcı";

    const email =
        profile.email ||
        "";

    const firstLetter =
        fullName
            .charAt(0)
            .toUpperCase();


    /* ------------------------------------------------------- */
    /* Avatar */
    /* ------------------------------------------------------- */

    const avatar =
        document.getElementById(
            "profileAvatar"
        );

    if (avatar) {

        avatar.textContent =
            firstLetter;
    }


    const topAvatar =
        document.getElementById(
            "profileTopAvatar"
        );

    if (topAvatar) {

        topAvatar.textContent =
            firstLetter;
    }


    /* ------------------------------------------------------- */
    /* Identity */
    /* ------------------------------------------------------- */

    const displayName =
        document.getElementById(
            "profileDisplayName"
        );

    if (displayName) {

        displayName.textContent =
            fullName;
    }


    const displayEmail =
        document.getElementById(
            "profileDisplayEmail"
        );

    if (displayEmail) {

        displayEmail.textContent =
            email;
    }


    /* ------------------------------------------------------- */
    /* Form */
    /* ------------------------------------------------------- */

    const fullNameInput =
        document.getElementById(
            "profileFullName"
        );

    if (fullNameInput) {

        fullNameInput.value =
            fullName;
    }


    const emailInput =
        document.getElementById(
            "profileEmail"
        );

    if (emailInput) {

        emailInput.value =
            email;
    }


    /* ------------------------------------------------------- */
    /* Email status */
    /* ------------------------------------------------------- */

    renderEmailStatus(
        profile.emailConfirmed
    );

    renderSecurityEmailStatus(
        profile.emailConfirmed
    );


    /* ------------------------------------------------------- */
    /* Created date */
    /* ------------------------------------------------------- */

    const createdAtElement =
        document.getElementById(
            "profileCreatedAt"
        );

    if (createdAtElement) {

        createdAtElement.textContent =
            formatProfileDate(
                profile.createdAt
            );
    }
}


/* ========================================================= */
/* EMAIL STATUS */
/* ========================================================= */

function renderEmailStatus(
    emailConfirmed
) {

    const container =
        document.getElementById(
            "profileEmailStatus"
        );

    const icon =
        container?.querySelector(
            ".profile-status-icon i"
        );

    const title =
        document.getElementById(
            "profileEmailStatusTitle"
        );

    const text =
        document.getElementById(
            "profileEmailStatusText"
        );


    if (
        !container ||
        !title ||
        !text
    ) {

        return;
    }


    /* ------------------------------------------------------- */
    /* Confirmed */
    /* ------------------------------------------------------- */

    if (emailConfirmed) {

        container.style.borderColor =
            "rgba(22, 163, 74, 0.20)";

        container.style.background =
            "rgba(22, 163, 74, 0.06)";


        if (icon) {

            icon.className =
                "bi bi-patch-check-fill";

            if (icon.parentElement) {

                icon.parentElement.style.background =
                    "rgba(22, 163, 74, 0.12)";

                icon.parentElement.style.color =
                    "var(--success)";
            }
        }


        title.textContent =
            "Email doğrulandı";

        text.textContent =
            "Email adresiniz doğrulanmış durumda.";
    }


    /* ------------------------------------------------------- */
    /* Not confirmed */
    /* ------------------------------------------------------- */

    else {

        container.style.borderColor =
            "rgba(245, 158, 11, 0.20)";

        container.style.background =
            "rgba(245, 158, 11, 0.06)";


        if (icon) {

            icon.className =
                "bi bi-envelope-exclamation";

            if (icon.parentElement) {

                icon.parentElement.style.background =
                    "rgba(245, 158, 11, 0.12)";

                icon.parentElement.style.color =
                    "var(--warning)";
            }
        }


        title.textContent =
            "Email doğrulanmadı";

        text.textContent =
            "Email adresiniz henüz doğrulanmamış.";
    }
}

/* ========================================================= */
/* SECURITY EMAIL STATUS */
/* ========================================================= */

function renderSecurityEmailStatus(
    emailConfirmed
) {

    const row =
        document.getElementById(
            "securityEmailVerification"
        );

    const iconWrapper =
        document.getElementById(
            "securityEmailIcon"
        );

    const icon =
        iconWrapper?.querySelector("i");

    const title =
        document.getElementById(
            "securityEmailTitle"
        );

    const text =
        document.getElementById(
            "securityEmailText"
        );

    const button =
        document.getElementById(
            "resendEmailConfirmationButton"
        );


    if (
        !row ||
        !iconWrapper ||
        !icon ||
        !title ||
        !text
    ) {
        return;
    }


    /* ----------------------------------------------------- */
    /* VERIFIED */
    /* ----------------------------------------------------- */

    if (emailConfirmed) {

        row.classList.add(
            "email-confirmed"
        );

        row.classList.remove(
            "email-not-confirmed"
        );


        icon.className =
            "bi bi-patch-check-fill";


        iconWrapper.classList.add(
            "success"
        );

        iconWrapper.classList.remove(
            "warning"
        );


        title.textContent =
            "Email doğrulandı";


        text.textContent =
            "Email adresiniz doğrulanmış durumda.";


        if (button) {

            button.hidden = true;
        }

    }


    /* ----------------------------------------------------- */
    /* NOT VERIFIED */
    /* ----------------------------------------------------- */

    else {

        row.classList.add(
            "email-not-confirmed"
        );

        row.classList.remove(
            "email-confirmed"
        );


        icon.className =
            "bi bi-envelope-exclamation";


        iconWrapper.classList.add(
            "warning"
        );

        iconWrapper.classList.remove(
            "success"
        );


        title.textContent =
            "Email doğrulanmadı";


        text.textContent =
            "Email adresinizi doğrulamanız gerekiyor.";


        if (button) {

            button.hidden = false;
        }
    }
}


/* ========================================================= */
/* RESEND EMAIL CONFIRMATION */
/* ========================================================= */

async function resendEmailConfirmation() {

    const button =
        document.getElementById(
            "resendEmailConfirmationButton"
        );

    const emailInput =
        document.getElementById(
            "profileEmail"
        );

    const email =
        emailInput?.value?.trim();


    if (!button || !email) {

        showProfileToast(
            "Hata",
            "Email adresi bulunamadı.",
            false
        );

        return;
    }


    const originalHtml =
        button.innerHTML;


    button.disabled = true;

    button.innerHTML =
        '<i class="bi bi-arrow-repeat"></i>' +
        '<span>Gönderiliyor...</span>';

    button.classList.add(
        "loading"
    );


    try {

        const result =
            await api.post(
                "/User/ResendEmailConfirmation",
                {
                    email: email
                }
            );


        if (!result) {
            return;
        }


        showProfileToast(
            "Doğrulama maili gönderildi",
            "Email adresinize doğrulama bağlantısı gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin.",
            true
        );

    }
    catch (error) {

        console.error(
            "Email doğrulama maili gönderilemedi:",
            error
        );


        showProfileToast(
            "Mail gönderilemedi",
            error.message ||
            "Doğrulama maili gönderilirken bir hata oluştu.",
            false
        );

    }
    finally {

        button.disabled = false;

        button.classList.remove(
            "loading"
        );

        button.innerHTML =
            originalHtml;
    }
}


/* ========================================================= */
/* SAVE PROFILE */
/* ========================================================= */

async function saveProfile(event) {

    event.preventDefault();


    const input =
        document.getElementById(
            "profileFullName"
        );

    const button =
        document.getElementById(
            "profileSaveButton"
        );


    if (!input || !button) {
        return;
    }


    const fullName =
        input.value.trim();


    /* ------------------------------------------------------- */
    /* Empty */
    /* ------------------------------------------------------- */

    if (!fullName) {

        showProfileToast(
            "Eksik bilgi",
            "Ad Soyad alanı boş bırakılamaz.",
            false
        );

        input.focus();

        return;
    }


    /* ------------------------------------------------------- */
    /* Minimum length */
    /* ------------------------------------------------------- */

    if (fullName.length < 2) {

        showProfileToast(
            "Geçersiz bilgi",
            "Ad Soyad en az 2 karakter olmalıdır.",
            false
        );

        input.focus();

        return;
    }


    const originalHtml =
        button.innerHTML;


    button.disabled = true;

    button.innerHTML = `
        <span
            class="spinner-border spinner-border-sm"
            role="status">
        </span>

        <span>Kaydediliyor...</span>
    `;


    try {

        const result =
            await api.put(
                "/User/Profile",
                {
                    fullName: fullName
                }
            );


        if (!result) {
            return;
        }


        const profile =
            result.data;


        if (profile) {

            renderProfile(profile);


            /*
             * Dashboard'daki kullanıcı bilgilerini
             * de güncel tut.
             */

            localStorage.setItem(
                "fullName",
                profile.fullName
            );

            localStorage.setItem(
                "email",
                profile.email
            );
        }


        showProfileToast(
            "Profil güncellendi",
            "Değişiklikler başarıyla kaydedildi.",
            true
        );

    }
    catch (error) {

        console.error(
            "Profil güncelleme hatası:",
            error
        );


        showProfileToast(
            "Güncelleme başarısız",
            error.message ||
            "Profil güncellenemedi.",
            false
        );
    }
    finally {

        button.disabled = false;

        button.innerHTML =
            originalHtml;
    }
}


/* ========================================================= */
/* DATE */
/* ========================================================= */

function formatProfileDate(
    value
) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";
    }


    return date.toLocaleDateString(
        "tr-TR",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


/* ========================================================= */
/* TOAST */
/* ========================================================= */

function showProfileToast(
    title,
    message,
    success = true
) {

    const toast =
        document.getElementById(
            "profileToast"
        );

    const titleElement =
        document.getElementById(
            "profileToastTitle"
        );

    const messageElement =
        document.getElementById(
            "profileToastMessage"
        );

    const icon =
        toast?.querySelector(
            ".profile-toast-icon"
        );


    if (!toast) {
        return;
    }


    if (titleElement) {

        titleElement.textContent =
            title;
    }


    if (messageElement) {

        messageElement.textContent =
            message;
    }


    if (icon) {

        icon.style.background =
            success
                ? "rgba(22, 163, 74, 0.10)"
                : "rgba(239, 68, 68, 0.10)";

        icon.style.color =
            success
                ? "var(--success)"
                : "var(--danger)";

        icon.innerHTML =
            success
                ? '<i class="bi bi-check-lg"></i>'
                : '<i class="bi bi-exclamation-lg"></i>';
    }


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        3200
    );
}