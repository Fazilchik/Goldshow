/* =========================================================
   GOLD SHOW - FINAL SCRIPT
========================================================= */

const SUPABASE_URL =
    "https://mvrrftlhjlbrsiexnwjq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_MFI3LFGRmSviFv6ygJnXyg_wFktEpyP";

let supabaseClient = null;
let currentUser = null;

let customerEventsPage = 1;
let workerEventsPage = 1;

const EVENTS_PER_PAGE = 10;

let applicationTimer = null;

/* =========================================================
   SUPABASE
========================================================= */

if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
) {
    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );
}

/* =========================================================
   HELPERS
========================================================= */

const UZ_MONTHS = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr"
];

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatMoney(value) {
    return (
        Number(value || 0).toLocaleString("uz-UZ") +
        " so‘m"
    );
}

function getToday() {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const parts = String(value).split("-");

    if (parts.length !== 3) {
        return String(value);
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (!year || !month || !day) {
        return String(value);
    }

    return `${day}-${UZ_MONTHS[month - 1]} ${year}-yil`;
}

function formatDateTime(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const year = date.getFullYear();

    const hour = String(
        date.getHours()
    ).padStart(2, "0");

    const minute = String(
        date.getMinutes()
    ).padStart(2, "0");

    return `${day}.${month}.${year} ${hour}:${minute}`;
}

function updateDate() {
    const element =
        document.getElementById("todayDate");

    if (!element) {
        return;
    }

    const date = new Date();

    element.textContent =
        `${date.getDate()}-${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()}-yil`;
}

/* =========================================================
   PAGE
========================================================= */

function hideAllPages() {
    [
        "landingPage",
        "loginPage",
        "customerPage",
        "mainPage"
    ].forEach(function(id) {

        const element =
            document.getElementById(id);

        if (element) {
            element.classList.add("hidden");
        }

    });
}

function backToLanding() {
    currentUser = null;

    if (applicationTimer) {
        clearInterval(applicationTimer);
    }

    applicationTimer = null;

    hideAllPages();

    const landing =
        document.getElementById("landingPage");

    if (landing) {
        landing.classList.remove("hidden");
    }

    closeOrderModal();
}

async function openCustomerPage() {
    hideAllPages();

    const page =
        document.getElementById("customerPage");

    if (page) {
        page.classList.remove("hidden");
    }

    customerEventsPage = 1;

    await loadCustomerEvents();

    restoreApplicationStatus();
}

function openWorkerLogin() {
    hideAllPages();

    const login =
        document.getElementById("loginPage");

    if (login) {
        login.classList.remove("hidden");
    }

    const username =
        document.getElementById("username");

    if (username) {
        username.focus();
    }
}

/* =========================================================
   LOGIN
========================================================= */

async function login(event) {

    if (event) {
        event.preventDefault();
    }

    const usernameElement =
        document.getElementById("username");

    const passwordElement =
        document.getElementById("password");

    const errorElement =
        document.getElementById("loginError");

    if (
        !usernameElement ||
        !passwordElement ||
        !errorElement
    ) {
        return;
    }

    const username =
        usernameElement.value.trim();

    const password =
        passwordElement.value.trim();

    errorElement.textContent = "";

    if (!username || !password) {
        errorElement.textContent =
            "❌ Login va parolni kiriting.";
        return;
    }

    if (!supabaseClient) {
        errorElement.textContent =
            "❌ Supabase ulanmagan.";
        return;
    }

    try {

        const result =
            await supabaseClient
                .from("users")
                .select(
                    "id,name,username,password,role"
                )
                .eq(
                    "username",
                    username
                )
                .eq(
                    "password",
                    password
                )
                .limit(1);

        if (result.error) {

            console.error(
                "LOGIN ERROR:",
                result.error
            );

            errorElement.textContent =
                "❌ " +
                result.error.message;

            return;
        }

        if (
            !result.data ||
            result.data.length === 0
        ) {

            errorElement.textContent =
                "❌ Login yoki parol noto‘g‘ri.";

            return;
        }

        const user =
            result.data[0];

        const role =
            String(
                user.role || ""
            )
            .trim()
            .toLowerCase();

        if (
            role !== "admin" &&
            role !== "user"
        ) {

            errorElement.textContent =
                "❌ User roli noto‘g‘ri.";

            return;
        }

        currentUser = {
            id: user.id,
            name: user.name,
            username: user.username,
            role: role
        };

        usernameElement.value = "";
        passwordElement.value = "";

        if (role === "admin") {
            await openAdminPage();
        } else {
            await openWorkerPage();
        }

    }
    catch (error) {

        console.error(
            "LOGIN EXCEPTION:",
            error
        );

        errorElement.textContent =
            "❌ " +
            (
                error.message ||
                "Kirishda xatolik."
            );
    }
}

/* =========================================================
   ADMIN / WORKER
========================================================= */

async function openAdminPage() {

    await prepareMainPage(
        "ADMIN PANEL"
    );

    toggleRoleMenus(true);

    await showPage(
        "dashboardPage"
    );
}

async function openWorkerPage() {

    await prepareMainPage(
        "ISHCHI PANEL"
    );

    toggleRoleMenus(false);

    await showPage(
        "dashboardPage"
    );
}

function toggleRoleMenus(isAdmin) {

    [
        "addOrderMenu",
        "applicationsMenu",
        "usersMenu"
    ].forEach(function(id) {

        const element =
            document.getElementById(id);

        if (element) {
            element.style.display =
                isAdmin ? "block" : "none";
        }

    });

    const eventForm =
        document.getElementById(
            "workerEventAdminForm"
        );

    if (eventForm) {
        eventForm.classList.toggle(
            "hidden",
            !isAdmin
        );
    }
}

async function prepareMainPage(
    panelTitle
) {

    hideAllPages();

    const mainPage =
        document.getElementById("mainPage");

    if (!mainPage) {
        return;
    }

    mainPage.classList.remove("hidden");

    if (currentUser) {

        const currentUserElement =
            document.getElementById(
                "currentUser"
            );

        if (currentUserElement) {
            currentUserElement.textContent =
                currentUser.name;
        }

        const roleElement =
            document.getElementById(
                "userRole"
            );

        if (roleElement) {
            roleElement.textContent =
                currentUser.role === "admin"
                    ? "ADMIN"
                    : "ISHCHI";
        }

        const avatar =
            document.getElementById(
                "userAvatar"
            );

        if (avatar) {
            avatar.textContent =
                (
                    currentUser.name ||
                    "G"
                )
                .charAt(0)
                .toUpperCase();
        }
    }

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );

    if (pageTitle) {
        pageTitle.textContent =
            panelTitle;
    }

    updateDate();

    await updateDashboard();

    await displayOrders();

    await loadWorkerEvents();

    if (
        currentUser &&
        currentUser.role === "admin"
    ) {

        await displayUsers();

        await loadApplications();
    }
}

