let todos = [];
let categories = [];

let currentFilter = "all";
let currentView = "all";
let currentCategory = "all";

let todoModal;
let categoryModal;
let selectedTodoId = null;


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

    initializeDate();

    initializeEvents();

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


/* ========================================================= */
/* EVENTS */
/* ========================================================= */

function initializeEvents() {


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


    todoModal.show();
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


    document.getElementById(
        "todoDueDate"
    ).value =
        toDateTimeLocal(
            todo.dueDate
        );


    todoModal.show();
}

function editTodoFromDetail(todoId) {

    const todo =
        todos.find(x => Number(x.id) === Number(todoId));

    if (!todo) return;

    closeTodoDetail();

    // Buraya mevcut edit modal fonksiyonun gelecek.
    openEditTodoModal(todo);
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
                dueDate
                    ? new Date(dueDate)
                        .toISOString()
                    : null

        };


        if (id) {

            result =
                await api.put(
                    `/Todo/${id}`,
                    data
                );

        }
        else {

            result =
                await api.post(
                    "/Todo",
                    data
                );
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

    // Mevcut delete modal / delete fonksiyonunu çağır.
    openDeleteTodoModal(todoId);
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

    selectedTodoId = todo.id;

    renderTodoDetail(todo);

    document
        .getElementById("todoDetailOverlay")
        ?.classList.add("active");

    document
        .getElementById("todoDetailDrawer")
        ?.classList.add("active");

    document.body.classList.add("todo-detail-open");
}

//DEtail kapatma
function closeTodoDetail() {

    document
        .getElementById("todoDetailOverlay")
        ?.classList.remove("active");

    document
        .getElementById("todoDetailDrawer")
        ?.classList.remove("active");

    document.body.classList.remove("todo-detail-open");

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
    }

});

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
            ? formatTodoDate(todo.dueDate)
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

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(date);
}

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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