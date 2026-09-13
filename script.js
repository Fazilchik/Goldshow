/* =========================================================
   GOLD SHOW
   FULL SCRIPT.JS
   ADMIN + WORKER + CUSTOMER
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://mvrrftlhjlbrsiexnwjq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_MFI3LFGRmSviFv6ygJnXyg_wFktEpyP";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let currentUser = null;

let customerEventsPage = 1;

let workerEventsPage = 1;

const EVENTS_PER_PAGE = 10;

let applicationTimer = null;


/* =========================================================
   BASIC HELPERS
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatMoney(value) {

    return Number(value || 0)
        .toLocaleString("uz-UZ") +
        " so‘m";

}


function getToday() {

    const date = new Date();

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

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


function formatDate(value) {

    if (!value) {
        return "—";
    }

    return new Date(
        value + "T00:00:00"
    ).toLocaleDateString(
        "uz-UZ"
    );

}


function formatDateTime(value) {

    if (!value) {
        return "—";
    }

    return new Date(
        value
    ).toLocaleString(
        "uz-UZ",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function updateDate() {

    const element =
        document.getElementById(
            "todayDate"
        );

    if (!element) {
        return;
    }

    element.textContent =
        new Date()
            .toLocaleDateString(
                "uz-UZ",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );

}


/* =========================================================
   PAGE VISIBILITY
========================================================= */

