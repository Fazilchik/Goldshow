/* =========================================================
   GOLD SHOW - SCRIPT.JS
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://mvrrftlhjlbrsiexnwjq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_MFI3LFGRmSviFv6ygJnXyg_wFktEpyP";

let supabaseClient = null;

if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
) {
    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );
} else {
    console.error(
        "❌ Supabase kutubxonasi yuklanmadi."
    );
}


/* =========================================================
   GLOBAL
========================================================= */

let currentUser = null;
let currentRole = null;

let allOrders = [];
let allEvents = [];
let allApplications = [];
let allUsers = [];

let currentEventPage = 1;

const EVENTS_PER_PAGE = 6;

let applicationTimer = null;


/* =========================================================
   MONTHS
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
   SUPABASE CHECK
========================================================= */

function checkSupabase() {

    if (!supabaseClient) {

        alert(
            "❌ Supabase ulanmagan.\n" +
            "Internet aloqasi yoki Supabase CDNni tekshiring."
        );

        return false;
    }

    return true;
}


/* =========================================================
   DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (isNaN(date.getTime())) {
        return String(value);
    }

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const month =
        UZ_MONTHS[
            date.getMonth()
        ];

    const year =
        date.getFullYear();

    return `${day}-${month} ${year}-yil`;
}


function formatShortDate(value) {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (isNaN(date.getTime())) {
        return String(value);
    }

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const year =
        date.getFullYear();

    return `${day}.${month}.${year}`;
}


function updateDate() {

    const element =
        document.getElementById(
            "todayDate"
        );

    if (!element) {
        return;
    }

    const date =
        new Date();

    const day =
        date.getDate();

    const month =
        UZ_MONTHS[
            date.getMonth()
        ];

    const year =
        date.getFullYear();

    element.textContent =
        `${day}-${month} ${year}-yil`;
}


/* =========================================================
   HELPERS
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value
        : "";
}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.value =
        value === null ||
        value === undefined
            ? ""
            : value;
}


function getNumber(id) {

    const value =
        parseFloat(
            getValue(id)
        );

    return isNaN(value)
        ? 0
        : value;
}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value;
    }
}


function formatMoney(value) {

    return new Intl.NumberFormat(
        "uz-UZ"
    ).format(
        Number(value || 0)
    );
}


function escapeHTML(value) {

    return String(value ?? "")
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


function escapeAttribute(value) {

    return escapeHTML(value);
}


/* =========================================================
   LANDING PAGE
========================================================= */

function openCustomerPage() {

    const landing =
        document.getElementById(
            "landingPage"
        );

    const login =
        document.getElementById(
            "loginPage"
        );

    const customer =
        document.getElementById(
            "customerPage"
        );

    const main =
        document.getElementById(
            "mainPage"
        );

    if (landing) {
        landing.classList.add(
            "hidden"
        );
    }

    if (login) {
        login.classList.add(
            "hidden"
        );
    }

    if (main) {
        main.classList.add(
            "hidden"
        );
    }

    if (customer) {
        customer.classList.remove(
            "hidden"
        );
    }

    /*
       AVVALGI XATO:
       loadCustomerEvents() mavjud emas edi.
       Endi to'g'ridan-to'g'ri getEvents() ishlaydi.
    */

    getEvents();
}


/* =========================================================
   CUSTOMER EVENTS LOAD
========================================================= */

function loadCustomerEvents() {

    getEvents();
}


/* =========================================================
   WORKER LOGIN
========================================================= */

function openWorkerLogin() {

    const landing =
        document.getElementById(
            "landingPage"
        );

    const login =
        document.getElementById(
            "loginPage"
        );

    const customer =
        document.getElementById(
            "customerPage"
        );

    const main =
        document.getElementById(
            "mainPage"
        );

    if (landing) {
        landing.classList.add(
            "hidden"
        );
    }

    if (customer) {
        customer.classList.add(
            "hidden"
        );
    }

    if (main) {
        main.classList.add(
            "hidden"
        );
    }

    if (login) {
        login.classList.remove(
            "hidden"
        );
    }

    const username =
        document.getElementById(
            "username"
        );

    const password =
        document.getElementById(
            "password"
        );

    const error =
        document.getElementById(
            "loginError"
        );

    if (username) {
        username.value = "";
    }

    if (password) {
        password.value = "";
    }

    if (error) {
        error.textContent = "";
    }

    if (username) {
        setTimeout(
            () => username.focus(),
            50
        );
    }
}


/* =========================================================
   BACK TO LANDING
========================================================= */

