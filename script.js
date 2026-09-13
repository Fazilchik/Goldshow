/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL = "https://mvrrftlhjlbrsiexnwjq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_MFI3LFGRmSviFv6ygJnXyg_wFktEpyP";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let currentUser = null;
let currentRole = null;

let allOrders = [];
let allEvents = [];
let allApplications = [];
let allUsers = [];

let currentEventPage = 1;
const eventsPerPage = 6;

let eventImageData = "";

let applicationCheckTimer = null;


/* =========================================================
   UZBEK MONTHS
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


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return value;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = UZ_MONTHS[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month} ${year}-yil`;
}


function formatDateShort(value) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return value;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}


function formatDateTime(dateValue, timeValue = "") {

    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return `${dateValue} ${timeValue}`;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let time = "";

    if (timeValue) {
        time = String(timeValue).slice(0, 5);
    }

    return `${day}.${month}.${year} ${time}`;
}


/* =========================================================
   TODAY DATE
========================================================= */

function updateDate() {

    const element = document.getElementById("todayDate");

    if (!element) {
        return;
    }

    const date = new Date();

    const day = date.getDate();
    const month = UZ_MONTHS[date.getMonth()];
    const year = date.getFullYear();

    element.textContent =
        `${day}-${month} ${year}-yil`;
}


/* =========================================================
   PAGE
========================================================= */

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }
}


/* =========================================================
   LANDING PAGE
========================================================= */

function openCustomerPage() {

    showPage("customerPage");

    loadCustomerEvents();
}


function openLoginPage() {

    showPage("loginPage");

    const username =
        document.getElementById("loginUsername");

    const password =
        document.getElementById("loginPassword");

    if (username) {
        username.value = "";
    }

    if (password) {
        password.value = "";
    }
}


