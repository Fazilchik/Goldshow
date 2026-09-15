/* =========================================================
   GOLD SHOW - OWNER / ADMIN / ISHCHI
========================================================= */


/* =========================================================
   SUPABASE
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


if(
    window.supabase &&
    typeof window.supabase.createClient === "function"
){

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );

}


/* =========================================================
   OWNER
========================================================= */

const OWNER_USERNAME = "Otabek";

const OWNER_PASSWORD = "goldshow";


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


function escapeHTML(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


function formatMoney(value){

    return Number(value || 0)
        .toLocaleString("uz-UZ")
        + " so‘m";

}


function getToday(){

    const now = new Date();

    return `${now.getFullYear()}-${String(
        now.getMonth()+1
    ).padStart(2,"0")}-${String(
        now.getDate()
    ).padStart(2,"0")}`;

}


function formatDate(value){

    if(!value) return "—";

    const p = String(value).split("-");

    if(p.length !== 3)
        return String(value);

    const y = Number(p[0]);
    const m = Number(p[1]);
    const d = Number(p[2]);

    if(!y || !m || !d)
        return String(value);

    return `${d}-${UZ_MONTHS[m-1]} ${y}-yil`;

}


function formatDateTime(value){

    if(!value)
        return "—";

    const d = new Date(value);

    if(Number.isNaN(d.getTime()))
        return "—";

    const day =
        String(d.getDate()).padStart(2,"0");

    const month =
        String(d.getMonth()+1).padStart(2,"0");

    const year =
        d.getFullYear();

    const hour =
        String(d.getHours()).padStart(2,"0");

    const minute =
        String(d.getMinutes()).padStart(2,"0");

    return `${day}.${month}.${year} ${hour}:${minute}`;

}


function updateDate(){

    const el =
        document.getElementById("todayDate");

    if(!el) return;

    const d = new Date();

    el.textContent =
        `${d.getDate()}-${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}-yil`;

}


/* =========================================================
   ROLE HELPERS
========================================================= */

function isOwner(){

    return currentUser?.role === "owner";

}


function isAdmin(){

    return currentUser?.role === "admin";

}


function canManage(){

    return (
        currentUser?.role === "owner" ||
        currentUser?.role === "admin"
    );

}


function canManageUsers(){

    return canManage();

}


/* =========================================================
   PAGE CONTROL
========================================================= */

function hideAllPages(){

    [
        "landingPage",
        "loginPage",
        "customerPage",
        "mainPage"
    ].forEach(id => {

        document
            .getElementById(id)
            ?.classList.add("hidden");

    });

}


function backToLanding(){

    currentUser = null;

    if(applicationTimer)
        clearInterval(applicationTimer);

    applicationTimer = null;

    hideAllPages();

    document
        .getElementById("landingPage")
        ?.classList.remove("hidden");

    closeOrderModal();

}


async function openCustomerPage(){

    hideAllPages();

    document
        .getElementById("customerPage")
        ?.classList.remove("hidden");

    customerEventsPage = 1;

    await loadCustomerEvents();

    restoreApplicationStatus();

}


function openWorkerLogin(){

    hideAllPages();

    document
        .getElementById("loginPage")
        ?.classList.remove("hidden");

    document
        .getElementById("username")
        ?.focus();

}


/* =========================================================
   LOGIN
========================================================= */

async function login(event){

    if(event)
        event.preventDefault();

    const usernameElement =
        document.getElementById("username");

    const passwordElement =
        document.getElementById("password");

    const errorElement =
        document.getElementById("loginError");


    if(
        !usernameElement ||
        !passwordElement ||
        !errorElement
    )
        return;


    const username =
        usernameElement.value.trim();

    const password =
        passwordElement.value.trim();


    errorElement.textContent = "";


    if(!username || !password){

        errorElement.textContent =
            "❌ Login va parolni kiriting.";

        return;
    }


    if(!supabaseClient){

        errorElement.textContent =
            "❌ Supabase ulanmagan.";

        return;
    }


    try{

        const result =
            await supabaseClient
                .from("users")
                .select(
                    "id,name,username,password,role"
                )
                .eq("username",username)
                .eq("password",password)
                .limit(1);


        if(result.error){

            errorElement.textContent =
                "❌ " + result.error.message;

            return;
        }


        if(!result.data?.length){

            errorElement.textContent =
                "❌ Login yoki parol noto‘g‘ri.";

            return;
        }


        const user =
            result.data[0];


        const role =
            String(user.role || "")
                .trim()
                .toLowerCase();


        if(
            ![
                "owner",
                "admin",
                "user"
            ].includes(role)
        ){

            errorElement.textContent =
                "❌ User roli noto‘g‘ri.";

            return;
        }


        currentUser = {

            id:user.id,

            name:user.name,

            username:user.username,

            role:role

        };


        localStorage.setItem(
            "goldshow_user_id",
            String(user.id)
        );


        usernameElement.value = "";

        passwordElement.value = "";


        if(role === "owner"){

            await openOwnerPage();

        }

        else if(role === "admin"){

            await openAdminPage();

        }

        else{

            await openWorkerPage();

        }


    }catch(err){

        console.error(err);

        errorElement.textContent =
            "❌ " +
            (
                err.message ||
                "Kirishda xatolik."
            );

    }

}


/* =========================================================
   OPEN PANELS
========================================================= */

async function openOwnerPage(){

    await prepareMainPage(
        "OWNER PANEL 👑"
    );

    toggleRoleMenus(true);

    await showPage(
        "dashboardPage"
    );

}


async function openAdminPage(){

    await prepareMainPage(
        "ADMIN PANEL"
    );

    toggleRoleMenus(true);

    await showPage(
        "dashboardPage"
    );

}


async function openWorkerPage(){

    await prepareMainPage(
        "ISHCHI PANEL"
    );

    toggleRoleMenus(false);

    await showPage(
        "dashboardPage"
    );

}


/* =========================================================
   MENUS
========================================================= */

function toggleRoleMenus(isManager){

    [
        "addOrderMenu",
        "applicationsMenu",
        "usersMenu"
    ].forEach(id => {

        const el =
            document.getElementById(id);

        if(el){

            el.style.display =
                isManager
                ? "block"
                : "none";

        }

    });


    document
        .getElementById("workerEventAdminForm")
        ?.classList.toggle(
            "hidden",
            !isManager
        );

}


/* =========================================================
   MAIN PAGE
========================================================= */

async function prepareMainPage(panelTitle){

    hideAllPages();

    document
        .getElementById("mainPage")
        ?.classList.remove("hidden");


    if(currentUser){

        const currentUserElement =
            document.getElementById("currentUser");

        const roleElement =
            document.getElementById("userRole");

        const avatarElement =
            document.getElementById("userAvatar");


        if(currentUserElement){

            currentUserElement.textContent =
                currentUser.name;

        }


        if(roleElement){

            if(currentUser.role === "owner"){

                roleElement.textContent =
                    "OWNER 👑";

            }

            else if(currentUser.role === "admin"){

                roleElement.textContent =
                    "ADMIN";

            }

            else{

                roleElement.textContent =
                    "ISHCHI";

            }

        }


        if(avatarElement){

            avatarElement.textContent =
                (
                    currentUser.name ||
                    "G"
                )
                .charAt(0)
                .toUpperCase();

        }

    }


    document
        .getElementById("pageTitle")
        .textContent =
            panelTitle;


    updateDate();


    await updateDashboard();

    await displayOrders();

    await loadWorkerEvents();


    if(canManageUsers()){

        await displayUsers();

        await loadApplications();

    }

}


async function openMainPage(){

    if(!currentUser)
        return;


    if(currentUser.role === "owner"){

        await openOwnerPage();

    }

    else if(currentUser.role === "admin"){

        await openAdminPage();

    }

    else{

        await openWorkerPage();

    }

}


function logout(){

    if(applicationTimer)
        clearInterval(applicationTimer);

    applicationTimer = null;

    localStorage.removeItem(
        "goldshow_user_id"
    );

    backToLanding();

}


/* =========================================================
   SHOW PAGE
========================================================= */

async function showPage(
    pageId,
    button = null
){

    const managerOnly = [

        "usersPage",

        "applicationsPage",

        "addOrderPage"

    ];


    if(
        managerOnly.includes(pageId) &&
        !canManage()
    ){

        alert(
            "❌ Bu sahifa faqat Admin yoki Owner uchun."
        );

        return;
    }


    document
        .querySelectorAll(
            "#mainPage .page"
        )
        .forEach(
            p => p.classList.add("hidden")
        );


    const target =
        document.getElementById(pageId);


    if(!target)
        return;


    target.classList.remove("hidden");


    const titles = {

        dashboardPage:
            isOwner()
                ? "OWNER PANEL 👑"
                : isAdmin()
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


    document
        .getElementById("pageTitle")
        .textContent =
            titles[pageId] ||
            "Gold Show";


    document
        .querySelectorAll(
            "#mainPage .menu-btn"
        )
        .forEach(
            b => b.classList.remove("active")
        );


    if(button){

        button.classList.add("active");

    }


    if(pageId === "dashboardPage")
        await updateDashboard();


    if(pageId === "ordersPage")
        await displayOrders();


    if(pageId === "addOrderPage")
        calculateRemaining();


    if(pageId === "workerEventsPage")
        await loadWorkerEvents();


    if(pageId === "applicationsPage")
        await loadApplications();


    if(pageId === "usersPage")
        await displayUsers();

}


/* =========================================================
   ORDER FORM
========================================================= */

function calculateRemaining(){

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


    const el =
        document.getElementById(
            "remaining"
        );


    if(el){

        el.textContent =
            formatMoney(
                total - paid
            );

    }

}


function getOrderFromForm(){

    const v =
        id =>
            document
                .getElementById(id)
                ?.value ?? "";


    return {

        client_name:
            v("clientName").trim(),

        client_phone:
            v("clientPhone").trim(),

        location:
            v("location").trim(),

        event_date:
            v("eventDate"),

        event_time:
            v("eventTime"),

        screen_height:
            Number(v("screenHeight")) || 0,

        screen_width:
            Number(v("screenWidth")) || 0,

        stage_width:
            Number(v("stageWidth")) || 0,

        stage_length:
            Number(v("stageLength")) || 0,

        curtain:
            v("curtain") || "Yo‘q",

        lights:
            Number(v("lights")) || 0,

        galava:
            Number(v("galava")) || 0,

        ledwash:
            Number(v("ledwash")) || 0,

        confetti:
            Number(v("confetti")) || 0,

        dim:
            Number(v("dim")) || 0,

        firework:
            Number(v("firework")) || 0,

        side_screens:
            Number(v("sideScreens")) || 0,

        side_height:
            Number(v("sideHeight")) || 0,

        side_width:
            Number(v("sideWidth")) || 0,

        paid:
            Number(v("paid")) || 0,

        total_price:
            Number(v("totalPrice")) || 0

    };

}


/* =========================================================
   SAVE ORDER
========================================================= */

async function saveOrderFromForm(event){

    event.preventDefault();


    if(!canManage()){

        alert(
            "❌ Faqat Admin yoki Owner zakas qo‘sha oladi."
        );

        return;
    }


    const order =
        getOrderFromForm();


    if(!order.client_name){

        alert(
            "❌ Mijoz ismini kiriting."
        );

        return;
    }


    if(!order.client_phone){

        alert(
            "❌ Telefon raqamini kiriting."
        );

        return;
    }


    if(!order.location){

        alert(
            "❌ Manzilni kiriting."
        );

        return;
    }


    if(!order.event_date){

        alert(
            "❌ Tadbir sanasini tanlang."
        );

        return;
    }


    if(!order.event_time){

        alert(
            "❌ Tadbir vaqtini tanlang."
        );

        return;
    }


    order.remaining =
        order.total_price -
        order.paid;


    const editingId =
        document
            .getElementById(
                "editingOrderId"
            )
            ?.value
            .trim();


    try{

        const result =
            editingId

            ?

            await supabaseClient
                .from("orders")
                .update(order)
                .eq(
                    "id",
                    Number(editingId)
                )
                .select()
                .single()

            :

            await supabaseClient
                .from("orders")
                .insert(order)
                .select()
                .single();


        if(result.error)
            throw result.error;


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


    }catch(err){

        console.error(err);

        alert(
            "❌ Zakas qo‘shilmadi:\n" +
            (
                err.message ||
                "Noma’lum xatolik"
            )
        );

    }

}


/* =========================================================
   GET ORDERS
========================================================= */

async function getOrders(){

    if(!supabaseClient)
        return [];


    const result =
        await supabaseClient
            .from("orders")
            .select("*")
            .order(
                "event_date",
                {ascending:false}
            )
            .order(
                "event_time",
                {ascending:false}
            );


    if(result.error){

        console.error(
            result.error
        );

        return [];

    }


    return result.data || [];

}


/* =========================================================
   DISPLAY ORDERS
========================================================= */

async function displayOrders(){

    const container =
        document.getElementById(
            "ordersList"
        );


    if(!container)
        return;


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


    if(search){

        orders =
            orders.filter(
                o =>
                    String(
                        o.client_name
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        o.client_phone
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        o.location
                    )
                    .toLowerCase()
                    .includes(search)
            );

    }


    if(!orders.length){

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


/* =========================================================
   ORDER HTML
========================================================= */

function createOrderHTML(order){

    const managerButtons =
        canManage()

        ?

        `
        <div
            class="user-actions"
            style="margin-top:15px">

            <button
                type="button"
                class="btn-edit"
                onclick="editOrder(${Number(order.id)})">

                ✏️ Tahrirlash

            </button>

            <button
                type="button"
                class="btn-delete"
                onclick="deleteOrder(${Number(order.id)})">

                🗑 O‘chirish

            </button>

        </div>
        `

        :

        "";


    return `

    <div class="order-card">

        <div class="order-header">

            <div>

                <div class="order-client">
                    👤 ${escapeHTML(order.client_name)}
                </div>

                <div>
                    📞 ${escapeHTML(order.client_phone)}
                </div>

            </div>

            <div class="order-date">

                📅 ${formatDate(order.event_date)}

                <br>

                ⏰ ${escapeHTML(order.event_time || "")}

            </div>

        </div>


        <div class="order-grid">


            <div class="info">

                <span>
                    📍 Manzil
                </span>

                <strong>
                    ${escapeHTML(order.location)}
                </strong>

            </div>


            <div class="info">

                <span>
                    🖥 Ekran
                </span>

                <strong>
                    ${order.screen_height || 0}m ×
                    ${order.screen_width || 0}m
                </strong>

            </div>


            <div class="info">

                <span>
                    🎭 Sahna
                </span>

                <strong>
                    ${order.stage_width || 0}m ×
                    ${order.stage_length || 0}m
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
                    ${order.side_screens || 0} dona
                    <br>
                    ${order.side_height || 0}m ×
                    ${order.side_width || 0}m
                </strong>

            </div>


            <div class="info">

                <span>
                    🎭 Parda
                </span>

                <strong>
                    ${escapeHTML(order.curtain || "Yo‘q")}
                </strong>

            </div>


            <div class="info">

                <span>
                    💰 Jami
                </span>

                <strong class="money">
                    ${formatMoney(order.total_price)}
                </strong>

            </div>


            <div class="info">

                <span>
                    💵 To‘langan
                </span>

                <strong class="money">
                    ${formatMoney(order.paid)}
                </strong>

            </div>


            <div class="info">

                <span>
                    ⚠️ Qolgan
                </span>

                <strong class="remaining-money">
                    ${formatMoney(order.remaining)}
                </strong>

            </div>


        </div>


        ${managerButtons}

    </div>

    `;

}


/* =========================================================
   EDIT ORDER
========================================================= */

async function editOrder(id){

    if(!canManage())
        return;


    const result =
        await supabaseClient
            .from("orders")
            .select("*")
            .eq("id",id)
            .single();


    if(result.error){

        alert(
            "❌ Zakas topilmadi.\n" +
            result.error.message
        );

        return;
    }


    const o =
        result.data;


    const map = {

        editingOrderId:"id",

        clientName:"client_name",

        clientPhone:"client_phone",

        location:"location",

        eventDate:"event_date",

        eventTime:"event_time",

        screenHeight:"screen_height",

        screenWidth:"screen_width",

        stageWidth:"stage_width",

        stageLength:"stage_length",

        curtain:"curtain",

        lights:"lights",

        galava:"galava",

        ledwash:"ledwash",

        confetti:"confetti",

        dim:"dim",

        firework:"firework",

        sideScreens:"side_screens",

        sideHeight:"side_height",

        sideWidth:"side_width",

        paid:"paid",

        totalPrice:"total_price"

    };


    Object
        .entries(map)
        .forEach(
            ([id,key]) => {

                const el =
                    document.getElementById(id);

                if(el)
                    el.value =
                        o[key] ?? "";

            }
        );


    document
        .getElementById(
            "editBadge"
        )
        ?.classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "cancelEditBtn"
        )
        ?.classList.remove(
            "hidden"
        );


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


function resetOrderForm(){

    document
        .getElementById(
            "orderForm"
        )
        ?.reset();


    document
        .getElementById(
            "editingOrderId"
        ).value = "";


    document
        .getElementById(
            "editBadge"
        )
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById(
            "cancelEditBtn"
        )
        ?.classList.add(
            "hidden"
        );


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


function cancelEditOrder(){

    resetOrderForm();

    showPage(
        "ordersPage"
    );

}


/* =========================================================
   DELETE ORDER
========================================================= */

async function deleteOrder(id){

    if(!canManage())
        return;


    if(
        !confirm(
            "Bu zakasni o‘chirmoqchimisiz?"
        )
    )
        return;


    const result =
        await supabaseClient
            .from("orders")
            .delete()
            .eq("id",id);


    if(result.error){

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


/* =========================================================
   DASHBOARD
========================================================= */

async function updateDashboard(){

    const orders =
        await getOrders();


    const today =
        getToday();


    const todayOrders =
        orders.filter(
            o =>
                o.event_date === today
        );


    const now =
        new Date();


    const upcoming =
        orders.filter(o => {

            if(
                !o.event_date ||
                !o.event_time
            )
                return false;


            const d =
                new Date(
                    `${o.event_date}T${o.event_time}`
                );


            const diff =
                d.getTime() -
                now.getTime();


            return (
                diff > 0 &&
                diff <=
                7 * 86400000
            );

        });


    const totalMoney =
        orders.reduce(
            (s,o) =>
                s +
                Number(
                    o.total_price || 0
                ),
            0
        );


    const totalOrdersEl =
        document.getElementById(
            "totalOrders"
        );


    const todayOrdersEl =
        document.getElementById(
            "todayOrders"
        );


    const upcomingOrdersEl =
        document.getElementById(
            "upcomingOrders"
        );


    const totalMoneyEl =
        document.getElementById(
            "totalMoney"
        );


    if(totalOrdersEl)
        totalOrdersEl.textContent =
            orders.length;


    if(todayOrdersEl)
        todayOrdersEl.textContent =
            todayOrders.length;


    if(upcomingOrdersEl)
        upcomingOrdersEl.textContent =
            upcoming.length;


    if(totalMoneyEl)
        totalMoneyEl.textContent =
            formatMoney(totalMoney);


    await displayTodayOrders();

    await checkNotifications();

}


/* =========================================================
   TODAY ORDERS
========================================================= */

async function displayTodayOrders(){

    const c =
        document.getElementById(
            "todayOrdersList"
        );


    if(!c)
        return;


    const orders =
        (
            await getOrders()
        )
        .filter(
            o =>
                o.event_date ===
                getToday()
        );


    c.innerHTML =
        orders.length

        ?

        orders
            .map(createOrderHTML)
            .join("")

        :

        `
        <div class="no-orders">

            <h3>
                🎉 Bugun zakas yo‘q
            </h3>

            <p>
                Bugungi kun uchun zakas mavjud emas.
            </p>

        </div>
        `;

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

async function checkNotifications(){

    const c =
        document.getElementById(
            "notifications"
        );


    if(!c)
        return;


    const now =
        new Date();


    let html = "";


    (
        await getOrders()
    )
    .forEach(o => {

        if(
            !o.event_date ||
            !o.event_time
        )
            return;


        const d =
            new Date(
                `${o.event_date}T${o.event_time}`
            );


        const h =
            (
                d - now
            ) / 3600000;


        if(
            h > 0 &&
            h <= 24
        ){

            html += `

            <div class="notification">

                <strong>
                    🔔 Tadbir yaqinlashmoqda!
                </strong>

                👤 ${escapeHTML(o.client_name)}

                <br>

                📅 ${formatDate(o.event_date)}

                <br>

                ⏰ ${escapeHTML(o.event_time)}

                <br>

                📍 ${escapeHTML(o.location)}

            </div>

            `;

        }

    });


    c.innerHTML =
        html;

}


/* =========================================================
   USERS
========================================================= */

async function displayUsers(){

    const c =
        document.getElementById(
            "usersList"
        );


    if(
        !c ||
        !canManageUsers()
    )
        return;


    const result =
        await supabaseClient
            .from("users")
            .select(
                "id,name,username,password,role,created_at"
            )
            .order(
                "id",
                {ascending:true}
            );


    if(result.error){

        c.innerHTML = `

            <div class="no-orders">

                ❌
                ${escapeHTML(
                    result.error.message
                )}

            </div>

        `;

        return;
    }


    const users =
        result.data || [];


    if(!users.length){

        c.innerHTML = `

            <div class="no-orders">

                <h3>
                    👥 Userlar yo‘q
                </h3>

            </div>

        `;

        return;
    }


    c.innerHTML =
        users
            .map(
                createUserHTML
            )
            .join("");

}


/* =========================================================
   USER HTML
========================================================= */

function createUserHTML(user){

    const role =
        String(
            user.role || ""
        )
        .toLowerCase();


    let roleText =
        "ISHCHI";


    let roleClass =
        "worker-role";


    if(role === "owner"){

        roleText =
            "OWNER 👑";

        roleClass =
            "owner-role";

    }


    else if(role === "admin"){

        roleText =
            "ADMIN";

        roleClass =
            "admin-role";

    }


    let canEdit =
        false;


    /*
        OWNER:
        - Adminni boshqaradi
        - Ishchini boshqaradi
        - Ownerga tegmaydi

        ADMIN:
        - Ishchini boshqaradi
        - Adminni boshqara olmaydi
        - Ownerga tegolmaydi
    */


    if(isOwner()){

        if(role !== "owner"){

            canEdit = true;

        }

    }


    else if(isAdmin()){

        if(role === "user"){

            canEdit = true;

        }

    }


    let buttons = "";


    if(canEdit){

        buttons = `

            <button
                type="button"
                class="btn-view"
                onclick="showUserPassword(${Number(user.id)})">

                👁 Parol

            </button>


            <button
                type="button"
                class="btn-edit"
                onclick="changeUserPassword(${Number(user.id)})">

                🔑 Parolni o‘zgartirish

            </button>


            <button
                type="button"
                class="btn-edit"
                onclick="changeUsername(${Number(user.id)})">

                ✏️ Login

            </button>


            <button
                type="button"
                class="btn-delete"
                onclick="deleteUser(${Number(user.id)})">

                🗑 O‘chirish

            </button>

        `;

    }


    else{

        buttons = `

            <span class="protected-user">

                🔒 Himoyalangan

            </span>

        `;

    }


    return `

    <div class="user-card">

        <div class="user-card-header">

            <div>

                <div class="user-card-name">

                    👤
                    ${escapeHTML(user.name)}

                </div>

                <span
                    class="user-role ${roleClass}">

                    ${roleText}

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
                    data-visible="false">

                    ••••••••

                </strong>

            </div>

        </div>


        <div class="user-actions">

            ${buttons}

        </div>

    </div>

    `;

}


/* =========================================================
   GET USER
========================================================= */

async function getUser(id){

    const r =
        await supabaseClient
            .from("users")
            .select("*")
            .eq("id",id)
            .single();


    if(r.error){

        console.error(
            r.error
        );

        return null;

    }


    return r.data;

}


/* =========================================================
   SHOW PASSWORD
========================================================= */

async function showUserPassword(id){

    const user =
        await getUser(id);


    if(!user)
        return;


    const role =
        String(
            user.role || ""
        )
        .toLowerCase();


    if(
        isAdmin() &&
        role !== "user"
    ){

        alert(
            "❌ Admin faqat Ishchi parolini ko‘rishi mumkin."
        );

        return;
    }


    if(
        isOwner() &&
        role === "owner"
    ){

        alert(
            "❌ Owner hisobini bu yerdan ko‘rish mumkin emas."
        );

        return;
    }


    const el =
        document.getElementById(
            "password-" + id
        );


    if(!el)
        return;


    if(
        el.dataset.visible === "true"
    ){

        el.textContent =
            "••••••••";

        el.dataset.visible =
            "false";

        return;
    }


    el.textContent =
        user.password ||
        "Parol mavjud emas";


    el.dataset.visible =
        "true";

}


/* =========================================================
   CREATE USER
========================================================= */

async function createUser(event){

    event.preventDefault();


    if(!canManage()){

        alert(
            "❌ Sizda user yaratish huquqi yo‘q."
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


    if(
        !name ||
        !username ||
        !password
    ){

        alert(
            "❌ Barcha maydonlarni to‘ldiring."
        );

        return;
    }


    /*
       Ikkinchi Owner yaratishga
       hech qachon ruxsat berilmaydi.
    */

    if(role === "owner"){

        alert(
            "❌ Yangi Owner yaratib bo‘lmaydi."
        );

        return;
    }


    /*
       Admin faqat Ishchi yaratadi.
    */

    if(
        isAdmin() &&
        role !== "user"
    ){

        alert(
            "❌ Admin faqat Ishchi yaratishi mumkin."
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


    if(check.error){

        alert(
            "❌ " +
            check.error.message
        );

        return;
    }


    if(check.data?.length){

        alert(
            "❌ Bu login allaqachon mavjud."
        );

        return;
    }


    const r =
        await supabaseClient
            .from("users")
            .insert({

                name,

                username,

                password,

                role

            });


    if(r.error){

        alert(
            "❌ " +
            r.error.message
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
   CHANGE PASSWORD
========================================================= */

async function changeUserPassword(id){

    const user =
        await getUser(id);


    if(!user)
        return;


    const role =
        String(
            user.role || ""
        )
        .toLowerCase();


    if(
        isAdmin() &&
        role !== "user"
    ){

        alert(
            "❌ Admin Admin yoki Owner parolini o‘zgartira olmaydi."
        );

        return;
    }


    if(
        isOwner() &&
        role === "owner"
    ){

        alert(
            "❌ Owner hisobini bu yerdan o‘zgartirib bo‘lmaydi."
        );

        return;
    }


    const p =
        prompt(
            "Yangi parolni kiriting:",
            ""
        );


    if(p === null)
        return;


    if(!p.trim()){

        alert(
            "❌ Parol bo‘sh bo‘lmasligi kerak."
        );

        return;
    }


    const r =
        await supabaseClient
            .from("users")
            .update({
                password:p.trim()
            })
            .eq("id",id);


    if(r.error){

        alert(
            "❌ " +
            r.error.message
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

async function changeUsername(id){

    const user =
        await getUser(id);


    if(!user)
        return;


    const role =
        String(
            user.role || ""
        )
        .toLowerCase();


    if(
        isAdmin() &&
        role !== "user"
    ){

        alert(
            "❌ Admin Admin yoki Owner loginini o‘zgartira olmaydi."
        );

        return;
    }


    if(
        isOwner() &&
        role === "owner"
    ){

        alert(
            "❌ Owner loginini bu yerdan o‘zgartirib bo‘lmaydi."
        );

        return;
    }


    const u =
        prompt(
            "Yangi loginni kiriting:",
            user.username
        );


    if(u === null)
        return;


    const username =
        u.trim();


    if(!username){

        alert(
            "❌ Login bo‘sh bo‘lmasligi kerak."
        );

        return;
    }


    const c =
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


    if(c.error){

        alert(
            "❌ " +
            c.error.message
        );

        return;
    }


    if(c.data?.length){

        alert(
            "❌ Bu login allaqachon mavjud."
        );

        return;
    }


    const r =
        await supabaseClient
            .from("users")
            .update({
                username
            })
            .eq(
                "id",
                id
            );


    if(r.error){

        alert(
            "❌ " +
            r.error.message
        );

        return;
    }


    if(
        Number(id) ===
        Number(currentUser.id)
    ){

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

async function deleteUser(id){

    if(!canManage())
        return;


    if(
        Number(id) ===
        Number(currentUser.id)
    ){

        alert(
            "❌ O‘zingizni o‘chira olmaysiz."
        );

        return;
    }


    const user =
        await getUser(id);


    if(!user)
        return;


    const role =
        String(
            user.role || ""
        )
        .toLowerCase();


    /*
       Ownerni hech kim o‘chira olmaydi.
    */

    if(role === "owner"){

        alert(
            "❌ Ownerni o‘chirish mumkin emas."
        );

        return;
    }


    /*
       Admin boshqa Adminni o‘chira olmaydi.
    */

    if(
        isAdmin() &&
        role === "admin"
    ){

        alert(
            "❌ Admin boshqa Adminni o‘chira olmaydi."
        );

        return;
    }


    if(
        !confirm(
            `${user.name} userini o‘chirmoqchimisiz?`
        )
    )
        return;


    const r =
        await supabaseClient
            .from("users")
            .delete()
            .eq(
                "id",
                id
            );


    if(r.error){

        alert(
            "❌ " +
            r.error.message
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

async function getEvents(){

    const r =
        await supabaseClient
            .from("events")
            .select("*")
            .order(
                "created_at",
                {ascending:false}
            );


    if(r.error){

        console.error(
            r.error
        );

        return [];

    }


    return r.data || [];

}


function eventImage(event){

    if(event.image_url){

        return `

        <img
            src="${escapeHTML(event.image_url)}"
            alt="${escapeHTML(event.title)}"
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
        ">

        🎪

    </div>

    `;

}


function createEventHTML(event){

    return `

    <article class="event-card">

        ${eventImage(event)}

        <div class="event-card-body">

            <div class="event-card-title">

                ${escapeHTML(event.title)}

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


function createWorkerEventHTML(event){

    const del =
        canManage()

        ?

        `

        <div class="event-admin-actions">

            <button
                type="button"
                class="btn-delete"
                onclick="deleteEvent(${Number(event.id)})">

                🗑 O‘chirish

            </button>

        </div>

        `

        :

        "";


    return `

    <article class="event-card">

        ${eventImage(event)}

        <div class="event-card-body">

            <div class="event-card-title">

                ${escapeHTML(event.title)}

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

            ${del}

        </div>

    </article>

    `;

}


/* =========================================================
   CUSTOMER EVENTS
========================================================= */

async function loadCustomerEvents(){

    const c =
        document.getElementById(
            "customerEventsList"
        );


    const p =
        document.getElementById(
            "customerPagination"
        );


    if(!c || !p)
        return;


    const events =
        await getEvents();


    const total =
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
            total
        );


    const start =
        (
            customerEventsPage - 1
        ) *
        EVENTS_PER_PAGE;


    const page =
        events.slice(
            start,
            start + EVENTS_PER_PAGE
        );


    c.innerHTML =
        page.length

        ?

        page
            .map(createEventHTML)
            .join("")

        :

        `
        <div class="no-orders">

            <h3>
                🎪 Hozircha tadbirlar yo‘q
            </h3>

            <p>
                Tez orada yangi tadbirlar qo‘shiladi.
            </p>

        </div>
        `;


    renderPagination(
        p,
        total,
        customerEventsPage,
        pageNum => {

            customerEventsPage =
                pageNum;

            loadCustomerEvents();

            window.scrollTo({
                top:0,
                behavior:"smooth"
            });

        }
    );

}


/* =========================================================
   WORKER EVENTS
========================================================= */

async function loadWorkerEvents(){

    const c =
        document.getElementById(
            "workerEventsList"
        );


    const p =
        document.getElementById(
            "workerPagination"
        );


    if(!c || !p)
        return;


    const events =
        await getEvents();


    const total =
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
            total
        );


    const start =
        (
            workerEventsPage - 1
        ) *
        EVENTS_PER_PAGE;


    const page =
        events.slice(
            start,
            start + EVENTS_PER_PAGE
        );


    c.innerHTML =
        page.length

        ?

        page
            .map(
                createWorkerEventHTML
            )
            .join("")

        :

        `
        <div class="no-orders">

            <h3>
                🎪 Tadbirlar yo‘q
            </h3>

        </div>
        `;


    renderPagination(
        p,
        total,
        workerEventsPage,
        pageNum => {

            workerEventsPage =
                pageNum;

            loadWorkerEvents();

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
){

    if(totalPages <= 1){

        container.innerHTML =
            "";

        return;
    }


    let html = `

        <button
            type="button"
            data-page="${currentPage - 1}"
            ${currentPage === 1 ? "disabled" : ""}>

            ← Oldingi

        </button>

    `;


    for(
        let i = 1;
        i <= totalPages;
        i++
    ){

        html += `

            <button
                type="button"
                data-page="${i}"
                class="${i === currentPage ? "active" : ""}">

                ${i}

            </button>

        `;

    }


    html += `

        <button
            type="button"
            data-page="${currentPage + 1}"
            ${currentPage === totalPages ? "disabled" : ""}>

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
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    const page =
                        Number(
                            btn.dataset.page
                        );


                    if(
                        page >= 1 &&
                        page <= totalPages
                    ){

                        onPage(page);

                    }

                }
            );

        });

}


/* =========================================================
   IMAGE
========================================================= */

function fileToDataURL(file){

    return new Promise(
        (resolve,reject) => {

            const reader =
                new FileReader();


            reader.onload =
                () =>
                    resolve(
                        reader.result
                    );


            reader.onerror =
                () =>
                    reject(
                        new Error(
                            "Rasm o‘qilmadi."
                        )
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

async function saveEventFromForm(event){

    event.preventDefault();


    if(!canManage()){

        alert(
            "❌ Faqat Admin yoki Owner tadbir qo‘sha oladi."
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


    if(!title){

        alert(
            "❌ Tadbir nomini kiriting."
        );

        return;
    }


    let imageUrl = "";


    try{

        if(file){

            if(
                !file.type.startsWith(
                    "image/"
                )
            ){

                alert(
                    "❌ Faqat rasm fayli yuklang."
                );

                return;
            }


            if(
                file.size >
                2 * 1024 * 1024
            ){

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


        const r =
            await supabaseClient
                .from("events")
                .insert({

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


        if(r.error){

            alert(
                "❌ Tadbir qo‘shilmadi:\n" +
                r.error.message
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

        await loadCustomerEvents();


        alert(
            "✅ Tadbir muvaffaqiyatli qo‘shildi."
        );


    }catch(err){

        console.error(err);

        alert(
            "❌ Tadbir qo‘shishda xatolik:\n" +
            (
                err.message ||
                "Noma’lum xatolik"
            )
        );

    }

}


/* =========================================================
   DELETE EVENT
========================================================= */

async function deleteEvent(id){

    if(!canManage())
        return;


    if(
        !confirm(
            "Bu tadbirni o‘chirmoqchimisiz?"
        )
    )
        return;


    const r =
        await supabaseClient
            .from("events")
            .delete()
            .eq(
                "id",
                id
            );


    if(r.error){

        alert(
            "❌ " +
            r.error.message
        );

        return;
    }


    await loadWorkerEvents();


    await loadCustomerEvents();


    alert(
        "✅ Tadbir o‘chirildi."
    );

}


/* =========================================================
   APPLICATION MODAL
========================================================= */

function openOrderModal(){

    const m =
        document.getElementById(
            "orderModal"
        );


    if(!m)
        return;


    m.classList.remove(
        "hidden"
    );


    document
        .getElementById(
            "applicationMessage"
        )
        .innerHTML = "";


    document
        .getElementById(
            "applicationName"
        )
        ?.focus();

}


function closeOrderModal(){

    document
        .getElementById(
            "orderModal"
        )
        ?.classList.add(
            "hidden"
        );

}


/* =========================================================
   APPLICATION
========================================================= */

async function submitApplication(event){

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


    if(!name || !phone){

        message.innerHTML = `

            <div class="error">

                ❌ Ism va telefon raqamini kiriting.

            </div>

        `;

        return;
    }


    try{

        const r =
            await supabaseClient
                .from("applications")
                .insert({

                    full_name:name,

                    phone:phone,

                    status:"new"

                })
                .select()
                .single();


        if(r.error)
            throw r.error;


        const app =
            r.data;


        localStorage.setItem(
            "goldshow_application_id",
            String(app.id)
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
                ">

                ✅ Arizangiz yuborildi!

                <br><br>

                <strong>
                    Ariza raqami: #${app.id}
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
            app.id,
            phone
        );


    }catch(err){

        console.error(err);

        message.innerHTML = `

            <div class="error">

                ❌ Ariza yuborishda xatolik:

                <br>

                ${escapeHTML(
                    err.message ||
                    "Noma’lum xatolik"
                )}

            </div>

        `;

    }

}


/* =========================================================
   APPLICATION STATUS
========================================================= */

function startApplicationPolling(
    id,
    phone
){

    if(applicationTimer)
        clearInterval(
            applicationTimer
        );


    checkApplicationStatus(
        id,
        phone
    );


    applicationTimer =
        setInterval(
            () =>
                checkApplicationStatus(
                    id,
                    phone
                ),
            8000
        );

}


function restoreApplicationStatus(){

    const id =
        localStorage.getItem(
            "goldshow_application_id"
        );


    const phone =
        localStorage.getItem(
            "goldshow_application_phone"
        );


    if(
        id &&
        phone
    ){

        startApplicationPolling(
            id,
            phone
        );

    }

}


async function checkApplicationStatus(
    id,
    phone
){

    const r =
        await supabaseClient
            .from("applications")
            .select(
                "id,status,full_name,phone,created_at"
            )
            .eq("id",id)
            .eq("phone",phone)
            .maybeSingle();


    if(
        r.error ||
        !r.data
    )
        return;


    const box =
        document.getElementById(
            "customerStatusBox"
        );


    if(!box)
        return;


    if(
        r.data.status ===
        "accepted"
    ){

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
            #${r.data.id}

        `;


        clearInterval(
            applicationTimer
        );


        applicationTimer =
            null;

    }


    else if(
        r.data.status ===
        "rejected"
    ){

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
            #${r.data.id}

        `;


        clearInterval(
            applicationTimer
        );


        applicationTimer =
            null;

    }

}


/* =========================================================
   APPLICATIONS ADMIN / OWNER
========================================================= */

async function loadApplications(){

    const c =
        document.getElementById(
            "applicationsList"
        );


    if(
        !c ||
        !canManage()
    )
        return;


    const r =
        await supabaseClient
            .from("applications")
            .select("*")
            .order(
                "created_at",
                {ascending:false}
            );


    if(r.error){

        c.innerHTML = `

            <div class="no-orders">

                ❌
                ${escapeHTML(
                    r.error.message
                )}

            </div>

        `;

        return;
    }


    const apps =
        r.data || [];


    c.innerHTML =
        apps.length

        ?

        apps
            .map(
                createApplicationHTML
            )
            .join("")

        :

        `

        <div class="no-orders">

            <h3>
                📭 Arizalar yo‘q
            </h3>

            <p>
                Hozircha buyurtmachi arizasi kelmagan.
            </p>

        </div>

        `;

}


/* =========================================================
   APPLICATION HTML
========================================================= */

function createApplicationHTML(a){

    const statuses = {

        new:[
            "status-new",
            "Yangi"
        ],

        accepted:[
            "status-accepted",
            "Qabul qilingan"
        ],

        rejected:[
            "status-rejected",
            "Rad etilgan"
        ]

    };


    const [
        cls,
        text
    ] =
        statuses[a.status] ||
        statuses.new;


    const buttons =
        a.status === "new"

        ?

        `

        <div class="application-actions">

            <button
                type="button"
                class="accept-btn"
                onclick="updateApplicationStatus(${Number(a.id)},'accepted')">

                ✅ Qabul qilish

            </button>

            <button
                type="button"
                class="reject-btn"
                onclick="updateApplicationStatus(${Number(a.id)},'rejected')">

                ❌ Rad etish

            </button>

        </div>

        `

        :

        "";


    return `

    <div class="application-card">

        <div class="application-header">

            <div>

                <div class="application-name">

                    👤
                    ${escapeHTML(
                        a.full_name
                    )}

                </div>

            </div>


            <div class="application-time">

                ${formatDateTime(
                    a.created_at
                )}

            </div>

        </div>


        <div class="application-info">

            <div class="application-detail">

                <span>
                    📞 Telefon
                </span>

                <strong>
                    ${escapeHTML(a.phone)}
                </strong>

            </div>


            <div class="application-detail">

                <span>
                    🆔 Ariza
                </span>

                <strong>
                    #${Number(a.id)}
                </strong>

            </div>

        </div>


        <span
            class="application-status ${cls}">

            ${text}

        </span>


        ${buttons}

    </div>

    `;

}


/* =========================================================
   UPDATE APPLICATION
========================================================= */

async function updateApplicationStatus(
    id,
    status
){

    if(!canManage())
        return;


    if(
        !confirm(
            status === "accepted"

                ?

                "Bu arizani qabul qilasizmi?"

                :

                "Bu arizani rad qilasizmi?"
        )
    )
        return;


    const data = {

        status

    };


    if(
        status ===
        "accepted"
    ){

        data.accepted_at =
            new Date()
                .toISOString();

    }


    const r =
        await supabaseClient
            .from("applications")
            .update(data)
            .eq(
                "id",
                id
            );


    if(r.error){

        alert(
            "❌ " +
            r.error.message
        );

        return;
    }


    await loadApplications();


    alert(

        status === "accepted"

            ?

            "✅ Ariza qabul qilindi."

            :

            "❌ Ariza rad etildi."

    );

}


/* =========================================================
   SESSION RESTORE
========================================================= */

async function restoreUserSession(){

    const id =
        localStorage.getItem(
            "goldshow_user_id"
        );


    if(!id)
        return;


    if(!supabaseClient)
        return;


    try{

        const result =
            await supabaseClient
                .from("users")
                .select(
                    "id,name,username,role"
                )
                .eq(
                    "id",
                    Number(id)
                )
                .single();


        if(result.error ||
           !result.data){

            localStorage.removeItem(
                "goldshow_user_id"
            );

            return;
        }


        currentUser =
            result.data;


        currentUser.role =
            String(
                currentUser.role || ""
            )
            .toLowerCase();


        await openMainPage();


    }catch(err){

        console.error(
            err
        );

    }

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        updateDate();


        document
            .getElementById(
                "loginForm"
            )
            ?.addEventListener(
                "submit",
                login
            );


        document
            .getElementById(
                "orderForm"
            )
            ?.addEventListener(
                "submit",
                saveOrderFromForm
            );


        document
            .getElementById(
                "userForm"
            )
            ?.addEventListener(
                "submit",
                createUser
            );


        document
            .getElementById(
                "eventForm"
            )
            ?.addEventListener(
                "submit",
                saveEventFromForm
            );


        document
            .getElementById(
                "applicationForm"
            )
            ?.addEventListener(
                "submit",
                submitApplication
            );


        document
            .getElementById(
                "searchInput"
            )
            ?.addEventListener(
                "input",
                displayOrders
            );


        document
            .getElementById(
                "totalPrice"
            )
            ?.addEventListener(
                "input",
                calculateRemaining
            );


        document
            .getElementById(
                "paid"
            )
            ?.addEventListener(
                "input",
                calculateRemaining
            );


        document
            .getElementById(
                "orderModal"
            )
            ?.addEventListener(
                "click",
                e => {

                    if(
                        e.target.id ===
                        "orderModal"
                    ){

                        closeOrderModal();

                    }

                }
            );


        calculateRemaining();


        await restoreUserSession();

    }
);