function backToLanding() {

    const landing =
        document.getElementById(
            "landingPage"
        );

    const login =
        document.getElementById(
            "loginPage"
        );

    const customer =
        document.getElementById(
            "customerPage"
        );

    const main =
        document.getElementById(
            "mainPage"
        );

    const modal =
        document.getElementById(
            "orderModal"
        );

    if (login) {
        login.classList.add(
            "hidden"
        );
    }

    if (customer) {
        customer.classList.add(
            "hidden"
        );
    }

    if (main) {
        main.classList.add(
            "hidden"
        );
    }

    if (modal) {
        modal.classList.add(
            "hidden"
        );
    }

    if (landing) {
        landing.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   LOGIN
========================================================= */

async function login(event) {

    if (event) {
        event.preventDefault();
    }

    const username =
        getValue(
            "username"
        ).trim();

    const password =
        getValue(
            "password"
        ).trim();

    const errorElement =
        document.getElementById(
            "loginError"
        );

    if (errorElement) {
        errorElement.textContent =
            "";
    }

    if (!username || !password) {

        if (errorElement) {
            errorElement.textContent =
                "Login va parolni kiriting.";
        }

        return;
    }

    if (!checkSupabase()) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("users")
                .select("*")
                .eq(
                    "username",
                    username
                )
                .eq(
                    "password",
                    password
                )
                .maybeSingle();

        if (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            if (errorElement) {
                errorElement.textContent =
                    "Kirishda xatolik: " +
                    error.message;
            }

            return;
        }

        if (!data) {

            if (errorElement) {
                errorElement.textContent =
                    "Login yoki parol noto‘g‘ri.";
            }

            return;
        }

        currentUser =
            data;

        currentRole =
            data.role;

        localStorage.setItem(
            "goldshow_user",
            JSON.stringify(data)
        );

        await openMainPage(
            data.role
        );

    } catch (error) {

        console.error(
            "LOGIN EXCEPTION:",
            error
        );

        if (errorElement) {
            errorElement.textContent =
                "Kutilmagan xatolik: " +
                error.message;
        }
    }
}


/* =========================================================
   MAIN PAGE
========================================================= */

async function openMainPage(role) {

    currentRole =
        role;

    const landing =
        document.getElementById(
            "landingPage"
        );

    const login =
        document.getElementById(
            "loginPage"
        );

    const customer =
        document.getElementById(
            "customerPage"
        );

    const main =
        document.getElementById(
            "mainPage"
        );

    if (landing) {
        landing.classList.add(
            "hidden"
        );
    }

    if (login) {
        login.classList.add(
            "hidden"
        );
    }

    if (customer) {
        customer.classList.add(
            "hidden"
        );
    }

    if (main) {
        main.classList.remove(
            "hidden"
        );
    }

    updateUserInfo();

    setupRoleMenus();

    updateDate();

    if (checkSupabase()) {

        await getEvents();

        await getOrders();

        if (role === "admin") {

            await getApplications();

            await getUsers();
        }
    }

    showPage(
        "dashboardPage"
    );
}


/* =========================================================
   USER INFO
========================================================= */

function updateUserInfo() {

    if (!currentUser) {
        return;
    }

    const nameElement =
        document.getElementById(
            "currentUser"
        );

    const roleElement =
        document.getElementById(
            "userRole"
        );

    const avatarElement =
        document.getElementById(
            "userAvatar"
        );

    if (nameElement) {

        nameElement.textContent =
            currentUser.name ||
            currentUser.username ||
            "User";
    }

    if (roleElement) {

        roleElement.textContent =
            currentUser.role === "admin"
                ? "Admin"
                : "Ishchi";
    }

    if (avatarElement) {

        const name =
            currentUser.name ||
            currentUser.username ||
            "G";

        avatarElement.textContent =
            name
                .charAt(0)
                .toUpperCase();
    }
}


/* =========================================================
   ROLE MENUS
========================================================= */

function setupRoleMenus() {

    const addOrderMenu =
        document.getElementById(
            "addOrderMenu"
        );

    const applicationsMenu =
        document.getElementById(
            "applicationsMenu"
        );

    const usersMenu =
        document.getElementById(
            "usersMenu"
        );

    const eventAdminForm =
        document.getElementById(
            "workerEventAdminForm"
        );

    const isAdmin =
        currentRole === "admin";

    if (addOrderMenu) {

        addOrderMenu.classList.toggle(
            "hidden",
            !isAdmin
        );
    }

    if (applicationsMenu) {

        applicationsMenu.classList.toggle(
            "hidden",
            !isAdmin
        );
    }

    if (usersMenu) {

        usersMenu.classList.toggle(
            "hidden",
            !isAdmin
        );
    }

    if (eventAdminForm) {

        eventAdminForm.classList.toggle(
            "hidden",
            !isAdmin
        );
    }
}


/* =========================================================
   SHOW PAGE
========================================================= */

function showPage(
    pageId,
    button = null
) {

    const pages =
        document.querySelectorAll(
            "#mainPage .page"
        );

    pages.forEach(
        page => {

            page.classList.add(
                "hidden"
            );

            page.classList.remove(
                "active"
            );
        }
    );

    const target =
        document.getElementById(
            pageId
        );

    if (!target) {
        return;
    }

    target.classList.remove(
        "hidden"
    );

    target.classList.add(
        "active"
    );

    const buttons =
        document.querySelectorAll(
            ".menu-btn"
        );

    buttons.forEach(
        btn => {

            btn.classList.remove(
                "active"
            );
        }
    );

    if (button) {

        button.classList.add(
            "active"
        );

    } else {

        const defaultButton =
            document.querySelector(
                `.menu-btn[onclick*="${pageId}"]`
            );

        if (defaultButton) {

            defaultButton.classList.add(
                "active"
            );
        }
    }

    updatePageTitle(
        pageId
    );

    if (pageId === "dashboardPage") {

        updateDashboard();
    }

    if (pageId === "ordersPage") {

        displayOrders();
    }

    if (pageId === "workerEventsPage") {

        getEvents();
    }

    if (pageId === "applicationsPage") {

        getApplications();
    }

    if (pageId === "usersPage") {

        getUsers();
    }
}


function updatePageTitle(
    pageId
) {

    const title =
        document.getElementById(
            "pageTitle"
        );

    if (!title) {
        return;
    }

    const titles = {

        dashboardPage:
            "Bosh sahifa",

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

    title.textContent =
        titles[pageId] ||
        "Gold Show";
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    currentUser =
        null;

    currentRole =
        null;

    localStorage.removeItem(
        "goldshow_user"
    );

    if (applicationTimer) {

        clearInterval(
            applicationTimer
        );

        applicationTimer =
            null;
    }

    backToLanding();
}


/* =========================================================
   DASHBOARD
========================================================= */

async function updateDashboard() {

    if (!checkSupabase()) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
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

        const today =
            new Date();

        const todayString =
            today.getFullYear() +
            "-" +
            String(
                today.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                today.getDate()
            ).padStart(2, "0");

        const todayOrders =
            orders.filter(
                order =>
                    order.event_date ===
                    todayString
            );

        const upcomingOrders =
            orders.filter(
                order =>
                    order.event_date >
                    todayString
            );

        const totalMoney =
            orders.reduce(
                (
                    total,
                    order
                ) => {

                    return (
                        total +
                        Number(
                            order.total_price ||
                            0
                        )
                    );
                },
                0
            );

        setText(
            "totalOrders",
            orders.length
        );

        setText(
            "todayOrders",
            todayOrders.length
        );

        setText(
            "upcomingOrders",
            upcomingOrders.length
        );

        setText(
            "totalMoney",
            formatMoney(
                totalMoney
            ) +
            " so‘m"
        );

        displayTodayOrders(
            todayOrders
        );

        updateNotifications(
            todayOrders,
            upcomingOrders
        );

    } catch (error) {

        console.error(
            "DASHBOARD EXCEPTION:",
            error
        );
    }
}


/* =========================================================
   TODAY ORDERS
========================================================= */

function displayTodayOrders(
    orders
) {

    const container =
        document.getElementById(
            "todayOrdersList"
        );

    if (!container) {
        return;
    }

    if (!orders.length) {

        container.innerHTML = `
            <div class="empty-state">
                Bugun zakas yo‘q.
            </div>
        `;

        return;
    }

    container.innerHTML =
        orders
            .map(
                order => {

                    return `
                        <div class="order-card">

                            <div class="order-card-header">

                                <div>

                                    <h3>
                                        ${escapeHTML(
                                            order.client_name ||
                                            "-"
                                        )}
                                    </h3>

                                    <p>
                                        📞
                                        ${escapeHTML(
                                            order.client_phone ||
                                            "-"
                                        )}
                                    </p>

                                </div>

                                <div>
                                    ${escapeHTML(
                                        String(
                                            order.event_time ||
                                            ""
                                        ).slice(0, 5)
                                    )}
                                </div>

                            </div>

                            <div class="order-info-grid">

                                <div>
                                    📍
                                    ${escapeHTML(
                                        order.location ||
                                        "-"
                                    )}
                                </div>

                                <div>
                                    💰
                                    ${formatMoney(
                                        order.total_price
                                    )} so‘m
                                </div>

                                <div>
                                    💳
                                    Qolgan:
                                    ${formatMoney(
                                        order.remaining
                                    )} so‘m
                                </div>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function updateNotifications(
    todayOrders,
    upcomingOrders
) {

    const element =
        document.getElementById(
            "notifications"
        );

    if (!element) {
        return;
    }

    let text =
        "";

    if (
        todayOrders.length >
        0
    ) {

        text +=
            `🔔 Bugun ${todayOrders.length} ta zakas bor. `;
    }

    if (
        upcomingOrders.length >
        0
    ) {

        text +=
            `📅 Kelgusi ${upcomingOrders.length} ta tadbir bor.`;
    }

    if (!text) {

        text =
            "✅ Hozircha yangi xabar yo‘q.";
    }

    element.textContent =
        text;
}


/* =========================================================
   ORDERS
========================================================= */

async function getOrders() {

    if (!checkSupabase()) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("orders")
                .select("*")
                .order(
                    "event_date",
                    {
                        ascending: true
                    }
                )
                .order(
                    "event_time",
                    {
                        ascending: true
                    }
                );

        if (error) {

            console.error(
                "ORDERS ERROR:",
                error
            );

            return;
        }

        allOrders =
            data || [];

        displayOrders();

    } catch (error) {

        console.error(
            "ORDERS EXCEPTION:",
            error
        );
    }
}


function displayOrders() {

    const container =
        document.getElementById(
            "ordersList"
        );

    if (!container) {
        return;
    }

    const search =
        getValue(
            "searchInput"
        )
            .trim()
            .toLowerCase();

    let orders =
        [...allOrders];

    if (search) {

        orders =
            orders.filter(
                order => (

                    String(
                        order.client_name ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        order.client_phone ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        order.location ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search)
                )
            );
    }

    if (!orders.length) {

        container.innerHTML = `
            <div class="empty-state">
                Zakaslar topilmadi.
            </div>
        `;

        return;
    }

    container.innerHTML =
        orders
            .map(
                order =>
                    createOrderHTML(
                        order
                    )
            )
            .join("");
}


function createOrderHTML(
    order
) {

    return `
        <div class="order-card">

            <div class="order-card-header">

                <div>

                    <h3>
                        ${escapeHTML(
                            order.client_name ||
                            "-"
                        )}
                    </h3>

                    <p>
                        📞
                        ${escapeHTML(
                            order.client_phone ||
                            "-"
                        )}
                    </p>

                </div>

                <div>
                    ${formatDate(
                        order.event_date
                    )}
                </div>

            </div>


            <div class="order-info-grid">

                <div>
                    📍
                    ${escapeHTML(
                        order.location ||
                        "-"
                    )}
                </div>

                <div>
                    🕒
                    ${escapeHTML(
                        String(
                            order.event_time ||
                            ""
                        ).slice(0, 5)
                    )}
                </div>

                <div>
                    💰
                    Jami:
                    ${formatMoney(
                        order.total_price
                    )} so‘m
                </div>

                <div>
                    💵
                    To‘langan:
                    ${formatMoney(
                        order.paid
                    )} so‘m
                </div>

                <div>
                    💳
                    Qolgan:
                    ${formatMoney(
                        order.remaining
                    )} so‘m
                </div>

            </div>


            <div class="order-buttons">

                <button
                    type="button"
                    onclick="editOrder(${order.id})"
                >
                    ✏️ Tahrirlash
                </button>

                <button
                    type="button"
                    class="btn-delete"
                    onclick="deleteOrder(${order.id})"
                >
                    🗑️ O‘chirish
                </button>

            </div>

        </div>
    `;
}


/* =========================================================
   ORDER FORM
========================================================= */

function getOrderFromForm() {

    const total =
        getNumber(
            "totalPrice"
        );

    const paid =
        getNumber(
            "paid"
        );

    return {

        client_name:
            getValue(
                "clientName"
            ).trim(),

        client_phone:
            getValue(
                "clientPhone"
            ).trim(),

        location:
            getValue(
                "location"
            ).trim(),

        event_date:
            getValue(
                "eventDate"
            ),

        event_time:
            getValue(
                "eventTime"
            ),

        screen_height:
            getNumber(
                "screenHeight"
            ),

        screen_width:
            getNumber(
                "screenWidth"
            ),

        stage_width:
            getNumber(
                "stageWidth"
            ),

        stage_length:
            getNumber(
                "stageLength"
            ),

        curtain:
            getValue(
                "curtain"
            ) ||
            "Yo‘q",

        lights:
            Math.floor(
                getNumber(
                    "lights"
                )
            ),

        galava:
            Math.floor(
                getNumber(
                    "galava"
                )
            ),

        ledwash:
            Math.floor(
                getNumber(
                    "ledwash"
                )
            ),

        confetti:
            Math.floor(
                getNumber(
                    "confetti"
                )
            ),

        dim:
            Math.floor(
                getNumber(
                    "dim"
                )
            ),

        firework:
            Math.floor(
                getNumber(
                    "firework"
                )
            ),

        side_screens:
            Math.floor(
                getNumber(
                    "sideScreens"
                )
            ),

        side_height:
            getNumber(
                "sideHeight"
            ),

        side_width:
            getNumber(
                "sideWidth"
            ),

        total_price:
            total,

        paid:
            paid,

        remaining:
            Math.max(
                0,
                total - paid
            )
    };
}


/* =========================================================
   SAVE ORDER
========================================================= */

async function saveOrder(event) {

    if (event) {
        event.preventDefault();
    }

    if (
        currentRole !==
        "admin"
    ) {

        alert(
            "Faqat admin zakas qo‘sha oladi."
        );

        return;
    }

    if (!checkSupabase()) {
        return;
    }

    const order =
        getOrderFromForm();

    if (!order.client_name) {

        alert(
            "Mijoz ismini kiriting."
        );

        return;
    }

    if (!order.client_phone) {

        alert(
            "Telefon raqamini kiriting."
        );

        return;
    }

    if (!order.location) {

        alert(
            "Manzilni kiriting."
        );

        return;
    }

    if (!order.event_date) {

        alert(
            "Tadbir sanasini tanlang."
        );

        return;
    }

    if (!order.event_time) {

        alert(
            "Tadbir vaqtini tanlang."
        );

        return;
    }

    const editingId =
        getValue(
            "editingOrderId"
        );

    const button =
        document.getElementById(
            "orderSubmitBtn"
        );

    try {

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Saqlanmoqda...";
        }

        let result;

        if (editingId) {

            result =
                await supabaseClient
                    .from("orders")
                    .update(order)
                    .eq(
                        "id",
                        editingId
                    );

        } else {

            result =
                await supabaseClient
                    .from("orders")
                    .insert([
                        order
                    ]);
        }

        if (result.error) {

            console.error(
                "SAVE ORDER ERROR:",
                result.error
            );

            alert(
                "❌ Zakas saqlanmadi:\n" +
                result.error.message
            );

            return;
        }

        alert(
            editingId
                ? "✅ Zakas yangilandi."
                : "✅ Zakas qo‘shildi."
        );

        resetOrderForm();

        await getOrders();

        await updateDashboard();

        showPage(
            "ordersPage"
        );

    } catch (error) {

        console.error(
            "SAVE ORDER EXCEPTION:",
            error
        );

        alert(
            "❌ Zakas qo‘shishda xatolik:\n" +
            error.message
        );

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "💾 Zakasni saqlash";
        }
    }
}


/* =========================================================
   REMAINING
========================================================= */

function calculateRemaining() {

    const total =
        getNumber(
            "totalPrice"
        );

    const paid =
        getNumber(
            "paid"
        );

    const remaining =
        Math.max(
            0,
            total - paid
        );

    const element =
        document.getElementById(
            "remaining"
        );

    if (element) {

        element.textContent =
            formatMoney(
                remaining
            ) +
            " so‘m";
    }
}


/* =========================================================
   EDIT ORDER
========================================================= */

function editOrder(id) {

    const order =
        allOrders.find(
            item =>
                item.id == id
        );

    if (!order) {
        return;
    }

    showPage(
        "addOrderPage"
    );

    setValue(
        "editingOrderId",
        order.id
    );

    setValue(
        "clientName",
        order.client_name
    );

    setValue(
        "clientPhone",
        order.client_phone
    );

    setValue(
        "location",
        order.location
    );

    setValue(
        "eventDate",
        order.event_date
    );

    setValue(
        "eventTime",
        String(
            order.event_time ||
            ""
        ).slice(
            0,
            5
        )
    );

    setValue(
        "screenHeight",
        order.screen_height
    );

    setValue(
        "screenWidth",
        order.screen_width
    );

    setValue(
        "stageWidth",
        order.stage_width
    );

    setValue(
        "stageLength",
        order.stage_length
    );

    setValue(
        "curtain",
        order.curtain
    );

    setValue(
        "sideScreens",
        order.side_screens
    );

    setValue(
        "sideHeight",
        order.side_height
    );

    setValue(
        "sideWidth",
        order.side_width
    );

    setValue(
        "lights",
        order.lights
    );

    setValue(
        "galava",
        order.galava
    );

    setValue(
        "ledwash",
        order.ledwash
    );

    setValue(
        "confetti",
        order.confetti
    );

    setValue(
        "dim",
        order.dim
    );

    setValue(
        "firework",
        order.firework
    );

    setValue(
        "totalPrice",
        order.total_price
    );

    setValue(
        "paid",
        order.paid
    );

    calculateRemaining();

    const badge =
        document.getElementById(
            "editBadge"
        );

    if (badge) {
        badge.classList.remove(
            "hidden"
        );
    }

    const title =
        document.getElementById(
            "orderFormTitle"
        );

    if (title) {
        title.textContent =
            "✏️ Zakasni tahrirlash";
    }

    const button =
        document.getElementById(
            "orderSubmitBtn"
        );

    if (button) {
        button.textContent =
            "💾 Zakasni yangilash";
    }

    const cancel =
        document.getElementById(
            "cancelEditBtn"
        );

    if (cancel) {
        cancel.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   CANCEL EDIT
========================================================= */

function cancelEditOrder() {

    resetOrderForm();

    showPage(
        "ordersPage"
    );
}


/* =========================================================
   RESET ORDER
========================================================= */

function resetOrderForm() {

    const form =
        document.getElementById(
            "orderForm"
        );

    if (form) {
        form.reset();
    }

    setValue(
        "editingOrderId",
        ""
    );

    setValue(
        "screenHeight",
        "0"
    );

    setValue(
        "screenWidth",
        "0"
    );

    setValue(
        "stageWidth",
        "0"
    );

    setValue(
        "stageLength",
        "0"
    );

    setValue(
        "sideScreens",
        "0"
    );

    setValue(
        "sideHeight",
        "0"
    );

    setValue(
        "sideWidth",
        "0"
    );

    setValue(
        "lights",
        "0"
    );

    setValue(
        "galava",
        "0"
    );

    setValue(
        "ledwash",
        "0"
    );

    setValue(
        "confetti",
        "0"
    );

    setValue(
        "dim",
        "0"
    );

    setValue(
        "firework",
        "0"
    );

    setValue(
        "totalPrice",
        "0"
    );

    setValue(
        "paid",
        "0"
    );

    calculateRemaining();

    const badge =
        document.getElementById(
            "editBadge"
        );

    if (badge) {
        badge.classList.add(
            "hidden"
        );
    }

    const cancel =
        document.getElementById(
            "cancelEditBtn"
        );

    if (cancel) {
        cancel.classList.add(
            "hidden"
        );
    }

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
}


/* =========================================================
   DELETE ORDER
========================================================= */

async function deleteOrder(id) {

    if (
        currentRole !==
        "admin"
    ) {
        return;
    }

    if (!checkSupabase()) {
        return;
    }

    if (
        !confirm(
            "Bu zakasni o‘chirmoqchimisiz?"
        )
    ) {
        return;
    }

    try {

        const {
            error
        } =
            await supabaseClient
                .from("orders")
                .delete()
                .eq(
                    "id",
                    id
                );

        if (error) {

            alert(
                "❌ O‘chirishda xatolik:\n" +
                error.message
            );

            return;
        }

        alert(
            "✅ Zakas o‘chirildi."
        );

        await getOrders();

        await updateDashboard();

    } catch (error) {

        console.error(
            "DELETE ORDER ERROR:",
            error
        );

        alert(
            "❌ Xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   EVENTS
========================================================= */

async function getEvents() {

    if (!checkSupabase()) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("events")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {

            console.error(
                "EVENTS ERROR:",
                error
            );

            return;
        }

        allEvents =
            data || [];

        displayWorkerEvents();

        displayCustomerEvents();

    } catch (error) {

        console.error(
            "EVENTS EXCEPTION:",
            error
        );
    }
}


/* =========================================================
   IMAGE
========================================================= */

function getImageData(file) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();

            reader.onload =
                () => resolve(
                    reader.result
                );

            reader.onerror =
                () => reject(
                    reader.error
                );

            reader.readAsDataURL(
                file
            );
        }
    );
}


/* =========================================================
   SAVE EVENT
========================================================= */

async function saveEvent(event) {

    if (event) {
        event.preventDefault();
    }

    if (
        currentRole !==
        "admin"
    ) {

        alert(
            "Faqat admin tadbir qo‘sha oladi."
        );

        return;
    }

    if (!checkSupabase()) {
        return;
    }

    const title =
        getValue(
            "eventTitle"
        ).trim();

    const description =
        getValue(
            "eventDescription"
        ).trim();

    const imageInput =
        document.getElementById(
            "eventImage"
        );

    if (!title) {

        alert(
            "Tadbir nomini kiriting."
        );

        return;
    }

    let imageURL =
        "";

    if (
        imageInput &&
        imageInput.files &&
        imageInput.files.length
    ) {

        const file =
            imageInput.files[0];

        if (
            file.size >
            2 * 1024 * 1024
        ) {

            alert(
                "Rasm hajmi 2 MB dan oshmasin."
            );

            return;
        }

        imageURL =
            await getImageData(
                file
            );
    }

    try {

        const {
            error
        } =
            await supabaseClient
                .from("events")
                .insert([
                    {
                        title:
                            title,

                        description:
                            description,

                        image_url:
                            imageURL
                    }
                ]);

        if (error) {

            console.error(
                "EVENT INSERT ERROR:",
                error
            );

            alert(
                "❌ Tadbir qo‘shilmadi:\n" +
                error.message
            );

            return;
        }

        alert(
            "✅ Tadbir qo‘shildi."
        );

        const form =
            document.getElementById(
                "eventForm"
            );

        if (form) {
            form.reset();
        }

        await getEvents();

    } catch (error) {

        console.error(
            "EVENT INSERT EXCEPTION:",
            error
        );

        alert(
            "❌ Xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   DISPLAY WORKER EVENTS
========================================================= */

function displayWorkerEvents() {

    const container =
        document.getElementById(
            "workerEventsList"
        );

    if (!container) {
        return;
    }

    const start =
        (
            currentEventPage - 1
        ) *
        EVENTS_PER_PAGE;

    const end =
        start +
        EVENTS_PER_PAGE;

    const events =
        allEvents.slice(
            start,
            end
        );

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
        events
            .map(
                event => {

                    const image =
                        event.image_url
                            ? `
                                <img
                                    src="${escapeAttribute(
                                        event.image_url
                                    )}"
                                    alt="${escapeAttribute(
                                        event.title
                                    )}"
                                >
                            `
                            : "";

                    const deleteButton =
                        currentRole ===
                        "admin"
                            ? `
                                <button
                                    type="button"
                                    class="btn-delete"
                                    onclick="deleteEvent(${event.id})"
                                >
                                    🗑️ O‘chirish
                                </button>
                            `
                            : "";

                    return `
                        <div class="event-card">

                            ${image}

                            <div class="event-content">

                                <h3>
                                    ${escapeHTML(
                                        event.title
                                    )}
                                </h3>

                                <p>
                                    ${escapeHTML(
                                        event.description ||
                                        ""
                                    )}
                                </p>

                                <small>
                                    ${formatDate(
                                        event.created_at
                                    )}
                                </small>

                                ${deleteButton}

                            </div>

                        </div>
                    `;
                }
            )
            .join("");

    renderEventPagination();
}


/* =========================================================
   DISPLAY CUSTOMER EVENTS
========================================================= */

function displayCustomerEvents() {

    const container =
        document.getElementById(
            "customerEventsList"
        );

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
        allEvents
            .map(
                event => {

                    const image =
                        event.image_url
                            ? `
                                <img
                                    src="${escapeAttribute(
                                        event.image_url
                                    )}"
                                    alt="${escapeAttribute(
                                        event.title
                                    )}"
                                >
                            `
                            : "";

                    return `
                        <div class="customer-event-card">

                            ${image}

                            <div class="customer-event-content">

                                <h3>
                                    ${escapeHTML(
                                        event.title
                                    )}
                                </h3>

                                <p>
                                    ${escapeHTML(
                                        event.description ||
                                        ""
                                    )}
                                </p>

                                <button
                                    type="button"
                                    class="customer-order-btn"
                                    onclick="openOrderModal()"
                                >
                                    📩 Buyurtma berish
                                </button>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   EVENT PAGINATION