async function openMainPage() {

    if (!currentUser) {
        return;
    }

    if (
        currentUser.role === "admin"
    ) {
        await openAdminPage();
    }
    else {
        await openWorkerPage();
    }
}

function logout() {

    if (applicationTimer) {
        clearInterval(applicationTimer);
    }

    applicationTimer = null;

    backToLanding();
}

/* =========================================================
   MENU
========================================================= */

async function showPage(
    pageId,
    button = null
) {

    const adminOnlyPages = [
        "usersPage",
        "applicationsPage",
        "addOrderPage"
    ];

    if (
        adminOnlyPages.includes(pageId) &&
        (
            !currentUser ||
            currentUser.role !== "admin"
        )
    ) {

        alert(
            "❌ Bu sahifa faqat admin uchun."
        );

        return;
    }

    document
        .querySelectorAll(
            "#mainPage .page"
        )
        .forEach(function(page) {

            page.classList.add(
                "hidden"
            );

        });

    const target =
        document.getElementById(pageId);

    if (!target) {
        return;
    }

    target.classList.remove("hidden");

    const titles = {

        dashboardPage:
            currentUser &&
            currentUser.role === "admin"
                ? "ADMIN PANEL"
                : "ISHCHI PANEL",

        ordersPage:
            "Zakaslar",

        addOrderPage:
            "Zakas qo‘shish",

        workerEventsPage:
            "Tadbirlar",

        applicationsPage:
            "Arizalar",

        usersPage:
            "Userlar"

    };

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );

    if (pageTitle) {
        pageTitle.textContent =
            titles[pageId] ||
            "Gold Show";
    }

    document
        .querySelectorAll(
            "#mainPage .menu-btn"
        )
        .forEach(function(btn) {

            btn.classList.remove(
                "active"
            );

        });

    if (button) {
        button.classList.add("active");
    }

    if (pageId === "dashboardPage") {
        await updateDashboard();
    }

    if (pageId === "ordersPage") {
        await displayOrders();
    }

    if (pageId === "addOrderPage") {
        calculateRemaining();
    }

    if (pageId === "workerEventsPage") {
        await loadWorkerEvents();
    }

    if (pageId === "applicationsPage") {
        await loadApplications();
    }

    if (pageId === "usersPage") {
        await displayUsers();
    }
}

/* =========================================================
   ORDER
========================================================= */

function calculateRemaining() {

    const total =
        Number(
            document.getElementById(
                "totalPrice"
            )?.value
        ) || 0;

    const paid =
        Number(
            document.getElementById(
                "paid"
            )?.value
        ) || 0;

    const remaining =
        document.getElementById(
            "remaining"
        );

    if (remaining) {
        remaining.textContent =
            formatMoney(
                total - paid
            );
    }
}

function getOrderFromForm() {

    const getValue =
        function(id) {

            const element =
                document.getElementById(id);

            return element
                ? element.value
                : "";
        };

    return {

        client_name:
            getValue("clientName")
                .trim(),

        client_phone:
            getValue("clientPhone")
                .trim(),

        location:
            getValue("location")
                .trim(),

        event_date:
            getValue("eventDate"),

        event_time:
            getValue("eventTime"),

        screen_height:
            Number(
                getValue("screenHeight")
            ) || 0,

        screen_width:
            Number(
                getValue("screenWidth")
            ) || 0,

        stage_width:
            Number(
                getValue("stageWidth")
            ) || 0,

        stage_length:
            Number(
                getValue("stageLength")
            ) || 0,

        curtain:
            getValue("curtain") ||
            "Yo‘q",

        lights:
            Number(
                getValue("lights")
            ) || 0,

        galava:
            Number(
                getValue("galava")
            ) || 0,

        ledwash:
            Number(
                getValue("ledwash")
            ) || 0,

        confetti:
            Number(
                getValue("confetti")
            ) || 0,

        dim:
            Number(
                getValue("dim")
            ) || 0,

        firework:
            Number(
                getValue("firework")
            ) || 0,

        side_screens:
            Number(
                getValue("sideScreens")
            ) || 0,

        side_height:
            Number(
                getValue("sideHeight")
            ) || 0,

        side_width:
            Number(
                getValue("sideWidth")
            ) || 0,

        paid:
            Number(
                getValue("paid")
            ) || 0,

        total_price:
            Number(
                getValue("totalPrice")
            ) || 0
    };
}

async function saveOrderFromForm(
    event
) {

    event.preventDefault();

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {

        alert(
            "❌ Faqat admin zakas qo‘sha oladi."
        );

        return;
    }

    if (!supabaseClient) {

        alert(
            "❌ Supabase ulanmagan."
        );

        return;
    }

    const order =
        getOrderFromForm();

    if (!order.client_name) {
        alert(
            "❌ Mijoz ismini kiriting."
        );
        return;
    }

    if (!order.client_phone) {
        alert(
            "❌ Telefon raqamini kiriting."
        );
        return;
    }

    if (!order.location) {
        alert(
            "❌ Manzilni kiriting."
        );
        return;
    }

    if (!order.event_date) {
        alert(
            "❌ Tadbir sanasini tanlang."
        );
        return;
    }

    if (!order.event_time) {
        alert(
            "❌ Tadbir vaqtini tanlang."
        );
        return;
    }

    order.remaining =
        order.total_price -
        order.paid;

    const editingId =
        document.getElementById(
            "editingOrderId"
        )?.value.trim();

    try {

        let result;

        if (editingId) {

            result =
                await supabaseClient
                    .from("orders")
                    .update(order)
                    .eq(
                        "id",
                        Number(editingId)
                    )
                    .select()
                    .single();

        }
        else {

            result =
                await supabaseClient
                    .from("orders")
                    .insert(order)
                    .select()
                    .single();
        }

        if (result.error) {
            throw result.error;
        }

        resetOrderForm();

        await displayOrders();

        await updateDashboard();

        await showPage(
            "ordersPage"
        );

        alert(
            editingId
                ? "✅ Zakas yangilandi."
                : "✅ Zakas muvaffaqiyatli qo‘shildi."
        );

    }
    catch (error) {

        console.error(
            "ORDER ERROR:",
            error
        );

        alert(
            "❌ Zakas qo‘shilmadi:\n" +
            (
                error.message ||
                "Noma'lum xatolik"
            )
        );
    }
}

