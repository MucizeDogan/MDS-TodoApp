let todos = [];
let categories = [];
let currentUserProfile = null;

let currentFilter = "all";
let currentView = "all";
let currentCategory = "all";

let todoModal;
let categoryModal;
let selectedTodoId = null;

let activeSwipeItem = null;

let swipeState = {
    item: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    isDragging: false,
    isHorizontal: false,
    didSwipe: false,
    pointerId: null
};

/* ========================================================= */
/* INIT */
/* ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);


async function initializeDashboard() {

    if (!requireAuthentication()) {
        return;
    }

    initializeBootstrapModals();

    initializeUser();

    updateMobileThemeText();

    initializeDate();

    await loadCurrentUserProfile();

    initializeEvents();

    initializeNotifications();

    await loadDashboardData();
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
/* BOOTSTRAP */
/* ========================================================= */

function initializeBootstrapModals() {

    todoModal =
        new bootstrap.Modal(
            document.getElementById("todoModal")
        );

    categoryModal =
        new bootstrap.Modal(
            document.getElementById("categoryModal")
        );
}


/* ========================================================= */
/* USER */
/* ========================================================= */

function initializeUser() {

    const fullName =
        localStorage.getItem("fullName")
        || "Kullanıcı";

    const email =
        localStorage.getItem("email")
        || "";

    const firstLetter =
        fullName
            .charAt(0)
            .toUpperCase();


    document.getElementById(
        "topbarUserName"
    ).textContent = fullName;


    document.getElementById(
        "dropdownUserName"
    ).textContent = fullName;


    document.getElementById(
        "dropdownEmail"
    ).textContent = email;


    document.getElementById(
        "userAvatar"
    ).textContent = firstLetter;


    document.getElementById(
        "dropdownAvatar"
    ).textContent = firstLetter;


    document.getElementById(
        "welcomeTitle"
    ).textContent =
        `${getGreeting()}, ${fullName} 👋`;
}


function getGreeting() {

    const hour =
        new Date().getHours();

    if (hour < 12) {
        return "Günaydın";
    }

    if (hour < 18) {
        return "İyi günler";
    }

    return "İyi akşamlar";
}


/* ========================================================= */
/* DATE */
/* ========================================================= */

function initializeDate() {

    const now = new Date();

    const text =
        now.toLocaleDateString(
            "tr-TR",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    document.getElementById(
        "currentDate"
    ).textContent = text;
}

async function loadCurrentUserProfile() {
    try {
        const result = await api.get("/User/Profile");

        if (!result || !result.data) {
            return;
        }

        currentUserProfile = result.data;

        updateEmailReminderAvailability();

    } catch (error) {
        console.error(
            "Kullanıcı profili alınamadı:",
            error
        );
    }
}


/* ========================================================= */
/* EVENTS */
/* ========================================================= */

function initializeEvents() {

    initializeEmailReminderEvents();

    /* Add Todo */

    document
        .getElementById("addTodoButton")
        .addEventListener(
            "click",
            openCreateTodoModal
        );


    document
        .getElementById("emptyAddButton")
        .addEventListener(
            "click",
            openCreateTodoModal
        );


    /* Save Todo */

    document
        .getElementById("saveTodoButton")
        .addEventListener(
            "click",
            saveTodo
        );


    /* Category */

    document
        .getElementById("addCategoryButton")
        .addEventListener(
            "click",
            openCreateCategoryModal
        );


    document
        .getElementById("sideAddCategoryButton")
        .addEventListener(
            "click",
            openCreateCategoryModal
        );


    /* Save category */

    document
        .getElementById("saveCategoryButton")
        .addEventListener(
            "click",
            saveCategory
        );


    /* Search */

    document
        .getElementById("searchInput")
        .addEventListener(
            "input",
            renderTasks
        );


    /* Category filter */

    document
        .getElementById("categoryFilter")
        .addEventListener(
            "change",
            event => {

                currentCategory =
                    event.target.value;

                renderTasks();
            }
        );


    /* Filters */

    document
        .querySelectorAll(".filter-tab")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".filter-tab"
                        )
                        .forEach(x =>
                            x.classList.remove(
                                "active"
                            )
                        );

                    button.classList.add(
                        "active"
                    );

                    currentFilter =
                        button.dataset.filter;

                    renderTasks();
                }
            );

        });


    /* Sidebar navigation */

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const view =
                        item.dataset.view || "all";


                    /*
                     * Dashboard'a tıklanırsa
                     * bütün filtreleri temizle.
                     */
                    if (view === "all") {

                        currentView = "all";

                        currentFilter = "all";

                        currentCategory = "all";

                        document.getElementById(
                            "categoryFilter"
                        ).value = "all";


                        document
                            .querySelectorAll(
                                ".filter-tab"
                            )
                            .forEach(x =>
                                x.classList.remove(
                                    "active"
                                )
                            );


                        document
                            .querySelector(
                                '[data-filter="all"]'
                            )
                            ?.classList.add(
                                "active"
                            );


                        document
                            .querySelectorAll(
                                ".sidebar-category"
                            )
                            .forEach(x =>
                                x.classList.remove(
                                    "active"
                                )
                            );
                    }

                    else {

                        currentView = view;
                    }


                    document
                        .querySelectorAll(
                            ".nav-item"
                        )
                        .forEach(x =>
                            x.classList.remove(
                                "active"
                            )
                        );


                    item.classList.add(
                        "active"
                    );


                    updatePanelTitle();

                    renderTasks();
                }
            );

        });


    /* Refresh */

    document
        .getElementById("refreshButton")
        .addEventListener(
            "click",
            async () => {

                await loadDashboardData();

                showToast(
                    "Güncellendi",
                    "Dashboard yenilendi."
                );
            }
        );


    /* User dropdown */

    document
        .getElementById("userButton")
        .addEventListener(
            "click",
            event => {

                event.stopPropagation();

                document
                    .getElementById(
                        "userDropdown"
                    )
                    .classList.toggle("show");
            }
        );


    document.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "userDropdown"
                )
                .classList.remove("show");

        }
    );

    /* Profile */

    document
        .getElementById("profileButton")
        ?.addEventListener(
            "click",
            () => {

                window.location.href = "profile.html";
            }
        );


    /* Logout */

    document
        .getElementById("logoutButton")
        .addEventListener(
            "click",
            () => api.logout()
        );


    /* Mobile menu */

    document
        .getElementById("mobileMenuButton")
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById("sidebar")
                    .classList.add("open");
            }
        );


    document
        .getElementById("sidebarClose")
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById("sidebar")
                    .classList.remove("open");
            }
    );

    /* ========================================================= */
    /* MOBILE BOTTOM NAVIGATION */
    /* ========================================================= */

    document
        .querySelectorAll(".mobile-nav-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const view =
                        button.dataset.mobileView;

                    if (!view) {
                        return;
                    }


                    /* ----------------------------------------- */
                    /* DASHBOARD */
                    /* ----------------------------------------- */

                    if (view === "all") {

                        resetTaskFilters();

                    }


                    /* ----------------------------------------- */
                    /* PENDING TASKS */
                    /* ----------------------------------------- */

                    else if (view === "pending") {

                        currentView = "pending";

                        currentFilter = "all";

                        currentCategory = "all";


                        document
                            .getElementById(
                                "categoryFilter"
                            )
                            .value = "all";


                        document
                            .querySelectorAll(
                                ".filter-tab"
                            )
                            .forEach(x =>
                                x.classList.remove(
                                    "active"
                                )
                            );


                        document
                            .querySelector(
                                '[data-filter="all"]'
                            )
                            ?.classList.add(
                                "active"
                            );


                        updatePanelTitle();

                        renderTasks();

                    }


                    /* ----------------------------------------- */
                    /* COMPLETED */
                    /* ----------------------------------------- */

                    else if (view === "completed") {

                        currentView = "completed";

                        currentFilter = "all";

                        currentCategory = "all";


                        document
                            .getElementById(
                                "categoryFilter"
                            )
                            .value = "all";


                        document
                            .querySelectorAll(
                                ".filter-tab"
                            )
                            .forEach(x =>
                                x.classList.remove(
                                    "active"
                                )
                            );


                        document
                            .querySelector(
                                '[data-filter="all"]'
                            )
                            ?.classList.add(
                                "active"
                            );


                        updatePanelTitle();

                        renderTasks();

                    }


                    /* ----------------------------------------- */
                    /* ACTIVE STATE */
                    /* ----------------------------------------- */

                    document
                        .querySelectorAll(
                            ".mobile-nav-item"
                        )
                        .forEach(x =>
                            x.classList.remove(
                                "active"
                            )
                        );


                    button.classList.add(
                        "active"
                    );


                    /* ----------------------------------------- */
                    /* SYNC DESKTOP SIDEBAR */
                    /* ----------------------------------------- */

                    document
                        .querySelectorAll(
                            ".nav-item"
                        )
                        .forEach(x =>
                            x.classList.remove(
                                "active"
                            )
                        );


                    const desktopNav =
                        document.querySelector(
                            `.nav-item[data-view="${view}"]`
                        );


                    desktopNav?.classList.add(
                        "active"
                    );

                }
            );

        });

    document
        .getElementById("mobileAddTodoButton")
        .addEventListener(
            "click",
            openCreateTodoModal
    );

    /* ========================================================= */
    /* MOBILE MORE SHEET */
    /* ========================================================= */

    const mobileMoreButton =
        document.getElementById(
            "mobileMoreButton"
        );

    const mobileMoreSheet =
        document.getElementById(
            "mobileMoreSheet"
        );

    const mobileMoreOverlay =
        document.getElementById(
            "mobileMoreOverlay"
        );

    const mobileMoreClose =
        document.getElementById(
            "mobileMoreClose"
        );


    function openMobileMoreSheet() {

        if (!mobileMoreSheet) {
            return;
        }

        mobileMoreSheet.classList.add(
            "active"
        );

        mobileMoreOverlay?.classList.add(
            "active"
        );

        mobileMoreSheet.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "mobile-sheet-open"
        );
    }

    mobileMoreButton?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            openMobileMoreSheet();
        }
    );


    mobileMoreClose?.addEventListener(
        "click",
        //closeMobileMoreSheet
        closeMobileMoreSheetGlobal
    );


    mobileMoreOverlay?.addEventListener(
        "click",
        //closeMobileMoreSheet
        closeMobileMoreSheetGlobal
    );


    /* View buttons */

    document
        .querySelectorAll(".view-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".view-button"
                        )
                        .forEach(x =>
                            x.classList.remove(
                                "active"
                            )
                        );

                    button.classList.add(
                        "active"
                    );

                    const mode =
                        button.dataset.viewMode;

                    document
                        .getElementById(
                            "taskList"
                        )
                        .classList.toggle(
                            "compact",
                            mode === "compact"
                        );
                }
            );

        });


    /* Colors */

    document
        .querySelectorAll(".color-option")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".color-option"
                        )
                        .forEach(x =>
                            x.classList.remove(
                                "selected"
                            )
                        );

                    button.classList.add(
                        "selected"
                    );
                }
            );

        });


    /* Dark mode */

    document
        .getElementById("darkModeButton")
        .addEventListener(
            "click",
            toggleDarkMode
        );


    /* Keyboard shortcut */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "/" &&
                document.activeElement.tagName !== "INPUT"
            ) {

                event.preventDefault();

                document
                    .getElementById(
                        "searchInput"
                    )
                    .focus();
            }


            if (
                event.key === "n" &&
                document.activeElement.tagName !== "INPUT" &&
                document.activeElement.tagName !== "TEXTAREA"
            ) {

                openCreateTodoModal();
            }

        }
    );

    document
        .querySelector(".brand")
        .addEventListener(
            "click",
            event => {

                event.preventDefault();

                resetTaskFilters();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        );
}