========================================================= */

function renderEventPagination() {

    const container =
        document.getElementById(
            "workerPagination"
        );

    if (!container) {
        return;
    }

    const totalPages =
        Math.ceil(
            allEvents.length /
            EVENTS_PER_PAGE
        );

    if (
        totalPages <= 1
    ) {

        container.innerHTML =
            "";

        return;
    }

    let html =
        "";

    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        html += `
            <button
                type="button"
                onclick="goToEventPage(${i})"
                class="${
                    i === currentEventPage
                        ? "active"
                        : ""
                }"
            >
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

    if (
        currentRole !==
        "admin"
    ) {
        return;
    }

    if (!checkSupabase()) {
        return;
    }

    if (
        !confirm(
            "Bu tadbirni o‘chirmoqchimisiz?"
        )
    ) {
        return;
    }

    try {

        const {
            error
        } =
            await supabaseClient
                .from("events")
                .delete()
                .eq(
                    "id",
                    id
                );

        if (error) {

            alert(
                "❌ O‘chirishda xatolik:\n" +
                error.message
            );

            return;
        }

        alert(
            "✅ Tadbir o‘chirildi."
        );

        await getEvents();

    } catch (error) {

        console.error(
            "DELETE EVENT ERROR:",
            error
        );

        alert(
            "❌ Xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   ORDER MODAL
========================================================= */

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

    const form =
        document.getElementById(
            "applicationForm"
        );

    if (form) {
        form.reset();
    }

    const message =
        document.getElementById(
            "applicationMessage"
        );

    if (message) {
        message.textContent =
            "";
    }
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


/* =========================================================
   APPLICATION
========================================================= */

async function submitApplication(
    event
) {

    if (event) {
        event.preventDefault();
    }

    if (!checkSupabase()) {
        return;
    }

    const name =
        getValue(
            "applicationName"
        ).trim();

    const phone =
        getValue(
            "applicationPhone"
        ).trim();

    const message =
        document.getElementById(
            "applicationMessage"
        );

    if (!name) {

        if (message) {
            message.textContent =
                "Ism va familyani kiriting.";
        }

        return;
    }

    if (!phone) {

        if (message) {
            message.textContent =
                "Telefon raqamini kiriting.";
        }

        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("applications")
                .insert([
                    {
                        full_name:
                            name,

                        phone:
                            phone,

                        status:
                            "new"
                    }
                ])
                .select()
                .single();

        if (error) {

            console.error(
                "APPLICATION ERROR:",
                error
            );

            if (message) {

                message.textContent =
                    "❌ Ariza yuborishda xatolik: " +
                    error.message;
            }

            return;
        }

        localStorage.setItem(
            "goldshow_application_id",
            data.id
        );

        if (message) {

            message.textContent =
                "✅ Arizangiz yuborildi!";
        }

        const statusBox =
            document.getElementById(
                "customerStatusBox"
            );

        if (statusBox) {

            statusBox.classList.remove(
                "hidden"
            );

            statusBox.textContent =
                "⏳ Arizangiz ko‘rib chiqilmoqda...";
        }

        closeOrderModal();

        startApplicationCheck(
            data.id
        );

    } catch (error) {

        console.error(
            "APPLICATION EXCEPTION:",
            error
        );

        if (message) {

            message.textContent =
                "❌ Xatolik: " +
                error.message;
        }
    }
}


/* =========================================================
   APPLICATION STATUS
========================================================= */

function startApplicationCheck(id) {

    if (applicationTimer) {

        clearInterval(
            applicationTimer
        );
    }

    checkApplicationStatus(
        id
    );

    applicationTimer =
        setInterval(
            () => {

                checkApplicationStatus(
                    id
                );

            },
            8000
        );
}


async function checkApplicationStatus(
    id
) {

    if (!checkSupabase()) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("applications")
                .select("*")
                .eq(
                    "id",
                    id
                )
                .maybeSingle();

        if (error) {
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

        statusBox.classList.remove(
            "hidden"
        );

        if (
            data.status ===
            "accepted"
        ) {

            statusBox.textContent =
                "✅ Arizangiz tasdiqlandi.";

            clearInterval(
                applicationTimer
            );

        } else if (
            data.status ===
            "rejected"
        ) {

            statusBox.textContent =
                "❌ Arizangiz rad etildi.";

            clearInterval(
                applicationTimer
            );

        } else {

            statusBox.textContent =
                "⏳ Arizangiz ko‘rib chiqilmoqda...";
        }

    } catch (error) {

        console.error(
            "APPLICATION STATUS ERROR:",
            error
        );
    }
}


/* =========================================================
   APPLICATIONS ADMIN
========================================================= */

async function getApplications() {

    if (
        currentRole !==
        "admin"
    ) {
        return;
    }

    if (!checkSupabase()) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("applications")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {

            console.error(
                "APPLICATIONS ERROR:",
                error
            );

            return;
        }

        allApplications =
            data || [];

        displayApplications();

    } catch (error) {

        console.error(
            "APPLICATIONS EXCEPTION:",
            error
        );
    }
}


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
        allApplications
            .map(
                application => {

                    let status =
                        "Yangi";

                    if (
                        application.status ===
                        "accepted"
                    ) {
                        status =
                            "Tasdiqlangan";
                    }

                    if (
                        application.status ===
                        "rejected"
                    ) {
                        status =
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
                                    📞
                                    ${escapeHTML(
                                        application.phone
                                    )}
                                </p>

                                <small>
                                    ${formatDate(
                                        application.created_at
                                    )}
                                </small>

                            </div>


                            <div>

                                <strong>
                                    ${status}
                                </strong>

                                <div>

                                    <button
                                        type="button"
                                        onclick="acceptApplication(${application.id})"
                                    >
                                        ✅
                                    </button>

                                    <button
                                        type="button"
                                        onclick="rejectApplication(${application.id})"
                                    >
                                        ❌
                                    </button>

                                    <button
                                        type="button"
                                        class="btn-delete"
                                        onclick="deleteApplication(${application.id})"
                                    >
                                        🗑️
                                    </button>

                                </div>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


async function acceptApplication(id) {

    await changeApplicationStatus(
        id,
        "accepted"
    );
}


async function rejectApplication(id) {

    await changeApplicationStatus(
        id,
        "rejected"
    );
}


async function changeApplicationStatus(
    id,
    status
) {

    if (
        currentRole !==
        "admin"
    ) {
        return;
    }

    if (!checkSupabase()) {
        return;
    }

    try {

        const updateData = {
            status:
                status
        };

        if (
            status ===
            "accepted"
        ) {

            updateData.accepted_at =
                new Date()
                    .toISOString();
        }

        const {
            error
        } =
            await supabaseClient
                .from("applications")
                .update(
                    updateData
                )
                .eq(
                    "id",
                    id
                );

        if (error) {

            alert(
                "❌ Xatolik:\n" +
                error.message
            );

            return;
        }

        await getApplications();

    } catch (error) {

        console.error(
            "CHANGE APPLICATION ERROR:",
            error
        );
    }
}


async function deleteApplication(
    id
) {

    if (
        currentRole !==
        "admin"
    ) {
        return;
    }

    if (!checkSupabase()) {
        return;
    }

    if (
        !confirm(
            "Bu arizani o‘chirmoqchimisiz?"
        )
    ) {
        return;
    }

    try {

        const {
            error
        } =
            await supabaseClient
                .from("applications")
                .delete()
                .eq(
                    "id",
                    id
                );

        if (error) {

            alert(
                "❌ Xatolik:\n" +
                error.message
            );

            return;
        }

        await getApplications();

    } catch (error) {

        console.error(
            "DELETE APPLICATION ERROR:",
            error
        );
    }
}


/* =========================================================
   USERS
========================================================= */

async function getUsers() {

    if (
        currentRole !==
        "admin"
    ) {
        return;
    }

    if (!checkSupabase()) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("users")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {

            console.error(
                "USERS ERROR:",
                error
            );

            return;
        }

        allUsers =
            data || [];

        displayUsers();

    } catch (error) {

        console.error(
            "USERS EXCEPTION:",
            error
        );
    }
}


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
        allUsers
            .map(
                user => {

                    const current =
                        currentUser &&
                        currentUser.id ===
                        user.id;

                    return `
                        <div class="user-card">

                            <div>

                                <h3>
                                    ${escapeHTML(
                                        user.name ||
                                        "-"
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
                                        ${
                                            user.role ===
                                            "admin"
                                                ? "Admin"
                                                : "Ishchi"
                                        }
                                    </strong>
                                </p>

                                <p>

                                    Parol:

                                    <span
                                        id="password-${user.id}"
                                    >
                                        ••••••••
                                    </span>

                                    <button
                                        type="button"
                                        onclick="showUserPassword(${user.id})"
                                    >
                                        👁️
                                    </button>

                                </p>

                            </div>


                            <div>

                                <button
                                    type="button"
                                    onclick="changeUsername(${user.id})"
                                >
                                    ✏️ Login
                                </button>

                                <button
                                    type="button"
                                    onclick="changePassword(${user.id})"
                                >
                                    🔑 Parol
                                </button>

                                ${
                                    !current
                                        ? `
                                            <button
                                                type="button"
                                                class="btn-delete"
                                                onclick="deleteUser(${user.id})"
                                            >
                                                🗑️
                                            </button>
                                        `
                                        : ""
                                }

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   CREATE USER
========================================================= */

async function createUser(
    event
) {

    if (event) {
        event.preventDefault();
    }

    if (
        currentRole !==
        "admin"
    ) {
        return;
    }

    if (!checkSupabase()) {
        return;
    }

    const name =
        getValue(
            "newUserName"
        ).trim();

    const username =
        getValue(
            "newUsername"
        ).trim();

    const password =
        getValue(
            "newUserPassword"
        ).trim();

    const role =
        getValue(
            "newUserRole"
        ) ||
        "user";

    if (
        !name ||
        !username ||
        !password
    ) {

        alert(
            "Barcha maydonlarni to‘ldiring."
        );

        return;
    }

    try {

        const {
            error
        } =
            await supabaseClient
                .from("users")
                .insert([
                    {
                        name:
                            name,

                        username:
                            username,

                        password:
                            password,

                        role:
                            role
                    }
                ]);

        if (error) {

            console.error(
                "CREATE USER ERROR:",
                error
            );

            if (
                error.code ===
                "23505"
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
            "✅ User yaratildi."
        );

        const form =
            document.getElementById(
                "userForm"
            );

        if (form) {
            form.reset();
        }

        await getUsers();

    } catch (error) {

        console.error(
            "CREATE USER EXCEPTION:",
            error
        );

        alert(
            "❌ Xatolik:\n" +
            error.message
        );
    }
}


/* =========================================================
   PASSWORD
========================================================= */

function showUserPassword(id) {

    const element =
        document.getElementById(
            `password-${id}`
        );

    if (!element) {
        return;
    }

    const user =
        allUsers.find(
            item =>
                item.id == id
        );

    if (!user) {
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

    } else {

        element.textContent =
            user.password || "";

        element.dataset.visible =
            "true";
    }
}


/* =========================================================
   CHANGE USERNAME
========================================================= */

async function changeUsername(
    id
) {

    if (
        currentRole !==
        "admin"
    ) {
        return;
    }

    if (!checkSupabase()) {
        return;
    }

    const user =
        allUsers.find(
            item =>
                item.id == id
        );

    if (!user) {
        return;
    }

    const username =
        prompt(
            "Yangi login:",
            user.username
        );

    if (username === null) {
        return;
    }

    if (!username.trim()) {

        alert(
            "Login bo‘sh bo‘lishi mumkin emas."
        );

        return;
    }

    try {

        const {
            error
        } =
            await supabaseClient
                .from("users")
                .update({
                    username:
                        username.trim()
                })
                .eq(
                    "id",
                    id
                );

        if (error) {

            alert(
                "❌ Login o‘zgartirilmadi:\n" +
                error.message
            );

            return;
        }

        await getUsers();

    } catch (error) {

        console.error(
            "CHANGE USERNAME ERROR:",
            error
        );
    }
}


/* =========================================================
   CHANGE PASSWORD
========================================================= */

async function changePassword(
    id
) {

    if (
        currentRole !==
        "admin"
    ) {
        return;
    }

    if (!checkSupabase()) {
        return;
    }

    const password =
        prompt(
            "Yangi parol:"
        );

    if (password === null) {
        return;
    }

    if (!password.trim()) {

        alert(
            "Parol bo‘sh bo‘lishi mumkin emas."
        );

        return;
    }

    try {

        const {
            error
        } =
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

        if (error) {

            alert(
                "❌ Parol o‘zgartirilmadi:\n" +
                error.message
            );

            return;
        }

        await getUsers();

        alert(
            "✅ Parol yangilandi."
        );

    } catch (error) {

        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );
    }
}


/* =========================================================
   DELETE USER
========================================================= */

async function deleteUser(
    id
) {

    if (
        currentRole !==
        "admin"
    ) {
        return;
    }

    if (!checkSupabase()) {
        return;
    }

    if (
        currentUser &&
        currentUser.id ==
        id
    ) {

        alert(
            "O‘zingizni o‘chira olmaysiz."
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

    try {

        const {
            error
        } =
            await supabaseClient
                .from("users")
                .delete()
                .eq(
                    "id",
                    id
                );

        if (error) {

            alert(
                "❌ User o‘chirilmadi:\n" +
                error.message
            );

            return;
        }

        await getUsers();

    } catch (error) {

        console.error(
            "DELETE USER ERROR:",
            error
        );
    }
}


/* =========================================================
   RESTORE SESSION
========================================================= */

async function restoreUser() {

    const saved =
        localStorage.getItem(
            "goldshow_user"
        );

    if (!saved) {
        return;
    }

    if (!checkSupabase()) {
        return;
    }

    try {

        const savedUser =
            JSON.parse(
                saved
            );

        if (
            !savedUser ||
            !savedUser.id
        ) {

            localStorage.removeItem(
                "goldshow_user"
            );

            return;
        }

        const {
            data,
            error
        } =
            await supabaseClient
                .from("users")
                .select("*")
                .eq(
                    "id",
                    savedUser.id
                )
                .maybeSingle();

        if (
            error ||
            !data
        ) {

            localStorage.removeItem(
                "goldshow_user"
            );

            return;
        }

        currentUser =
            data;

        currentRole =
            data.role;

        await openMainPage(
            data.role
        );

    } catch (error) {

        console.error(
            "RESTORE USER ERROR:",
            error
        );

        localStorage.removeItem(
            "goldshow_user"
        );
    }
}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        updateDate();


        /* -----------------------------------------
           LOGIN
        ----------------------------------------- */

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


        /* -----------------------------------------
           ORDER FORM
        ----------------------------------------- */

        const orderForm =
            document.getElementById(
                "orderForm"
            );

        if (orderForm) {

            orderForm.addEventListener(
                "submit",
                saveOrder
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
                displayOrders
            );
        }


        /* -----------------------------------------
           PAYMENT
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
           EVENT FORM
        ----------------------------------------- */

        const eventForm =
            document.getElementById(
                "eventForm"
            );

        if (eventForm) {

            eventForm.addEventListener(
                "submit",
                saveEvent
            );
        }


        /* -----------------------------------------
           USER FORM
        ----------------------------------------- */

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
           MODAL OUTSIDE CLICK
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
           EVENT IMAGE
        ----------------------------------------- */

        const eventImage =
            document.getElementById(
                "eventImage"
            );

        if (eventImage) {

            eventImage.addEventListener(
                "change",
                function () {

                    const file =
                        this.files &&
                        this.files[0];

                    if (!file) {
                        return;
                    }

                    if (
                        file.size >
                        2 * 1024 * 1024
                    ) {

                        alert(
                            "Rasm hajmi 2 MB dan oshmasin."
                        );

                        this.value =
                            "";
                    }
                }
            );
        }


        /* -----------------------------------------
           RESTORE LOGIN
        ----------------------------------------- */

        await restoreUser();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.openCustomerPage =
    openCustomerPage;

window.loadCustomerEvents =
    loadCustomerEvents;

window.openWorkerLogin =
    openWorkerLogin;

window.backToLanding =
    backToLanding;

window.login =
    login;

window.logout =
    logout;

window.showPage =
    showPage;

window.openOrderModal =
    openOrderModal;

window.closeOrderModal =
    closeOrderModal;

window.saveOrder =
    saveOrder;

window.calculateRemaining =
    calculateRemaining;

window.editOrder =
    editOrder;

window.cancelEditOrder =
    cancelEditOrder;

window.deleteOrder =
    deleteOrder;

window.deleteEvent =
    deleteEvent;

window.goToEventPage =
    goToEventPage;

window.acceptApplication =
    acceptApplication;

window.rejectApplication =
    rejectApplication;

window.deleteApplication =
    deleteApplication;

window.showUserPassword =
    showUserPassword;

window.changeUsername =
    changeUsername;

window.changePassword =
    changePassword;

window.deleteUser =
    deleteUser;