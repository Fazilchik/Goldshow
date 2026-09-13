/* =========================================
   GOLD SHOW
   Supabase + Buyurtmachi + Ishchi + Admin
========================================= */


/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
    "https://mvrrftlhjlbrsiexnwjq.supabase.co";

/*
   BU YERGA SUPABASE'DAGI
   PUBLISHABLE KEY'NI QO'YING.
*/

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_MFI3LFGRmSviFv6ygJnXyg_wFktEpyP";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


let currentUser = null;

let customerEventsPage = 1;
let workerEventsPage = 1;

const EVENTS_PER_PAGE = 10;

let applicationPollTimer = null;


/* =========================================
   UMUMIY YORDAMCHI
========================================= */

function escapeHTML(value){

    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}


function formatMoney(value){

    return Number(value || 0)
        .toLocaleString("uz-UZ")
        + " so‘m";
}


function getToday(){

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2,"0");

    const day =
        String(
            date.getDate()
        ).padStart(2,"0");

    return `${year}-${month}-${day}`;
}


function updateDate(){

    const element =
        document.getElementById("todayDate");

    if(!element){
        return;
    }

    element.textContent =
        new Date().toLocaleDateString(
            "uz-UZ",
            {
                day:"2-digit",
                month:"long",
                year:"numeric"
            }
        );
}


/* =========================================
   EKRAN ALMASHTIRISH
========================================= */

function hideAllMainSections(){

    [
        "landingPage",
        "loginPage",
        "customerPage",
        "mainPage"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if(element){
            element.classList.add("hidden");
        }

    });
}


function backToLanding(){

    hideAllMainSections();

    document
        .getElementById("landingPage")
        .classList
        .remove("hidden");

    closeOrderModal();

    stopApplicationPolling();
}


function openWorkerLogin(){

    hideAllMainSections();

    document
        .getElementById("loginPage")
        .classList
        .remove("hidden");

    document
        .getElementById("username")
        .focus();
}


async function openCustomerPage(){

    hideAllMainSections();

    document
        .getElementById("customerPage")
        .classList
        .remove("hidden");

    customerEventsPage = 1;

    await loadCustomerEvents();

    restoreCustomerApplicationStatus();
}


/* =========================================
   LOGIN
========================================= */

async function login(event){

    if(event){
        event.preventDefault();
    }

    const username =
        document
        .getElementById("username")
        .value
        .trim();

    const password =
        document
        .getElementById("password")
        .value
        .trim();

    const error =
        document
        .getElementById("loginError");


    error.textContent = "";


    if(!username || !password){

        error.textContent =
            "❌ Login va parolni kiriting.";

        return;
    }


    try{

        const { data, error: dbError } =
            await supabaseClient
            .from("users")
            .select("*")
            .ilike("username", username)
            .eq("password", password)
            .limit(1);

        if(dbError){
            throw dbError;
        }


        const user =
            data && data.length
                ? data[0]
                : null;


        if(!user){

            error.textContent =
                "❌ Login yoki parol noto‘g‘ri!";

            return;
        }


        currentUser = {

            id: user.id,

            name: user.name,

            username: user.username,

            role: user.role

        };


        document
            .getElementById("username")
            .value = "";

        document
            .getElementById("password")
            .value = "";


        openMainPage();

    }
    catch(dbError){

        console.error(dbError);

        error.textContent =
            "❌ Server bilan ulanishda xatolik.";

    }

}


/* =========================================
   MAIN PAGE
========================================= */

async function openMainPage(){

    hideAllMainSections();

    document
        .getElementById("mainPage")
        .classList
        .remove("hidden");


    document
        .getElementById("currentUser")
        .textContent =
        currentUser.name;


    document
        .getElementById("userRole")
        .textContent =
        currentUser.role === "admin"
            ? "Admin"
            : "Ishchi";


    document
        .getElementById("userAvatar")
        .textContent =
        currentUser.name
            .charAt(0)
            .toUpperCase();


    const isAdmin =
        currentUser.role === "admin";


    document
        .getElementById("addOrderMenu")
        .style.display =
        isAdmin ? "block" : "none";


    document
        .getElementById("applicationsMenu")
        .style.display =
        isAdmin ? "block" : "none";


    document
        .getElementById("usersMenu")
        .style.display =
        isAdmin ? "block" : "none";


    document
        .getElementById("workerEventAdminForm")
        .classList.toggle(
            "hidden",
            !isAdmin
        );


    updateDate();

    await displayOrders();

    await updateDashboard();

    await checkNotifications();

    await displayUsers();

    await loadWorkerEvents();

    if(isAdmin){
        await loadApplications();
    }

}


/* =========================================
   LOGOUT
========================================= */

function logout(){

    currentUser = null;

    stopApplicationPolling();

    backToLanding();
}


/* =========================================
   SAHIFA ALMASHTIRISH
========================================= */