function resetTaskFilters() {

    currentView = "all";

    currentFilter = "all";

    currentCategory = "all";


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );

    if (categoryFilter) {
        categoryFilter.value = "all";
    }


    document
        .querySelectorAll(
            ".filter-tab"
        )
        .forEach(x =>
            x.classList.remove(
                "active"
            )
        );


    document
        .querySelector(
            '[data-filter="all"]'
        )
        ?.classList.add(
            "active"
        );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(x =>
            x.classList.remove(
                "active"
            )
        );


    document
        .querySelector(
            '.nav-item[data-view="all"]'
        )
        ?.classList.add(
            "active"
        );


    document
        .querySelectorAll(
            ".sidebar-category"
        )
        .forEach(x =>
            x.classList.remove(
                "active"
            )
        );


    document
        .querySelectorAll(
            ".smart-summary-item"
        )
        .forEach(x =>
            x.classList.remove(
                "active"
            )
        );


    document
        .querySelector(
            '[data-smart-filter="today"]'
        )
        ?.classList.add(
            "active"
        );


    updatePanelTitle();

    renderTasks();

    document
        .querySelectorAll(".mobile-nav-item")
        .forEach(x =>
            x.classList.remove("active")
        );

    document
        .querySelector(
            '.mobile-nav-item[data-mobile-view="all"]'
        )
        ?.classList.add("active");
}


/* ========================================================= */
/* LOAD DATA */
/* ========================================================= */

async function loadDashboardData() {

    try {

        const [todoResult, categoryResult] =
            await Promise.all([
                api.get("/Todo"),
                api.get("/Category")
            ]);


        if (!todoResult || !categoryResult) {
            return;
        }


        todos =
            todoResult.data?.items
            || [];


        categories =
            categoryResult.data
            || [];


        renderEverything();

    }
    catch (error) {

        console.error(error);

        showToast(
            "Hata",
            error.message,
            true
        );
    }
}

function renderSmartSummary() {

    const now = new Date();


    const startOfToday =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    const endOfToday =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
        );


    const todayCount =
        todos.filter(todo => {

            if (todo.isCompleted ||
                !todo.dueDate) {
                return false;
            }

            const date =
                new Date(
                    todo.dueDate
                );

            return (
                date >= startOfToday &&
                date < endOfToday
            );

        }).length;


    const overdueCount =
        todos.filter(todo => {

            if (todo.isCompleted ||
                !todo.dueDate) {
                return false;
            }

            return (
                new Date(todo.dueDate)
                < startOfToday
            );

        }).length;


    const upcomingCount =
        todos.filter(todo => {

            if (todo.isCompleted ||
                !todo.dueDate) {
                return false;
            }

            return (
                new Date(todo.dueDate)
                >= endOfToday
            );

        }).length;


    document.getElementById(
        "todayTaskCount"
    ).textContent =
        todayCount;


    document.getElementById(
        "upcomingTaskCount"
    ).textContent =
        upcomingCount;


    document.getElementById(
        "overdueTaskCount"
    ).textContent =
        overdueCount;
}

document
    .querySelectorAll(
        ".smart-summary-item"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const filter =
                    button.dataset.smartFilter;


                document
                    .querySelectorAll(
                        ".smart-summary-item"
                    )
                    .forEach(x =>
                        x.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                currentView = "all";

                currentCategory = "all";

                currentFilter =
                    filter;


                if (filter === "today") {

                    currentFilter =
                        "today";
                }

                else if (
                    filter === "upcoming"
                ) {

                    currentFilter =
                        "upcoming";
                }

                else if (
                    filter === "overdue"
                ) {

                    currentFilter =
                        "overdue";
                }


                document.getElementById(
                    "categoryFilter"
                ).value = "all";


                renderTasks();
            }
        );

    });


/* ========================================================= */
/* RENDER EVERYTHING */
/* ========================================================= */

function renderEverything() {

    renderStatistics();

    renderCategories();

    renderSidebarCategories();

    renderCategoryFilter();

    renderTasks();

    renderUpcoming();

    renderTodayProgress();

    updatePanelTitle();

    renderSmartSummary();
}


/* ========================================================= */
/* STATISTICS */
/* ========================================================= */

function renderStatistics() {

    const total =
        todos.length;

    const completed =
        todos.filter(
            x => x.isCompleted
        ).length;

    const pending =
        total - completed;

    const rate =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    document.getElementById(
        "totalCount"
    ).textContent = total;


    document.getElementById(
        "pendingCount"
    ).textContent = pending;


    document.getElementById(
        "completedCount"
    ).textContent = completed;


    document.getElementById(
        "completionRate"
    ).textContent =
        `${rate}%`;


    document.getElementById(
        "completionProgress"
    ).style.width =
        `${rate}%`;


    document.getElementById(
        "sidebarPendingCount"
    ).textContent =
        pending;
}


/* ========================================================= */
/* CATEGORIES */
/* ========================================================= */

function renderCategories() {

    const container =
        document.getElementById(
            "categoryList"
        );

    if (!categories.length) {

        container.innerHTML = `
            <div class="text-muted small">
                Henüz kategori yok.
            </div>
        `;

        return;
    }


    container.innerHTML =
        categories
            .map(category => {

                const color =
                    category.color
                    || "#6c63ff";

                return `
                    <div class="dashboard-category">

                        <span
                            class="category-dot"
                            style="
                                --category-color:${color}
                            ">
                        </span>

                        <span
                            class="dashboard-category-name">

                            ${escapeHtml(
                    category.name
                )}

                        </span>

                        <span
                            class="dashboard-category-count">

                            ${category.todoCount || 0}

                        </span>

                    </div>
                `;

            })
            .join("");
}


function renderSidebarCategories() {

    const container =
        document.getElementById(
            "sidebarCategories"
        );


    if (!categories.length) {

        container.innerHTML = `
            <div class="category-loading">
                Henüz kategori yok.
            </div>
        `;

        return;
    }


    container.innerHTML =
        categories
            .map(category => {

                const color =
                    category.color
                    || "#6c63ff";

                return `
                    <button
                        class="sidebar-category"
                        data-category-id="${category.id}">

                        <span
                            class="category-dot"
                            style="
                                --category-color:${color}
                            ">
                        </span>

                        <span>
                            ${escapeHtml(
                    category.name
                )}
                        </span>

                        <span
                            class="sidebar-category-count">

                            ${category.todoCount || 0}

                        </span>

                    </button>
                `;

            })
            .join("");


    container
        .querySelectorAll(
            ".sidebar-category"
        )
        .forEach(button => {

            //button.addEventListener(
            //    "click",
            //    () => {

            //        currentCategory =
            //            button.dataset.categoryId;

            //        document.getElementById(
            //            "categoryFilter"
            //        ).value =
            //            currentCategory;

            //        currentFilter = "all";

            //        document
            //            .querySelectorAll(
            //                ".filter-tab"
            //            )
            //            .forEach(x =>
            //                x.classList.remove(
            //                    "active"
            //                )
            //            );

            //        document
            //            .querySelector(
            //                '[data-filter="all"]'
            //            )
            //            ?.classList.add(
            //                "active"
            //            );

            //        renderTasks();
            //    }
            //);
            button.addEventListener(
                "click",
                () => {

                    currentCategory =
                        button.dataset.categoryId;

                    currentView = "all";

                    currentFilter = "all";


                    document
                        .querySelectorAll(
                            ".sidebar-category"
                        )
                        .forEach(x =>
                            x.classList.remove(
                                "active"
                            )
                        );

                    button.classList.add(
                        "active"
                    );


                    document
                        .querySelectorAll(
                            ".nav-item"
                        )
                        .forEach(x =>
                            x.classList.remove(
                                "active"
                            )
                        );


                    document.getElementById(
                        "categoryFilter"
                    ).value =
                        currentCategory;


                    document
                        .querySelectorAll(
                            ".filter-tab"
                        )
                        .forEach(x =>
                            x.classList.remove(
                                "active"
                            )
                        );


                    document
                        .querySelector(
                            '[data-filter="all"]'
                        )
                        ?.classList.add(
                            "active"
                        );


                    updatePanelTitle();

                    renderTasks();

                }
            );

        });
}