async function getOrders() {

    if (!supabaseClient) {
        return [];
    }

    const result =
        await supabaseClient
            .from("orders")
            .select("*")
            .order(
                "event_date",
                {
                    ascending: false
                }
            )
            .order(
                "event_time",
                {
                    ascending: false
                }
            );

    if (result.error) {

        console.error(
            "ORDERS ERROR:",
            result.error
        );

        return [];
    }

    return result.data || [];
}

async function displayOrders() {

    const container =
        document.getElementById(
            "ordersList"
        );

    if (!container) {
        return;
    }

    let orders =
        await getOrders();

    const search =
        (
            document.getElementById(
                "searchInput"
            )?.value || ""
        )
        .toLowerCase()
        .trim();

    if (search) {

        orders =
            orders.filter(function(order) {

                return (

                    String(
                        order.client_name
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        order.client_phone
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        order.location
                    )
                    .toLowerCase()
                    .includes(search)
                );

            });
    }

    if (!orders.length) {

        container.innerHTML = `
            <div class="no-orders">
                <h3>📭 Zakas topilmadi</h3>
                <p>Hozircha zakas mavjud emas.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        orders
            .map(createOrderHTML)
            .join("");
}

function createOrderHTML(order) {

    let adminButtons = "";

    if (
        currentUser &&
        currentUser.role === "admin"
    ) {

        adminButtons = `
            <div
                style="
                    display:flex;
                    gap:8px;
                    flex-wrap:wrap;
                    margin-top:15px;
                "
            >
                <button
                    type="button"
                    class="btn-edit"
                    onclick="editOrder(${Number(order.id)})"
                >
                    ✏️ Tahrirlash
                </button>

                <button
                    type="button"
                    class="btn-delete"
                    onclick="deleteOrder(${Number(order.id)})"
                >
                    🗑 O‘chirish
                </button>
            </div>
        `;
    }

    return `
        <div class="order-card">

            <div class="order-header">

                <div>

                    <div class="order-client">
                        👤 ${escapeHTML(
                            order.client_name
                        )}
                    </div>

                    <div>
                        📞 ${escapeHTML(
                            order.client_phone
                        )}
                    </div>

                </div>

                <div class="order-date">

                    📅 ${formatDate(
                        order.event_date
                    )}

                    <br>

                    ⏰ ${escapeHTML(
                        order.event_time || ""
                    )}

                </div>

            </div>

            <div class="order-grid">

                <div class="info">
                    <span>📍 Manzil</span>
                    <strong>
                        ${escapeHTML(
                            order.location
                        )}
                    </strong>
                </div>

                <div class="info">
                    <span>🖥 Ekran</span>
                    <strong>
                        ${order.screen_height || 0}m
                        ×
                        ${order.screen_width || 0}m
                    </strong>
                </div>

                <div class="info">
                    <span>🎭 Sahna</span>
                    <strong>
                        ${order.stage_width || 0}m
                        ×
                        ${order.stage_length || 0}m
                    </strong>
                </div>

                <div class="info">
                    <span>💡 Chiroq</span>
                    <strong>
                        ${order.lights || 0}
                    </strong>
                </div>

                <div class="info">
                    <span>🔆 Galava</span>
                    <strong>
                        ${order.galava || 0}
                    </strong>
                </div>

                <div class="info">
                    <span>💡 LED Wash</span>
                    <strong>
                        ${order.ledwash || 0}
                    </strong>
                </div>

                <div class="info">
                    <span>🎉 Konfetti</span>
                    <strong>
                        ${order.confetti || 0}
                    </strong>
                </div>

                <div class="info">
                    <span>💡 Dim</span>
                    <strong>
                        ${order.dim || 0}
                    </strong>
                </div>

                <div class="info">
                    <span>🎆 Firework</span>
                    <strong>
                        ${order.firework || 0}
                    </strong>
                </div>

                <div class="info">
                    <span>🖥 Yon ekran</span>
                    <strong>
                        ${order.side_screens || 0} dona
                        <br>
                        ${order.side_height || 0}m
                        ×
                        ${order.side_width || 0}m
                    </strong>
                </div>

                <div class="info">
                    <span>🎭 Parda</span>
                    <strong>
                        ${escapeHTML(
                            order.curtain || "Yo‘q"
                        )}
                    </strong>
                </div>

                <div class="info">
                    <span>💰 Jami</span>
                    <strong class="money">
                        ${formatMoney(
                            order.total_price
                        )}
                    </strong>
                </div>

                <div class="info">
                    <span>💵 To‘langan</span>
                    <strong class="money">
                        ${formatMoney(
                            order.paid
                        )}
                    </strong>
                </div>

                <div class="info">
                    <span>⚠️ Qolgan</span>
                    <strong class="remaining-money">
                        ${formatMoney(
                            order.remaining
                        )}
                    </strong>
                </div>

            </div>

            ${adminButtons}

        </div>
    `;
}

/* =========================================
   EDIT ORDER
========================================= */

async function editOrder(id) {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {

        alert(
            "❌ Faqat admin."
        );

        return;
    }

    const result =
        await supabaseClient
            .from("orders")
            .select("*")
            .eq("id", id)
            .single();

    if (
        result.error ||
        !result.data
    ) {

        alert(
            "❌ Zakas topilmadi."
        );

        return;
    }

    const order =
        result.data;

    const fields = {

        editingOrderId: "id",
        clientName: "client_name",
        clientPhone: "client_phone",
        location: "location",
        eventDate: "event_date",
        eventTime: "event_time",
        screenHeight: "screen_height",
        screenWidth: "screen_width",
        stageWidth: "stage_width",
        stageLength: "stage_length",
        curtain: "curtain",
        lights: "lights",
        galava: "galava",
        ledwash: "ledwash",
        confetti: "confetti",
        dim: "dim",
        firework: "firework",
        sideScreens: "side_screens",
        sideHeight: "side_height",
        sideWidth: "side_width",
        paid: "paid",
        totalPrice: "total_price"
    };

    Object.entries(fields)
        .forEach(function([elementId, field]) {

            const element =
                document.getElementById(
                    elementId
                );

            if (element) {
                element.value =
                    order[field] ?? "";
            }

        });

    document
        .getElementById("editBadge")
        ?.classList.remove("hidden");

    document
        .getElementById("cancelEditBtn")
        ?.classList.remove("hidden");

    const title =
        document.getElementById(
            "orderFormTitle"
        );

    if (title) {
        title.textContent =
            "✏️ Zakasni tahrirlash";
    }

    const submitButton =
        document.getElementById(
            "orderSubmitBtn"
        );

    if (submitButton) {
        submitButton.textContent =
            "💾 O‘zgarishlarni saqlash";
    }

    calculateRemaining();

    await showPage(
        "addOrderPage"
    );
}

function resetOrderForm() {

    const form =
        document.getElementById(
            "orderForm"
        );

    if (form) {
        form.reset();
    }

    const editing =
        document.getElementById(
            "editingOrderId"
        );

    if (editing) {
        editing.value = "";
    }

    document
        .getElementById("editBadge")
        ?.classList.add("hidden");

    document
        .getElementById("cancelEditBtn")
        ?.classList.add("hidden");

    const title =
        document.getElementById(
            "orderFormTitle"
        );

    if (title) {
        title.textContent =
            "➕ Yangi zakas qo‘shish";
    }

    const button =
        document.getElementById(
            "orderSubmitBtn"
        );

    if (button) {
        button.textContent =
            "💾 Zakasni saqlash";
    }

    calculateRemaining();
}

function cancelEditOrder() {

    resetOrderForm();

    showPage(
        "ordersPage"
    );
}

async function deleteOrder(id) {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {
        alert("❌ Faqat admin.");
        return;
    }

    if (
        !confirm(
            "Bu zakasni o‘chirmoqchimisiz?"
        )
    ) {
        return;
    }

    const result =
        await supabaseClient
            .from("orders")
            .delete()
            .eq(
                "id",
                id
            );

    if (result.error) {

        alert(
            "❌ " +
            result.error.message
        );

        return;
    }

    await displayOrders();
    await updateDashboard();

    alert(
        "✅ Zakas o‘chirildi."
    );
}

/* =========================================
   DASHBOARD
========================================= */

async function updateDashboard() {

    const orders =
        await getOrders();

    const today =
        getToday();

    const todayOrders =
        orders.filter(function(order) {
            return order.event_date === today;
        });

    const now =
        new Date();

    const upcoming =
        orders.filter(function(order) {

            if (
                !order.event_date ||
                !order.event_time
            ) {
                return false;
            }

            const date =
                new Date(
                    `${order.event_date}T${order.event_time}`
                );

            const difference =
                date.getTime() -
                now.getTime();

            return (
                difference > 0 &&
                difference <=
                7 *
                24 *
                60 *
                60 *
                1000
            );
        });

    const totalMoney =
        orders.reduce(
            function(sum, order) {

                return sum +
                    Number(
                        order.total_price || 0
                    );

            },
            0
        );

    const totalOrders =
        document.getElementById(
            "totalOrders"
        );

    const todayOrdersElement =
        document.getElementById(
            "todayOrders"
        );

    const upcomingOrders =
        document.getElementById(
            "upcomingOrders"
        );

    const totalMoneyElement =
        document.getElementById(
            "totalMoney"
        );

    if (totalOrders) {
        totalOrders.textContent =
            orders.length;
    }

    if (todayOrdersElement) {
        todayOrdersElement.textContent =
            todayOrders.length;
    }

    if (upcomingOrders) {
        upcomingOrders.textContent =
            upcoming.length;
    }

    if (totalMoneyElement) {
        totalMoneyElement.textContent =
            formatMoney(totalMoney);
    }

    await displayTodayOrders();
    await checkNotifications();
}

async function displayTodayOrders() {

    const container =
        document.getElementById(
            "todayOrdersList"
        );

    if (!container) {
        return;
    }

    const orders =
        (
            await getOrders()
        )
        .filter(function(order) {

            return (
                order.event_date ===
                getToday()
            );

        });

    if (!orders.length) {

        container.innerHTML = `
            <div class="no-orders">
                <h3>🎉 Bugun zakas yo‘q</h3>
                <p>
                    Bugungi kun uchun zakas mavjud emas.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        orders
            .map(createOrderHTML)
            .join("");
}

async function checkNotifications() {

    const container =
        document.getElementById(
            "notifications"
        );

    if (!container) {
        return;
    }

    const orders =
        await getOrders();

    const now =
        new Date();

    let html = "";

    orders.forEach(function(order) {

        if (
            !order.event_date ||
            !order.event_time
        ) {
            return;
        }

        const eventDate =
            new Date(
                `${order.event_date}T${order.event_time}`
            );

        const hours =
            (
                eventDate.getTime() -
                now.getTime()
            ) / 3600000;

        if (
            hours > 0 &&
            hours <= 24
        ) {

            html += `
                <div class="notification">
                    <strong>
                        🔔 Tadbir yaqinlashmoqda!
                    </strong>

                    👤
                    ${escapeHTML(
                        order.client_name
                    )}

                    <br>

                    📅
                    ${formatDate(
                        order.event_date
                    )}

                    <br>

                    ⏰
                    ${escapeHTML(
                        order.event_time
                    )}

                    <br>

                    📍
                    ${escapeHTML(
                        order.location
                    )}
                </div>
            `;
        }

    });

    container.innerHTML =
        html;
}

/* =========================================
   USERS
========================================= */

async function displayUsers() {

    const container =
        document.getElementById(
            "usersList"
        );

    if (
        !container ||
        !currentUser ||
        currentUser.role !== "admin"
    ) {
        return;
    }

    const result =
        await supabaseClient
            .from("users")
            .select(
                "id,name,username,password,role,created_at"
            )
            .order(
                "id",
                {
                    ascending: true
                }
            );

    if (result.error) {

        container.innerHTML = `
            <div class="no-orders">
                ❌ ${escapeHTML(
                    result.error.message
                )}
            </div>
        `;

        return;
    }

    const users =
        result.data || [];

    if (!users.length) {

        container.innerHTML = `
            <div class="no-orders">
                <h3>👥 Userlar yo‘q</h3>
            </div>
        `;

        return;
    }

    container.innerHTML =
        users.map(function(user) {

            const role =
                String(
                    user.role || ""
                ).toLowerCase();

            return `
                <div class="user-card">

                    <div class="user-card-header">

                        <div>

                            <div class="user-card-name">
                                👤
                                ${escapeHTML(
                                    user.name
                                )}
                            </div>

                            <span class="user-role">
                                ${
                                    role === "admin"
                                        ? "ADMIN"
                                        : "ISHCHI"
                                }
                            </span>

                        </div>

                    </div>

                    <div class="user-grid">

                        <div class="user-detail">

                            <span>
                                🔑 Login
                            </span>

                            <strong>
                                ${escapeHTML(
                                    user.username
                                )}
                            </strong>

                        </div>

                        <div class="user-detail">

                            <span>
                                🔒 Parol
                            </span>

                            <strong
                                id="password-${user.id}"
                                data-visible="false"
                            >
                                ••••••••
                            </strong>

                        </div>

                    </div>

                    <div class="user-actions">

                        <button
                            type="button"
                            class="btn-view"
                            onclick="showUserPassword(${Number(user.id)})"
                        >
                            👁 Ko‘rish
                        </button>

                        <button
                            type="button"
                            class="btn-edit"
                            onclick="changeUserPassword(${Number(user.id)})"
                        >
                            🔑 Parol
                        </button>

                        <button
                            type="button"
                            class="btn-edit"
                            onclick="changeUsername(${Number(user.id)})"
                        >
                            ✏️ Login
                        </button>

                        ${
                            Number(user.id) !==
                            Number(currentUser.id)

                                ? `
                                    <button
                                        type="button"
                                        class="btn-delete"
                                        onclick="deleteUser(${Number(user.id)})"
                                    >
                                        🗑 O‘chirish
                                    </button>
                                `
                                : ""
                        }

                    </div>

                </div>
            `;

        }).join("");
}

async function getUser(id) {

    const result =
        await supabaseClient
            .from("users")
            .select("*")
            .eq(
                "id",
                id
            )
            .single();

    if (result.error) {
        console.error(result.error);
        return null;
    }

    return result.data;
}

async function showUserPassword(id) {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {
        return;
    }

    const element =
        document.getElementById(
            "password-" + id
        );

    if (!element) {
        return;
    }

    if (
        element.dataset.visible ===
        "true"
    ) {

        element.textContent =
            "••••••••";

        element.dataset.visible =
            "false";

        return;
    }

    const result =
        await supabaseClient
            .from("users")
            .select("password")
            .eq(
                "id",
                id
            )
            .single();

    if (result.error) {

        alert(
            "❌ Parolni olishda xatolik:\n" +
            result.error.message
        );

        return;
    }

    element.textContent =
        result.data.password ||
        "Parol mavjud emas";

    element.dataset.visible =
        "true";
}

async function createUser(event) {

    event.preventDefault();

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {
        alert(
            "❌ Faqat admin user yaratadi."
        );

        return;
    }

    const name =
        document.getElementById(
            "newUserName"
        ).value.trim();

    const username =
        document.getElementById(
            "newUsername"
        ).value.trim();

    const password =
        document.getElementById(
            "newUserPassword"
        ).value.trim();

    const role =
        document.getElementById(
            "newUserRole"
        ).value.trim()
        .toLowerCase();

    if (!name || !username || !password) {

        alert(
            "❌ Barcha maydonlarni to‘ldiring."
        );

        return;
    }

    const check =
        await supabaseClient
            .from("users")
            .select("id")
            .eq(
                "username",
                username
            )
            .limit(1);

    if (check.error) {

        alert(
            "❌ " +
            check.error.message
        );

        return;
    }

    if (
        check.data &&
        check.data.length
    ) {

        alert(
            "❌ Bu login allaqachon mavjud."
        );

        return;
    }

    const result =
        await supabaseClient
            .from("users")
            .insert({

                name:
                    name,

                username:
                    username,

                password:
                    password,

                role:
                    role

            });

    if (result.error) {

        alert(
            "❌ " +
            result.error.message
        );

        return;
    }

    document
        .getElementById("userForm")
        .reset();

    await displayUsers();

    alert(
        "✅ User muvaffaqiyatli yaratildi."
    );
}

async function changeUserPassword(id) {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {
        return;
    }

    const password =
        prompt(
            "Yangi parolni kiriting:",
            ""
        );

    if (password === null) {
        return;
    }

    if (!password.trim()) {

        alert(
            "❌ Parol bo‘sh bo‘lmasligi kerak."
        );

        return;
    }

    const result =
        await supabaseClient
            .from("users")
            .update({
                password:
                    password.trim()
            })
            .eq(
                "id",
                id
            );

    if (result.error) {

        alert(
            "❌ " +
            result.error.message
        );

        return;
    }

    await displayUsers();

    alert(
        "✅ Parol o‘zgartirildi."
    );
}

async function changeUsername(id) {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {
        return;
    }

    const user =
        await getUser(id);

    if (!user) {
        return;
    }

    const newUsername =
        prompt(
            "Yangi loginni kiriting:",
            user.username
        );

    if (newUsername === null) {
        return;
    }

    const username =
        newUsername.trim();

    if (!username) {

        alert(
            "❌ Login bo‘sh bo‘lmasligi kerak."
        );

        return;
    }

    const check =
        await supabaseClient
            .from("users")
            .select("id")
            .eq(
                "username",
                username
            )
            .neq(
                "id",
                id
            )
            .limit(1);

    if (check.error) {

        alert(
            "❌ " +
            check.error.message
        );

        return;
    }

    if (
        check.data &&
        check.data.length
    ) {

        alert(
            "❌ Bu login allaqachon mavjud."
        );

        return;
    }

    const result =
        await supabaseClient
            .from("users")
            .update({
                username:
                    username
            })
            .eq(
                "id",
                id
            );

    if (result.error) {

        alert(
            "❌ " +
            result.error.message
        );

        return;
    }

    if (
        Number(id) ===
        Number(currentUser.id)
    ) {
        currentUser.username =
            username;
    }

    await displayUsers();

    alert(
        "✅ Login o‘zgartirildi."
    );
}

async function deleteUser(id) {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {
        return;
    }

    if (
        Number(id) ===
        Number(currentUser.id)
    ) {

        alert(
            "❌ O‘zingizni o‘chira olmaysiz."
        );

        return;
    }

    if (
        !confirm(
            "Bu userni o‘chirmoqchimisiz?"
        )
    ) {
        return;
    }

    const result =
        await supabaseClient
            .from("users")
            .delete()
            .eq(
                "id",
                id
            );

    if (result.error) {

        alert(
            "❌ " +
            result.error.message
        );

        return;
    }

    await displayUsers();

    alert(
        "✅ User o‘chirildi."
    );
}

/* =========================================
   EVENTS
========================================= */

async function getEvents() {

    const result =
        await supabaseClient
            .from("events")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (result.error) {

        console.error(
            "EVENT ERROR:",
            result.error
        );

        return [];
    }

    return result.data || [];
}

function eventImage(event) {

    if (
        event.image_url
    ) {

        return `
            <img
                src="${escapeHTML(
                    event.image_url
                )}"
                alt="${escapeHTML(
                    event.title
                )}"
                class="event-card-image"
            >
        `;

    }

    return `
        <div
            class="event-card-image"
            style="
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:55px;
            "
        >
            🎪
        </div>
    `;
}

function createEventHTML(event) {

    return `
        <article class="event-card">

            ${eventImage(event)}

            <div class="event-card-body">

                <div class="event-card-title">
                    ${escapeHTML(
                        event.title
                    )}
                </div>

                <div class="event-card-description">
                    ${escapeHTML(
                        event.description ||
                        "Tavsif mavjud emas."
                    )}
                </div>

                <div class="event-card-date">
                    ${formatDateTime(
                        event.created_at
                    )}
                </div>

            </div>

        </article>
    `;
}

function createWorkerEventHTML(event) {

    const deleteButton =
        currentUser &&
        currentUser.role === "admin"

            ? `
                <div class="event-admin-actions">

                    <button
                        type="button"
                        class="btn-delete"
                        onclick="deleteEvent(${Number(event.id)})"
                    >
                        🗑 O‘chirish
                    </button>

                </div>
            `
            : "";

    return `
        <article class="event-card">

            ${eventImage(event)}

            <div class="event-card-body">

                <div class="event-card-title">
                    ${escapeHTML(
                        event.title
                    )}
                </div>

                <div class="event-card-description">
                    ${escapeHTML(
                        event.description ||
                        "Tavsif mavjud emas."
                    )}
                </div>

                <div class="event-card-date">
                    ${formatDateTime(
                        event.created_at
                    )}
                </div>

                ${deleteButton}

            </div>

        </article>
    `;
}

async function loadCustomerEvents() {

    const container =
        document.getElementById(
            "customerEventsList"
        );

    const pagination =
        document.getElementById(
            "customerPagination"
        );

    if (
        !container ||
        !pagination
    ) {
        return;
    }

    const events =
        await getEvents();

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                events.length /
                EVENTS_PER_PAGE
            )
        );

    customerEventsPage =
        Math.min(
            customerEventsPage,
            totalPages
        );

    const start =
        (
            customerEventsPage -
            1
        ) *
        EVENTS_PER_PAGE;

    const pageEvents =
        events.slice(
            start,
            start + EVENTS_PER_PAGE
        );

    if (pageEvents.length) {

        container.innerHTML =
            pageEvents
                .map(createEventHTML)
                .join("");

    }
    else {

        container.innerHTML = `
            <div class="no-orders">

                <h3>
                    🎪 Hozircha tadbirlar yo‘q
                </h3>

                <p>
                    Tez orada yangi tadbirlar qo‘shiladi.
                </p>

            </div>
        `;
    }

    renderPagination(
        pagination,
        totalPages,
        customerEventsPage,
        function(page) {

            customerEventsPage =
                page;

            loadCustomerEvents();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    );
}