async function showPage(
    pageId,
    button = null
){

    if(
        pageId === "usersPage" &&
        (
            !currentUser ||
            currentUser.role !== "admin"
        )
    ){

        alert(
            "❌ Bu sahifa faqat admin uchun."
        );

        return;
    }


    if(
        pageId === "applicationsPage" &&
        (
            !currentUser ||
            currentUser.role !== "admin"
        )
    ){

        alert(
            "❌ Bu sahifa faqat admin uchun."
        );

        return;
    }


    if(
        pageId === "addOrderPage" &&
        (
            !currentUser ||
            currentUser.role !== "admin"
        )
    ){

        alert(
            "❌ Faqat admin zakas qo‘sha oladi."
        );

        return;
    }


    document
        .querySelectorAll("#mainPage .page")
        .forEach(page => {

            page.classList.add("hidden");

        });


    const page =
        document.getElementById(pageId);


    if(!page){
        return;
    }


    page.classList.remove("hidden");


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


    document
        .getElementById("pageTitle")
        .textContent =
        titles[pageId] || "Gold Show";


    document
        .querySelectorAll(".menu-btn")
        .forEach(btn => {

            btn.classList.remove("active");

        });


    if(button){

        button.classList.add("active");

    }


    if(pageId === "usersPage"){
        await displayUsers();
    }


    if(pageId === "applicationsPage"){
        await loadApplications();
    }


    if(pageId === "ordersPage"){
        await displayOrders();
    }


    if(pageId === "dashboardPage"){
        await updateDashboard();
    }


    if(pageId === "workerEventsPage"){

        workerEventsPage = 1;

        await loadWorkerEvents();

    }

}


/* =========================================
   ORDERS - FORM
========================================= */

function calculateRemaining(){

    const paid =
        Number(
            document
            .getElementById("paid")
            .value
        ) || 0;


    const total =
        Number(
            document
            .getElementById("totalPrice")
            .value
        ) || 0;


    document
        .getElementById("remaining")
        .textContent =
        formatMoney(total - paid);

}


function getOrderFromForm(){

    return {

        client_name:
            document
            .getElementById("clientName")
            .value
            .trim(),

        client_phone:
            document
            .getElementById("clientPhone")
            .value
            .trim(),

        location:
            document
            .getElementById("location")
            .value
            .trim(),

        event_date:
            document
            .getElementById("eventDate")
            .value,

        event_time:
            document
            .getElementById("eventTime")
            .value,

        screen_height:
            Number(
                document
                .getElementById("screenHeight")
                .value
            ) || 0,

        screen_width:
            Number(
                document
                .getElementById("screenWidth")
                .value
            ) || 0,

        stage_width:
            Number(
                document
                .getElementById("stageWidth")
                .value
            ) || 0,

        stage_length:
            Number(
                document
                .getElementById("stageLength")
                .value
            ) || 0,

        curtain:
            document
            .getElementById("curtain")
            .value,

        lights:
            Number(
                document
                .getElementById("lights")
                .value
            ) || 0,

        galava:
            Number(
                document
                .getElementById("galava")
                .value
            ) || 0,

        ledwash:
            Number(
                document
                .getElementById("ledwash")
                .value
            ) || 0,

        confetti:
            Number(
                document
                .getElementById("confetti")
                .value
            ) || 0,

        dim:
            Number(
                document
                .getElementById("dim")
                .value
            ) || 0,

        firework:
            Number(
                document
                .getElementById("firework")
                .value
            ) || 0,

        side_screens:
            Number(
                document
                .getElementById("sideScreens")
                .value
            ) || 0,

        side_height:
            Number(
                document
                .getElementById("sideHeight")
                .value
            ) || 0,

        side_width:
            Number(
                document
                .getElementById("sideWidth")
                .value
            ) || 0,

        paid:
            Number(
                document
                .getElementById("paid")
                .value
            ) || 0,

        total_price:
            Number(
                document
                .getElementById("totalPrice")
                .value
            ) || 0

    };

}