function renderCategoryFilter() {

    const select =
        document.getElementById(
            "categoryFilter"
        );

    select.innerHTML = `
        <option value="all">
            Tüm Kategoriler
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value =
            category.id;

        option.textContent =
            category.name;

        select.appendChild(option);
    });


    select.value =
        currentCategory;
}


/* ========================================================= */
/* TASKS */
/* ========================================================= */

function getFilteredTodos() {

    let result = [...todos];


    if (currentView === "pending") {

        result =
            result.filter(
                x => !x.isCompleted
            );
    }


    if (currentView === "completed") {

        result =
            result.filter(
                x => x.isCompleted
            );
    }


    if (currentFilter === "pending") {

        result =
            result.filter(
                x => !x.isCompleted
            );
    }


    if (currentFilter === "completed") {

        result =
            result.filter(
                x => x.isCompleted
            );
    }


    if (currentFilter === "high") {

        result =
            result.filter(
                x =>
                    !x.isCompleted &&
                    x.priority === 3
            );
    }

    if (currentFilter === "today") {

        const now = new Date();

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

        const end =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1
            );


        result =
            result.filter(todo => {

                if (
                    todo.isCompleted ||
                    !todo.dueDate
                ) {
                    return false;
                }

                const date =
                    new Date(todo.dueDate);

                return (
                    date >= start &&
                    date < end
                );
            });
    }


    if (currentFilter === "upcoming") {

        const now = new Date();

        const tomorrow =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1
            );


        result =
            result.filter(todo => {

                if (
                    todo.isCompleted ||
                    !todo.dueDate
                ) {
                    return false;
                }

                return (
                    new Date(todo.dueDate)
                    >= tomorrow
                );
            });
    }


    if (currentFilter === "overdue") {

        const now = new Date();

        const today =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );


        result =
            result.filter(todo => {

                if (
                    todo.isCompleted ||
                    !todo.dueDate
                ) {
                    return false;
                }

                return (
                    new Date(todo.dueDate)
                    < today
                );
            });
    }


    if (currentCategory !== "all") {

        result =
            result.filter(
                x =>
                    String(x.categoryId)
                    === String(currentCategory)
            );
    }


    const search =
        document
            .getElementById("searchInput")
            .value
            .trim()
            .toLowerCase();


    if (search) {

        result =
            result.filter(x =>

                x.title
                    ?.toLowerCase()
                    .includes(search)

                ||

                x.description
                    ?.toLowerCase()
                    .includes(search)

                ||

                x.categoryName
                    ?.toLowerCase()
                    .includes(search)

            );
    }


    return result;
}

function updateEmptyState() {

    const title =
        document.getElementById(
            "emptyStateTitle"
        );

    const message =
        document.getElementById(
            "emptyStateMessage"
        );


    const search =
        document.getElementById(
            "searchInput"
        )
            .value
            .trim();


    if (search) {

        title.textContent =
            "Sonuç bulunamadı";

        message.textContent =
            `"${search}" için eşleşen görev bulunamadı.`;

        return;
    }


    if (currentCategory !== "all") {

        const category =
            categories.find(
                x =>
                    String(x.id)
                    === String(currentCategory)
            );


        title.textContent =
            "Bu kategoride görev yok";

        message.textContent =
            category
                ? `"${category.name}" kategorisinde henüz görev bulunmuyor.`
                : "Bu kategoride henüz görev bulunmuyor.";

        return;
    }


    if (currentFilter === "completed") {

        title.textContent =
            "Henüz tamamlanan görev yok";

        message.textContent =
            "Bir görevi tamamladığında burada görünecek.";

        return;
    }


    title.textContent =
        "Burada henüz bir görev yok";

    message.textContent =
        "Yeni bir görev oluşturarak başlayabilirsin.";
}


function renderTasks() {

    const container =
        document.getElementById(
            "taskList"
        );

    const empty =
        document.getElementById(
            "emptyState"
        );


    const filtered =
        getFilteredTodos();


    if (!filtered.length) {

        container.innerHTML = "";

        empty.classList.remove(
            "d-none"
        );

        return;
    }


    empty.classList.add(
        "d-none"
    );

    if (!filtered.length) {

        container.innerHTML = "";

        updateEmptyState();

        empty.classList.remove(
            "d-none"
        );

        return;
    }


    container.innerHTML =
        filtered
            .map(renderTask)
            .join("");


    attachTaskEvents();
}


function renderTask(todo) {

    const priority =
        getPriorityInfo(
            todo.priority
        );


    const category =
        categories.find(
            x => x.id === todo.categoryId
        );


    const categoryColor =
        category?.color
        || "#6c63ff";


    const due =
        formatDueDate(
            todo.dueDate
        );


    return `
    <div
        class="task-item ${todo.isCompleted
            ? "completed"
            : ""
        }"
        data-id="${todo.id}">

        <!-- SAĞA KAYDIRINCA GÖRÜNECEK -->
        <button
            type="button"
            class="task-swipe-action swipe-complete"
            data-swipe-action="complete"
            title="Tamamla">

            <i class="bi bi-check-lg"></i>
            <span>Tamamla</span>

        </button>

        <!-- SOLA KAYDIRINCA GÖRÜNECEK -->
        <div class="task-swipe-actions-right">

            <button
                type="button"
                class="swipe-action-button swipe-edit"
                data-swipe-action="edit"
                title="Düzenle">

                <i class="bi bi-pencil"></i>
                <span>Düzenle</span>

            </button>

            <button
                type="button"
                class="swipe-action-button swipe-delete"
                data-swipe-action="delete"
                title="Sil">

                <i class="bi bi-trash3"></i>
                <span>Sil</span>

            </button>

        </div>


        <!-- ASIL GÖREV KARTI -->
        <div class="task-swipe-content">

            <button
                class="task-checkbox"
                data-action="complete"
                title="${todo.isCompleted
            ? "Tekrar bekleyen yap"
            : "Tamamla"
        }">

                ${todo.isCompleted
            ? `<i class="bi bi-check-lg"></i>`
            : ""
        }

            </button>


            <div
                class="task-main"
                data-action="edit">

                <div class="task-title">

                    ${escapeHtml(
            todo.title
        )}

                </div>


                <div class="task-meta">

                    ${todo.categoryName
            ? `
                            <span
                                class="task-category">

                                <span
                                    class="task-category-dot"
                                    style="
                                        --category-color:${categoryColor}
                                    ">
                                </span>

                                ${escapeHtml(
                todo.categoryName
            )}

                            </span>
                          `
            : ""
        }


                    ${due
            ? `
                            <span
                                class="task-due ${due.className}">

                                <i
                                    class="bi bi-calendar3">
                                </i>

                                ${due.text}

                            </span>
                          `
            : ""
        }

                </div>

            </div>


            <span
                class="priority-badge ${priority.className}">

                ${priority.text}

            </span>


            <div class="task-actions">

                <button
                    class="task-action-button"
                    data-action="edit"
                    title="Düzenle">

                    <i class="bi bi-pencil"></i>

                </button>


                <button
                    class="task-action-button delete"
                    data-action="delete"
                    title="Sil">

                    <i class="bi bi-trash3"></i>

                </button>

            </div>

        </div>

    </div>