function hideAllPages() {

    const ids = [
        "landingPage",
        "loginPage",
        "customerPage",
        "mainPage"
    ];


    ids.forEach(
        function(id) {

            const element =
                document.getElementById(
                    id
                );

            if (element) {

                element.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* =========================================================
   LANDING
========================================================= */

function backToLanding() {

    hideAllPages();

    const landing =
        document.getElementById(
            "landingPage"
        );


    if (landing) {

        landing.classList.remove(
            "hidden"
        );

    }


    closeOrderModal();

}


function openWorkerLogin() {

    hideAllPages();


    const loginPage =
        document.getElementById(
            "loginPage"
        );


    if (loginPage) {

        loginPage.classList.remove(
            "hidden"
        );

    }


    const username =
        document.getElementById(
            "username"
        );


    if (username) {
        username.focus();
    }

}


async function openCustomerPage() {

    hideAllPages();


    const customerPage =
        document.getElementById(
            "customerPage"
        );


    if (customerPage) {

        customerPage.classList.remove(
            "hidden"
        );

    }


    customerEventsPage = 1;


    await loadCustomerEvents();


    restoreApplicationStatus();

}


/* =========================================================
   LOGIN
========================================================= */

async function login(event) {

    event.preventDefault();


    const usernameElement =
        document.getElementById(
            "username"
        );


    const passwordElement =
        document.getElementById(
            "password"
        );


    const errorElement =
        document.getElementById(
            "loginError"
        );


    const username =
        usernameElement
            .value
            .trim();


    const password =
        passwordElement
            .value
            .trim();


    errorElement.textContent = "";


    if (
        username === "" ||
        password === ""
    ) {

        errorElement.textContent =
            "❌ Login va parolni kiriting.";

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
                .maybeSingle();


        console.log(
            "LOGIN RESULT:",
            result
        );


        if (result.error) {

            console.error(
                "SUPABASE LOGIN ERROR:",
                result.error
            );


            errorElement.textContent =
                "❌ Server bilan ulanishda xatolik.";

            return;

        }


        if (!result.data) {

            errorElement.textContent =
                "❌ Login yoki parol noto‘g‘ri.";

            return;

        }


        const user =
            result.data;


        const role =
            String(
                user.role || ""
            )
            .trim()
            .toLowerCase();


        /*
           Faqat admin va user role qabul qilinadi.
        */

        if (
            role !== "admin" &&
            role !== "user"
        ) {

            errorElement.textContent =
                "❌ User roli noto‘g‘ri.";

            console.error(
                "Noto‘g‘ri role:",
                user.role
            );

            return;

        }


        currentUser = {

            id: user.id,

            name: user.name,

            username: user.username,

            role: role

        };


        /*
           Inputlarni tozalash.
        */

        usernameElement.value = "";

        passwordElement.value = "";


        /*
           ROLE BO‘YICHA KIRISH.
        */

        if (
            currentUser.role ===
            "admin"
        ) {

            await openAdminPage();

            return;

        }


        if (
            currentUser.role ===
            "user"
        ) {

            await openWorkerPage();

            return;

        }

    }
    catch (errorObject) {

        console.error(
            "LOGIN ERROR:",
            errorObject
        );


        errorElement.textContent =
            "❌ Server bilan ulanishda xatolik.";

    }

}


/* =========================================================
   ADMIN PAGE
========================================================= */

async function openAdminPage() {

    await prepareMainPage(
        "ADMIN PANEL"
    );


    /*
       ADMIN FUNKSIYALARI
    */

    const addOrderMenu =
        document.getElementById(
            "addOrderMenu"
        );


    if (addOrderMenu) {

        addOrderMenu.style.display =
            "block";

    }


    const applicationsMenu =
        document.getElementById(
            "applicationsMenu"
        );


    if (applicationsMenu) {

        applicationsMenu.style.display =
            "block";

    }


    const usersMenu =
        document.getElementById(
            "usersMenu"
        );


    if (usersMenu) {

        usersMenu.style.display =
            "block";

    }


    const eventAdminForm =
        document.getElementById(
            "workerEventAdminForm"
        );


    if (eventAdminForm) {

        eventAdminForm.classList.remove(
            "hidden"
        );

    }


    await showPage(
        "dashboardPage"
    );

}


/* =========================================================
   WORKER PAGE
========================================================= */

async function openWorkerPage() {

    await prepareMainPage(
        "ISHCHI PANEL"
    );


    /*
       ISHCHI ADMIN HUQUQLARINI KO‘RMAYDI.
    */

    const addOrderMenu =
        document.getElementById(
            "addOrderMenu"
        );


    if (addOrderMenu) {

        addOrderMenu.style.display =
            "none";

    }


    const applicationsMenu =
        document.getElementById(
            "applicationsMenu"
        );


    if (applicationsMenu) {

        applicationsMenu.style.display =
            "none";

    }


    const usersMenu =
        document.getElementById(
            "usersMenu"
        );


    if (usersMenu) {

        usersMenu.style.display =
            "none";

    }


    const eventAdminForm =
        document.getElementById(
            "workerEventAdminForm"
        );


    if (eventAdminForm) {

        eventAdminForm.classList.add(
            "hidden"
        );

    }


    await showPage(
        "dashboardPage"
    );

}


/* =========================================================
   PREPARE MAIN PAGE
========================================================= */

async function prepareMainPage(
    panelTitle
) {

    hideAllPages();


    const mainPage =
        document.getElementById(
            "mainPage"
        );


    if (!mainPage) {
        return;
    }


    mainPage.classList.remove(
        "hidden"
    );


    /*
       USER NAME
    */

    const currentUserElement =
        document.getElementById(
            "currentUser"
        );


    if (currentUserElement) {

        currentUserElement.textContent =
            currentUser.name;

    }


    /*
       ROLE
    */

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


    /*
       AVATAR
    */

    const avatar =
        document.getElementById(
            "userAvatar"
        );


    if (avatar) {

        avatar.textContent =
            currentUser.name
                .charAt(0)
                .toUpperCase();

    }


    /*
       TITLE
    */

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );


    if (pageTitle) {

        pageTitle.textContent =
            panelTitle;

    }


    updateDate();


    /*
       MA'LUMOTLARNI YUKLASH
    */

    await updateDashboard();

    await displayOrders();

    await loadWorkerEvents();


    if (
        currentUser.role ===
        "admin"
    ) {

        await displayUsers();

        await loadApplications();

    }

}


/*
   Eski kod bilan moslik uchun.
*/

async function openMainPage() {

    if (!currentUser) {
        return;
    }


    if (
        currentUser.role ===
        "admin"
    ) {

        await openAdminPage();

    }
    else {

        await openWorkerPage();

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    currentUser = null;


    if (applicationTimer) {

        clearInterval(
            applicationTimer
        );

        applicationTimer = null;

    }


    backToLanding();

}


/* =========================================================
   MAIN MENU
========================================================= */

async function showPage(
    pageId,
    button = null
) {

    /*
       ADMIN HUQUQLARI
    */

    if (
        pageId === "usersPage" &&
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


    if (
        pageId === "applicationsPage" &&
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


    if (
        pageId === "addOrderPage" &&
        (
            !currentUser ||
            currentUser.role !== "admin"
        )
    ) {

        alert(
            "❌ Zakas qo‘shish faqat admin uchun."
        );

        return;

    }


    /*
       BARCHA PAGE'LARNI YOPISH
    */

    const pages =
        document.querySelectorAll(
            "#mainPage .page"
        );


    pages.forEach(
        function(page) {

            page.classList.add(
                "hidden"
            );

        }
    );


    /*
       KERAKLI PAGE
    */

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


    /*
       PAGE NOMLARI
    */

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


    /*
       ACTIVE MENU
    */

    document
        .querySelectorAll(
            "#mainPage .menu-btn"
        )
        .forEach(
            function(menuButton) {

                menuButton.classList.remove(
                    "active"
                );

            }
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    /*
       DATA
    */

    if (
        pageId ===
        "dashboardPage"
    ) {

        await updateDashboard();

    }


    if (
        pageId ===
        "ordersPage"
    ) {

        await displayOrders();

    }


    if (
        pageId ===
        "usersPage"
    ) {

        await displayUsers();

    }


    if (
        pageId ===
        "applicationsPage"
    ) {

        await loadApplications();

    }


    if (
        pageId ===
        "workerEventsPage"
    ) {

        await loadWorkerEvents();

    }

}


/* =========================================================
   CALCULATE REMAINING
========================================================= */

function calculateRemaining() {

    const totalElement =
        document.getElementById(
            "totalPrice"
        );


    const paidElement =
        document.getElementById(
            "paid"
        );


    const remainingElement =
        document.getElementById(
            "remaining"
        );


    if (
        !totalElement ||
        !paidElement ||
        !remainingElement
    ) {
        return;
    }


    const total =
        Number(
            totalElement.value
        ) || 0;


    const paid =
        Number(
            paidElement.value
        ) || 0;


    remainingElement.textContent =
        formatMoney(
            total - paid
        );

}


/* =========================================================
   ORDER FORM DATA
========================================================= */

function getOrderFromForm() {

    return {

        client_name:
            document
                .getElementById(
                    "clientName"
                )
                .value
                .trim(),

        client_phone:
            document
                .getElementById(
                    "clientPhone"
                )
                .value
                .trim(),

        location:
            document
                .getElementById(
                    "location"
                )
                .value
                .trim(),

        event_date:
            document
                .getElementById(
                    "eventDate"
                )
                .value,

        event_time:
            document
                .getElementById(
                    "eventTime"
                )
                .value,

        screen_height:
            Number(
                document
                    .getElementById(
                        "screenHeight"
                    )
                    .value
            ) || 0,

        screen_width:
            Number(
                document
                    .getElementById(
                        "screenWidth"
                    )
                    .value
            ) || 0,

        stage_width:
            Number(
                document
                    .getElementById(
                        "stageWidth"
                    )
                    .value
            ) || 0,

        stage_length:
            Number(
                document
                    .getElementById(
                        "stageLength"
                    )
                    .value
            ) || 0,

        curtain:
            document
                .getElementById(
                    "curtain"
                )
                .value,

        lights:
            Number(
                document
                    .getElementById(
                        "lights"
                    )
                    .value
            ) || 0,

        galava:
            Number(
                document
                    .getElementById(
                        "galava"
                    )
                    .value
            ) || 0,

        ledwash:
            Number(
                document
                    .getElementById(
                        "ledwash"
                    )
                    .value
            ) || 0,

        confetti:
            Number(
                document
                    .getElementById(
                        "confetti"
                    )
                    .value
            ) || 0,

        dim:
            Number(
                document
                    .getElementById(
                        "dim"
                    )
                    .value
            ) || 0,

        firework:
            Number(
                document
                    .getElementById(
                        "firework"
                    )
                    .value
            ) || 0,

        side_screens:
            Number(
                document
                    .getElementById(
                        "sideScreens"
                    )
                    .value
            ) || 0,

        side_height:
            Number(
                document
                    .getElementById(
                        "sideHeight"
                    )
                    .value
            ) || 0,

        side_width:
            Number(
                document
                    .getElementById(
                        "sideWidth"
                    )
                    .value
            ) || 0,

        paid:
            Number(
                document
                    .getElementById(
                        "paid"
                    )
                    .value
            ) || 0,

        total_price:
            Number(
                document
                    .getElementById(
                        "totalPrice"
                    )
                    .value
            ) || 0

    };

}


/* =========================================================
   SAVE ORDER
========================================================= */

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


    const order =
        getOrderFromForm();


    order.remaining =
        order.total_price -
        order.paid;


    const editingId =
        document
            .getElementById(
                "editingOrderId"
            )
            .value;


    try {

        if (editingId) {

            const result =
                await supabaseClient
                    .from("orders")
                    .update(order)
                    .eq(
                        "id",
                        editingId
                    );


            if (result.error) {
                throw result.error;
            }


            alert(
                "✅ Zakas yangilandi."
            );

        }
        else {

            const result =
                await supabaseClient
                    .from("orders")
                    .insert([
                        order
                    ]);


            if (result.error) {
                throw result.error;
            }


            alert(
                "✅ Zakas qo‘shildi."
            );

        }


        resetOrderForm();


        await updateDashboard();

        await displayOrders();


        await showPage(
            "ordersPage"
        );

    }
    catch (errorObject) {

        console.error(
            "ORDER ERROR:",
            errorObject
        );


        alert(
            "❌ Zakasni saqlashda xatolik."
        );

    }

}


/* =========================================================
   GET ORDERS
========================================================= */

async function getOrders() {

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


/* =========================================================
   DISPLAY ORDERS
========================================================= */

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


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    if (search !== "") {

        orders =
            orders.filter(
                function(order) {

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

                }
            );

    }


    if (
        orders.length === 0
    ) {

        container.innerHTML = `

            <div class="no-orders">

                <h3>
                    📭 Zakas topilmadi
                </h3>

                <p>
                    Hozircha zakas mavjud emas.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        orders
            .map(
                createOrderHTML
            )
            .join("");

}


/* =========================================================
   CREATE ORDER HTML
========================================================= */

function createOrderHTML(
    order
) {

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
                    onclick="
                        editOrder(
                            ${order.id}
                        )
                    "
                >
                    ✏️ Tahrirlash
                </button>


                <button
                    type="button"
                    class="btn-delete"
                    onclick="
                        deleteOrder(
                            ${order.id}
                        )
                    "
                >
                    🗑️ O‘chirish
                </button>

            </div>

        `;

    }


    return `

        <div class="order-card">

            <div class="order-header">

                <div>

                    <div class="order-client">

                        👤
                        ${escapeHTML(
                            order.client_name
                        )}

                    </div>

                    <div>

                        📞
                        ${escapeHTML(
                            order.client_phone
                        )}

                    </div>

                </div>


                <div class="order-date">

                    📅
                    ${formatDate(
                        order.event_date
                    )}

                    <br>

                    ⏰
                    ${escapeHTML(
                        order.event_time || ""
                    )}

                </div>

            </div>


            <div class="order-grid">

                <div class="info">

                    <span>
                        📍 Manzil
                    </span>

                    <strong>
                        ${escapeHTML(
                            order.location
                        )}
                    </strong>

                </div>


                <div class="info">

                    <span>
                        🖥 Ekran
                    </span>

                    <strong>

                        ${
                            order.screen_height || 0
                        }m

                        ×

                        ${
                            order.screen_width || 0
                        }m

                    </strong>

                </div>


                <div class="info">

                    <span>
                        🎭 Sahna
                    </span>

                    <strong>

                        ${
                            order.stage_width || 0
                        }m

                        ×

                        ${
                            order.stage_length || 0
                        }m

                    </strong>

                </div>


                <div class="info">

                    <span>
                        💡 Chiroq
                    </span>

                    <strong>
                        ${order.lights || 0}
                    </strong>

                </div>


                <div class="info">

                    <span>
                        🔆 Galava
                    </span>

                    <strong>
                        ${order.galava || 0}
                    </strong>

                </div>


                <div class="info">

                    <span>
                        💡 LED Wash
                    </span>

                    <strong>
                        ${order.ledwash || 0}
                    </strong>

                </div>


                <div class="info">

                    <span>
                        🎉 Konfetti
                    </span>

                    <strong>
                        ${order.confetti || 0}
                    </strong>

                </div>


                <div class="info">

                    <span>
                        💡 Dim
                    </span>

                    <strong>
                        ${order.dim || 0}
                    </strong>

                </div>


                <div class="info">

                    <span>
                        🎆 Firework
                    </span>

                    <strong>
                        ${order.firework || 0}
                    </strong>

                </div>


                <div class="info">

                    <span>
                        🖥 Yon ekran
                    </span>

                    <strong>

                        ${order.side_screens || 0}
                        dona

                        <br>

                        ${order.side_height || 0}m
                        ×
                        ${order.side_width || 0}m

                    </strong>

                </div>


                <div class="info">

                    <span>
                        🎭 Parda
                    </span>

                    <strong>

                        ${escapeHTML(
                            order.curtain ||
                            "Yo‘q"
                        )}

                    </strong>

                </div>


                <div class="info">

                    <span>
                        💰 Jami
                    </span>

                    <strong class="money">

                        ${formatMoney(
                            order.total_price
                        )}

                    </strong>

                </div>


                <div class="info">

                    <span>
                        💵 To‘langan
                    </span>

                    <strong class="money">

                        ${formatMoney(
                            order.paid
                        )}

                    </strong>

                </div>


                <div class="info">

                    <span>
                        ⚠️ Qolgan
                    </span>

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


/* =========================================================
   EDIT ORDER
========================================================= */

async function editOrder(
    id
) {

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
            .eq(
                "id",
                id
            )
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


    document.getElementById(
        "editingOrderId"
    ).value =
        order.id;


    document.getElementById(
        "clientName"
    ).value =
        order.client_name || "";


    document.getElementById(
        "clientPhone"
    ).value =
        order.client_phone || "";


    document.getElementById(
        "location"
    ).value =
        order.location || "";


    document.getElementById(
        "eventDate"
    ).value =
        order.event_date || "";


    document.getElementById(
        "eventTime"
    ).value =
        order.event_time || "";


    document.getElementById(
        "screenHeight"
    ).value =
        order.screen_height || 0;


    document.getElementById(
        "screenWidth"
    ).value =
        order.screen_width || 0;


    document.getElementById(
        "stageWidth"
    ).value =
        order.stage_width || 0;


    document.getElementById(
        "stageLength"
    ).value =
        order.stage_length || 0;


    document.getElementById(
        "curtain"
    ).value =
        order.curtain || "Yo‘q";


    document.getElementById(
        "lights"
    ).value =
        order.lights || 0;


    document.getElementById(
        "galava"
    ).value =
        order.galava || 0;


    document.getElementById(
        "ledwash"
    ).value =
        order.ledwash || 0;


    document.getElementById(
        "confetti"
    ).value =
        order.confetti || 0;


    document.getElementById(
        "dim"
    ).value =
        order.dim || 0;


    document.getElementById(
        "firework"
    ).value =
        order.firework || 0;


    document.getElementById(
        "sideScreens"
    ).value =
        order.side_screens || 0;


    document.getElementById(
        "sideHeight"
    ).value =
        order.side_height || 0;


    document.getElementById(
        "sideWidth"
    ).value =
        order.side_width || 0;


    document.getElementById(
        "paid"
    ).value =
        order.paid || 0;


    document.getElementById(
        "totalPrice"
    ).value =
        order.total_price || 0;


    document
        .getElementById(
            "editBadge"
        )
        .classList
        .remove("hidden");


    document
        .getElementById(
            "cancelEditBtn"
        )
        .classList
        .remove("hidden");


    document
        .getElementById(
            "orderFormTitle"
        )
        .textContent =
        "✏️ Zakasni tahrirlash";


    document
        .getElementById(
            "orderSubmitBtn"
        )
        .textContent =
        "💾 O‘zgarishlarni saqlash";


    calculateRemaining();


    await showPage(
        "addOrderPage"
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


    document.getElementById(
        "editingOrderId"
    ).value = "";


    document
        .getElementById(
            "editBadge"
        )
        .classList
        .add("hidden");


    document
        .getElementById(
            "cancelEditBtn"
        )
        .classList
        .add("hidden");


    document
        .getElementById(
            "orderFormTitle"
        )
        .textContent =
        "➕ Yangi zakas qo‘shish";


    document
        .getElementById(
            "orderSubmitBtn"
        )
        .textContent =
        "💾 Zakasni saqlash";


    calculateRemaining();

}


function cancelEditOrder() {

    resetOrderForm();

    showPage(
        "ordersPage"
    );

}


/* =========================================================
   DELETE ORDER
========================================================= */

async function deleteOrder(
    id
) {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {

        alert(
            "❌ Faqat admin."
        );

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

        console.error(
            result.error
        );

        alert(
            "❌ Zakas o‘chirilmadi."
        );

        return;

    }


    await displayOrders();

    await updateDashboard();


    alert(
        "✅ Zakas o‘chirildi."
    );

}


/* =========================================================
   DASHBOARD
========================================================= */

async function updateDashboard() {

    const orders =
        await getOrders();


    const today =
        getToday();


    const todayOrders =
        orders.filter(
            function(order) {

                return (
                    order.event_date ===
                    today
                );

            }
        );


    const now =
        new Date();


    const upcoming =
        orders.filter(
            function(order) {

                if (
                    !order.event_date ||
                    !order.event_time
                ) {

                    return false;

                }


                const eventDate =
                    new Date(
                        order.event_date +
                        "T" +
                        order.event_time
                    );


                const difference =
                    eventDate.getTime() -
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

            }
        );


    const totalMoney =
        orders.reduce(
            function(
                sum,
                order
            ) {

                return (
                    sum +
                    Number(
                        order.total_price ||
                        0
                    )
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
            formatMoney(
                totalMoney
            );

    }


    await displayTodayOrders();

    await checkNotifications();

}


/* =========================================================
   TODAY ORDERS
========================================================= */

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
        .filter(
            function(order) {

                return (
                    order.event_date ===
                    getToday()
                );

            }
        );


    if (
        orders.length === 0
    ) {

        container.innerHTML = `

            <div class="no-orders">

                <h3>
                    🎉 Bugun zakas yo‘q
                </h3>

                <p>
                    Bugungi kun uchun zakas mavjud emas.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        orders
            .map(
                createOrderHTML
            )
            .join("");

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

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


    orders.forEach(
        function(order) {

            if (
                !order.event_date ||
                !order.event_time
            ) {

                return;

            }


            const eventDate =
                new Date(
                    order.event_date +
                    "T" +
                    order.event_time
                );


            const hours =
                (
                    eventDate.getTime() -
                    now.getTime()
                ) /
                3600000;


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
                        ${escapeHTML(
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

        }
    );


    container.innerHTML =
        html;

}


/* =========================================================
   USERS
========================================================= */

async function displayUsers() {

    const container =
        document.getElementById(
            "usersList"
        );


    if (!container) {
        return;
    }


    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {

        container.innerHTML = "";

        return;

    }


    const result =
        await supabaseClient
            .from("users")
            .select("*")
            .order(
                "id",
                {
                    ascending: true
                }
            );


    if (result.error) {

        console.error(
            "USERS ERROR:",
            result.error
        );


        container.innerHTML = `

            <div class="no-orders">

                ❌ Userlarni olishda xatolik.

            </div>

        `;

        return;

    }


    const users =
        result.data || [];


    if (
        users.length === 0
    ) {

        container.innerHTML = `

            <div class="no-orders">

                <h3>
                    👥 Userlar yo‘q
                </h3>

            </div>

        `;

        return;

    }


    container.innerHTML =
        users
            .map(
                function(user) {

                    return `

                        <div class="user-card">

                            <div
                                class="user-card-header"
                            >

                                <div>

                                    <div
                                        class="user-card-name"
                                    >

                                        👤
                                        ${escapeHTML(
                                            user.name
                                        )}

                                    </div>


                                    <span
                                        class="user-role"
                                    >

                                        ${
                                            String(
                                                user.role
                                            )
                                            .toLowerCase() ===
                                            "admin"

                                                ? "ADMIN"

                                                : "ISHCHI"
                                        }

                                    </span>

                                </div>

                            </div>


                            <div class="user-grid">

                                <div
                                    class="user-detail"
                                >

                                    <span>
                                        🔑 Login
                                    </span>

                                    <strong>
                                        ${escapeHTML(
                                            user.username
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="user-detail"
                                >

                                    <span>
                                        🔒 Parol
                                    </span>

                                    <strong
                                        id="
                                            password-${user.id}
                                        "
                                    >
                                        ••••••••
                                    </strong>

                                </div>

                            </div>


                            <div
                                class="user-actions"
                            >

                                <button
                                    type="button"
                                    class="btn-view"
                                    onclick="
                                        showUserPassword(
                                            ${user.id}
                                        )
                                    "
                                >
                                    👁 Ko‘rish
                                </button>


                                <button
                                    type="button"
                                    class="btn-edit"
                                    onclick="
                                        changeUserPassword(
                                            ${user.id}
                                        )
                                    "
                                >
                                    🔑 Parol
                                </button>


                                <button
                                    type="button"
                                    class="btn-edit"
                                    onclick="
                                        changeUsername(
                                            ${user.id}
                                        )
                                    "
                                >
                                    ✏️ Login
                                </button>


                                ${
                                    Number(
                                        user.id
                                    ) !==
                                    Number(
                                        currentUser.id
                                    )

                                        ?

                                    `

                                        <button
                                            type="button"
                                            class="btn-delete"
                                            onclick="
                                                deleteUser(
                                                    ${user.id}
                                                )
                                            "
                                        >
                                            🗑 O‘chirish
                                        </button>

                                    `

                                        :

                                    ""

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
        document
            .getElementById(
                "newUserName"
            )
            .value
            .trim();


    const username =
        document
            .getElementById(
                "newUsername"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "newUserPassword"
            )
            .value
            .trim();


    const role =
        document
            .getElementById(
                "newUserRole"
            )
            .value
            .trim()
            .toLowerCase();


    if (
        !name ||
        !username ||
        !password
    ) {

        alert(
            "❌ Barcha maydonlarni to‘ldiring."
        );

        return;

    }


    if (
        role !== "admin" &&
        role !== "user"
    ) {

        alert(
            "❌ Rol noto‘g‘ri."
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

        console.error(
            check.error
        );

        alert(
            "❌ Userni tekshirishda xatolik."
        );

        return;

    }


    if (
        check.data &&
        check.data.length > 0
    ) {

        alert(
            "❌ Bu login allaqachon mavjud."
        );

        return;

    }


    const result =
        await supabaseClient
            .from("users")
            .insert([
                {
                    name: name,
                    username: username,
                    password: password,
                    role: role
                }
            ]);


    if (result.error) {

        console.error(
            result.error
        );

        alert(
            "❌ User yaratilmadi."
        );

        return;

    }


    document
        .getElementById(
            "userForm"
        )
        .reset();


    await displayUsers();


    alert(
        "✅ User muvaffaqiyatli yaratildi."
    );

}


/* =========================================================
   GET USER
========================================================= */

async function getUser(
    id
) {

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

        console.error(
            result.error
        );

        return null;

    }


    return result.data;

}


/* =========================================================
   SHOW PASSWORD
========================================================= */

async function showUserPassword(
    id
) {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {

        return;

    }


    const user =
        await getUser(id);


    const element =
        document.getElementById(
            "password-" + id
        );


    if (
        !user ||
        !element
    ) {

        return;

    }


    if (
        element.textContent
            .trim() ===
        "••••••••"
    ) {

        element.textContent =
            user.password;

    }
    else {

        element.textContent =
            "••••••••";

    }

}


/* =========================================================
   CHANGE PASSWORD
========================================================= */

async function changeUserPassword(
    id
) {

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


    const newPassword =
        prompt(
            "Yangi parolni kiriting:",
            ""
        );


    if (
        newPassword === null
    ) {

        return;

    }


    const password =
        newPassword.trim();


    if (!password) {

        alert(
            "❌ Parol bo‘sh bo‘lmasligi kerak."
        );

        return;

    }


    const result =
        await supabaseClient
            .from("users")
            .update(
                {
                    password:
                        password
                }
            )
            .eq(
                "id",
                id
            );


    if (result.error) {

        console.error(
            result.error
        );

        alert(
            "❌ Parol o‘zgartirilmadi."
        );

        return;

    }


    await displayUsers();


    alert(
        "✅ Parol o‘zgartirildi."
    );

}


/* =========================================================
   CHANGE USERNAME
========================================================= */

async function changeUsername(
    id
) {

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


    if (
        newUsername === null
    ) {

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

        console.error(
            check.error
        );

        alert(
            "❌ Loginni tekshirishda xatolik."
        );

        return;

    }


    if (
        check.data &&
        check.data.length > 0
    ) {

        alert(
            "❌ Bu login allaqachon mavjud."
        );

        return;

    }


    const result =
        await supabaseClient
            .from("users")
            .update(
                {
                    username:
                        username
                }
            )
            .eq(
                "id",
                id
            );


    if (result.error) {

        console.error(
            result.error
        );

        alert(
            "❌ Login o‘zgartirilmadi."
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


/* =========================================================
   DELETE USER
========================================================= */

async function deleteUser(
    id
) {

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

        console.error(
            result.error
        );

        alert(
            "❌ User o‘chirilmadi."
        );

        return;

    }


    await displayUsers();


    alert(
        "✅ User o‘chirildi."
    );

}


/* =========================================================
   EVENTS
========================================================= */

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
            "EVENTS ERROR:",
            result.error
        );

        return [];

    }


    return result.data || [];

}


/* =========================================================
   EVENT HTML
========================================================= */

function createEventHTML(
    event
) {

    let imageHTML = "";


    if (
        event.image_url
    ) {

        imageHTML = `

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
    else {

        imageHTML = `

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


    return `

        <article
            class="event-card"
        >

            ${imageHTML}


            <div
                class="event-card-body"
            >

                <div
                    class="event-card-title"
                >

                    ${escapeHTML(
                        event.title
                    )}

                </div>


                <div
                    class="event-card-description"
                >

                    ${escapeHTML(
                        event.description ||
                        "Tavsif mavjud emas."
                    )}

                </div>


                <div
                    class="event-card-date"
                >

                    ${formatDateTime(
                        event.created_at
                    )}

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   CUSTOMER EVENTS
========================================================= */

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


    if (
        customerEventsPage >
        totalPages
    ) {

        customerEventsPage =
            totalPages;

    }


    const start =
        (
            customerEventsPage - 1
        ) *
        EVENTS_PER_PAGE;


    const pageEvents =
        events.slice(
            start,
            start +
            EVENTS_PER_PAGE
        );


    if (
        pageEvents.length === 0
    ) {

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
    else {

        container.innerHTML =
            pageEvents
                .map(
                    createEventHTML
                )
                .join("");

    }


    renderPagination(
        pagination,
        totalPages,
        customerEventsPage,
        function(page) {

            customerEventsPage =
                page;

            loadCustomerEvents();

            window.scrollTo(
                {
                    top: 0,
                    behavior: "smooth"
                }
            );

        }
    );

}


/* =========================================================
   PAGINATION
========================================================= */

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
            id="previousPage"
            ${
                currentPage === 1
                    ? "disabled"
                    : ""
            }
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
                class="${
                    i === currentPage
                        ? "active"
                        : ""
                }"
            >
                ${i}
            </button>

        `;

    }


    html += `

        <button
            type="button"
            id="nextPage"
            ${
                currentPage === totalPages
                    ? "disabled"
                    : ""
            }
        >
            Keyingi sahifa →
        </button>


        <span>
            ${currentPage}
            /
            ${totalPages}
        </span>

    `;


    container.innerHTML =
        html;


    container
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        onPage(
                            Number(
                                button.dataset.page
                            )
                        );

                    }
                );

            }
        );


    const previous =
        document.getElementById(
            "previousPage"
        );


    if (previous) {

        previous.addEventListener(
            "click",
            function() {

                if (
                    currentPage > 1
                ) {

                    onPage(
                        currentPage - 1
                    );

                }

            }
        );

    }


    const next =
        document.getElementById(
            "nextPage"
        );


    if (next) {

        next.addEventListener(
            "click",
            function() {

                if (
                    currentPage <
                    totalPages
                ) {

                    onPage(
                        currentPage + 1
                    );

                }

            }
        );

    }

}


/* =========================================================
   WORKER EVENTS
========================================================= */

function createWorkerEventHTML(
    event
) {

    let imageHTML = "";


    if (
        event.image_url
    ) {

        imageHTML = `

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
    else {

        imageHTML = `

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


    let deleteButton = "";


    if (
        currentUser &&
        currentUser.role === "admin"
    ) {

        deleteButton = `

            <div
                class="event-admin-actions"
            >

                <button
                    type="button"
                    class="btn-delete"
                    onclick="
                        deleteEvent(
                            ${event.id}
                        )
                    "
                >
                    🗑 O‘chirish
                </button>

            </div>

        `;

    }


    return `

        <article
            class="event-card"
        >

            ${imageHTML}


            <div
                class="event-card-body"
            >

                <div
                    class="event-card-title"
                >

                    ${escapeHTML(
                        event.title
                    )}

                </div>


                <div
                    class="event-card-description"
                >

                    ${escapeHTML(
                        event.description ||
                        "Tavsif mavjud emas."
                    )}

                </div>


                <div
                    class="event-card-date"
                >

                    ${formatDateTime(
                        event.created_at
                    )}

                </div>


                ${deleteButton}

            </div>

        </article>

    `;

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


    if (
        workerEventsPage >
        totalPages
    ) {

        workerEventsPage =
            totalPages;

    }


    const start =
        (
            workerEventsPage - 1
        ) *
        EVENTS_PER_PAGE;


    const pageEvents =
        events.slice(
            start,
            start +
            EVENTS_PER_PAGE
        );


    if (
        pageEvents.length === 0
    ) {

        container.innerHTML = `

            <div class="no-orders">

                <h3>
                    🎪 Tadbirlar yo‘q
                </h3>

            </div>

        `;

    }
    else {

        container.innerHTML =
            pageEvents
                .map(
                    createWorkerEventHTML
                )
                .join("");

    }


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


/* =========================================================
   EVENT IMAGE
========================================================= */

function fileToDataURL(
    file
) {

    return new Promise(
        function(
            resolve,
            reject
        ) {

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


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   SAVE EVENT
========================================================= */

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


    const title =
        document
            .getElementById(
                "eventTitle"
            )
            .value
            .trim();


    const description =
        document
            .getElementById(
                "eventDescription"
            )
            .value
            .trim();


    const file =
        document
            .getElementById(
                "eventImage"
            )
            .files[0];


    if (!title) {

        alert(
            "❌ Tadbir nomini kiriting."
        );

        return;

    }


    let imageUrl = "";


    if (file) {

        if (
            file.size >
            3 * 1024 * 1024
        ) {

            alert(
                "❌ Rasm 3 MB dan kichik bo‘lsin."
            );

            return;

        }


        try {

            imageUrl =
                await fileToDataURL(
                    file
                );

        }
        catch (errorObject) {

            console.error(
                errorObject
            );

            alert(
                "❌ Rasmni o‘qib bo‘lmadi."
            );

            return;

        }

    }


    const result =
        await supabaseClient
            .from("events")
            .insert([
                {
                    title:
                        title,

                    description:
                        description,

                    image_url:
                        imageUrl
                }
            ]);


    if (result.error) {

        console.error(
            "EVENT INSERT ERROR:",
            result.error
        );

        alert(
            "❌ Tadbirni saqlashda xatolik."
        );

        return;

    }


    document
        .getElementById(
            "eventForm"
        )
        .reset();


    await loadWorkerEvents();


    alert(
        "✅ Tadbir muvaffaqiyatli qo‘shildi."
    );

}


/* =========================================================
   DELETE EVENT
========================================================= */

async function deleteEvent(
    id
) {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {

        alert(
            "❌ Faqat admin."
        );

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

        console.error(
            result.error
        );

        alert(
            "❌ Tadbir o‘chirilmadi."
        );

        return;

    }


    await loadWorkerEvents();


    alert(
        "✅ Tadbir o‘chirildi."
    );

}


/* =========================================================
   CUSTOMER ORDER MODAL
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


    const message =
        document.getElementById(
            "applicationMessage"
        );


    if (message) {
        message.innerHTML =
            "";
    }


    const name =
        document.getElementById(
            "applicationName"
        );


    if (name) {
        name.focus();
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
   CUSTOMER APPLICATION
========================================================= */

async function submitApplication(
    event
) {

    event.preventDefault();


    const name =
        document
            .getElementById(
                "applicationName"
            )
            .value
            .trim();


    const phone =
        document
            .getElementById(
                "applicationPhone"
            )
            .value
            .trim();


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

                ❌ Ism va telefonni kiriting.

            </div>

        `;

        return;

    }


    try {

        const result =
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


        if (result.error) {

            throw result.error;

        }


        const application =
            result.data;


        localStorage.setItem(
            "goldshow_application_id",
            String(
                application.id
            )
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
                    color:#15803d;
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
    catch (errorObject) {

        console.error(
            "APPLICATION ERROR:",
            errorObject
        );


        message.innerHTML = `

            <div class="error">

                ❌ Ariza yuborishda xatolik.

            </div>

        `;

    }

}


/* =========================================================
   APPLICATION POLLING
========================================================= */

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


        applicationTimer =
            null;

    }


    if (
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


        applicationTimer =
            null;

    }

}


/* =========================================================
   ADMIN APPLICATIONS
========================================================= */

async function loadApplications() {

    const container =
        document.getElementById(
            "applicationsList"
        );


    if (!container) {
        return;
    }


    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {

        container.innerHTML =
            "";

        return;

    }


    const result =
        await supabaseClient
            .from("applications")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (result.error) {

        console.error(
            "APPLICATION LOAD ERROR:",
            result.error
        );


        container.innerHTML = `

            <div class="no-orders">

                ❌ Arizalarni olishda xatolik.

            </div>

        `;

        return;

    }


    const applications =
        result.data || [];


    if (
        applications.length ===
        0
    ) {

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
            .map(
                createApplicationHTML
            )
            .join("");

}


/* =========================================================
   APPLICATION HTML
========================================================= */

function createApplicationHTML(
    application
) {

    let statusClass =
        "status-new";


    let statusText =
        "Yangi";


    if (
        application.status ===
        "accepted"
    ) {

        statusClass =
            "status-accepted";

        statusText =
            "Qabul qilingan";

    }


    if (
        application.status ===
        "rejected"
    ) {

        statusClass =
            "status-rejected";

        statusText =
            "Rad etilgan";

    }


    let buttons = "";


    if (
        application.status ===
        "new"
    ) {

        buttons = `

            <div
                class="application-actions"
            >

                <button
                    type="button"
                    class="accept-btn"
                    onclick="
                        updateApplicationStatus(
                            ${application.id},
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
                            ${application.id},
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

        <div
            class="application-card"
        >

            <div
                class="application-header"
            >

                <div>

                    <div
                        class="application-name"
                    >

                        👤
                        ${escapeHTML(
                            application.full_name
                        )}

                    </div>

                </div>


                <div
                    class="application-time"
                >

                    ${formatDateTime(
                        application.created_at
                    )}

                </div>

            </div>


            <div
                class="application-info"
            >

                <div
                    class="application-detail"
                >

                    <span>
                        📞 Telefon
                    </span>

                    <strong>

                        ${escapeHTML(
                            application.phone
                        )}

                    </strong>

                </div>


                <div
                    class="application-detail"
                >

                    <span>
                        🆔 Ariza
                    </span>

                    <strong>

                        #${application.id}

                    </strong>

                </div>

            </div>


            <span
                class="
                    application-status
                    ${statusClass}
                "
            >
                ${statusText}
            </span>


            ${buttons}

        </div>

    `;

}


/* =========================================================
   UPDATE APPLICATION STATUS
========================================================= */

async function updateApplicationStatus(
    id,
    status
) {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {

        alert(
            "❌ Faqat admin."
        );

        return;

    }


    const question =
        status ===
        "accepted"

            ? "Bu arizani qabul qilasizmi?"

            : "Bu arizani rad qilasizmi?";


    if (
        !confirm(
            question
        )
    ) {

        return;

    }


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


    const result =
        await supabaseClient
            .from("applications")
            .update(
                updateData
            )
            .eq(
                "id",
                id
            );


    if (result.error) {

        console.error(
            result.error
        );


        alert(
            "❌ Ariza statusini o‘zgartirib bo‘lmadi."
        );

        return;

    }


    await loadApplications();


    alert(
        status ===
        "accepted"
            ? "✅ Ariza qabul qilindi."
            : "❌ Ariza rad etildi."
    );

}


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateDate();


        /*
           LOGIN FORM
        */

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


        /*
           ORDER FORM
        */

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


        /*
           USER FORM
        */

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


        /*
           EVENT FORM
        */

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


        /*
           APPLICATION FORM
        */

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


        /*
           SEARCH
        */

        const searchInput =
            document.getElementById(
                "searchInput"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                function() {

                    displayOrders();

                }
            );

        }


        /*
           TOTAL PRICE
        */

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


        /*
           PAID
        */

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


        /*
           MODAL
        */

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