function backToLanding() {

    showPage("landingPage");
}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser(event) {

    if (event) {
        event.preventDefault();
    }

    const usernameInput =
        document.getElementById("username") ||
        document.getElementById("loginUsername");

    const passwordInput =
        document.getElementById("password") ||
        document.getElementById("loginPassword");

    const username =
        usernameInput ? usernameInput.value.trim() : "";

    const password =
        passwordInput ? passwordInput.value.trim() : "";

    if (!username || !password) {

        alert("Login va parolni kiriting.");

        return;
    }

    try {

        const {
            data,
            error
        } = await supabase
            .from("users")
            .select("*")
            .eq("username", username)
            .eq("password", password)
            .maybeSingle();

        if (error) {

            console.error("LOGIN ERROR:", error);

            alert(
                "Login vaqtida xatolik:\n" +
                error.message
            );

            return;
        }

        if (!data) {

            alert(
                "Login yoki parol noto‘g‘ri."
            );

            return;
        }

        currentUser = data;
        currentRole = data.role;

        localStorage.setItem(
            "goldshow_user",
            JSON.stringify(data)
        );

        if (data.role === "admin") {

            await openAdminPage();

        } else {

            await openWorkerPage();
        }

    } catch (error) {

        console.error(error);

        alert(
            "Kutilmagan xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    currentUser = null;
    currentRole = null;

    localStorage.removeItem("goldshow_user");

    if (applicationCheckTimer) {
        clearInterval(applicationCheckTimer);
        applicationCheckTimer = null;
    }

    showPage("landingPage");
}


/* =========================================================
   ROLE MENUS
========================================================= */

function toggleRoleMenus(isAdmin) {

    const addOrderMenu =
        document.getElementById("addOrderMenu");

    const applicationsMenu =
        document.getElementById("applicationsMenu");

    const usersMenu =
        document.getElementById("usersMenu");

    const eventAdminForm =
        document.getElementById("workerEventAdminForm");

    if (addOrderMenu) {
        addOrderMenu.style.display =
            isAdmin ? "" : "none";
    }

    if (applicationsMenu) {
        applicationsMenu.style.display =
            isAdmin ? "" : "none";
    }

    if (usersMenu) {
        usersMenu.style.display =
            isAdmin ? "" : "none";
    }

    if (eventAdminForm) {
        eventAdminForm.style.display =
            isAdmin ? "" : "none";
    }
}


/* =========================================================
   OPEN ADMIN PAGE
========================================================= */

async function openAdminPage() {

    currentRole = "admin";

    toggleRoleMenus(true);

    await prepareMainPage();

    showPage("mainPage");

    toggleRoleMenus(true);

    await updateDashboard();
}


/* =========================================================
   OPEN WORKER PAGE
========================================================= */

async function openWorkerPage() {

    currentRole = "user";

    toggleRoleMenus(false);

    await prepareMainPage();

    showPage("mainPage");

    toggleRoleMenus(false);
}


/* =========================================================
   PREPARE MAIN PAGE
========================================================= */

async function prepareMainPage() {

    updateDate();

    await updateDashboard();

    await getOrders();

    await getEvents();

    if (currentRole === "admin") {

        await getApplications();

        await getUsers();
    }
}


/* =========================================================
   MENU
========================================================= */

function openDashboard() {

    showPageSection("dashboardSection");

    updateDashboard();
}


function openOrdersPage() {

    showPageSection("ordersSection");

    getOrders();
}


function openOrderFormPage() {

    showPageSection("orderFormSection");

    resetOrderForm();
}


function openApplicationsPage() {

    if (currentRole !== "admin") {
        return;
    }

    showPageSection("applicationsPage");

    getApplications();
}


function openUsersPage() {

    if (currentRole !== "admin") {
        return;
    }

    showPageSection("usersPage");

    getUsers();
}


function openEventsPage() {

    showPageSection("workerEventsPage");

    getEvents();
}


function showPageSection(sectionId) {

    document
        .querySelectorAll(".main-section")
        .forEach(section => {

            section.classList.remove("active");
            section.style.display = "none";
        });

    const section =
        document.getElementById(sectionId);

    if (section) {

        section.classList.add("active");
        section.style.display = "block";
    }
}


/* =========================================================
   ORDER FORM
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value
        : "";
}


function getNumberValue(id) {

    const value =
        parseFloat(getValue(id));

    return isNaN(value) ? 0 : value;
}


function getOrderFromForm() {

    return {

        client_name:
            getValue("clientName").trim(),

        client_phone:
            getValue("clientPhone").trim(),

        location:
            getValue("location").trim(),

        event_date:
            getValue("eventDate"),

        event_time:
            getValue("eventTime"),

        screen_height:
            getNumberValue("screenHeight"),

        screen_width:
            getNumberValue("screenWidth"),

        stage_width:
            getNumberValue("stageWidth"),

        stage_length:
            getNumberValue("stageLength"),

        curtain:
            getValue("curtain") || "Yo‘q",

        lights:
            parseInt(getNumberValue("lights")) || 0,

        galava:
            parseInt(getNumberValue("galava")) || 0,

        ledwash:
            parseInt(getNumberValue("ledwash")) || 0,

        confetti:
            parseInt(getNumberValue("confetti")) || 0,

        dim:
            parseInt(getNumberValue("dim")) || 0,

        firework:
            parseInt(getNumberValue("firework")) || 0,

        side_screens:
            parseInt(getNumberValue("sideScreens")) || 0,

        side_height:
            getNumberValue("sideHeight"),

        side_width:
            getNumberValue("sideWidth"),

        paid:
            getNumberValue("paid"),

        total_price:
            getNumberValue("totalPrice"),

        remaining:
            getNumberValue("remaining")
    };
}


/* =========================================================
   SAVE ORDER
========================================================= */

async function saveOrderFromForm(event) {

    if (event) {
        event.preventDefault();
    }

    const form =
        document.getElementById("orderForm");

    if (!form) {
        return;
    }

    const order =
        getOrderFromForm();

    if (!order.client_name) {

        alert("Buyurtmachi ismini kiriting.");

        return;
    }

    if (!order.client_phone) {

        alert("Telefon raqamini kiriting.");

        return;
    }

    if (!order.location) {

        alert("Manzilni kiriting.");

        return;
    }

    if (!order.event_date) {

        alert("Tadbir sanasini tanlang.");

        return;
    }

    if (!order.event_time) {

        alert("Tadbir vaqtini tanlang.");

        return;
    }

    const editingId =
        getValue("editingOrderId");

    const button =
        document.getElementById("orderSubmitBtn");

    try {

        if (button) {
            button.disabled = true;
            button.textContent =
                "Saqlanmoqda...";
        }

        let result;

        if (editingId) {

            result = await supabase
                .from("orders")
                .update(order)
                .eq("id", editingId);

        } else {

            result = await supabase
                .from("orders")
                .insert([order]);
        }

        if (result.error) {

            console.error(
                "ORDER ERROR:",
                result.error
            );

            alert(
                "❌ Buyurtma saqlanmadi:\n" +
                result.error.message
            );

            return;
        }

        alert(
            editingId
                ? "✅ Buyurtma yangilandi."
                : "✅ Buyurtma qo‘shildi."
        );

        resetOrderForm();

        await getOrders();

        await updateDashboard();

        showPageSection("ordersSection");

    } catch (error) {

        console.error(error);

        alert(
            "❌ Buyurtma qo‘shishda xatolik:\n" +
            error.message
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Saqlash";
        }
    }
}


/* =========================================================
   RESET ORDER FORM
========================================================= */

function resetOrderForm() {

    const form =
        document.getElementById("orderForm");

    if (form) {
        form.reset();
    }

    const editing =
        document.getElementById("editingOrderId");

    if (editing) {
        editing.value = "";
    }

    const cancelButton =
        document.getElementById("cancelEditBtn");

    if (cancelButton) {
        cancelButton.style.display = "none";
    }

    const badge =
        document.getElementById("editBadge");

    if (badge) {
        badge.style.display = "none";
    }

    const submitButton =
        document.getElementById("orderSubmitBtn");

    if (submitButton) {
        submitButton.textContent =
            "Saqlash";
    }

    calculateRemaining();
}


/* =========================================================
   CALCULATE REMAINING
========================================================= */

function calculateRemaining() {

    const total =
        getNumberValue("totalPrice");

    const paid =
        getNumberValue("paid");

    const remaining =
        Math.max(0, total - paid);

    const remainingInput =
        document.getElementById("remaining");

    if (remainingInput) {

        remainingInput.value =
            remaining;
    }
}


/* =========================================================
   GET ORDERS
========================================================= */

async function getOrders() {

    try {

        const {
            data,
            error
        } = await supabase
            .from("orders")
            .select("*")
            .order("event_date", {
                ascending: true
            })
            .order("event_time", {
                ascending: true
            });

        if (error) {

            console.error(
                "GET ORDERS ERROR:",
                error
            );

            return;
        }

        allOrders = data || [];

        displayOrders(allOrders);

    } catch (error) {

        console.error(error);
    }
}


/* =========================================================
   DISPLAY ORDERS
========================================================= */

function displayOrders(orders) {

    const container =
        document.getElementById("ordersList");

    if (!container) {
        return;
    }

    if (!orders.length) {

        container.innerHTML = `
            <div class="empty-state">
                Buyurtmalar hali mavjud emas.
            </div>
        `;

        return;
    }

    container.innerHTML =
        orders.map(createOrderHTML).join("");
}


/* =========================================================
   ORDER HTML
========================================================= */

function createOrderHTML(order) {

    return `
        <div class="order-card">

            <div class="order-card-header">

                <div>
                    <h3>
                        ${escapeHTML(order.client_name || "-")}
                    </h3>

                    <p>
                        📞 ${escapeHTML(order.client_phone || "-")}
                    </p>
                </div>

                <div class="order-date">
                    ${formatDate(order.event_date)}
                </div>

            </div>

            <div class="order-info-grid">

                <div>
                    <strong>📍 Manzil:</strong>
                    ${escapeHTML(order.location || "-")}
                </div>

                <div>
                    <strong>🕒 Vaqt:</strong>
                    ${escapeHTML(
                        String(order.event_time || "").slice(0, 5)
                    )}
                </div>

                <div>
                    <strong>💰 Jami:</strong>
                    ${formatMoney(order.total_price)} so‘m
                </div>

                <div>
                    <strong>💵 To‘langan:</strong>
                    ${formatMoney(order.paid)} so‘m
                </div>

                <div>
                    <strong>💳 Qolgan:</strong>
                    ${formatMoney(order.remaining)} so‘m
                </div>

                <div>
                    <strong>🪟 Parda:</strong>
                    ${escapeHTML(order.curtain || "Yo‘q")}
                </div>

            </div>

            <div class="order-buttons">

                <button
                    type="button"
                    onclick="editOrder(${order.id})"
                    class="btn-edit">
                    ✏️ Tahrirlash
                </button>

                <button
                    type="button"
                    onclick="deleteOrder(${order.id})"
                    class="btn-delete">
                    🗑️ O‘chirish
                </button>

            </div>

        </div>
    `;
}


/* =========================================================
   EDIT ORDER
========================================================= */

function editOrder(id) {

    const order =
        allOrders.find(item => item.id == id);

    if (!order) {
        return;
    }

    showPageSection("orderFormSection");

    setValue("editingOrderId", order.id);

    setValue("clientName", order.client_name);
    setValue("clientPhone", order.client_phone);
    setValue("location", order.location);

    setValue("eventDate", order.event_date);
    setValue(
        "eventTime",
        String(order.event_time || "").slice(0, 5)
    );

    setValue("screenHeight", order.screen_height);
    setValue("screenWidth", order.screen_width);

    setValue("stageWidth", order.stage_width);
    setValue("stageLength", order.stage_length);

    setValue("curtain", order.curtain);

    setValue("sideScreens", order.side_screens);

    setValue("sideHeight", order.side_height);
    setValue("sideWidth", order.side_width);

    setValue("lights", order.lights);
    setValue("galava", order.galava);
    setValue("ledwash", order.ledwash);
    setValue("confetti", order.confetti);
    setValue("dim", order.dim);
    setValue("firework", order.firework);

    setValue("totalPrice", order.total_price);
    setValue("paid", order.paid);
    setValue("remaining", order.remaining);

    const cancelButton =
        document.getElementById("cancelEditBtn");

    if (cancelButton) {
        cancelButton.style.display = "inline-block";
    }

    const badge =
        document.getElementById("editBadge");

    if (badge) {
        badge.style.display = "inline-block";
    }

    const submitButton =
        document.getElementById("orderSubmitBtn");

    if (submitButton) {
        submitButton.textContent =
            "Yangilash";
    }

    calculateRemaining();
}


/* =========================================================
   SET INPUT VALUE
========================================================= */

function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.value =
            value === null ||
            value === undefined
                ? ""
                : value;
    }
}


