/* =========================================
   GOLD SHOW
   SUPABASE ONLINE VERSION
========================================= */


/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
    "https://mvrrftlhjlbrsiexnwjq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_MFI3LFGRmSviFv6ygJnXyg_wFktEpyP";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================
   GLOBAL
========================================= */

let currentUser = null;


/* =========================================
   USERLAR
========================================= */

async function getUsers() {

    const {
        data,
        error
    } = await supabaseClient
        .from("users")
        .select("*")
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(
            "Users error:",
            error
        );

        alert(
            "❌ Userlarni olishda xatolik!"
        );

        return [];
    }


    return data || [];
}


/* =========================================
   ZAKASLAR
========================================= */

async function getOrders() {

    const {
        data,
        error
    } = await supabaseClient
        .from("orders")
        .select("*")
        .order("event_date", {
            ascending: false
        });


    if (error) {

        console.error(
            "Orders error:",
            error
        );

        alert(
            "❌ Zakaslarni olishda xatolik!"
        );

        return [];
    }


    return data || [];
}


/* =========================================
   LOGIN
========================================= */

async function login() {

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


    if (
        !username ||
        !password
    ) {

        error.textContent =
            "❌ Login va parolni kiriting!";

        return;
    }


    const users =
        await getUsers();


    const user =
        users.find(

            item =>

                item.username
                    .toLowerCase()
                    ===
                username.toLowerCase()

                &&

                item.password ===
                password

        );


    if (!user) {

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


    openMainPage();
}


/* =========================================
   MAIN PAGE
========================================= */

async function openMainPage() {

    document
        .getElementById("loginPage")
        .classList
        .add("hidden");


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
            : "Oddiy user";


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
        isAdmin
            ? "block"
            : "none";


    document
        .getElementById("usersMenu")
        .style.display =
        isAdmin
            ? "block"
            : "none";


    updateDate();

    await displayOrders();

    await updateDashboard();

    await checkNotifications();

    await displayUsers();
}


/* =========================================
   LOGOUT
========================================= */

function logout() {

    currentUser = null;


    document
        .getElementById("mainPage")
        .classList
        .add("hidden");


    document
        .getElementById("loginPage")
        .classList
        .remove("hidden");


    document
        .getElementById("username")
        .value = "";


    document
        .getElementById("password")
        .value = "";


    document
        .getElementById("loginError")
        .textContent = "";

}


/* =========================================
   SAHIFA
========================================= */

function showPage(
    pageId,
    button = null
) {

    if (

        pageId === "usersPage"

        &&

        (
            !currentUser
            ||
            currentUser.role !== "admin"
        )

    ) {

        alert(
            "❌ Bu sahifa faqat admin uchun!"
        );

        return;
    }


    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(
        page => {

            page.classList
                .add("hidden");

        }
    );


    const page =
        document.getElementById(
            pageId
        );


    if (!page) {
        return;
    }


    page.classList
        .remove("hidden");


    const title =
        document.getElementById(
            "pageTitle"
        );


    const titles = {

        dashboardPage:
            "Bosh sahifa",

        ordersPage:
            "Zakaslar",

        addOrderPage:
            "Zakas qo‘shish",

        usersPage:
            "Userlar"

    };


    title.textContent =
        titles[pageId]
        ||
        "Goldshow";


    document
        .querySelectorAll(
            ".menu-btn"
        )
        .forEach(
            btn => {

                btn.classList
                    .remove("active");

            }
        );


    if (button) {

        button.classList
            .add("active");

    }


    if (
        pageId === "ordersPage"
    ) {

        displayOrders();

    }


    if (
        pageId === "usersPage"
    ) {

        displayUsers();

    }

}


/* =========================================
   DATE
========================================= */

function getToday() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        )
        .padStart(2, "0");


    const day =
        String(
            date.getDate()
        )
        .padStart(2, "0");


    return `${year}-${month}-${day}`;
}


function updateDate() {

    const formatted =
        new Date()
        .toLocaleDateString(
            "uz-UZ",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );


    document
        .getElementById("todayDate")
        .textContent =
        formatted;
}


/* =========================================
   QOLGAN PUL
========================================= */