`;
}


/* ========================================================= */
/* TASK EVENTS */
/* ========================================================= */

function attachTaskEvents() {

    document
        .querySelectorAll(".task-item")
        .forEach(item => {

            const id =
                Number(item.dataset.id);

            //item.addEventListener(
            //    "click",
            //    () => {
            //        openTodoDetail(id);
            //    }
            //);

            item.addEventListener(
                "click",
                event => {

                    if (
                        item.dataset.swiped === "true"
                    ) {

                        delete item.dataset.swiped;

                        return;
                    }


                    /*
                     * Aynı task zaten açıksa kapat.
                     */

                    if (
                        activeSwipeItem === item
                    ) {

                        resetSwipePosition(item);

                        activeSwipeItem = null;

                        return;

                    }


                    /*
                     * Başka task açıksa önce onu kapat.
                     */

                    if (
                        activeSwipeItem &&
                        activeSwipeItem !== item
                    ) {

                        resetSwipePosition(
                            activeSwipeItem
                        );

                        activeSwipeItem = null;

                        openTodoDetail(id);

                        return;
                    }


                    openTodoDetail(id);

                }
            );


            item
                .querySelectorAll(
                    "[data-action]"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            const action =
                                button.dataset.action;


                            if (
                                action === "complete"
                            ) {

                                toggleTodo(id);

                            }

                            else if (
                                action === "edit"
                            ) {

                                openEditTodoModal(id);

                            }

                            else if (
                                action === "delete"
                            ) {

                                deleteTodo(id);

                            }

                        }
                    );

                });

        });

    attachSwipeEvents();
}

/* ========================================================= */
/* MOBILE SWIPE */
/* ========================================================= */

function isSwipeDevice() {

    return window.matchMedia(
        "(max-width: 700px)"
    ).matches;

}


function resetSwipeState() {

    swipeState.item = null;
    swipeState.startX = 0;
    swipeState.startY = 0;
    swipeState.currentX = 0;
    swipeState.isDragging = false;
    swipeState.isHorizontal = false;
    swipeState.didSwipe = false;
    swipeState.pointerId = null;

}


function closeActiveSwipe(exceptItem = null) {

    if (
        activeSwipeItem &&
        activeSwipeItem !== exceptItem
    ) {

        resetSwipePosition(
            activeSwipeItem
        );

    }

    if (exceptItem === null) {
        activeSwipeItem = null;
    }

}


function setSwipePosition(
    item,
    distance,
    animate = false
) {

    const content =
        item.querySelector(
            ".task-swipe-content"
        );

    if (!content) {
        return;
    }


    if (animate) {

        content.style.transition =
            "transform 0.22s ease";

    }
    else {

        content.style.transition =
            "none";

    }


    content.style.transform =
        `translateX(${distance}px)`;

}


function resetSwipePosition(item) {

    const content =
        item.querySelector(
            ".task-swipe-content"
        );

    if (!content) {
        return;
    }


    content.style.transition =
        "transform 0.22s ease";

    content.style.transform =
        "translateX(0)";

    item.classList.remove(
        "swipe-left",
        "swipe-right"
    );

}


function attachSwipeEvents() {

    if (!isSwipeDevice()) {
        return;
    }


    document
        .querySelectorAll(".task-item")
        .forEach(item => {

            const content =
                item.querySelector(
                    ".task-swipe-content"
                );

            if (!content) {
                return;
            }


            content.addEventListener(
                "pointerdown",
                event => {

                    /*
                     * Mouse ile swipe yapmayacağız.
                     * Böylece desktop/tablet mouse
                     * hareketleri yanlışlıkla swipe olmaz.
                     */

                    if (
                        event.pointerType === "mouse"
                        ||
                        !isSwipeDevice()
                    ) {
                        return;
                    }


                    /*
                     * Buton veya checkbox üzerinde
                     * başlayan hareketleri swipe olarak
                     * kabul etme.
                     */

                    if (
                        event.target.closest(
                            "button, a, input, select, textarea"
                        )
                    ) {
                        return;
                    }


                    closeActiveSwipe(item);


                    swipeState.item = item;

                    swipeState.startX =
                        event.clientX;

                    swipeState.startY =
                        event.clientY;

                    swipeState.currentX =
                        event.clientX;

                    swipeState.isDragging = false;

                    swipeState.isHorizontal = false;

                    swipeState.pointerId =
                        event.pointerId;

                }
            );


            content.addEventListener(
                "pointermove",
                event => {

                    if (
                        swipeState.item !== item ||
                        swipeState.pointerId !== event.pointerId
                    ) {
                        return;
                    }


                    const deltaX =
                        event.clientX -
                        swipeState.startX;

                    const deltaY =
                        event.clientY -
                        swipeState.startY;


                    /*
                     * Henüz hareket yönünü
                     * belirlemediysek küçük
                     * hareketleri görmezden gel.
                     */

                    if (
                        !swipeState.isHorizontal &&
                        Math.abs(deltaX) < 8 &&
                        Math.abs(deltaY) < 8
                    ) {
                        return;
                    }


                    /*
                     * Dikey hareket baskınsa
                     * sayfanın normal scroll davranışını
                     * bozma.
                     */

                    if (
                        !swipeState.isHorizontal &&
                        Math.abs(deltaY) > Math.abs(deltaX)
                    ) {

                        resetSwipeState();

                        return;
                    }


                    swipeState.isHorizontal = true;
                    swipeState.isDragging = true;
                    swipeState.didSwipe = true;

                    let distance = deltaX;

                    /*
                     * Maksimum sağ swipe:
                     * 100px
                     */

                    if (distance > 100) {
                        distance = 100;
                    }


                    /*
                     * Maksimum sol swipe:
                     * 150px
                     */

                    if (distance < -150) {
                        distance = -150;
                    }


                    setSwipePosition(
                        item,
                        distance,
                        false
                    );


                    /*
                     * Sağ / sol sınıfını
                     * görsel olarak belirle.
                     */

                    item.classList.toggle(
                        "swipe-right",
                        distance > 10
                    );

                    item.classList.toggle(
                        "swipe-left",
                        distance < -10
                    );


                    /*
                     * Yatay gesture başladıktan sonra
                     * pointer capture kullan.
                     */

                    try {

                        content.setPointerCapture(
                            event.pointerId
                        );

                    }
                    catch {
                        // Desteklenmeyen cihazlarda sorun çıkarma.
                    }


                    event.preventDefault();

                }
            );


            content.addEventListener(
                "pointerup",
                event => {

                    handleSwipeEnd(
                        item,
                        event
                    );

                }
            );


            content.addEventListener(
                "pointercancel",
                event => {

                    handleSwipeCancel(
                        item,
                        event
                    );

                }
            );

        });

    document
        .querySelectorAll("[data-swipe-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    const item =
                        button.closest(".task-item");

                    if (!item) {
                        return;
                    }


                    const id =
                        Number(item.dataset.id);

                    const action =
                        button.dataset.swipeAction;


                    /*
                     * Önce swipe kartını kapat.
                     */

                    resetSwipePosition(item);

                    if (activeSwipeItem === item) {
                        activeSwipeItem = null;
                    }


                    /*
                     * TAMAMLA
                     */

                    if (action === "complete") {

                        await toggleTodo(id);

                        return;
                    }


                    /*
                     * DÜZENLE
                     */

                    if (action === "edit") {

                        openEditTodoModal(id);

                        return;
                    }


                    /*
                     * SİL
                     */

                    if (action === "delete") {

                        deleteTodo(id);

                        return;
                    }

                }
            );

        });

}


function handleSwipeEnd(
    item,
    event
) {

    if (
        swipeState.item !== item ||
        swipeState.pointerId !== event.pointerId
    ) {
        return;
    }


    const deltaX =
        event.clientX -
        swipeState.startX;


    const wasHorizontal =
        swipeState.isHorizontal;


    /*
     * Gesture tamamlandı.
     */

    if (!wasHorizontal) {

        resetSwipeState();

        return;
    }


    /*
     * Sağa yeterince kaydırıldıysa
     * şimdilik tamamla durumunu açık bırak.
     *
     * API çağrısını sonraki adımda ekleyeceğiz.
     */

    if (deltaX >= 70) {

        item.classList.add(
            "swipe-right"
        );

        setSwipePosition(
            item,
            100,
            true
        );

        activeSwipeItem = item;

    }


    /*
     * Sola yeterince kaydırıldıysa
     * Edit / Sil alanını aç.
     */

    else if (deltaX <= -70) {

        item.classList.add(
            "swipe-left"
        );

        setSwipePosition(
            item,
            -150,
            true
        );

        activeSwipeItem = item;

    }


    /*
     * Yeterince kaydırılmadıysa
     * eski konumuna geri dön.
     */

    else {

        resetSwipePosition(item);

        if (activeSwipeItem === item) {
            activeSwipeItem = null;
        }

    }


    /*
     * Pointer capture bırak.
     */

    try {

        const content =
            item.querySelector(
                ".task-swipe-content"
            );

        content?.releasePointerCapture(
            event.pointerId
        );

    }
    catch {
        // Güvenli şekilde devam et.
    }


    resetSwipeState();

}


function handleSwipeCancel(
    item,
    event
) {

    if (
        swipeState.item !== item ||
        swipeState.pointerId !== event.pointerId
    ) {
        return;
    }


    resetSwipePosition(item);


    if (activeSwipeItem === item) {
        activeSwipeItem = null;
    }


    try {

        const content =
            item.querySelector(
                ".task-swipe-content"
            );

        content?.releasePointerCapture(
            event.pointerId
        );

    }
    catch {
        // Güvenli şekilde devam et.
    }


    resetSwipeState();

}


/* ========================================================= */
/* PRIORITY */
/* ========================================================= */

function getPriorityInfo(priority) {

    switch (Number(priority)) {

        case 3:

            return {
                text: "YÜKSEK",
                className: "priority-high"
            };

        case 2:

            return {
                text: "ORTA",
                className: "priority-medium"
            };

        default:

            return {
                text: "DÜŞÜK",
                className: "priority-low"
            };
    }
}


/* ========================================================= */
/* DUE DATE */
/* ========================================================= */

function formatDueDate(value) {

    if (!value) {
        return null;
    }


    const date =
        new Date(value);

    if (isNaN(date)) {
        return null;
    }


    const now =
        new Date();


    const today =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    const dueDay =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );


    const diff =
        Math.round(
            (dueDay - today)
            / 86400000
        );


    const time =
        date.toLocaleTimeString(
            "tr-TR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    if (diff < 0) {

        return {
            text: "Gecikti",
            className: "overdue"
        };
    }


    if (diff === 0) {

        return {
            text: `Bugün ${time}`,
            className: "today"
        };
    }


    if (diff === 1) {

        return {
            text: `Yarın ${time}`,
            className: ""
        };
    }


    return {
        text:
            `${date.toLocaleDateString(
                "tr-TR",
                {
                    day: "2-digit",
                    month: "2-digit"
                }
            )} ${time}`,

        className: ""
    };
}


/* ========================================================= */
/* CREATE TODO */
/* ========================================================= */

function isEmailReminderAvailable() {
    return currentUserProfile?.emailConfirmed === true;
}


function updateEmailReminderAvailability() {

    const checkbox =
        document.getElementById(
            "todoEmailReminder"
        );

    const settings =
        document.getElementById(
            "emailReminderSettings"
        );

    const verificationMessage =
        document.getElementById(
            "emailReminderVerificationMessage"
        );

    const dateMessage =
        document.getElementById(
            "emailReminderDateMessage"
        );

    const dueDate =
        document.getElementById(
            "todoDueDate"
        )?.value;

    const dueTime =
        document.getElementById(
            "todoDueTime"
        )?.value;


    if (
        !checkbox ||
        !settings ||
        !verificationMessage ||
        !dateMessage
    ) {
        return;
    }


    const emailVerified =
        isEmailReminderAvailable();


    verificationMessage.style.display =
        emailVerified
            ? "none"
            : "block";


    checkbox.disabled =
        !emailVerified;


    if (!emailVerified) {

        checkbox.checked = false;

        settings.style.display = "none";

        dateMessage.style.display = "none";

        return;
    }


    const hasDateAndTime =
        Boolean(dueDate && dueTime);


    if (!hasDateAndTime) {

        dateMessage.style.display =
            "block";

        if (checkbox.checked) {
            checkbox.checked = false;
        }

        settings.style.display =
            "none";

        return;
    }


    dateMessage.style.display =
        "none";


    settings.style.display =
        checkbox.checked
            ? "block"
            : "none";
}


function initializeEmailReminderEvents() {

    const checkbox =
        document.getElementById(
            "todoEmailReminder"
        );

    const dueDate =
        document.getElementById(
            "todoDueDate"
        );

    const dueTime =
        document.getElementById(
            "todoDueTime"
        );


    checkbox?.addEventListener(
        "change",
        () => {

            if (
                checkbox.checked &&
                !isEmailReminderAvailable()
            ) {

                checkbox.checked = false;

                showToast(
                    "Email doğrulama gerekli",
                    "Email hatırlatmalarını kullanabilmek için email adresinizi doğrulamanız gerekiyor.",
                    true
                );

                return;
            }


            updateEmailReminderAvailability();
        }
    );


    dueDate?.addEventListener(
        "change",
        updateEmailReminderAvailability
    );


    dueTime?.addEventListener(
        "change",
        updateEmailReminderAvailability
    );
}

function openCreateTodoModal() {

    document.getElementById(
        "todoModalTitle"
    ).textContent =
        "Yeni Görev";


    document.getElementById(
        "todoForm"
    ).reset();


    document.getElementById(
        "todoId"
    ).value = "";


    populateTodoCategories();


    document.getElementById(
        "todoPriority"
    ).value = "2";

    const reminderCheckbox =
        document.getElementById(
            "todoEmailReminder"
        );

    const reminderMinutes =
        document.getElementById(
            "todoReminderMinutes"
        );

    if (reminderCheckbox) {
        reminderCheckbox.checked = false;
    }

    if (reminderMinutes) {
        reminderMinutes.value = "120";
    }

    updateEmailReminderAvailability();

    todoModal.show();

    setTimeout(() => {

        document
            .getElementById("todoTitle")
            ?.focus();

    }, 500);


}


function populateTodoCategories() {

    const select =
        document.getElementById(
            "todoCategory"
        );


    select.innerHTML = `
        <option value="">
            Kategori seçin
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value =
            category.id;

        option.textContent =
            category.name;

        select.appendChild(option);
    });
}


