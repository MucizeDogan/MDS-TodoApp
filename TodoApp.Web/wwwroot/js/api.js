class ApiClient {

    async request(url, options = {}) {

        const token = localStorage.getItem("token");

        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_BASE_URL}${url}`,
            {
                ...options,
                headers: headers
            }
        );

        let result = null;

        try {
            result = await response.json();
        }
        catch {
            result = null;
        }

        //if (response.status === 401) {

        //    this.logout();

        //    return null;
        //}
        if (response.status === 401) {
            if (!this.isPublicAuthRequest(url)) {
                this.logout("Oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.");
                return null;
            }

            const message =
                result?.message ||
                "E-posta adresi veya şifre hatalı.";

            throw new Error(message);
        }


        if (!response.ok) {

            const message = result?.message ||  "API isteği sırasında bir hata oluştu.";

            throw new Error(message);
        }

        return result;
    }

    async get(url) {

        return await this.request(
            url,
            {
                method: "GET"
            }
        );
    }

    async post(url, data) {

        return await this.request(
            url,
            {
                method: "POST",
                body: JSON.stringify(data)
            }
        );
    }

    async put(url, data) {

        return await this.request(
            url,
            {
                method: "PUT",
                body: JSON.stringify(data)
            }
        );
    }

    async delete(url) {

        return await this.request(
            url,
            {
                method: "DELETE"
            }
        );
    }

    async patch(url, data = null) {

        const options = {
            method: "PATCH"
        };

        if (data !== null) {

            options.body = JSON.stringify(data);
        }

        return await this.request(
            url,
            options
        );
    }


    isPublicAuthRequest(url) {
        const publicPrefixes = [
            "/Auth/login",
            "/Auth/register",
            "/User/ForgotPassword",
            "/User/ResetPassword",
            "/User/ConfirmEmail",
            "/User/GenerateEmailConfirmation",
            "/User/ResendEmailConfirmation",
            "/User/ConfirmEmailChange"
        ];

        return publicPrefixes.some(prefix =>
            String(url).toLowerCase().startsWith(prefix.toLowerCase())
        );
    }

    logout(message = null) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("fullName");
        localStorage.removeItem("email");

        if (message) {
            sessionStorage.setItem("authRedirectMessage", message);
        }

        window.location.href = "login.html";
    }
}

const api = new ApiClient();