async function loadWorkerEvents() {

    const container =
        document.getElementById(
            "workerEventsList"
        );

    const pagination =
        document.getElementById(
            "workerPagination"
        );

    if (
        !container ||
        !pagination
    ) {
        return;
    }

    const events =
        await getEvents();

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                events.length /
                EVENTS_PER_PAGE
            )
        );

    workerEventsPage =
        Math.min(
            workerEventsPage,
            totalPages
        );

    const start =
        (
            workerEventsPage -
            1
        ) *
        EVENTS_PER_PAGE;

    const pageEvents =
        events.slice(
            start,
            start + EVENTS_PER_PAGE
        );

    container.innerHTML =
        pageEvents.length
            ? pageEvents
                .map(createWorkerEventHTML)
                .join("")
            : `
                <div class="no-orders">
                    <h3>🎪 Tadbirlar yo‘q</h3>
                </div>
            `;

    renderPagination(
        pagination,
        totalPages,
        workerEventsPage,
        function(page) {

            workerEventsPage =
                page;

            loadWorkerEvents();
        }
    );
}

function renderPagination(
    container,
    totalPages,
    currentPage,
    onPage
) {

    if (
        totalPages <= 1
    ) {

        container.innerHTML =
            "";

        return;
    }

    let html = "";

    html += `
        <button
            type="button"
            data-page="${currentPage - 1}"
            ${currentPage === 1 ? "disabled" : ""}
        >
            ← Oldingi
        </button>
    `;

    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        html += `
            <button
                type="button"
                data-page="${i}"
                class="${i === currentPage ? "active" : ""}"
            >
                ${i}
            </button>
        `;
    }

    html += `
        <button
            type="button"
            data-page="${currentPage + 1}"
            ${currentPage === totalPages ? "disabled" : ""}
        >
            Keyingi sahifa →
        </button>

        <span>
            ${currentPage}/${totalPages}
        </span>
    `;

    container.innerHTML =
        html;

    container
        .querySelectorAll(
            "button[data-page]"
        )
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    const page =
                        Number(
                            button.dataset.page
                        );

                    if (
                        page >= 1 &&
                        page <= totalPages
                    ) {

                        onPage(page);
                    }
                }
            );
        });
}