/* ========================================================= */
/* EDIT TODO */
/* ========================================================= */

function openEditTodoModal(id) {

    const todo =
        todos.find(
            x => x.id === id
        );


    if (!todo) {
        return;
    }


    document.getElementById(
        "todoModalTitle"
    ).textContent =
        "Görevi Düzenle";


    populateTodoCategories();


    document.getElementById(
        "todoId"
    ).value =
        todo.id;


    document.getElementById(
        "todoTitle"
    ).value =
        todo.title || "";


    document.getElementById(
        "todoDescription"
    ).value =
        todo.description || "";


    document.getElementById(
        "todoCategory"
    ).value =
        todo.categoryId;


    document.getElementById(
        "todoPriority"
    ).value =
        todo.priority;


    setTodoDueDateFields(
        todo.dueDate
    );

    const reminderCheckbox = document.getElementById(
            "todoEmailReminder"
        );

    const reminderMinutes = document.getElementById(
            "todoReminderMinutes"
        );


    if (reminderCheckbox) {

        reminderCheckbox.checked = todo.emailReminderEnabled === true;
    }


    if (reminderMinutes) {

        reminderMinutes.value =
            String(
                todo.emailReminderMinutesBefore
                || 120
            );
    }


    updateEmailReminderAvailability();


    todoModal.show();
}

function editTodoFromDetail(todoId) {

    const todo =
        todos.find(
            x => Number(x.id) === Number(todoId)
        );

    if (!todo) {
        return;
    }

    closeTodoDetail();

    openEditTodoModal(todo.id);
}


/* ========================================================= */
/* SAVE TODO */
/* ========================================================= */

async function saveTodo() {

    const id =
        document.getElementById(
            "todoId"
        ).value;


    const title =
        document.getElementById(
            "todoTitle"
        ).value.trim();


    const description =
        document.getElementById(
            "todoDescription"
        ).value.trim();


    const categoryId =
        Number(
            document.getElementById(
                "todoCategory"
            ).value
        );


    const priority =
        Number(
            document.getElementById(
                "todoPriority"
            ).value
        );


    const dueDate =
        document.getElementById(
            "todoDueDate"
        ).value;

    const dueTime =
        document.getElementById(
            "todoDueTime"
        ).value;

    const reminderCheckbox =
        document.getElementById(
            "todoEmailReminder"
        );

    const reminderMinutes =
        document.getElementById(
            "todoReminderMinutes"
        );


    const emailReminderEnabled =
        reminderCheckbox?.checked === true;


    const emailReminderMinutesBefore =
        emailReminderEnabled
            ? Number(
                reminderMinutes?.value || 120
            )
            : null;


    if (!title) {

        showToast(
            "Eksik bilgi",
            "Görev başlığı zorunludur.",
            true
        );

        return;
    }


    if (!categoryId) {

        showToast(
            "Eksik bilgi",
            "Lütfen kategori seçin.",
            true
        );

        return;
    }


    const button =
        document.getElementById(
            "saveTodoButton"
        );


    button.disabled = true;

    button.textContent =
        "Kaydediliyor...";


    try {

        let result;


        const data = {

            title: title,

            description:
                description || null,

            categoryId: categoryId,

            priority: priority,

            dueDate:
                buildDueDateValue(
                    dueDate,
                    dueTime
                ),

                emailReminderEnabled:
                emailReminderEnabled,

            emailReminderMinutesBefore:
                emailReminderMinutesBefore

        };


        if (id) {

            result =
                await api.put(
                    `/Todo/${id}`,
                    data
                );

            await loadNotifications();

        }
        else {

            result =
                await api.post(
                    "/Todo",
                    data
                );

            await loadNotifications();
        }


        if (!result) {
            return;
        }


        todoModal.hide();


        await loadDashboardData();


        showToast(
            "Başarılı",
            id
                ? "Görev güncellendi."
                : "Yeni görev oluşturuldu."
        );

    }
    catch (error) {

        console.error(error);

        showToast(
            "Hata",
            error.message,
            true
        );

    }
    finally {

        button.disabled = false;

        button.innerHTML =
            `<i class="bi bi-check-lg"></i> Kaydet`;
    }
}


/* ========================================================= */
/* COMPLETE TODO */
/* ========================================================= */

async function toggleTodo(id) {

    const todo =
        todos.find(
            x => x.id === id
        );


    if (!todo) {
        return;
    }


    try {

        const result =
            await api.patch(
                `/Todo/${id}/complete?completed=${!todo.isCompleted
                }`
            );

        await loadNotifications();


        if (!result) {
            return;
        }


        await loadDashboardData();


        showToast(
            todo.isCompleted
                ? "Görev geri alındı"
                : "Görev tamamlandı",
            todo.isCompleted
                ? "Görev tekrar bekleyenlere alındı."
                : "Harika! Bir görev daha tamamlandı."
        );

    }
    catch (error) {

        console.error(error);

        showToast(
            "Hata",
            error.message,
            true
        );
    }
}


/* ========================================================= */
/* DELETE TODO */
/* ========================================================= */