/* =========================================================
   DELETE ORDER
========================================================= */

async function deleteOrder(id) {

    const confirmDelete =
        confirm(
            "Bu buyurtmani o‘chirmoqchimisiz?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const {
            error
        } = await supabase
            .from("orders")
            .delete()
            .eq("id", id);

        if (error) {

            console.error(
                "DELETE ORDER ERROR:",
                error
            );

            alert(
                "❌ O‘chirishda xatolik:\n" +
                error.message
            );

            return;
        }

        alert(
            "✅ Buyurtma o‘chirildi."
        );

        await getOrders();

        await updateDashboard();

    } catch (error) {

        console.error(error);

        alert(
            "❌ Xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   SEARCH ORDERS
========================================================= */

function searchOrders() {

    const input =
        document.getElementById("searchInput");

    const query =
        input
            ? input.value.trim().toLowerCase()
            : "";

    if (!query) {

        displayOrders(allOrders);

        return;
    }

    const filtered =
        allOrders.filter(order => {

            return (
                String(order.client_name || "")
                    .toLowerCase()
                    .includes(query)

                ||

                String(order.client_phone || "")
                    .toLowerCase()
                    .includes(query)

                ||

                String(order.location || "")
                    .toLowerCase()
                    .includes(query)
            );
        });

    displayOrders(filtered);
}


/* =========================================================
   DASHBOARD
========================================================= */

async function updateDashboard() {

    try {

        const {
            data,
            error
        } = await supabase
            .from("orders")
            .select("*");

        if (error) {

            console.error(
                "DASHBOARD ERROR:",
                error
            );

            return;
        }

        const orders =
            data || [];

        allOrders =
            orders;

        const totalOrders =
            orders.length;

        const today =
            new Date();

        const todayString =
            `${today.getFullYear()}-` +
            `${String(today.getMonth() + 1).padStart(2, "0")}-` +
            `${String(today.getDate()).padStart(2, "0")}`;

        const todayOrders =
            orders.filter(
                order =>
                    order.event_date === todayString
            ).length;

        const upcomingOrders =
            orders.filter(
                order =>
                    order.event_date > todayString
            ).length;

        const totalMoney =
            orders.reduce(
                (sum, order) =>
                    sum +
                    Number(order.total_price || 0),
                0
            );

        setText(
            "totalOrders",
            totalOrders
        );

        setText(
            "todayOrders",
            todayOrders
        );

        setText(
            "upcomingOrders",
            upcomingOrders
        );

        setText(
            "totalMoney",
            formatMoney(totalMoney) +
            " so‘m"
        );

        displayTodayOrders(orders);

        checkNotifications(orders);

    } catch (error) {

        console.error(error);
    }
}


/* =========================================================
   TODAY ORDERS
========================================================= */

function displayTodayOrders(orders) {

    const container =
        document.getElementById("todayOrdersList");

    if (!container) {
        return;
    }

    const today =
        new Date();

    const todayString =
        `${today.getFullYear()}-` +
        `${String(today.getMonth() + 1).padStart(2, "0")}-` +
        `${String(today.getDate()).padStart(2, "0")}`;

    const todayOrders =
        orders.filter(
            order =>
                order.event_date === todayString
        );

    if (!todayOrders.length) {

        container.innerHTML = `
            <div class="empty-state">
                Bugun buyurtma yo‘q.
            </div>
        `;

        return;
    }

    container.innerHTML =
        todayOrders.map(order => {

            return `
                <div class="today-order-item">

                    <strong>
                        ${escapeHTML(order.client_name || "-")}
                    </strong>

                    <span>
                        ${escapeHTML(
                            String(order.event_time || "")
                                .slice(0, 5)
                        )}
                    </span>

                    <small>
                        ${escapeHTML(order.location || "-")}
                    </small>

                </div>
            `;

        }).join("");
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function checkNotifications(orders = allOrders) {

    const element =
        document.getElementById("notifications");

    if (!element) {
        return;
    }

    const today =
        new Date();

    const todayString =
        `${today.getFullYear()}-` +
        `${String(today.getMonth() + 1).padStart(2, "0")}-` +
        `${String(today.getDate()).padStart(2, "0")}`;

    const todayOrders =
        orders.filter(
            order =>
                order.event_date === todayString
        );

    const upcomingOrders =
        orders.filter(
            order =>
                order.event_date > todayString
        );

    let message = "";

    if (todayOrders.length) {

        message +=
            `Bugun ${todayOrders.length} ta tadbir bor. `;
    }

    if (upcomingOrders.length) {

        message +=
            `Kelgusi ${upcomingOrders.length} ta buyurtma bor.`;
    }

    if (!message) {
        message = "Yangi xabar yo‘q.";
    }

    element.textContent = message;
}


/* =========================================================
   EVENTS
========================================================= */

async function getEvents() {

    try {

        const {
            data,
            error
        } = await supabase
            .from("events")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {

            console.error(
                "GET EVENTS ERROR:",
                error
            );

            return;
        }

        allEvents =
            data || [];

        displayWorkerEvents();
        displayCustomerEvents();

    } catch (error) {

        console.error(error);
    }
}


/* =========================================================
   EVENT IMAGE
========================================================= */

function handleEventImage(event) {

    const file =
        event.target.files &&
        event.target.files[0];

    if (!file) {
        eventImageData = "";
        return;
    }

    const maxSize =
        2 * 1024 * 1024;

    if (file.size > maxSize) {

        alert(
            "Rasm hajmi 2 MB dan oshmasin."
        );

        event.target.value = "";

        eventImageData = "";

        return;
    }

    const reader =
        new FileReader();

    reader.onload = function(e) {

        eventImageData =
            e.target.result;
    };

    reader.readAsDataURL(file);
}


/* =========================================================
   SAVE EVENT
========================================================= */

async function saveEventFromForm(event) {

    if (event) {
        event.preventDefault();
    }

    if (currentRole !== "admin") {

        alert(
            "Faqat admin tadbir qo‘sha oladi."
        );

        return;
    }

    const title =
        getValue("eventTitle").trim();

    const description =
        getValue("eventDescription").trim();

    const imageInput =
        document.getElementById("eventImage");

    if (!title) {

        alert("Tadbir nomini kiriting.");

        return;
    }

    let image_url =
        eventImageData || "";

    if (
        imageInput &&
        imageInput.files &&
        imageInput.files[0]
    ) {

        const file =
            imageInput.files[0];

        const maxSize =
            2 * 1024 * 1024;

        if (file.size > maxSize) {

            alert(
                "Rasm hajmi 2 MB dan oshmasin."
            );

            return;
        }

        image_url =
            await fileToDataURL(file);
    }

    try {

        const {
            error
        } = await supabase
            .from("events")
            .insert([
                {
                    title: title,
                    description: description,
                    image_url: image_url
                }
            ]);

        if (error) {

            console.error(
                "SAVE EVENT ERROR:",
                error
            );

            alert(
                "❌ Tadbir qo‘shilmadi:\n" +
                error.message
            );

            return;
        }

        alert(
            "✅ Tadbir muvaffaqiyatli qo‘shildi."
        );

        const form =
            document.getElementById("eventForm");

        if (form) {
            form.reset();
        }

        eventImageData = "";

        await getEvents();

    } catch (error) {

        console.error(error);

        alert(
            "❌ Xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   FILE TO DATA URL
========================================================= */

function fileToDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload =
                () => resolve(
                    reader.result
                );

            reader.onerror =
                reject;

            reader.readAsDataURL(file);
        }
    );
}


/* =========================================================
   WORKER EVENTS
========================================================= */

function displayWorkerEvents() {

    const container =
        document.getElementById("workerEventsList");

    if (!container) {
        return;
    }

    const start =
        (currentEventPage - 1) *
        eventsPerPage;

    const end =
        start +
        eventsPerPage;

    const events =
        allEvents.slice(start, end);

    if (!events.length) {

        container.innerHTML = `
            <div class="empty-state">
                Tadbirlar mavjud emas.
            </div>
        `;

        renderEventPagination();

        return;
    }

    container.innerHTML =
        events.map(event => {

            return `
                <div class="event-card">

                    ${
                        event.image_url
                            ? `
                                <img
                                    src="${escapeAttribute(event.image_url)}"
                                    alt="${escapeAttribute(event.title)}"
                                    class="event-image"
                                >
                            `
                            : ""
                    }

                    <div class="event-content">

                        <h3>
                            ${escapeHTML(event.title)}
                        </h3>

                        <p>
                            ${escapeHTML(
                                event.description || ""
                            )}
                        </p>

                        <small>
                            ${formatDate(event.created_at)}
                        </small>

                        ${
                            currentRole === "admin"
                                ? `
                                    <button
                                        type="button"
                                        onclick="deleteEvent(${event.id})"
                                        class="btn-delete">
                                        🗑️ O‘chirish
                                    </button>
                                `
                                : ""
                        }

                    </div>

                </div>
            `;

        }).join("");

    renderEventPagination();
}


/* =========================================================
   CUSTOMER EVENTS
========================================================= */

function displayCustomerEvents() {

    const container =
        document.getElementById("customerEventsList");

    if (!container) {
        return;
    }

    if (!allEvents.length) {

        container.innerHTML = `
            <div class="empty-state">
                Hozircha tadbirlar mavjud emas.
            </div>
        `;

        return;
    }

    container.innerHTML =
        allEvents.map(event => {

            return `
                <div class="customer-event-card">

                    ${
                        event.image_url
                            ? `
                                <img
                                    src="${escapeAttribute(event.image_url)}"
                                    alt="${escapeAttribute(event.title)}"
                                >
                            `
                            : ""
                    }

                    <div class="customer-event-content">

                        <h3>
                            ${escapeHTML(event.title)}
                        </h3>

                        <p>
                            ${escapeHTML(
                                event.description || ""
                            )}
                        </p>

                        <button
                            type="button"
                            onclick="openOrderModal(${event.id})"
                            class="btn-primary">
                            Buyurtma berish
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


function loadCustomerEvents() {

    getEvents();
}


/* =========================================================
   EVENT PAGINATION
========================================================= */

function renderEventPagination() {

    const container =
        document.getElementById("workerPagination");

    if (!container) {
        return;
    }

    const totalPages =
        Math.ceil(
            allEvents.length /
            eventsPerPage
        );

    if (totalPages <= 1) {

        container.innerHTML = "";

        return;
    }

    let html = "";

    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        html += `
            <button
                type="button"
                class="${
                    i === currentEventPage
                        ? "active"
                        : ""
                }"
                onclick="goToEventPage(${i})">
                ${i}
            </button>
        `;
    }

    container.innerHTML =
        html;
}


function goToEventPage(page) {

    currentEventPage =
        page;

    displayWorkerEvents();
}


/* =========================================================
   DELETE EVENT
========================================================= */

async function deleteEvent(id) {

    if (currentRole !== "admin") {
        return;
    }

    const result =
        confirm(
            "Bu tadbirni o‘chirmoqchimisiz?"
        );

    if (!result) {
        return;
    }

    try {

        const {
            error
        } = await supabase
            .from("events")
            .delete()
            .eq("id", id);

        if (error) {

            console.error(
                "DELETE EVENT ERROR:",
                error
            );

            alert(
                "❌ Tadbir o‘chirilmadi:\n" +
                error.message
            );

            return;
        }

        alert(
            "✅ Tadbir o‘chirildi."
        );

        await getEvents();

    } catch (error) {

        console.error(error);

        alert(
            "❌ Xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   CUSTOMER ORDER MODAL
========================================================= */

function openOrderModal(eventId = null) {

    const modal =
        document.getElementById("orderModal");

    if (!modal) {
        return;
    }

    modal.style.display = "flex";

    const form =
        document.getElementById("applicationForm");

    if (form) {
        form.reset();
    }

    const message =
        document.getElementById("applicationMessage");

    if (message) {
        message.textContent = "";
    }

    const selectedEvent =
        allEvents.find(
            event =>
                event.id == eventId
        );

    if (selectedEvent) {

        const title =
            document.getElementById("selectedEventTitle");

        if (title) {

            title.textContent =
                selectedEvent.title;
        }
    }
}


function closeOrderModal() {

    const modal =
        document.getElementById("orderModal");

    if (modal) {
        modal.style.display = "none";
    }
}


/* =========================================================
   APPLICATION
========================================================= */

async function submitApplication(event) {

    if (event) {
        event.preventDefault();
    }

    const name =
        getValue("applicationName").trim();

    const phone =
        getValue("applicationPhone").trim();

    const message =
        document.getElementById("applicationMessage");

    if (!name) {

        showApplicationMessage(
            "Ismingizni kiriting.",
            "error"
        );

        return;
    }

    if (!phone) {

        showApplicationMessage(
            "Telefon raqamingizni kiriting.",
            "error"
        );

        return;
    }

    try {

        const {
            data,
            error
        } = await supabase
            .from("applications")
            .insert([
                {
                    full_name: name,
                    phone: phone,
                    status: "new"
                }
            ])
            .select()
            .single();

        if (error) {

            console.error(
                "APPLICATION ERROR:",
                error
            );

            showApplicationMessage(
                "Ariza yuborishda xatolik:\n" +
                error.message,
                "error"
            );

            return;
        }

        localStorage.setItem(
            "goldshow_application_id",
            data.id
        );

        localStorage.setItem(
            "goldshow_application_phone",
            phone
        );

        showApplicationMessage(
            "✅ Arizangiz muvaffaqiyatli yuborildi.",
            "success"
        );

        const statusBox =
            document.getElementById("customerStatusBox");

        if (statusBox) {

            statusBox.innerHTML = `
                <div class="status-success">
                    Ariza qabul qilindi.
                    Admin javobini kuting.
                </div>
            `;
        }

        startApplicationStatusCheck(data.id);

    } catch (error) {

        console.error(error);

        showApplicationMessage(
            "Ariza yuborishda xatolik:\n" +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   APPLICATION MESSAGE
========================================================= */

function showApplicationMessage(
    text,
    type = "success"
) {

    const element =
        document.getElementById(
            "applicationMessage"
        );

    if (!element) {
        alert(text);
        return;
    }

    element.textContent =
        text;

    element.className =
        type === "error"
            ? "error-message"
            : "success-message";
}


/* =========================================================
   CHECK APPLICATION STATUS
========================================================= */

function startApplicationStatusCheck(id) {

    if (applicationCheckTimer) {

        clearInterval(
            applicationCheckTimer
        );
    }

    checkApplicationStatus(id);

    applicationCheckTimer =
        setInterval(
            () => {

                checkApplicationStatus(
                    id
                );

            },
            8000
        );
}


async function checkApplicationStatus(id) {

    try {

        const {
            data,
            error
        } = await supabase
            .from("applications")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) {

            console.error(
                "STATUS CHECK ERROR:",
                error
            );

            return;
        }

        if (!data) {
            return;
        }

        const statusBox =
            document.getElementById(
                "customerStatusBox"
            );

        if (!statusBox) {
            return;
        }

        if (data.status === "accepted") {

            statusBox.innerHTML = `
                <div class="status-success">
                    ✅ Arizangiz tasdiqlandi.
                </div>
            `;

            if (applicationCheckTimer) {

                clearInterval(
                    applicationCheckTimer
                );

                applicationCheckTimer =
                    null;
            }

        } else if (
            data.status === "rejected"
        ) {

            statusBox.innerHTML = `
                <div class="status-error">
                    ❌ Arizangiz rad etildi.
                </div>
            `;

            if (applicationCheckTimer) {

                clearInterval(
                    applicationCheckTimer
                );

                applicationCheckTimer =
                    null;
            }

        } else {

            statusBox.innerHTML = `
                <div class="status-pending">
                    ⏳ Arizangiz ko‘rib chiqilmoqda...
                </div>
            `;
        }

    } catch (error) {

        console.error(error);
    }
}


/* =========================================================
   GET APPLICATIONS
========================================================= */

async function getApplications() {

    if (currentRole !== "admin") {
        return;
    }

    try {

        const {
            data,
            error
        } = await supabase
            .from("applications")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {

            console.error(
                "GET APPLICATIONS ERROR:",
                error
            );

            return;
        }

        allApplications =
            data || [];

        displayApplications();

    } catch (error) {

        console.error(error);
    }
}


/* =========================================================
   DISPLAY APPLICATIONS
========================================================= */

function displayApplications() {

    const container =
        document.getElementById(
            "applicationsList"
        );

    if (!container) {
        return;
    }

    if (!allApplications.length) {

        container.innerHTML = `
            <div class="empty-state">
                Arizalar mavjud emas.
            </div>
        `;

        return;
    }

    container.innerHTML =
        allApplications.map(
            application => {

                let statusText =
                    "Yangi";

                if (
                    application.status ===
                    "accepted"
                ) {
                    statusText =
                        "Tasdiqlangan";
                }

                if (
                    application.status ===
                    "rejected"
                ) {
                    statusText =
                        "Rad etilgan";
                }

                return `
                    <div class="application-card">

                        <div>

                            <h3>
                                ${escapeHTML(
                                    application.full_name
                                )}
                            </h3>

                            <p>
                                📞 ${escapeHTML(
                                    application.phone
                                )}
                            </p>

                            <small>
                                ${formatDate(
                                    application.created_at
                                )}
                            </small>

                        </div>

                        <div class="application-status">

                            <strong>
                                ${statusText}
                            </strong>

                            <div class="application-buttons">

                                <button
                                    type="button"
                                    onclick="acceptApplication(${application.id})">
                                    ✅ Tasdiqlash
                                </button>

                                <button
                                    type="button"
                                    onclick="rejectApplication(${application.id})">
                                    ❌ Rad etish
                                </button>

                                <button
                                    type="button"
                                    onclick="deleteApplication(${application.id})"
                                    class="btn-delete">
                                    🗑️
                                </button>

                            </div>

                        </div>

                    </div>
                `;
            }
        ).join("");
}


/* =========================================================
   ACCEPT APPLICATION
========================================================= */

async function acceptApplication(id) {

    if (currentRole !== "admin") {
        return;
    }

    await changeApplicationStatus(
        id,
        "accepted"
    );
}


/* =========================================================
   REJECT APPLICATION
========================================================= */

async function rejectApplication(id) {

    if (currentRole !== "admin") {
        return;
    }

    await changeApplicationStatus(
        id,
        "rejected"
    );
}


/* =========================================================
   CHANGE APPLICATION STATUS
========================================================= */

async function changeApplicationStatus(
    id,
    status
) {

    try {

        const updateData = {
            status: status
        };

        if (status === "accepted") {

            updateData.accepted_at =
                new Date().toISOString();
        }

        const {
            error
        } = await supabase
            .from("applications")
            .update(updateData)
            .eq("id", id);

        if (error) {

            console.error(
                "STATUS UPDATE ERROR:",
                error
            );

            alert(
                "❌ Xatolik:\n" +
                error.message
            );

            return;
        }

        await getApplications();

    } catch (error) {

        console.error(error);

        alert(
            "❌ Xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   DELETE APPLICATION
========================================================= */

async function deleteApplication(id) {

    if (currentRole !== "admin") {
        return;
    }

    const confirmDelete =
        confirm(
            "Bu arizani o‘chirmoqchimisiz?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const {
            error
        } = await supabase
            .from("applications")
            .delete()
            .eq("id", id);

        if (error) {

            console.error(
                "DELETE APPLICATION ERROR:",
                error
            );

            alert(
                "❌ Xatolik:\n" +
                error.message
            );

            return;
        }

        await getApplications();

    } catch (error) {

        console.error(error);

        alert(
            "❌ Xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   USERS
========================================================= */

async function getUsers() {

    if (currentRole !== "admin") {
        return;
    }

    try {

        const {
            data,
            error
        } = await supabase
            .from("users")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {

            console.error(
                "GET USERS ERROR:",
                error
            );

            return;
        }

        allUsers =
            data || [];

        displayUsers();

    } catch (error) {

        console.error(error);
    }
}


/* =========================================================
   DISPLAY USERS
========================================================= */

function displayUsers() {

    const container =
        document.getElementById(
            "usersList"
        );

    if (!container) {
        return;
    }

    if (!allUsers.length) {

        container.innerHTML = `
            <div class="empty-state">
                Userlar mavjud emas.
            </div>
        `;

        return;
    }

    container.innerHTML =
        allUsers.map(user => {

            const isCurrent =
                currentUser &&
                currentUser.id === user.id;

            return `
                <div class="user-card">

                    <div class="user-main-info">

                        <h3>
                            ${escapeHTML(
                                user.name || "-"
                            )}
                        </h3>

                        <p>
                            Login:
                            <strong>
                                ${escapeHTML(
                                    user.username
                                )}
                            </strong>
                        </p>

                        <p>
                            Rol:
                            <strong>
                                ${escapeHTML(
                                    user.role
                                )}
                            </strong>
                        </p>

                        <p>
                            Parol:
                            <span id="password-${user.id}">
                                ••••••••
                            </span>

                            <button
                                type="button"
                                onclick="showUserPassword(${user.id})">
                                👁️
                            </button>
                        </p>

                    </div>

                    <div class="user-actions">

                        <button
                            type="button"
                            onclick="changeUsername(${user.id})">
                            ✏️ Login
                        </button>

                        <button
                            type="button"
                            onclick="changePassword(${user.id})">
                            🔑 Parol
                        </button>

                        ${
                            !isCurrent
                                ? `
                                    <button
                                        type="button"
                                        onclick="deleteUser(${user.id})"
                                        class="btn-delete">
                                        🗑️ O‘chirish
                                    </button>
                                `
                                : ""
                        }

                    </div>

                </div>
            `;
        }).join("");
}


/* =========================================================
   SHOW USER PASSWORD
========================================================= */

async function showUserPassword(id) {

    if (currentRole !== "admin") {
        return;
    }

    const element =
        document.getElementById(
            `password-${id}`
        );

    if (!element) {
        return;
    }

    const user =
        allUsers.find(
            item => item.id == id
        );

    if (!user) {
        return;
    }

    if (
        element.dataset.visible === "true"
    ) {

        element.textContent =
            "••••••••";

        element.dataset.visible =
            "false";

        return;
    }

    element.textContent =
        user.password || "";

    element.dataset.visible =
        "true";
}


/* =========================================================
   CREATE USER
========================================================= */

async function createUser(event) {

    if (event) {
        event.preventDefault();
    }

    if (currentRole !== "admin") {
        return;
    }

    const name =
        getValue("newUserName").trim();

    const username =
        getValue("newUsername").trim();

    const password =
        getValue("newUserPassword").trim();

    const role =
        getValue("newUserRole") ||
        "user";

    if (!name) {

        alert("User ismini kiriting.");

        return;
    }

    if (!username) {

        alert("Login kiriting.");

        return;
    }

    if (!password) {

        alert("Parol kiriting.");

        return;
    }

    try {

        const {
            data,
            error
        } = await supabase
            .from("users")
            .insert([
                {
                    name: name,
                    username: username,
                    password: password,
                    role: role
                }
            ])
            .select()
            .single();

        if (error) {

            console.error(
                "CREATE USER ERROR:",
                error
            );

            if (
                error.code === "23505"
            ) {

                alert(
                    "❌ Bu login allaqachon mavjud."
                );

            } else {

                alert(
                    "❌ User yaratishda xatolik:\n" +
                    error.message
                );
            }

            return;
        }

        alert(
            "✅ Yangi user yaratildi."
        );

        const form =
            document.getElementById("userForm");

        if (form) {
            form.reset();
        }

        await getUsers();

    } catch (error) {

        console.error(error);

        alert(
            "❌ Xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   CHANGE PASSWORD
========================================================= */

async function changePassword(id) {

    if (currentRole !== "admin") {
        return;
    }

    const user =
        allUsers.find(
            item => item.id == id
        );

    if (!user) {
        return;
    }

    const newPassword =
        prompt(
            `Yangi parolni kiriting:\n${user.username}`
        );

    if (newPassword === null) {
        return;
    }

    const password =
        newPassword.trim();

    if (!password) {

        alert(
            "Parol bo‘sh bo‘lishi mumkin emas."
        );

        return;
    }

    try {

        const {
            error
        } = await supabase
            .from("users")
            .update({
                password: password
            })
            .eq("id", id);

        if (error) {

            console.error(
                "CHANGE PASSWORD ERROR:",
                error
            );

            alert(
                "❌ Parol o‘zgartirilmadi:\n" +
                error.message
            );

            return;
        }

        alert(
            "✅ Parol yangilandi."
        );

        await getUsers();

    } catch (error) {

        console.error(error);

        alert(
            "❌ Xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   CHANGE USERNAME
========================================================= */

async function changeUsername(id) {

    if (currentRole !== "admin") {
        return;
    }

    const user =
        allUsers.find(
            item => item.id == id
        );

    if (!user) {
        return;
    }

    const newUsername =
        prompt(
            `Yangi loginni kiriting:\n${user.username}`
        );

    if (newUsername === null) {
        return;
    }

    const username =
        newUsername.trim();

    if (!username) {

        alert(
            "Login bo‘sh bo‘lishi mumkin emas."
        );

        return;
    }

    try {

        const {
            error
        } = await supabase
            .from("users")
            .update({
                username: username
            })
            .eq("id", id);

        if (error) {

            console.error(
                "CHANGE USERNAME ERROR:",
                error
            );

            if (
                error.code === "23505"
            ) {

                alert(
                    "❌ Bu login allaqachon mavjud."
                );

            } else {

                alert(
                    "❌ Login o‘zgartirilmadi:\n" +
                    error.message
                );
            }

            return;
        }

        alert(
            "✅ Login yangilandi."
        );

        await getUsers();

    } catch (error) {

        console.error(error);

        alert(
            "❌ Xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   DELETE USER
========================================================= */

async function deleteUser(id) {

    if (currentRole !== "admin") {
        return;
    }

    if (
        currentUser &&
        currentUser.id == id
    ) {

        alert(
            "O‘zingizni o‘chira olmaysiz."
        );

        return;
    }

    const user =
        allUsers.find(
            item => item.id == id
        );

    if (!user) {
        return;
    }

    const confirmDelete =
        confirm(
            `"${user.username}" userini o‘chirmoqchimisiz?`
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const {
            error
        } = await supabase
            .from("users")
            .delete()
            .eq("id", id);

        if (error) {

            console.error(
                "DELETE USER ERROR:",
                error
            );

            alert(
                "❌ User o‘chirilmadi:\n" +
                error.message
            );

            return;
        }

        alert(
            "✅ User o‘chirildi."
        );

        await getUsers();

    } catch (error) {

        console.error(error);

        alert(
            "❌ Xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   HELPERS
========================================================= */

function setText(id, text) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            text;
    }
}


function formatMoney(value) {

    const number =
        Number(value || 0);

    return new Intl.NumberFormat(
        "uz-UZ"
    ).format(number);
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHTML(value);
}


/* =========================================================
   RESTORE LOGIN
========================================================= */

function restoreSavedUser() {

    const saved =
        localStorage.getItem(
            "goldshow_user"
        );

    if (!saved) {
        return;
    }

    try {

        const user =
            JSON.parse(saved);

        if (!user || !user.id) {
            return;
        }

        currentUser =
            user;

        currentRole =
            user.role;

    } catch (error) {

        localStorage.removeItem(
            "goldshow_user"
        );
    }
}


/* =========================================================
   DOM CONTENT LOADED
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        updateDate();

        restoreSavedUser();

        /* -----------------------------------------
           LOGIN FORM
        ----------------------------------------- */

        const loginForm =
            document.getElementById("loginForm");

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                loginUser
            );
        }


        /* -----------------------------------------
           ORDER FORM
        ----------------------------------------- */

        const orderForm =
            document.getElementById("orderForm");

        if (orderForm) {

            orderForm.addEventListener(
                "submit",
                saveOrderFromForm
            );
        }


        /* -----------------------------------------
           EVENT FORM
        ----------------------------------------- */

        const eventForm =
            document.getElementById("eventForm");

        if (eventForm) {

            eventForm.addEventListener(
                "submit",
                saveEventFromForm
            );
        }


        /* -----------------------------------------
           USER FORM
        ----------------------------------------- */

        const userForm =
            document.getElementById("userForm");

        if (userForm) {

            userForm.addEventListener(
                "submit",
                createUser
            );
        }


        /* -----------------------------------------
           APPLICATION FORM
        ----------------------------------------- */

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


        /* -----------------------------------------
           SEARCH
        ----------------------------------------- */

        const searchInput =
            document.getElementById(
                "searchInput"
            );

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                searchOrders
            );
        }


        /* -----------------------------------------
           MONEY
        ----------------------------------------- */

        const totalPrice =
            document.getElementById(
                "totalPrice"
            );

        const paid =
            document.getElementById(
                "paid"
            );

        if (totalPrice) {

            totalPrice.addEventListener(
                "input",
                calculateRemaining
            );
        }

        if (paid) {

            paid.addEventListener(
                "input",
                calculateRemaining
            );
        }


        /* -----------------------------------------
           EVENT IMAGE
        ----------------------------------------- */

        const eventImage =
            document.getElementById(
                "eventImage"
            );

        if (eventImage) {

            eventImage.addEventListener(
                "change",
                handleEventImage
            );
        }


        /* -----------------------------------------
           CANCEL EDIT
        ----------------------------------------- */

        const cancelEditButton =
            document.getElementById(
                "cancelEditBtn"
            );

        if (cancelEditButton) {

            cancelEditButton.addEventListener(
                "click",
                function () {

                    resetOrderForm();

                    showPageSection(
                        "orderFormSection"
                    );
                }
            );
        }


        /* -----------------------------------------
           CLOSE MODAL BY CLICKING OUTSIDE
        ----------------------------------------- */

        const modal =
            document.getElementById(
                "orderModal"
            );

        if (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeOrderModal();
                    }
                }
            );
        }


        /* -----------------------------------------
           INIT EVENTS
        ----------------------------------------- */

        await getEvents();

        /* -----------------------------------------
           AUTO LOGIN
        ----------------------------------------- */

        if (
            currentUser &&
            currentUser.role
        ) {

            if (
                currentUser.role ===
                "admin"
            ) {

                await openAdminPage();

            } else {

                await openWorkerPage();
            }
        }
    }
);


/* =========================================================
   WINDOW FUNCTIONS
========================================================= */

window.openCustomerPage =
    openCustomerPage;

window.openLoginPage =
    openLoginPage;

window.backToLanding =
    backToLanding;

window.loginUser =
    loginUser;

window.logout =
    logout;

window.openDashboard =
    openDashboard;

window.openOrdersPage =
    openOrdersPage;

window.openOrderFormPage =
    openOrderFormPage;

window.openApplicationsPage =
    openApplicationsPage;

window.openUsersPage =
    openUsersPage;

window.openEventsPage =
    openEventsPage;

window.openOrderModal =
    openOrderModal;

window.closeOrderModal =
    closeOrderModal;

window.editOrder =
    editOrder;

window.deleteOrder =
    deleteOrder;

window.deleteEvent =
    deleteEvent;

window.acceptApplication =
    acceptApplication;

window.rejectApplication =
    rejectApplication;

window.deleteApplication =
    deleteApplication;

window.showUserPassword =
    showUserPassword;

window.changePassword =
    changePassword;

window.changeUsername =
    changeUsername;

window.deleteUser =
    deleteUser;

window.goToEventPage =
    goToEventPage;

window.calculateRemaining =
    calculateRemaining;

window.createUser =
    createUser;