function calculateRemaining() {

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


    const remaining =
        total - paid;


    document
        .getElementById("remaining")
        .textContent =

        remaining
        .toLocaleString("uz-UZ")
        +
        " so‘m";
}


/* =========================================
   FORM
========================================= */

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


/* =========================================
   ZAKAS SAQLASH
========================================= */

async function saveOrderFromForm(
    event
) {

    event.preventDefault();


    if (

        !currentUser

        ||

        currentUser.role !== "admin"

    ) {

        alert(
            "❌ Faqat admin zakas boshqara oladi!"
        );

        return;
    }


    const orderData =
        getOrderFromForm();


    orderData.remaining =
        orderData.total_price
        -
        orderData.paid;


    const editingId =
        document
        .getElementById(
            "editingOrderId"
        )
        .value;


    let result;


    if (editingId) {

        result =
            await supabaseClient
            .from("orders")
            .update(
                orderData
            )
            .eq(
                "id",
                editingId
            );

    } else {

        result =
            await supabaseClient
            .from("orders")
            .insert([
                orderData
            ]);

    }


    if (result.error) {

        console.error(
            result.error
        );


        alert(
            "❌ Zakasni saqlashda xatolik!"
        );

        return;
    }


    alert(

        editingId

            ?

            "✅ Zakas muvaffaqiyatli tahrirlandi!"

            :

            "✅ Zakas muvaffaqiyatli saqlandi!"

    );


    resetOrderForm();


    await displayOrders();

    await updateDashboard();

    await checkNotifications();


    showPage(
        "ordersPage"
    );
}


document
    .getElementById(
        "orderForm"
    )
    .addEventListener(
        "submit",
        saveOrderFromForm
    );


/* =========================================
   FORM RESET
========================================= */