async function deleteTodo(id) {

    const todo =
        todos.find(
            x => x.id === id
        );


    if (!todo) {
        return;
    }


    const confirmed =
        confirm(
            `"${todo.title}" görevini silmek istediğine emin misin?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const result =
            await api.delete(
                `/Todo/${id}`
            );

        await loadNotifications();


        if (!result) {
            return;
        }


        await loadDashboardData();


        showToast(
            "Görev silindi",
            "Görev başarıyla silindi."
        );

    }
    catch (error) {

        console.error(error);

        showToast(
            "Hata",
            error.message,
            true
        );
    }
}

function deleteTodoFromDetail(todoId) {

    closeTodoDetail();

    deleteTodo(Number(todoId));
}


/* ========================================================= */
/* CATEGORY CREATE */
/* ========================================================= */

function openCreateCategoryModal() {

    document.getElementById(
        "categoryName"
    ).value = "";


    document
        .querySelectorAll(
            ".color-option"
        )
        .forEach(x =>
            x.classList.remove(
                "selected"
            )
        );


    document
        .querySelector(
            ".color-option"
        )
        ?.classList.add(
            "selected"
        );


    categoryModal.show();
}


async function saveCategory() {

    const name =
        document.getElementById(
            "categoryName"
        )
            .value
            .trim();


    if (!name) {

        showToast(
            "Eksik bilgi",
            "Kategori adı zorunludur.",
            true
        );

        return;
    }


    const selectedColor =
        document.querySelector(
            ".color-option.selected"
        );


    const color =
        selectedColor?.dataset.color
        || "#6c63ff";


    const button =
        document.getElementById(
            "saveCategoryButton"
        );


    button.disabled = true;

    button.textContent =
        "Oluşturuluyor...";


    try {

        const result =
            await api.post(
                "/Category",
                {
                    name: name,
                    color: color,
                    icon: null
                }
            );


        if (!result) {
            return;
        }


        categoryModal.hide();


        await loadDashboardData();


        showToast(
            "Kategori oluşturuldu",
            `"${name}" kategorisi oluşturuldu.`
        );

    }
    catch (error) {

        console.error(error);

        showToast(
            "Hata",
            error.message,
            true
        );

    }
    finally {

        button.disabled = false;

        button.textContent =
            "Oluştur";
    }
}


/* ========================================================= */
/* TODAY */
/* ========================================================= */

function renderTodayProgress() {

    const today =
        new Date();


    const completedToday =
        todos.filter(todo => {

            if (!todo.isCompleted ||
                !todo.completedAt) {
                return false;
            }

            const date =
                new Date(
                    todo.completedAt
                );

            return isSameDay(
                date,
                today
            );

        }).length;


    const pendingToday =
        todos.filter(todo => {

            if (todo.isCompleted ||
                !todo.dueDate) {
                return false;
            }

            return isSameDay(
                new Date(todo.dueDate),
                today
            );

        }).length;


    const totalToday =
        completedToday +
        pendingToday;


    const percentage =
        totalToday === 0
            ? 0
            : Math.round(
                (completedToday /
                    totalToday) * 100
            );


    document.getElementById(
        "todayCompleted"
    ).textContent =
        completedToday;


    document.getElementById(
        "todayPending"
    ).textContent =
        pendingToday;


    document.getElementById(
        "todayProgressText"
    ).textContent =
        `${percentage}%`;


    const circumference =
        100.5;


    const offset =
        circumference -
        (percentage / 100) *
        circumference;


    document.getElementById(
        "todayProgressRing"
    ).style.strokeDashoffset =
        offset;
}


/* ========================================================= */
/* UPCOMING */
/* ========================================================= */

function renderUpcoming() {

    const container =
        document.getElementById(
            "upcomingList"
        );


    const upcoming =
        todos
            .filter(
                x =>
                    !x.isCompleted &&
                    x.dueDate
            )
            .sort(
                (a, b) =>
                    new Date(a.dueDate)
                    -
                    new Date(b.dueDate)
            )
            .slice(0, 4);


    if (!upcoming.length) {

        container.innerHTML = `
            <div class="text-muted small">
                Yaklaşan görev yok.
            </div>
        `;

        return;
    }


    container.innerHTML =
        upcoming
            .map(todo => {

                const date =
                    new Date(
                        todo.dueDate
                    );


                return `
                    <div class="upcoming-item">

                        <div class="upcoming-date">

                            <strong>
                                ${date.getDate()}
                            </strong>

                            <span>
                                ${date.toLocaleDateString(
                    "tr-TR",
                    {
                        month: "short"
                    }
                )}
                            </span>

                        </div>

                        <div class="upcoming-info">

                            <strong>
                                ${escapeHtml(
                    todo.title
                )}
                            </strong>

                            <span>
                                ${todo.categoryName
                    || "Kategori yok"
                    }
                            </span>

                        </div>

                    </div>
                `;
            })
            .join("");
}


/* ========================================================= */
/* PANEL TITLE */
/* ========================================================= */

function updatePanelTitle() {

    const title =
        document.getElementById(
            "taskPanelTitle"
        );

    const subtitle =
        document.getElementById(
            "taskPanelSubtitle"
        );


    if (currentView === "completed") {

        title.textContent =
            "Tamamlanan Görevler";

        subtitle.textContent =
            "Tamamladığın görevler";

        return;
    }


    if (currentView === "pending") {

        title.textContent =
            "Bekleyen Görevler";

        subtitle.textContent =
            "Henüz tamamlanmamış görevler";

        return;
    }


    title.textContent =
        "My Tasks";

    subtitle.textContent =
        "Tüm görevlerini yönet";
}

//Detail Açma
function openTodoDetail(todoId) {

    const todo = todos.find(x => Number(x.id) === Number(todoId));

    if (!todo) {
        showToast("Görev bilgisi bulunamadı.", "error");
        return;
    }

    const notificationPanel = document.getElementById("notificationPanel");

    const notificationPanelWasOpen = notificationPanel?.classList.contains("active");

    selectedTodoId = todo.id;

    renderTodoDetail(todo);

    document
        .getElementById("todoDetailOverlay")
        ?.classList.add("active");

    document
        .getElementById("todoDetailDrawer")
        ?.classList.add("active");

    document.body.classList.add("todo-detail-open");

    document.body.classList.toggle(
        "notification-detail-open",
        notificationPanelWasOpen
    );
}

//DEtail kapatma
function closeTodoDetail() {

    document
        .getElementById("todoDetailOverlay")
        ?.classList.remove("active");

    document
        .getElementById("todoDetailDrawer")
        ?.classList.remove("active");

    document.body.classList.remove(
        "todo-detail-open"
    );

    document.body.classList.remove(
        "notification-detail-open"
    );

    selectedTodoId = null;
}

document
    .getElementById("closeTodoDetailBtn")
    ?.addEventListener("click", closeTodoDetail);

document
    .getElementById("todoDetailOverlay")
    ?.addEventListener("click", closeTodoDetail);

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeTodoDetail();

        closeMobileMoreSheetGlobal();
    }

});

document
    .getElementById(
        "mobileCategoriesButton"
    )
    ?.addEventListener(
        "click",
        () => {

            closeMobileMoreSheetGlobal();

            showToast(
                "Kategoriler",
                "Kategori yönetimi ekranını bir sonraki adımda ekleyeceğiz."
            );
        }
);

document
    .getElementById(
        "mobileDarkModeButton"
    )
    ?.addEventListener(
        "click",
        () => {

            toggleDarkMode();

            updateMobileThemeText();
        }
);

function updateMobileThemeText() {

    const text =
        document.getElementById(
            "mobileThemeText"
        );

    if (!text) {
        return;
    }


    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );


    text.textContent =
        isDark
            ? "Açık temaya geç"
            : "Koyu temaya geç";
}

/* ========================================================= */
/* MOBILE MORE SHEET - GLOBAL CLOSE */
/* ========================================================= */

function closeMobileMoreSheetGlobal() {

    const overlay =
        document.getElementById(
            "mobileMoreOverlay"
        );

    const sheet =
        document.getElementById(
            "mobileMoreSheet"
        );

    if (overlay) {

        overlay.classList.remove(
            "active"
        );
    }

    if (sheet) {

        sheet.classList.remove(
            "active"
        );

        sheet.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    document.body.classList.remove(
        "mobile-more-open"
    );

    document.body.classList.remove(
        "mobile-sheet-open"
    );
}

document
    .getElementById(
        "mobileLogoutButton"
    )
    ?.addEventListener(
        "click",
        () => {

            closeMobileMoreSheetGlobal();

            api.logout();
        }
);

document
    .getElementById("mobileProfileButton")
    ?.addEventListener(
        "click",
        () => {

            closeMobileMoreSheetGlobal();

            window.location.href = "profile.html";
        }
    );

function renderTodoDetail(todo) {

    const body = document.getElementById("todoDetailBody");

    if (!body) return;

    const category =
        categories.find(x => Number(x.id) === Number(todo.categoryId));

    const priorityMap = {
        1: {
            text: "Düşük",
            className: "low",
            icon: "bi-arrow-down"
        },
        2: {
            text: "Orta",
            className: "medium",
            icon: "bi-dash"
        },
        3: {
            text: "Yüksek",
            className: "high",
            icon: "bi-arrow-up"
        }
    };

    const priority =
        priorityMap[todo.priority] || priorityMap[2];

    const categoryName =
        todo.categoryName ||
        category?.name ||
        "Kategorisiz";

    const dueDate =
        todo.dueDate
            ? formatTodoDueDate(todo.dueDate)
            : "Tarih belirtilmemiş";

    const createdDate =
        todo.createdAt
            ? formatTodoDate(todo.createdAt)
            : "-";

    const completedDate =
        todo.completedAt
            ? formatTodoDate(todo.completedAt)
            : null;

    body.innerHTML = `
        <div class="todo-detail-title-section">

            <div class="todo-detail-status-row">

                <button
                    type="button"
                    class="todo-detail-checkbox ${todo.isCompleted ? "completed" : ""}"
                    onclick="toggleTodoFromDetail(${todo.id})">

                    ${todo.isCompleted
            ? '<i class="bi bi-check-lg"></i>'
            : ''
        }

                </button>

                <span class="todo-priority-badge ${priority.className}">
                    <i class="bi ${priority.icon}"></i>
                    ${priority.text}
                </span>

            </div>

            <h2 class="todo-detail-title">
                ${escapeHtml(todo.title)}
            </h2>

            ${todo.description
            ? `
                        <div class="todo-detail-description">
                            ${escapeHtml(todo.description)}
                        </div>
                    `
            : `
                        <div class="todo-detail-description text-muted">
                            Bu görev için açıklama eklenmemiş.
                        </div>
                    `
        }

        </div>

        <div class="todo-detail-meta">

            <div class="todo-detail-meta-item">

                <div class="todo-detail-meta-label">
                    <i class="bi bi-tag"></i>
                    Kategori
                </div>

                <div class="todo-detail-meta-value">
                    ${escapeHtml(categoryName)}
                </div>

            </div>

            <div class="todo-detail-meta-item">

                <div class="todo-detail-meta-label">
                    <i class="bi bi-calendar-event"></i>
                    Son Tarih
                </div>

                <div class="todo-detail-meta-value">
                    ${dueDate}
                </div>

            </div>

            <div class="todo-detail-meta-item">

                <div class="todo-detail-meta-label">
                    <i class="bi bi-calendar-plus"></i>
                    Oluşturulma
                </div>

                <div class="todo-detail-meta-value">
                    ${createdDate}
                </div>

            </div>

            ${completedDate
            ? `
                        <div class="todo-detail-meta-item">

                            <div class="todo-detail-meta-label">
                                <i class="bi bi-check-circle"></i>
                                Tamamlanma
                            </div>

                            <div class="todo-detail-meta-value">
                                ${completedDate}
                            </div>

                        </div>
                    `
            : ''
        }

        </div>

        <div class="todo-detail-actions">

            <button
                type="button"
                class="todo-detail-action primary"
                onclick="editTodoFromDetail(${todo.id})">

                <i class="bi bi-pencil"></i>
                Düzenle

            </button>

            <button
                type="button"
                class="todo-detail-action secondary"
                onclick="toggleTodoFromDetail(${todo.id})">

                ${todo.isCompleted
            ? '<i class="bi bi-arrow-counterclockwise"></i> Geri Al'
            : '<i class="bi bi-check-lg"></i> Tamamla'
        }

            </button>

        </div>

        <button
            type="button"
            class="todo-detail-delete"
            onclick="deleteTodoFromDetail(${todo.id})">

            <i class="bi bi-trash3"></i>
            Görevi Sil

        </button>
    `;
}

function formatTodoDate(value) {

    if (!value) {
        return "-";
    }

    let normalizedValue = String(value);

    // CreatedAt backend tarafından UTC olarak tutuluyor.
    // API Z göndermiyorsa UTC olduğunu belirtiyoruz.
    if (
        !normalizedValue.endsWith("Z") &&
        !normalizedValue.includes("+")
    ) {
        normalizedValue += "Z";
    }

    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    const dateText = new Intl.DateTimeFormat(
        "tr-TR",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    ).format(date);

    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (
        hours === 0 &&
        minutes === 0
    ) {
        return dateText;
    }

    const timeText = new Intl.DateTimeFormat(
        "tr-TR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);

    return `${dateText} ${timeText}`;
}

function formatTodoDueDate(value) {

    if (!value) {
        return "-";
    }

    const text = String(value);

    /*
     * DueDate kullanıcı tarafından girilen
     * yerel tarih/saat bilgisidir.
     *
     * Örnek:
     * 2026-09-20T20:51:00
     *
     * Bu değere Z EKLENMEZ.
     */

    const match = text.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:T|\s)(\d{2}):(\d{2})/
    );

    if (match) {

        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const hours = Number(match[4]);
        const minutes = Number(match[5]);

        const dateText = new Intl.DateTimeFormat(
            "tr-TR",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(
            new Date(
                year,
                month - 1,
                day
            )
        );

        if (hours === 0 && minutes === 0) {
            return dateText;
        }

        const timeText =
            `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

        return `${dateText} ${timeText}`;
    }

    return "-";
}