async function saveOrderFromForm(event){

    event.preventDefault();


    if(
        !currentUser ||
        currentUser.role !== "admin"
    ){

        alert(
            "❌ Faqat admin zakasni boshqara oladi."
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
        .getElementById("editingOrderId")
        .value;


    try{

        if(editingId){

            const { error } =
                await supabaseClient
                .from("orders")
                .update(order)
                .eq("id", editingId);


            if(error){
                throw error;
            }


            alert(
                "✅ Zakas muvaffaqiyatli tahrirlandi!"
            );

        }
        else{

            const { error } =
                await supabaseClient
                .from("orders")
                .insert([order]);


            if(error){
                throw error;
            }


            alert(
                "✅ Zakas muvaffaqiyatli saqlandi!"
            );

        }


        resetOrderForm();

        await displayOrders();

        await updateDashboard();

        await checkNotifications();

        await showPage("ordersPage");

    }
    catch(error){

        console.error(error);

        alert(
            "❌ Zakasni saqlashda xatolik."
        );

    }

}


/* =========================================
   ORDERS - DISPLAY
========================================= */

async function getOrders(){

    const {
        data,
        error
    } =
        await supabaseClient
        .from("orders")
        .select("*")
        .order(
            "event_date",
            { ascending:false }
        )
        .order(
            "event_time",
            { ascending:false }
        );


    if(error){

        console.error(error);

        return [];

    }


    return data || [];

}


async function displayOrders(){

    const container =
        document.getElementById(
            "ordersList"
        );


    if(!container){
        return;
    }


    let orders =
        await getOrders();


    const search =
        document
        .getElementById("searchInput")
        ?.value
        .toLowerCase()
        .trim();


    if(search){

        orders =
            orders.filter(order =>

                String(
                    order.client_name
                )
                .toLowerCase()
                .includes(search)

                ||

                String(
                    order.location
                )
                .toLowerCase()
                .includes(search)

                ||

                String(
                    order.client_phone
                )
                .includes(search)

            );

    }


    if(!orders.length){

        container.innerHTML = `

            <div class="no-orders">

                <h3>
                    📭 Zakas topilmadi
                </h3>

                <p>
                    Hozircha zakaslar mavjud emas.
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


function createOrderHTML(order){

    const eventDate =
        order.event_date
            ? new Date(
                order.event_date +
                "T00:00:00"
            ).toLocaleDateString("uz-UZ")
            : "—";


    const adminButtons =
        currentUser &&
        currentUser.role === "admin"

        ?

        `

            <div
                style="
                    margin-top:15px;
                    display:flex;
                    justify-content:flex-end;
                    gap:8px;
                    flex-wrap:wrap;
                "
            >

                <button
                    onclick="editOrder(${order.id})"
                    style="
                        padding:9px 15px;
                        border:0;
                        border-radius:7px;
                        background:#d89b00;
                        color:#fff;
                        cursor:pointer;
                        font-weight:bold;
                    "
                >
                    ✏️ Tahrirlash
                </button>


                <button
                    onclick="deleteOrder(${order.id})"
                    style="
                        padding:9px 15px;
                        border:0;
                        border-radius:7px;
                        background:#dc2626;
                        color:#fff;
                        cursor:pointer;
                        font-weight:bold;
                    "
                >
                    🗑️ O‘chirish
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
                        👤
                        ${escapeHTML(order.client_name)}
                    </div>

                    <div>
                        📞
                        ${escapeHTML(order.client_phone)}
                    </div>

                </div>


                <div class="order-date">

                    📅 ${eventDate}

                    <br>

                    ⏰
                    ${escapeHTML(
                        order.event_time || ""
                    )}

                </div>

            </div>


            <div class="order-grid">

                <div class="info">
                    <span>📍 Manzil</span>
                    <strong>
                        ${escapeHTML(order.location)}
                    </strong>
                </div>


                <div class="info">
                    <span>🖥️ Asosiy ekran</span>
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
                    <span>💡 Chiroqlar</span>
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
                    <span>🎉 Kanfeti</span>
                    <strong>
                        ${order.confetti || 0}
                    </strong>
                </div>


                <div class="info">
                    <span>💡 Dim apparat</span>
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

                    <span>
                        🖥️ Yon ekran
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
                            order.curtain || "Yo‘q"
                        )}
                    </strong>

                </div>


                <div class="info">

                    <span>
                        💰 Jami summa
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


/* =========================================
   ORDER EDIT
========================================= */

async function editOrder(id){

    if(
        !currentUser ||
        currentUser.role !== "admin"
    ){
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();


    if(error || !data){

        alert(
            "❌ Zakas topilmadi."
        );

        return;

    }


    const fields = {

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
        .forEach(([elementId, dbField]) => {

            const element =
                document.getElementById(
                    elementId
                );

            if(element){
                element.value =
                    data[dbField] ?? "";
            }

        });


    document
        .getElementById("editingOrderId")
        .value = data.id;


    document
        .getElementById("cancelEditBtn")
        .classList
        .remove("hidden");


    document
        .getElementById("editBadge")
        .classList
        .remove("hidden");


    document
        .getElementById("orderFormTitle")
        .textContent =
        "✏️ Zakasni tahrirlash";


    document
        .getElementById("orderSubmitBtn")
        .textContent =
        "💾 O‘zgarishlarni saqlash";


    calculateRemaining();


    await showPage("addOrderPage");

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}


function resetOrderForm(){

    const form =
        document.getElementById(
            "orderForm"
        );


    if(form){
        form.reset();
    }


    document
        .getElementById("editingOrderId")
        .value = "";


    document
        .getElementById("cancelEditBtn")
        .classList
        .add("hidden");


    document
        .getElementById("editBadge")
        .classList
        .add("hidden");


    document
        .getElementById("orderFormTitle")
        .textContent =
        "➕ Yangi zakas qo‘shish";


    document
        .getElementById("orderSubmitBtn")
        .textContent =
        "💾 Zakasni saqlash";


    calculateRemaining();

}


function cancelEditOrder(){

    resetOrderForm();

    showPage("ordersPage");

}


async function deleteOrder(id){

    if(
        !currentUser ||
        currentUser.role !== "admin"
    ){
        return;
    }


    if(
        !confirm(
            "Bu zakasni o‘chirmoqchimisiz?"
        )
    ){
        return;
    }


    const { error } =
        await supabaseClient
        .from("orders")
        .delete()
        .eq("id", id);


    if(error){

        console.error(error);

        alert(
            "❌ O‘chirishda xatolik."
        );

        return;

    }


    await displayOrders();

    await updateDashboard();

    await checkNotifications();

}


/* =========================================
   DASHBOARD
========================================= */

async function updateDashboard(){

    const orders =
        await getOrders();


    const today =
        getToday();


    const todayOrders =
        orders.filter(
            order =>
                order.event_date === today
        );


    const now =
        new Date();


    const upcoming =
        orders.filter(order => {

            const event =
                new Date(
                    `${order.event_date}T${order.event_time}`
                );


            const difference =
                event - now;


            return (
                difference > 0 &&
                difference <=
                7 * 24 * 60 * 60 * 1000
            );

        });


    const totalMoney =
        orders.reduce(
            (sum, order) =>
                sum +
                Number(
                    order.total_price || 0
                ),
            0
        );


    document
        .getElementById("totalOrders")
        .textContent =
        orders.length;


    document
        .getElementById("todayOrders")
        .textContent =
        todayOrders.length;


    document
        .getElementById("upcomingOrders")
        .textContent =
        upcoming.length;


    document
        .getElementById("totalMoney")
        .textContent =
        formatMoney(totalMoney);


    await displayTodayOrders();

}


async function displayTodayOrders(){

    const container =
        document.getElementById(
            "todayOrdersList"
        );


    if(!container){
        return;
    }


    const orders =
        (await getOrders())
        .filter(
            order =>
                order.event_date ===
                getToday()
        );


    if(!orders.length){

        container.innerHTML = `

            <div class="no-orders">

                <h3>
                    🎉 Bugun zakas yo‘q
                </h3>

                <p>
                    Bugungi kun uchun buyurtma mavjud emas.
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


/* =========================================
   NOTIFICATIONS
========================================= */

async function checkNotifications(){

    const container =
        document.getElementById(
            "notifications"
        );


    if(!container){
        return;
    }


    const orders =
        await getOrders();


    const now =
        new Date();


    const alerts = [];


    orders.forEach(order => {

        const event =
            new Date(
                `${order.event_date}T${order.event_time}`
            );


        const hours =
            (
                event - now
            ) /
            (
                1000 *
                60 *
                60
            );


        if(
            hours > 0 &&
            hours <= 24
        ){

            alerts.push(`

                <div class="notification">

                    <strong>
                        🔔 Tadbir yaqinlashmoqda!
                    </strong>

                    ${escapeHTML(
                        order.client_name
                    )}

                    —

                    ${escapeHTML(
                        order.event_date
                    )}
                    ${escapeHTML(
                        order.event_time
                    )}

                    <br>

                    📍
                    ${escapeHTML(
                        order.location
                    )}

                </div>

            `);

        }

    });


    orders
        .filter(
            order =>
                order.event_date ===
                getToday()
        )
        .forEach(order => {

            alerts.push(`

                <div class="notification">

                    <strong>
                        🚨 BUGUN TADBIR BOR!
                    </strong>

                    👤
                    ${escapeHTML(
                        order.client_name
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

            `);

        });


    container.innerHTML =
        alerts.join("");

}


/* =========================================
   USERLAR
========================================= */

async function displayUsers(){

    const container =
        document.getElementById(
            "usersList"
        );


    if(!container){
        return;
    }


    if(
        !currentUser ||
        currentUser.role !== "admin"
    ){

        container.innerHTML = "";

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
        .from("users")
        .select("*")
        .order("id");


    if(error){

        console.error(error);

        container.innerHTML =
            `
                <div class="no-orders">
                    Userlarni olishda xatolik.
                </div>
            `;

        return;

    }


    const users =
        data || [];


    if(!users.length){

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
        .map(user => `

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
                                user.role === "admin"
                                    ? "ADMIN"
                                    : "USER"
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
                        >
                            ••••••••
                        </strong>

                    </div>

                </div>


                <div class="user-actions">

                    <button
                        class="btn-view"
                        onclick="showUserPassword(${user.id})"
                    >
                        👁️ Ko‘rish
                    </button>


                    <button
                        class="btn-edit"
                        onclick="changeUserPassword(${user.id})"
                    >
                        🔑 Parolni almashtirish
                    </button>


                    <button
                        class="btn-edit"
                        onclick="changeUsername(${user.id})"
                    >
                        ✏️ Loginni o‘zgartirish
                    </button>


                    ${
                        user.id !== currentUser.id

                            ?

                        `
                            <button
                                class="btn-delete"
                                onclick="deleteUser(${user.id})"
                            >
                                🗑️ Userni o‘chirish
                            </button>
                        `

                            :

                        ""
                    }

                </div>

            </div>

        `)
        .join("");

}


/* =========================================
   USER FORM
========================================= */

async function createUser(event){

    event.preventDefault();


    if(
        !currentUser ||
        currentUser.role !== "admin"
    ){

        alert(
            "❌ Faqat admin user yaratadi."
        );

        return;

    }


    const name =
        document
        .getElementById("newUserName")
        .value
        .trim();


    const username =
        document
        .getElementById("newUsername")
        .value
        .trim();


    const password =
        document
        .getElementById("newUserPassword")
        .value
        .trim();


    const role =
        document
        .getElementById("newUserRole")
        .value;


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


    const {
        data: existing,
        error: checkError
    } =
        await supabaseClient
        .from("users")
        .select("id")
        .ilike("username", username)
        .limit(1);


    if(checkError){

        console.error(checkError);

        alert(
            "❌ Userni tekshirishda xatolik."
        );

        return;

    }


    if(existing && existing.length){

        alert(
            "❌ Bu login allaqachon mavjud!"
        );

        return;

    }


    const { error } =
        await supabaseClient
        .from("users")
        .insert([{

            name,
            username,
            password,
            role

        }]);


    if(error){

        console.error(error);

        alert(
            "❌ User yaratilmadi."
        );

        return;

    }


    document
        .getElementById("userForm")
        .reset();


    await displayUsers();


    alert(
        "✅ Yangi user muvaffaqiyatli yaratildi!"
    );

}


async function getUserById(id){

    const {
        data,
        error
    } =
        await supabaseClient
        .from("users")
        .select("*")
        .eq("id", id)
        .single();


    if(error){
        return null;
    }


    return data;

}


/* =========================================
   USER PAROL
========================================= */

async function showUserPassword(id){

    if(
        !currentUser ||
        currentUser.role !== "admin"
    ){
        return;
    }


    const user =
        await getUserById(id);


    const element =
        document.getElementById(
            `password-${id}`
        );


    if(
        !user ||
        !element
    ){
        return;
    }


    element.textContent =
        element.textContent === "••••••••"
            ? user.password
            : "••••••••";

}


async function changeUserPassword(id){

    if(
        !currentUser ||
        currentUser.role !== "admin"
    ){
        return;
    }


    const user =
        await getUserById(id);


    if(!user){
        return;
    }


    const newPassword =
        prompt(
            `"${user.username}" uchun yangi parolni kiriting:`,
            ""
        );


    if(newPassword === null){
        return;
    }


    const cleanPassword =
        newPassword.trim();


    if(!cleanPassword){

        alert(
            "❌ Parol bo‘sh bo‘lishi mumkin emas."
        );

        return;

    }


    const { error } =
        await supabaseClient
        .from("users")
        .update({
            password:cleanPassword
        })
        .eq("id", id);


    if(error){

        console.error(error);

        alert(
            "❌ Parol almashtirilmadi."
        );

        return;

    }


    await displayUsers();


    alert(
        "✅ Parol muvaffaqiyatli almashtirildi!"
    );

}


async function changeUsername(id){

    if(
        !currentUser ||
        currentUser.role !== "admin"
    ){
        return;
    }


    const user =
        await getUserById(id);


    if(!user){
        return;
    }


    const newUsername =
        prompt(
            `"${user.username}" uchun yangi loginni kiriting:`,
            user.username
        );


    if(newUsername === null){
        return;
    }


    const cleanUsername =
        newUsername.trim();


    if(!cleanUsername){

        alert(
            "❌ Login bo‘sh bo‘lishi mumkin emas."
        );

        return;

    }


    const {
        data: existing,
        error: checkError
    } =
        await supabaseClient
        .from("users")
        .select("id")
        .ilike("username", cleanUsername)
        .neq("id", id)
        .limit(1);


    if(checkError){

        console.error(checkError);

        return;

    }


    if(existing && existing.length){

        alert(
            "❌ Bu login allaqachon mavjud!"
        );

        return;

    }


    const { error } =
        await supabaseClient
        .from("users")
        .update({
            username:cleanUsername
        })
        .eq("id", id);


    if(error){

        console.error(error);

        alert(
            "❌ Login o‘zgartirilmadi."
        );

        return;

    }


    if(currentUser.id === id){

        currentUser.username =
            cleanUsername;

    }


    await displayUsers();


    alert(
        "✅ Login muvaffaqiyatli o‘zgartirildi!"
    );

}


async function deleteUser(id){

    if(
        !currentUser ||
        currentUser.role !== "admin"
    ){
        return;
    }


    if(currentUser.id === id){

        alert(
            "❌ O‘zingizni o‘chira olmaysiz."
        );

        return;

    }


    const user =
        await getUserById(id);


    if(!user){
        return;
    }


    if(
        !confirm(
            `"${user.username}" userini o‘chirmoqchimisiz?`
        )
    ){
        return;
    }


    const { error } =
        await supabaseClient
        .from("users")
        .delete()
        .eq("id", id);


    if(error){

        console.error(error);

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


/* =========================================
   CUSTOMER - EVENTS
========================================= */

async function getEvents(){

    const {
        data,
        error
    } =
        await supabaseClient
        .from("events")
        .select("*")
        .order(
            "created_at",
            { ascending:false }
        );


    if(error){

        console.error(error);

        return [];

    }


    return data || [];

}


async function loadCustomerEvents(){

    const list =
        document.getElementById(
            "customerEventsList"
        );


    const pagination =
        document.getElementById(
            "customerPagination"
        );


    if(!list || !pagination){
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


    if(
        customerEventsPage >
        totalPages
    ){
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
            start + EVENTS_PER_PAGE
        );


    if(!pageEvents.length){

        list.innerHTML = `

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
    else{

        list.innerHTML =
            pageEvents
            .map(createEventHTML)
            .join("");

    }


    renderPagination(
        pagination,
        totalPages,
        customerEventsPage,
        page => {

            customerEventsPage =
                page;

            loadCustomerEvents();

            window.scrollTo({
                top:0,
                behavior:"smooth"
            });

        }
    );

}


function createEventHTML(event){

    const image =
        event.image_url
            ?

        `<img
            class="event-card-image"
            src="${event.image_url}"
            alt="${escapeHTML(event.title)}"
            loading="lazy"
        >`

            :

        `<div
            class="event-card-image"
            style="
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:50px;
            "
        >
            🎪
        </div>`;


    return `

        <article class="event-card">

            ${image}

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

                    ${formatEventDate(
                        event.created_at
                    )}

                </div>

            </div>

        </article>

    `;

}


function formatEventDate(date){

    if(!date){
        return "";
    }


    return new Date(date)
        .toLocaleDateString(
            "uz-UZ",
            {
                day:"2-digit",
                month:"long",
                year:"numeric"
            }
        );

}


function renderPagination(
    container,
    totalPages,
    currentPage,
    onPage
){

    if(totalPages <= 1){

        container.innerHTML = "";

        return;
    }


    let html = `

        <button
            ${currentPage === 1 ? "disabled" : ""}
            onclick="void 0"
            id="prevPageBtn"
        >
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
                class="${
                    i === currentPage
                        ? "active"
                        : ""
                }"
                data-page="${i}"
            >
                ${i}
            </button>

        `;

    }


    html += `

        <button
            ${
                currentPage === totalPages
                    ? "disabled"
                    : ""
            }
            id="nextPageBtn"
        >
            Keyingi sahifa →
        </button>

        <span>
            ${currentPage} / ${totalPages}
        </span>

    `;


    container.innerHTML = html;


    const buttons =
        container.querySelectorAll(
            "[data-page]"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                onPage(
                    Number(
                        button.dataset.page
                    )
                );

            }
        );

    });


    const prev =
        container.querySelector(
            "#prevPageBtn"
        );


    const next =
        container.querySelector(
            "#nextPageBtn"
        );


    if(prev){

        prev.addEventListener(
            "click",
            () => {

                if(currentPage > 1){

                    onPage(
                        currentPage - 1
                    );

                }

            }
        );

    }


    if(next){

        next.addEventListener(
            "click",
            () => {

                if(
                    currentPage <
                    totalPages
                ){

                    onPage(
                        currentPage + 1
                    );

                }

            }
        );

    }

}


/* =========================================
   ADMIN / WORKER EVENTS
========================================= */

async function loadWorkerEvents(){

    const list =
        document.getElementById(
            "workerEventsList"
        );


    const pagination =
        document.getElementById(
            "workerPagination"
        );


    if(!list || !pagination){
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


    if(workerEventsPage > totalPages){

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
            start + EVENTS_PER_PAGE
        );


    if(!pageEvents.length){

        list.innerHTML = `

            <div class="no-orders">

                <h3>
                    🎪 Tadbirlar mavjud emas
                </h3>

            </div>

        `;

    }
    else{

        list.innerHTML =
            pageEvents
            .map(createWorkerEventHTML)
            .join("");

    }


    renderPagination(
        pagination,
        totalPages,
        workerEventsPage,
        page => {

            workerEventsPage =
                page;

            loadWorkerEvents();

        }
    );

}


function createWorkerEventHTML(event){

    const image =
        event.image_url
            ?

        `<img
            class="event-card-image"
            src="${event.image_url}"
            alt="${escapeHTML(event.title)}"
        >`

            :

        `<div
            class="event-card-image"
            style="
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:50px;
            "
        >
            🎪
        </div>`;


    const adminButtons =
        currentUser &&
        currentUser.role === "admin"

        ?

        `

            <div class="event-admin-actions">

                <button
                    class="btn-edit"
                    onclick="deleteEvent(${event.id})"
                >
                    🗑️ O‘chirish
                </button>

            </div>

        `

        :

        "";


    return `

        <article class="event-card">

            ${image}

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

                    ${formatEventDate(
                        event.created_at
                    )}

                </div>


                ${adminButtons}

            </div>

        </article>

    `;

}


/* =========================================
   IMAGE COMPRESS
========================================= */

function compressImage(file){

    return new Promise(
        (resolve,reject) => {

            const reader =
                new FileReader();


            reader.onload = event => {

                const img =
                    new Image();


                img.onload = () => {

                    const maxWidth = 1200;


                    let width =
                        img.width;


                    let height =
                        img.height;


                    if(width > maxWidth){

                        const ratio =
                            maxWidth / width;

                        width =
                            maxWidth;

                        height =
                            Math.round(
                                height * ratio
                            );

                    }


                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    canvas.width =
                        width;

                    canvas.height =
                        height;


                    const ctx =
                        canvas.getContext("2d");


                    ctx.drawImage(
                        img,
                        0,
                        0,
                        width,
                        height
                    );


                    resolve(
                        canvas.toDataURL(
                            "image/jpeg",
                            0.78
                        )
                    );

                };


                img.onerror =
                    () =>
                        reject(
                            new Error(
                                "Rasm ochilmadi."
                            )
                        );


                img.src =
                    event.target.result;

            };


            reader.onerror =
                () =>
                    reject(
                        new Error(
                            "Faylni o‘qib bo‘lmadi."
                        )
                    );


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================
   ADD EVENT
========================================= */

async function saveEventFromForm(event){

    event.preventDefault();


    if(
        !currentUser ||
        currentUser.role !== "admin"
    ){

        alert(
            "❌ Faqat admin tadbir qo‘sha oladi."
        );

        return;

    }


    const title =
        document
        .getElementById("eventTitle")
        .value
        .trim();


    const description =
        document
        .getElementById("eventDescription")
        .value
        .trim();


    const file =
        document
        .getElementById("eventImage")
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

            imageUrl =
                await compressImage(file);

        }


        const { error } =
            await supabaseClient
            .from("events")
            .insert([{

                title,
                description,
                image_url:imageUrl

            }]);


        if(error){
            throw error;
        }


        document
            .getElementById("eventForm")
            .reset();


        await loadWorkerEvents();


        alert(
            "✅ Tadbir muvaffaqiyatli qo‘shildi!"
        );

    }
    catch(error){

        console.error(error);

        alert(
            "❌ Tadbirni saqlashda xatolik."
        );

    }

}


async function deleteEvent(id){

    if(
        !currentUser ||
        currentUser.role !== "admin"
    ){
        return;
    }


    if(
        !confirm(
            "Bu tadbirni o‘chirmoqchimisiz?"
        )
    ){
        return;
    }


    const { error } =
        await supabaseClient
        .from("events")
        .delete()
        .eq("id", id);


    if(error){

        console.error(error);

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


/* =========================================
   BUYURTMA MODALI
========================================= */

function openOrderModal(){

    const modal =
        document.getElementById(
            "orderModal"
        );


    modal.classList.remove("hidden");


    document
        .getElementById("applicationMessage")
        .innerHTML = "";


    document
        .getElementById("applicationName")
        .focus();

}


function closeOrderModal(){

    const modal =
        document.getElementById(
            "orderModal"
        );


    if(modal){
        modal.classList.add("hidden");
    }

}


/* =========================================
   APPLICATION
========================================= */

async function submitApplication(event){

    event.preventDefault();


    const name =
        document
        .getElementById("applicationName")
        .value
        .trim();


    const phone =
        document
        .getElementById("applicationPhone")
        .value
        .trim();


    const message =
        document
        .getElementById(
            "applicationMessage"
        );


    if(!name || !phone){

        message.innerHTML = `
            <div class="error">
                ❌ Ism va telefonni kiriting.
            </div>
        `;

        return;

    }


    try{

        const { data, error } =
            await supabaseClient
            .from("applications")
            .insert([{

                full_name:name,

                phone:phone,

                status:"new"

            }])
            .select()
            .single();


        if(error){
            throw error;
        }


        sessionStorage.setItem(
            "goldshow_application_id",
            String(data.id)
        );


        sessionStorage.setItem(
            "goldshow_application_phone",
            phone
        );


        message.innerHTML = `

            <div
                style="
                    padding:14px;
                    border-radius:10px;
                    background:#dcfce7;
                    color:#15803d;
                "
            >

                ✅ Arizangiz yuborildi!

                <br><br>

                <strong>
                    Ariza raqami:
                    #${data.id}
                </strong>

                <br><br>

                Biz siz bilan bog‘lanamiz.

            </div>

        `;


        document
            .getElementById("applicationForm")
            .reset();


        startApplicationPolling(
            data.id,
            phone
        );


    }
    catch(error){

        console.error(error);

        message.innerHTML = `

            <div class="error">

                ❌ Ariza yuborishda xatolik.

            </div>

        `;

    }

}


/* =========================================
   APPLICATION STATUS
========================================= */

function startApplicationPolling(
    id,
    phone
){

    stopApplicationPolling();


    checkApplicationStatus(
        id,
        phone
    );


    applicationPollTimer =
        setInterval(
            () => {

                checkApplicationStatus(
                    id,
                    phone
                );

            },
            8000
        );

}


function stopApplicationPolling(){

    if(applicationPollTimer){

        clearInterval(
            applicationPollTimer
        );

        applicationPollTimer = null;

    }

}


async function checkApplicationStatus(
    id,
    phone
){

    const {
        data,
        error
    } =
        await supabaseClient
        .from("applications")
        .select(
            "id,status,full_name,phone,created_at"
        )
        .eq("id", id)
        .eq("phone", phone)
        .maybeSingle();


    if(error || !data){
        return;
    }


    const box =
        document.getElementById(
            "customerStatusBox"
        );


    if(!box){
        return;
    }


    if(data.status === "accepted"){

        box.classList.remove("hidden");


        box.innerHTML = `

            <strong>
                ✅ Sizning arizangiz qabul qilindi
            </strong>

            <br>

            Tez orada siz bilan bog‘lanamiz.

            <br><br>

            Ariza:
            #${data.id}

        `;


        stopApplicationPolling();

    }

    else if(data.status === "rejected"){

        box.classList.remove("hidden");

        box.style.borderLeftColor =
            "#dc2626";


        box.innerHTML = `

            <strong>
                ❌ Afsuski, arizangiz qabul qilinmadi.
            </strong>

            <br><br>

            Ariza:
            #${data.id}

        `;


        stopApplicationPolling();

    }

}


function restoreCustomerApplicationStatus(){

    const id =
        sessionStorage.getItem(
            "goldshow_application_id"
        );


    const phone =
        sessionStorage.getItem(
            "goldshow_application_phone"
        );


    if(id && phone){

        startApplicationPolling(
            id,
            phone
        );

    }

}


/* =========================================
   ADMIN - APPLICATIONS
========================================= */

async function loadApplications(){

    const container =
        document.getElementById(
            "applicationsList"
        );


    if(!container){

        return;

    }


    if(
        !currentUser ||
        currentUser.role !== "admin"
    ){

        container.innerHTML = "";

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
        .from("applications")
        .select("*")
        .order(
            "created_at",
            { ascending:false }
        );


    if(error){

        console.error(error);

        container.innerHTML = `

            <div class="no-orders">
                Arizalarni olishda xatolik.
            </div>

        `;

        return;

    }


    const applications =
        data || [];


    if(!applications.length){

        container.innerHTML = `

            <div class="no-orders">

                <h3>
                    📭 Arizalar yo‘q
                </h3>

            </div>

        `;

        return;

    }


    container.innerHTML =
        applications
        .map(createApplicationHTML)
        .join("");

}


function createApplicationHTML(application){

    const statusClass =
        application.status === "accepted"

            ? "status-accepted"

            : application.status === "rejected"

                ? "status-rejected"

                : "status-new";


    const statusText =
        application.status === "accepted"

            ? "Qabul qilingan"

            : application.status === "rejected"

                ? "Rad etilgan"

                : "Yangi";


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
                        🆔 Ariza raqami
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


            ${
                application.status === "new"

                    ?

                `

                    <div class="application-actions">

                        <button
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

                `

                    :

                ""

            }

        </div>

    `;

}


async function updateApplicationStatus(
    id,
    status
){

    if(
        !currentUser ||
        currentUser.role !== "admin"
    ){
        return;
    }


    const text =
        status === "accepted"
            ? "Bu arizani qabul qilasizmi?"
            : "Bu arizani rad qilasizmi?";


    if(!confirm(text)){
        return;
    }


    const updateData = {
        status:status
    };


    if(status === "accepted"){

        updateData.accepted_at =
            new Date()
            .toISOString();

    }


    const { error } =
        await supabaseClient
        .from("applications")
        .update(updateData)
        .eq("id", id);


    if(error){

        console.error(error);

        alert(
            "❌ Ariza statusini o‘zgartirib bo‘lmadi."
        );

        return;

    }


    await loadApplications();

    alert(
        status === "accepted"
            ? "✅ Ariza qabul qilindi!"
            : "❌ Ariza rad etildi."
    );

}


function formatDateTime(value){

    if(!value){
        return "—";
    }


    return new Date(value)
        .toLocaleString(
            "uz-UZ",
            {
                day:"2-digit",
                month:"2-digit",
                year:"numeric",
                hour:"2-digit",
                minute:"2-digit"
            }
        );

}


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateDate();


        const orderForm =
            document.getElementById(
                "orderForm"
            );


        if(orderForm){

            orderForm.addEventListener(
                "submit",
                saveOrderFromForm
            );

        }


        const userForm =
            document.getElementById(
                "userForm"
            );


        if(userForm){

            userForm.addEventListener(
                "submit",
                createUser
            );

        }


        const eventForm =
            document.getElementById(
                "eventForm"
            );


        if(eventForm){

            eventForm.addEventListener(
                "submit",
                saveEventFromForm
            );

        }


        const applicationForm =
            document.getElementById(
                "applicationForm"
            );


        if(applicationForm){

            applicationForm.addEventListener(
                "submit",
                submitApplication
            );

        }


        const modal =
            document.getElementById(
                "orderModal"
            );


        if(modal){

            modal.addEventListener(
                "click",
                event => {

                    if(
                        event.target === modal
                    ){

                        closeOrderModal();

                    }

                }
            );

        }


        calculateRemaining();

    }
);