function fileToDataURL(file) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();

            reader.onload =
                function() {
                    resolve(
                        reader.result
                    );
                };

            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "Rasm o‘qilmadi."
                        )
                    );
                };

            reader.readAsDataURL(file);
        }
    );
}

async function saveEventFromForm(
    event
) {

    event.preventDefault();

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {

        alert(
            "❌ Faqat admin tadbir qo‘sha oladi."
        );

        return;
    }

    const titleElement =
        document.getElementById(
            "eventTitle"
        );

    const descriptionElement =
        document.getElementById(
            "eventDescription"
        );

    const imageElement =
        document.getElementById(
            "eventImage"
        );

    if (
        !titleElement ||
        !descriptionElement ||
        !imageElement
    ) {

        alert(
            "❌ Tadbir formasi topilmadi."
        );

        return;
    }

    const title =
        titleElement.value.trim();

    const description =
        descriptionElement.value.trim();

    const file =
        imageElement.files[0];

    if (!title) {

        alert(
            "❌ Tadbir nomini kiriting."
        );

        return;
    }

    let imageUrl = "";

    try {

        if (file) {

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "❌ Faqat rasm fayli yuklang."
                );

                return;
            }

            if (
                file.size >
                2 * 1024 * 1024
            ) {

                alert(
                    "❌ Rasm hajmi 2 MB dan kichik bo‘lsin."
                );

                return;
            }

            imageUrl =
                await fileToDataURL(
                    file
                );
        }

        const result =
            await supabaseClient
                .from("events")
                .insert({
                    title:
                        title,

                    description:
                        description ||
                        null,

                    image_url:
                        imageUrl ||
                        null
                })
                .select()
                .single();

        if (result.error) {

            alert(
                "❌ Tadbir qo‘shilmadi:\n" +
                result.error.message
            );

            return;
        }

        document
            .getElementById(
                "eventForm"
            )
            .reset();

        workerEventsPage = 1;

        await loadWorkerEvents();

        alert(
            "✅ Tadbir muvaffaqiyatli qo‘shildi."
        );

    }
    catch (error) {

        console.error(
            "EVENT ERROR:",
            error
        );

        alert(
            "❌ Tadbir qo‘shishda xatolik:\n" +
            (
                error.message ||
                "Noma'lum xatolik"
            )
        );
    }
}