async function toggleTodoFromDetail(todoId) {

    const todo = todos.find(x => Number(x.id) === Number(todoId));

    if (!todo) return;

    await toggleTodo(todoId);

    const updatedTodo =
        todos.find(x => Number(x.id) === Number(todoId));

    if (updatedTodo) {
        renderTodoDetail(updatedTodo);
    }
}

/* ========================================================= */
/* DARK MODE */
/* ========================================================= */

function toggleDarkMode() {

    document.body.classList.toggle(
        "dark-mode"
    );

    const enabled =
        document.body.classList.contains(
            "dark-mode"
        );


    localStorage.setItem(
        "darkMode",
        enabled
            ? "true"
            : "false"
    );
}


function initializeDarkMode() {

    if (
        localStorage.getItem(
            "darkMode"
        ) === "true"
    ) {

        document.body.classList.add(
            "dark-mode"
        );
    }
}


initializeDarkMode();


/* ========================================================= */
/* TOAST */
/* ========================================================= */

function showToast(
    title,
    message,
    isError = false
) {

    const toastElement =
        document.getElementById(
            "appToast"
        );


    document.getElementById(
        "toastTitle"
    ).textContent =
        title;


    document.getElementById(
        "toastMessage"
    ).textContent =
        message;


    const icon =
        toastElement.querySelector(
            ".toast-icon i"
        );


    if (isError) {

        icon.className =
            "bi bi-exclamation-lg";

    }
    else {

        icon.className =
            "bi bi-check-lg";
    }


    const toast =
        bootstrap.Toast.getOrCreateInstance(
            toastElement,
            {
                delay: 3500
            }
        );


    toast.show();
}


/* ========================================================= */
/* HELPERS */
/* ========================================================= */

function isSameDay(a, b) {

    return (
        a.getFullYear() === b.getFullYear()
        &&
        a.getMonth() === b.getMonth()
        &&
        a.getDate() === b.getDate()
    );
}


function toDateTimeLocal(value) {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    const offset =
        date.getTimezoneOffset();


    const local =
        new Date(
            date.getTime()
            -
            offset * 60000
        );


    return local
        .toISOString()
        .slice(0, 16);
}


function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function buildDueDateValue(
    dateValue,
    timeValue
) {

    if (!dateValue) {
        return null;
    }

    const time =
        timeValue || "00:00";

    /*
     * DueDate kullanıcı tarafından girilen
     * yerel tarih/saat bilgisidir.
     *
     * Burada toISOString() KULLANMIYORUZ.
     *
     * Çünkü toISOString() Türkiye saatini
     * UTC'ye çevirerek tarihi bir gün geriye
     * kaydırabilir.
     */

    return `${dateValue}T${time}:00`;
}

function setTodoDueDateFields(value) {

    const dateInput =
        document.getElementById(
            "todoDueDate"
        );

    const timeInput =
        document.getElementById(
            "todoDueTime"
        );

    if (!dateInput || !timeInput) {
        return;
    }

    dateInput.value = "";
    timeInput.value = "";

    if (!value) {
        return;
    }

    /*
     * API'den gelen DueDate:
     *
     * 2026-09-20T00:00:00
     * veya
     * 2026-09-20T14:30:00
     *
     * şeklinde kullanıcı tarafından girilen
     * local tarih/saat olarak değerlendirilir.
     */

    const text = String(value);

    /*
     * Eğer eski kayıtlar nedeniyle Z ile biten
     * bir UTC değer gelirse mevcut JS Date
     * davranışını kullan.
     *
     * Yeni kayıtlarımız Z içermeyecek.
     */
    if (text.endsWith("Z")) {

        const date =
            new Date(text);

        if (Number.isNaN(date.getTime())) {
            return;
        }

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        const hours =
            String(
                date.getHours()
            ).padStart(2, "0");

        const minutes =
            String(
                date.getMinutes()
            ).padStart(2, "0");

        dateInput.value =
            `${year}-${month}-${day}`;

        if (
            hours !== "00" ||
            minutes !== "00"
        ) {
            timeInput.value =
                `${hours}:${minutes}`;
        }

        return;
    }

    /*
     * Yeni kayıtlar timezone içermeyecek.
     *
     * Örnek:
     * 2026-09-20T14:30:00
     */

    const match =
        text.match(
            /^(\d{4})-(\d{2})-(\d{2})(?:T|\s)(\d{2}):(\d{2})/
        );

    if (!match) {
        return;
    }

    const year = match[1];
    const month = match[2];
    const day = match[3];
    const hours = match[4];
    const minutes = match[5];

    dateInput.value =
        `${year}-${month}-${day}`;

    /*
     * Saat 00:00 ise kullanıcıya
     * saat girilmemiş gibi gösteriyoruz.
     */
    if (
        hours !== "00" ||
        minutes !== "00"
    ) {
        timeInput.value =
            `${hours}:${minutes}`;
    }
}

/* ========================================================= */
/* NOTIFICATIONS */
/* ========================================================= */

let dashboardNotifications = [];


/* ========================================================= */
/* INITIALIZE */
/* ========================================================= */

function initializeNotifications() {

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );

    const closeButton =
        document.getElementById(
            "notificationCloseButton"
        );

    const overlay =
        document.getElementById(
            "notificationOverlay"
        );

    const markAllButton =
        document.getElementById(
            "markAllNotificationsReadButton"
        );


    notificationButton?.addEventListener(
        "click",
        toggleNotificationPanel
    );


    closeButton?.addEventListener(
        "click",
        closeNotificationPanel
    );


    overlay?.addEventListener(
        "click",
        closeNotificationPanel
    );


    markAllButton?.addEventListener(
        "click",
        markAllNotificationsRead
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeNotificationPanel();
            }
        }
    );


    loadNotifications();
}


/* ========================================================= */
/* LOAD */
/* ========================================================= */

async function loadNotifications() {

    try {

        const result =
            await api.get(
                "/Notification"
            );


        if (!result) {
            return;
        }


        dashboardNotifications =
            result.data || [];


        renderNotificationBadge();


        renderNotifications();

    }
    catch (error) {

        console.error(
            "Bildirimler yüklenemedi:",
            error
        );
    }
}


/* ========================================================= */
/* BADGE */
/* ========================================================= */

function renderNotificationBadge() {

    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (!badge) {
        return;
    }


    const unreadCount =
        dashboardNotifications
            .filter(x => !x.isRead)
            .length;


    if (unreadCount <= 0) {

        badge.style.display =
            "none";

        return;
    }


    badge.style.display =
        "flex";


    badge.textContent =
        unreadCount > 99
            ? "99+"
            : unreadCount;
}


/* ========================================================= */
/* PANEL */
/* ========================================================= */

function toggleNotificationPanel() {

    const panel =
        document.getElementById(
            "notificationPanel"
        );


    if (!panel) {
        return;
    }


    if (
        panel.classList.contains(
            "active"
        )
    ) {

        closeNotificationPanel();

    } else {

        openNotificationPanel();
    }
}


function openNotificationPanel() {

    const panel =
        document.getElementById(
            "notificationPanel"
        );

    const overlay =
        document.getElementById(
            "notificationOverlay"
        );


    if (!panel) {
        return;
    }


    panel.classList.add(
        "active"
    );


    panel.setAttribute(
        "aria-hidden",
        "false"
    );


    if (overlay) {

        overlay.classList.add(
            "active"
        );
    }


    document.body.classList.add(
        "notification-panel-open"
    );


    renderNotifications();
}