function resetOrderForm() {

    document
        .getElementById(
            "orderForm"
        )
        .reset();


    document
        .getElementById(
            "editingOrderId"
        )
        .value = "";


    document
        .getElementById(
            "cancelEditBtn"
        )
        .classList
        .add("hidden");


    document
        .getElementById(
            "editBadge"
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


/* =========================================
   ZAKASLAR
========================================= */

async function displayOrders() {

    const container =
        document
        .getElementById(
            "ordersList"
        );


    if (!container) {
        return;
    }


    let orders =
        await getOrders();


    const search =
        document
        .getElementById(
            "searchInput"
        )
        ?.value
        .toLowerCase()
        .trim();


    if (search) {

        orders =
            orders.filter(

                order =>

                    String(
                        order.client_name
                    )
                    .toLowerCase()
                    .includes(
                        search
                    )

                    ||

                    String(
                        order.location
                    )
                    .toLowerCase()
                    .includes(
                        search
                    )

                    ||

                    String(
                        order.client_phone
                    )
                    .includes(
                        search
                    )

            );

    }


    orders.sort(

        (a, b) =>

            new Date(
                `${b.event_date}T${b.event_time}`
            )

            -

            new Date(
                `${a.event_date}T${a.event_time}`
            )

    );


    if (
        orders.length === 0
    ) {

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
        .map(
            createOrderHTML
        )
        .join("");
}


/* =========================================
   ZAKAS HTML
========================================= */

function createOrderHTML(
    order
) {

    const eventDate =
        new Date(
            `${order.event_date}T00:00:00`
        )
        .toLocaleDateString(
            "uz-UZ"
        );


    const adminButtons =

        currentUser
        &&
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
                onclick="
                    editOrder(${order.id})
                "
                style="
                    padding:9px 15px;
                    border:0;
                    border-radius:7px;
                    background:#d89b00;
                    color:white;
                    cursor:pointer;
                    font-weight:bold;
                "
            >
                ✏️ Tahrirlash
            </button>


            <button
                onclick="
                    deleteOrder(${order.id})
                "
                style="
                    padding:9px 15px;
                    border:0;
                    border-radius:7px;
                    background:#dc2626;
                    color:white;
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

                    <div
                        class="order-client"
                    >
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


                <div
                    class="order-date"
                >

                    📅
                    ${eventDate}

                    <br>

                    ⏰
                    ${escapeHTML(
                        order.event_time
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
                        🖥️ Asosiy ekran
                    </span>

                    <strong>
                        ${order.screen_height || 0}m
                        ×
                        ${order.screen_width || 0}m
                    </strong>

                </div>


                <div class="info">

                    <span>
                        🎭 Sahna
                    </span>

                    <strong>
                        ${order.stage_width || 0}m
                        ×
                        ${order.stage_length || 0}m
                    </strong>

                </div>


                <div class="info">

                    <span>
                        💡 Chiroqlar
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
                        🎉 Kanfeti
                    </span>

                    <strong>
                        ${order.confetti || 0}
                    </strong>

                </div>


                <div class="info">

                    <span>
                        💡 Dim apparat
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

                    <strong
                        class="money"
                    >

                        ${Number(
                            order.total_price || 0
                        ).toLocaleString(
                            "uz-UZ"
                        )}

                        so‘m

                    </strong>

                </div>


                <div class="info">

                    <span>
                        💵 To‘langan
                    </span>

                    <strong
                        class="money"
                    >

                        ${Number(
                            order.paid || 0
                        ).toLocaleString(
                            "uz-UZ"
                        )}

                        so‘m

                    </strong>

                </div>


                <div class="info">

                    <span>
                        ⚠️ Qolgan
                    </span>

                    <strong
                        class="remaining-money"
                    >

                        ${Number(
                            order.remaining || 0
                        ).toLocaleString(
                            "uz-UZ"
                        )}

                        so‘m

                    </strong>

                </div>


            </div>


            ${adminButtons}

        </div>
    `;
}


/* =========================================
   ZAKAS TAHRIRLASH
========================================= */

async function editOrder(id) {

    if (
        !currentUser
        ||
        currentUser.role !== "admin"
    ) {

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


    if (error || !data) {

        alert(
            "❌ Zakas topilmadi!"
        );

        return;
    }


    const fields = {

        clientName:
            data.client_name,

        clientPhone:
            data.client_phone,

        location:
            data.location,

        eventDate:
            data.event_date,

        eventTime:
            data.event_time,

        screenHeight:
            data.screen_height,

        screenWidth:
            data.screen_width,

        stageWidth:
            data.stage_width,

        stageLength:
            data.stage_length,

        curtain:
            data.curtain,

        lights:
            data.lights,

        galava:
            data.galava,

        ledwash:
            data.ledwash,

        confetti:
            data.confetti,

        dim:
            data.dim,

        firework:
            data.firework,

        sideScreens:
            data.side_screens,

        sideHeight:
            data.side_height,

        sideWidth:
            data.side_width,

        paid:
            data.paid,

        totalPrice:
            data.total_price

    };


    Object.entries(
        fields
    ).forEach(
        ([key, value]) => {

            const element =
                document.getElementById(
                    key
                );


            if (element) {

                element.value =
                    value ?? "";

            }

        }
    );


    document
        .getElementById(
            "editingOrderId"
        )
        .value =
        id;


    document
        .getElementById(
            "cancelEditBtn"
        )
        .classList
        .remove("hidden");


    document
        .getElementById(
            "editBadge"
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


    showPage(
        "addOrderPage"
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });
}


/* =========================================
   ZAKAS O‘CHIRISH
========================================= */

async function deleteOrder(id) {

    if (
        !currentUser
        ||
        currentUser.role !== "admin"
    ) {

        return;
    }


    if (
        !confirm(
            "Bu zakasni o‘chirmoqchimisiz?"
        )
    ) {

        return;
    }


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

        console.error(error);

        alert(
            "❌ Zakasni o‘chirishda xatolik!"
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

async function updateDashboard() {

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
        orders.filter(
            order => {

                const event =
                    new Date(
                        `${order.event_date}T${order.event_time}`
                    );


                const difference =
                    event - now;


                return (

                    difference > 0

                    &&

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

            (
                sum,
                order
            ) =>

                sum +
                Number(
                    order.total_price || 0
                ),

            0
        );


    document
        .getElementById(
            "totalOrders"
        )
        .textContent =
        orders.length;


    document
        .getElementById(
            "todayOrders"
        )
        .textContent =
        todayOrders.length;


    document
        .getElementById(
            "upcomingOrders"
        )
        .textContent =
        upcoming.length;


    document
        .getElementById(
            "totalMoney"
        )
        .textContent =

        totalMoney
        .toLocaleString(
            "uz-UZ"
        )
        +
        " so‘m";


    await displayTodayOrders();
}


/* =========================================
   BUGUNGI ZAKASLAR
========================================= */

async function displayTodayOrders() {

    const container =
        document.getElementById(
            "todayOrdersList"
        );


    if (!container) {
        return;
    }


    const orders =
        await getOrders();


    const todayOrders =
        orders.filter(

            order =>
                order.event_date ===
                getToday()

        );


    if (
        todayOrders.length === 0
    ) {

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
        todayOrders
        .map(
            createOrderHTML
        )
        .join("");
}


/* =========================================
   OGOHLANTIRISH
========================================= */

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


    const alerts = [];


    orders.forEach(
        order => {

            const event =
                new Date(
                    `${order.event_date}T${order.event_time}`
                );


            const hours =
                (
                    event - now
                )
                /
                (
                    1000 *
                    60 *
                    60
                );


            if (
                hours > 0
                &&
                hours <= 24
            ) {

                alerts.push(`

                    <div
                        class="notification"
                    >

                        <strong>
                            🔔 Tadbir yaqinlashmoqda!
                        </strong>

                        ${escapeHTML(
                            order.client_name
                        )}

                        —

                        ${order.event_date}
                        ${order.event_time}

                        <br>

                        📍
                        ${escapeHTML(
                            order.location
                        )}

                    </div>
                `);

            }

        }
    );


    orders
        .filter(
            order =>
                order.event_date ===
                getToday()
        )
        .forEach(
            order => {

                alerts.push(`

                    <div
                        class="notification"
                    >

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

            }
        );


    container.innerHTML =
        alerts.join("");
}


/* =========================================
   USER QO‘SHISH
========================================= */

document
    .getElementById(
        "userForm"
    )
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (
                !currentUser
                ||
                currentUser.role !== "admin"
            ) {

                alert(
                    "❌ Faqat admin user yarata oladi!"
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
                .value;


            if (
                !name
                ||
                !username
                ||
                !password
            ) {

                alert(
                    "❌ Barcha maydonlarni to‘ldiring!"
                );

                return;
            }


            const users =
                await getUsers();


            const exists =
                users.some(

                    user =>

                        user.username
                            .toLowerCase()
                            ===
                        username
                            .toLowerCase()

                );


            if (exists) {

                alert(
                    "❌ Bu login allaqachon mavjud!"
                );

                return;
            }


            const {
                error
            } =
                await supabaseClient
                .from("users")
                .insert([

                    {

                        name,

                        username,

                        password,

                        role

                    }

                ]);


            if (error) {

                console.error(
                    error
                );

                alert(
                    "❌ User yaratishda xatolik!"
                );

                return;
            }


            this.reset();


            await displayUsers();


            alert(
                "✅ Yangi user yaratildi!"
            );

        }
    );


/* =========================================
   USERLAR
========================================= */

async function displayUsers() {

    const container =
        document.getElementById(
            "usersList"
        );


    if (!container) {
        return;
    }


    if (
        !currentUser
        ||
        currentUser.role !== "admin"
    ) {

        container.innerHTML =
            "";

        return;
    }


    const users =
        await getUsers();


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
            user => `

                <div
                    class="user-card"
                >

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
                                    user.role ===
                                    "admin"

                                    ?

                                    "ADMIN"

                                    :

                                    "USER"

                                }

                            </span>

                        </div>

                    </div>


                    <div
                        class="user-grid"
                    >

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
                            class="btn-view"
                            onclick="
                                showUserPassword(
                                    ${user.id}
                                )
                            "
                        >
                            👁️ Ko‘rish
                        </button>


                        <button
                            class="btn-edit"
                            onclick="
                                changeUserPassword(
                                    ${user.id}
                                )
                            "
                        >
                            🔑 Parolni almashtirish
                        </button>


                        <button
                            class="btn-edit"
                            onclick="
                                changeUsername(
                                    ${user.id}
                                )
                            "
                        >
                            ✏️ Loginni o‘zgartirish
                        </button>


                        ${
                            user.id !==
                            currentUser.id

                            ?

                            `

                            <button
                                class="btn-delete"
                                onclick="
                                    deleteUser(
                                        ${user.id}
                                    )
                                "
                            >
                                🗑️ Userni o‘chirish
                            </button>

                            `

                            :

                            ""
                        }

                    </div>

                </div>

            `
        )
        .join("");
}


/* =========================================
   PAROL KO‘RISH
========================================= */

async function showUserPassword(id) {

    if (
        !currentUser
        ||
        currentUser.role !== "admin"
    ) {

        return;
    }


    const users =
        await getUsers();


    const user =
        users.find(
            item =>
                item.id === id
        );


    const element =
        document.getElementById(
            `password-${id}`
        );


    if (
        !user
        ||
        !element
    ) {

        return;
    }


    element.textContent =

        element.textContent
        ===
        "••••••••"

        ?

        user.password

        :

        "••••••••";

}


/* =========================================
   PAROL ALMASHTIRISH
========================================= */

async function changeUserPassword(
    id
) {

    if (
        !currentUser
        ||
        currentUser.role !== "admin"
    ) {

        return;
    }


    const users =
        await getUsers();


    const user =
        users.find(
            item =>
                item.id === id
        );


    if (!user) {
        return;
    }


    const newPassword =
        prompt(
            `"${user.username}"
uchun yangi parolni kiriting:`,
            ""
        );


    if (
        newPassword === null
    ) {

        return;
    }


    const cleanPassword =
        newPassword.trim();


    if (!cleanPassword) {

        alert(
            "❌ Parol bo‘sh bo‘lishi mumkin emas!"
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient
        .from("users")
        .update({

            password:
                cleanPassword

        })
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            error
        );

        alert(
            "❌ Parolni almashtirishda xatolik!"
        );

        return;
    }


    await displayUsers();


    alert(
        "✅ Parol muvaffaqiyatli almashtirildi!"
    );
}


/* =========================================
   LOGIN O‘ZGARTIRISH
========================================= */

async function changeUsername(
    id
) {

    if (
        !currentUser
        ||
        currentUser.role !== "admin"
    ) {

        return;
    }


    const users =
        await getUsers();


    const user =
        users.find(
            item =>
                item.id === id
        );


    if (!user) {
        return;
    }


    const newUsername =
        prompt(
            `"${user.username}"
uchun yangi loginni kiriting:`,
            user.username
        );


    if (
        newUsername === null
    ) {

        return;
    }


    const cleanUsername =
        newUsername.trim();


    if (!cleanUsername) {

        alert(
            "❌ Login bo‘sh bo‘lishi mumkin emas!"
        );

        return;
    }


    const exists =
        users.some(

            item =>

                item.id !== id

                &&

                item.username
                    .toLowerCase()
                    ===
                cleanUsername
                    .toLowerCase()

        );


    if (exists) {

        alert(
            "❌ Bu login allaqachon mavjud!"
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient
        .from("users")
        .update({

            username:
                cleanUsername

        })
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            error
        );

        alert(
            "❌ Loginni o‘zgartirishda xatolik!"
        );

        return;
    }


    if (
        currentUser.id === id
    ) {

        currentUser.username =
            cleanUsername;

    }


    await displayUsers();


    alert(
        "✅ Login muvaffaqiyatli o‘zgartirildi!"
    );
}


/* =========================================
   USER O‘CHIRISH
========================================= */

async function deleteUser(id) {

    if (
        !currentUser
        ||
        currentUser.role !== "admin"
    ) {

        return;
    }


    if (
        currentUser.id === id
    ) {

        alert(
            "❌ O‘zingizni o‘chira olmaysiz!"
        );

        return;
    }


    const users =
        await getUsers();


    const user =
        users.find(
            item =>
                item.id === id
        );


    if (!user) {
        return;
    }


    if (
        !confirm(
            `"${user.username}"
userini o‘chirmoqchimisiz?`
        )
    ) {

        return;
    }


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

        console.error(
            error
        );

        alert(
            "❌ Userni o‘chirishda xatolik!"
        );

        return;
    }


    await displayUsers();


    alert(
        "✅ User o‘chirildi."
    );
}


/* =========================================
   XAVFSIZ HTML
========================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================================
   START
========================================= */

updateDate();