async function deleteEvent(id) {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {
        return;
    }

    if (
        !confirm(
            "Bu tadbirni o‘chirmoqchimisiz?"
        )
    ) {
        return;
    }

    const result =
        await supabaseClient
            .from("events")
            .delete()
            .eq(
                "id",
                id
            );

    if (result.error) {

        alert(
            "❌ " +
            result.error.message
        );

        return;
    }

    await loadWorkerEvents();

    alert(
        "✅ Tadbir o‘chirildi."
    );
}

/* =========================================
   APPLICATION
========================================= */

function openOrderModal() {

    const modal =
        document.getElementById(
            "orderModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );

    const message =
        document.getElementById(
            "applicationMessage"
        );

    if (message) {
        message.innerHTML = "";
    }

    document
        .getElementById(
            "applicationName"
        )
        ?.focus();
}

function closeOrderModal() {

    const modal =
        document.getElementById(
            "orderModal"
        );

    if (modal) {
        modal.classList.add(
            "hidden"
        );
    }
}

async function submitApplication(
    event
) {

    event.preventDefault();

    const name =
        document.getElementById(
            "applicationName"
        ).value.trim();

    const phone =
        document.getElementById(
            "applicationPhone"
        ).value.trim();

    const message =
        document.getElementById(
            "applicationMessage"
        );

    if (
        !name ||
        !phone
    ) {

        message.innerHTML = `
            <div class="error">
                ❌ Ism va telefon raqamini kiriting.
            </div>
        `;

        return;
    }

    try {

        const result =
            await supabaseClient
                .from("applications")
                .insert({
                    full_name:
                        name,

                    phone:
                        phone,

                    status:
                        "new"
                })
                .select()
                .single();

        if (result.error) {
            throw result.error;
        }

        const application =
            result.data;

        localStorage.setItem(
            "goldshow_application_id",
            String(application.id)
        );

        localStorage.setItem(
            "goldshow_application_phone",
            phone
        );

        message.innerHTML = `
            <div
                style="
                    padding:15px;
                    border-radius:10px;
                    background:#dcfce7;
                    color:#15803d
                "
            >
                ✅ Arizangiz yuborildi!

                <br><br>

                <strong>
                    Ariza raqami:
                    #${application.id}
                </strong>

                <br><br>

                Biz siz bilan bog‘lanamiz.
            </div>
        `;

        document
            .getElementById(
                "applicationForm"
            )
            .reset();

        startApplicationPolling(
            application.id,
            phone
        );

    }
    catch (error) {

        console.error(
            "APPLICATION ERROR:",
            error
        );

        message.innerHTML = `
            <div class="error">
                ❌ Ariza yuborishda xatolik:
                <br>
                ${escapeHTML(
                    error.message ||
                    "Noma'lum xatolik"
                )}
            </div>
        `;
    }
}

function startApplicationPolling(
    id,
    phone
) {

    if (applicationTimer) {
        clearInterval(
            applicationTimer
        );
    }

    checkApplicationStatus(
        id,
        phone
    );

    applicationTimer =
        setInterval(
            function() {

                checkApplicationStatus(
                    id,
                    phone
                );

            },
            8000
        );
}

function restoreApplicationStatus() {

    const id =
        localStorage.getItem(
            "goldshow_application_id"
        );

    const phone =
        localStorage.getItem(
            "goldshow_application_phone"
        );

    if (
        id &&
        phone
    ) {

        startApplicationPolling(
            id,
            phone
        );
    }
}

async function checkApplicationStatus(
    id,
    phone
) {

    const result =
        await supabaseClient
            .from("applications")
            .select(
                "id,status,full_name,phone,created_at"
            )
            .eq(
                "id",
                id
            )
            .eq(
                "phone",
                phone
            )
            .maybeSingle();

    if (
        result.error ||
        !result.data
    ) {
        return;
    }

    const application =
        result.data;

    const box =
        document.getElementById(
            "customerStatusBox"
        );

    if (!box) {
        return;
    }

    if (
        application.status ===
        "accepted"
    ) {

        box.classList.remove(
            "hidden"
        );

        box.style.borderLeftColor =
            "#16a34a";

        box.innerHTML = `
            <strong>
                ✅ Sizning arizangiz qabul qilindi
            </strong>

            <br><br>

            Tez orada siz bilan bog‘lanamiz.

            <br><br>

            Ariza:
            #${application.id}
        `;

        clearInterval(
            applicationTimer
        );

        applicationTimer = null;
    }

    else if (
        application.status ===
        "rejected"
    ) {

        box.classList.remove(
            "hidden"
        );

        box.style.borderLeftColor =
            "#dc2626";

        box.innerHTML = `
            <strong>
                ❌ Arizangiz rad etildi.
            </strong>

            <br><br>

            Ariza:
            #${application.id}
        `;

        clearInterval(
            applicationTimer
        );

        applicationTimer = null;
    }
}

/* =========================================
   ADMIN APPLICATIONS
========================================= */

async function loadApplications() {

    const container =
        document.getElementById(
            "applicationsList"
        );

    if (
        !container ||
        !currentUser ||
        currentUser.role !== "admin"
    ) {
        return;
    }

    const result =
        await supabaseClient
            .from("applications")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (result.error) {

        container.innerHTML = `
            <div class="no-orders">
                ❌
                ${escapeHTML(
                    result.error.message
                )}
            </div>
        `;

        return;
    }

    const applications =
        result.data || [];

    if (!applications.length) {

        container.innerHTML = `
            <div class="no-orders">

                <h3>
                    📭 Arizalar yo‘q
                </h3>

                <p>
                    Hozircha buyurtmachi arizasi kelmagan.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        applications
            .map(createApplicationHTML)
            .join("");
}

function createApplicationHTML(
    application
) {

    const statuses = {

        new: [
            "status-new",
            "Yangi"
        ],

        accepted: [
            "status-accepted",
            "Qabul qilingan"
        ],

        rejected: [
            "status-rejected",
            "Rad etilgan"
        ]

    };

    const status =
        statuses[
            application.status
        ] ||
        statuses.new;

    let buttons = "";

    if (
        application.status ===
        "new"
    ) {

        buttons = `
            <div class="application-actions">

                <button
                    type="button"
                    class="accept-btn"
                    onclick="
                        updateApplicationStatus(
                            ${Number(application.id)},
                            'accepted'
                        )
                    "
                >
                    ✅ Qabul qilish
                </button>

                <button
                    type="button"
                    class="reject-btn"
                    onclick="
                        updateApplicationStatus(
                            ${Number(application.id)},
                            'rejected'
                        )
                    "
                >
                    ❌ Rad etish
                </button>

            </div>
        `;
    }

    return `
        <div class="application-card">

            <div class="application-header">

                <div>

                    <div class="application-name">
                        👤
                        ${escapeHTML(
                            application.full_name
                        )}
                    </div>

                </div>

                <div class="application-time">
                    ${formatDateTime(
                        application.created_at
                    )}
                </div>

            </div>

            <div class="application-info">

                <div class="application-detail">

                    <span>
                        📞 Telefon
                    </span>

                    <strong>
                        ${escapeHTML(
                            application.phone
                        )}
                    </strong>

                </div>

                <div class="application-detail">

                    <span>
                        🆔 Ariza
                    </span>

                    <strong>
                        #${Number(
                            application.id
                        )}
                    </strong>

                </div>

            </div>

            <span
                class="application-status ${status[0]}"
            >
                ${status[1]}
            </span>

            ${buttons}

        </div>
    `;
}

async function updateApplicationStatus(
    id,
    status
) {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {
        return;
    }

    const question =
        status === "accepted"
            ? "Bu arizani qabul qilasizmi?"
            : "Bu arizani rad qilasizmi?";

    if (!confirm(question)) {
        return;
    }

    const updateData = {
        status: status
    };

    if (
        status === "accepted"
    ) {

        updateData.accepted_at =
            new Date()
                .toISOString();
    }

    const result =
        await supabaseClient
            .from("applications")
            .update(updateData)
            .eq(
                "id",
                id
            );

    if (result.error) {

        alert(
            "❌ " +
            result.error.message
        );

        return;
    }

    await loadApplications();

    alert(
        status === "accepted"
            ? "✅ Ariza qabul qilindi."
            : "❌ Ariza rad etildi."
    );
}

/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateDate();

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        if (loginForm) {
            loginForm.addEventListener(
                "submit",
                login
            );
        }

        const orderForm =
            document.getElementById(
                "orderForm"
            );

        if (orderForm) {
            orderForm.addEventListener(
                "submit",
                saveOrderFromForm
            );
        }

        const userForm =
            document.getElementById(
                "userForm"
            );

        if (userForm) {
            userForm.addEventListener(
                "submit",
                createUser
            );
        }

        const eventForm =
            document.getElementById(
                "eventForm"
            );

        if (eventForm) {
            eventForm.addEventListener(
                "submit",
                saveEventFromForm
            );
        }

        const applicationForm =
            document.getElementById(
                "applicationForm"
            );

        if (applicationForm) {
            applicationForm.addEventListener(
                "submit",
                submitApplication
            );
        }

        const searchInput =
            document.getElementById(
                "searchInput"
            );

        if (searchInput) {
            searchInput.addEventListener(
                "input",
                displayOrders
            );
        }

        const totalPrice =
            document.getElementById(
                "totalPrice"
            );

        if (totalPrice) {
            totalPrice.addEventListener(
                "input",
                calculateRemaining
            );
        }

        const paid =
            document.getElementById(
                "paid"
            );

        if (paid) {
            paid.addEventListener(
                "input",
                calculateRemaining
            );
        }

        const modal =
            document.getElementById(
                "orderModal"
            );

        if (modal) {

            modal.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeOrderModal();
                    }

                }
            );
        }

        calculateRemaining();

    }
);