function closeNotificationPanel() {

    const panel =
        document.getElementById(
            "notificationPanel"
        );

    const overlay =
        document.getElementById(
            "notificationOverlay"
        );


    if (panel) {

        panel.classList.remove(
            "active"
        );

        panel.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    if (overlay) {

        overlay.classList.remove(
            "active"
        );
    }


    document.body.classList.remove(
        "notification-panel-open"
    );
}


/* ========================================================= */
/* RENDER */
/* ========================================================= */

function renderNotifications() {
    const list = document.getElementById("notificationList");

    if (!list) return;

    if (!dashboardNotifications || dashboardNotifications.length === 0) {
        list.innerHTML = `
            <div class="notification-empty">
                <div class="notification-empty-icon">
                    <i class="bi bi-bell-slash"></i>
                </div>
                <div class="notification-empty-title">
                    Bildirim yok
                </div>
                <div class="notification-empty-text">
                    Şu anda görüntülenecek bir bildirimin bulunmuyor.
                </div>
            </div>
        `;

        return;
    }

    const overdueNotifications = dashboardNotifications.filter(
        x => x.type === "TaskOverdue"
    );

    const todayNotifications = dashboardNotifications.filter(
        x => x.type === "TaskDueToday"
    );

    const tomorrowNotifications = dashboardNotifications.filter(
        x => x.type === "TaskDueTomorrow"
    );

    let html = "";

    html += renderNotificationGroup(
        "Gecikmiş",
        "bi-exclamation-circle",
        "overdue",
        overdueNotifications
    );

    html += renderNotificationGroup(
        "Bugün",
        "bi-calendar-event",
        "today",
        todayNotifications
    );

    html += renderNotificationGroup(
        "Yarın",
        "bi-calendar2-week",
        "tomorrow",
        tomorrowNotifications
    );

    if (!html) {
        html = `
            <div class="notification-empty">
                <div class="notification-empty-icon">
                    <i class="bi bi-check2-circle"></i>
                </div>
                <div class="notification-empty-title">
                    Her şey yolunda
                </div>
                <div class="notification-empty-text">
                    Şu anda yaklaşan veya gecikmiş görevin bulunmuyor.
                </div>
            </div>
        `;
    }

    list.innerHTML = html;

    attachNotificationEvents();
}

function attachNotificationEvents() {
    document
        .querySelectorAll(".notification-task-item")
        .forEach(item => {

            item.addEventListener("click", async () => {

                const notificationId =
                    Number(item.dataset.notificationId);

                const todoId =
                    Number(item.dataset.todoId);

                if (!notificationId) {
                    return;
                }

                await markNotificationAsRead(
                    notificationId
                );

                //closeNotificationPanel();

                if (!todoId) {
                    return;
                }

                openTodoDetail(todoId);
            });
        });
}

async function markNotificationAsRead(notificationId) {
    try {
        await api.patch(
            `/Notification/${notificationId}/read`
        );

        const notification =
            dashboardNotifications.find(
                x => x.id === notificationId
            );

        if (notification) {
            notification.isRead = true;
        }

        renderNotificationBadge();
        renderNotifications();

    } catch (error) {
        console.error(
            "Bildirim okundu olarak işaretlenemedi:",
            error
        );
    }
}

function renderNotificationGroup(
    title,
    icon,
    cssClass,
    notifications
) {
    if (!notifications || notifications.length === 0) {
        return "";
    }

    let html = `
        <div class="notification-group">
            <div class="notification-group-header">
                <div class="notification-group-title ${cssClass}">
                    <i class="bi ${icon}"></i>
                    <span>${title}</span>
                </div>

                <span class="notification-group-count">
                    ${notifications.length}
                </span>
            </div>

            <div class="notification-group-items">
    `;

    notifications.forEach(notification => {
        html += renderNotificationItem(notification, cssClass);
    });

    html += `
            </div>
        </div>
    `;

    return html;
}

function renderNotificationItem(
    notification,
    cssClass
) {
    const todoTitle = escapeNotificationHtml(
        notification.todoTitle ||
        notification.title ||
        "Görev"
    );

    const isRead = notification.isRead;

    const taskId = notification.relatedEntityId;

    const dueDateText = formatNotificationDueDate(
        notification.todoDueDate,
        notification.type
    );

    const priorityText =
        getNotificationPriorityText(
            notification.todoPriority
        );

    const priorityClass =
        getNotificationPriorityClass(
            notification.todoPriority
        );

    const categoryName =
        notification.categoryName
            ? escapeNotificationHtml(
                notification.categoryName
            )
            : "";

    const categoryColor =
        notification.categoryColor ||
        "";

    return `
        <div
            class="notification-task-item ${cssClass} ${isRead ? "read" : "unread"}"
            data-notification-id="${notification.id}"
            data-todo-id="${taskId || ""}"
        >

            <div class="notification-task-icon">
                ${getNotificationTaskIcon(cssClass)}
            </div>

            <div class="notification-task-content">

                <div class="notification-task-top">

                    <span class="notification-task-title">
                        ${todoTitle}
                    </span>

                    ${!isRead
            ? `<span class="notification-unread-dot"></span>`
            : ""
        }

                </div>

                <div class="notification-task-due">
                    <i class="bi bi-clock"></i>
                    ${dueDateText}
                </div>

                <div class="notification-task-tags">

                    ${priorityText
            ? `
                                <span
                                    class="notification-task-tag ${priorityClass}"
                                >
                                    ${priorityText}
                                </span>
                              `
            : ""
        }

                    ${categoryName
            ? `
                                <span
    class="notification-task-tag notification-category-tag"
    ${
        categoryColor
            ? `style="--notification-category-color:${escapeNotificationHtml(categoryColor)}"`
            : ""
        }
>
    <span class="notification-category-dot"></span>
    ${categoryName}
</span>
                              `
            : ""
        }

                </div>

            </div>

            <div class="notification-task-arrow">
                <i class="bi bi-chevron-right"></i>
            </div>

        </div>
    `;
}

function getNotificationTaskIcon(cssClass) {
    switch (cssClass) {
        case "overdue":
            return `
                <i class="bi bi-exclamation-lg"></i>
            `;

        case "today":
            return `
                <i class="bi bi-clock"></i>
            `;

        case "tomorrow":
            return `
                <i class="bi bi-calendar-event"></i>
            `;

        default:
            return `
                <i class="bi bi-check2"></i>
            `;
    }
}

async function handleNotificationClick(
    notificationId
) {

    const notification =
        dashboardNotifications.find(
            x =>
                x.id === notificationId
        );


    if (!notification) {
        return;
    }


    if (!notification.isRead) {

        try {

            await api.patch(
                `/Notification/${notificationId}/read`
            );


            notification.isRead =
                true;


            renderNotificationBadge();

            renderNotifications();

            if (
                notification.relatedEntityType === "TodoItem" &&
                notification.relatedEntityId
            ) {
                openTodoDetail(
                    notification.relatedEntityId
                );
            }

        }
        catch (error) {

            console.error(
                "Bildirim okundu yapılamadı:",
                error
            );
        }
    }


    /*
     * İleride RelatedEntityType /
     * RelatedEntityId üzerinden
     * ilgili görevi açacağız.
     */
}


/* ========================================================= */
/* MARK ALL READ */
/* ========================================================= */

async function markAllNotificationsRead() {

    const unreadNotifications =
        dashboardNotifications.filter(
            x => !x.isRead
        );


    if (
        unreadNotifications.length === 0
    ) {

        return;
    }


    const button =
        document.getElementById(
            "markAllNotificationsReadButton"
        );


    try {

        if (button) {
            button.disabled = true;
        }


        await api.patch(
            "/Notification/read-all"
        );


        dashboardNotifications =
            dashboardNotifications.map(
                notification => ({
                    ...notification,
                    isRead: true
                })
            );


        renderNotificationBadge();

        renderNotifications();

    }
    catch (error) {

        console.error(
            "Bildirimler okunamadı:",
            error
        );

        showToast(
            "Hata",
            "Bildirimler güncellenemedi."
        );

    }
    finally {

        if (button) {
            button.disabled = false;
        }
    }
}

function formatNotificationDueDate(
    value,
    notificationType
) {

    if (!value) {
        return "";
    }

    const text =
        String(value);

    let year;
    let month;
    let day;
    let hours;
    let minutes;

    /*
     * DueDate bizim sistemimizde local tarih/saat.
     *
     * Örnek:
     * 2026-09-21T19:33:00
     *
     * Bunu UTC olarak yorumlamıyoruz.
     */

    const match =
        text.match(
            /^(\d{4})-(\d{2})-(\d{2})(?:T|\s)(\d{2}):(\d{2})/
        );

    if (match) {

        year =
            Number(match[1]);

        month =
            Number(match[2]);

        day =
            Number(match[3]);

        hours =
            Number(match[4]);

        minutes =
            Number(match[5]);

    } else {

        /*
         * Eski UTC kayıtlar için
         * fallback.
         */
        const date =
            new Date(text);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        year =
            date.getFullYear();

        month =
            date.getMonth() + 1;

        day =
            date.getDate();

        hours =
            date.getHours();

        minutes =
            date.getMinutes();
    }

    const timeText =
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    /*
     * Saat 00:00 ise kullanıcı aslında
     * saat girmemiş demektir.
     */
    const hasTime =
        hours !== 0 ||
        minutes !== 0;

    if (notificationType === "TaskDueToday") {

        return hasTime
            ? `Bugün · ${timeText}`
            : "Bugün";
    }

    if (notificationType === "TaskDueTomorrow") {

        return hasTime
            ? `Yarın · ${timeText}`
            : "Yarın";
    }

    if (notificationType === "TaskOverdue") {

        const dateText =
            `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}`;

        return hasTime
            ? `${dateText} · ${timeText}`
            : dateText;
    }

    const dateText =
        `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;

    return hasTime
        ? `${dateText} · ${timeText}`
        : dateText;
}

function getNotificationPriorityText(priority) {
    switch (Number(priority)) {
        case 1:
            return "Düşük";

        case 2:
            return "Orta";

        case 3:
            return "Yüksek";

        default:
            return "";
    }
}

function getNotificationPriorityClass(priority) {
    switch (Number(priority)) {
        case 1:
            return "priority-low";

        case 2:
            return "priority-medium";

        case 3:
            return "priority-high";

        default:
            return "";
    }
}

/* ========================================================= */
/* HTML ESCAPE */
/* ========================================================= */

function escapeNotificationHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}