/* =========================================
   GOLD SHOW - ZAKAS BOSHQARUV TIZIMI
   Frontend demo: localStorage asosida
========================================= */

let currentUser = null;

const KEYS = {
    users: "goldshow_users",
    orders: "goldshow_orders"
};


/* =========================================
   USERLAR
========================================= */

function getUsers() {

    const data =
        localStorage.getItem(KEYS.users);

    return data
        ? JSON.parse(data)
        : [];
}


function saveUsers(users) {

    localStorage.setItem(
        KEYS.users,
        JSON.stringify(users)
    );
}


function initializeUsers() {

    if (getUsers().length === 0) {

        saveUsers([

            {
                id: 1,
                name: "Otabek",
                username: "Otabek",
                password: "goldshow",
                role: "admin"
            },

            {
                id: 2,
                name: "User",
                username: "user",
                password: "user123",
                role: "user"
            }

        ]);

    }

}


/* =========================================
   ZAKASLAR
========================================= */

function getOrders() {

    const data =
        localStorage.getItem(
            KEYS.orders
        );

    return data
        ? JSON.parse(data)
        : [];
}


function saveOrders(orders) {

    localStorage.setItem(
        KEYS.orders,
        JSON.stringify(orders)
    );
}


/* =========================================
   LOGIN
========================================= */

function login() {

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


    const user =
        getUsers().find(item =>

            item.username
                .toLowerCase()
                ===
            username.toLowerCase()

            &&

            item.password === password

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


    error.textContent = "";

    openMainPage();
}


/* =========================================
   MAIN PAGE
========================================= */

function openMainPage() {

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

    displayOrders();

    updateDashboard();

    checkNotifications();

    displayUsers();
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
   SAHIFA ALMASHTIRISH
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
            "❌ Bu sahifa faqat admin uchun."
        );

        return;
    }


    const pages =
        document.querySelectorAll(".page");


    pages.forEach(page => {

        page.classList
            .add("hidden");

    });


    const page =
        document.getElementById(pageId);


    if (!page) {
        return;
    }


    page.classList
        .remove("hidden");


    const title =
        document
        .getElementById("pageTitle");


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
        .querySelectorAll(".menu-btn")
        .forEach(btn => {

            btn.classList
                .remove("active");

        });


    if (button) {

        button.classList
            .add("active");

    }


    if (
        pageId === "usersPage"
    ) {

        displayUsers();

    }

}


/* =========================================
   BUGUNGI SANA
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
   FORMADAN ZAKAS OLISH
========================================= */

function getOrderFromForm() {

    return {

        clientName:
            document
            .getElementById("clientName")
            .value
            .trim(),


        clientPhone:
            document
            .getElementById("clientPhone")
            .value
            .trim(),


        location:
            document
            .getElementById("location")
            .value
            .trim(),


        eventDate:
            document
            .getElementById("eventDate")
            .value,


        eventTime:
            document
            .getElementById("eventTime")
            .value,


        screenHeight:
            document
            .getElementById("screenHeight")
            .value,


        screenWidth:
            document
            .getElementById("screenWidth")
            .value,


        stageWidth:
            document
            .getElementById("stageWidth")
            .value,


        stageLength:
            document
            .getElementById("stageLength")
            .value,


        curtain:
            document
            .getElementById("curtain")
            .value,


        lights:
            document
            .getElementById("lights")
            .value,


        galava:
            document
            .getElementById("galava")
            .value,


        ledwash:
            document
            .getElementById("ledwash")
            .value,


        confetti:
            document
            .getElementById("confetti")
            .value,


        dim:
            document
            .getElementById("dim")
            .value,


        firework:
            document
            .getElementById("firework")
            .value,


        sideScreens:
            document
            .getElementById("sideScreens")
            .value,


        sideHeight:
            document
            .getElementById("sideHeight")
            .value,


        sideWidth:
            document
            .getElementById("sideWidth")
            .value,


        paid:
            Number(
                document
                .getElementById("paid")
                .value
            ) || 0,


        totalPrice:
            Number(
                document
                .getElementById("totalPrice")
                .value
            ) || 0

    };

}


/* =========================================
   ZAKAS SAQLASH / TAHRIRLASH
========================================= */

function saveOrderFromForm(event) {

    event.preventDefault();


    if (
        !currentUser
        ||
        currentUser.role !== "admin"
    ) {

        alert(
            "❌ Faqat admin zakasni boshqara oladi!"
        );

        return;
    }


    const orderData =
        getOrderFromForm();


    orderData.remaining =
        orderData.totalPrice
        -
        orderData.paid;


    const editingId =
        document
        .getElementById(
            "editingOrderId"
        )
        .value;


    const orders =
        getOrders();


    if (editingId) {

        const index =
            orders.findIndex(
                order =>
                    String(order.id)
                    ===
                    String(editingId)
            );


        if (index === -1) {

            alert(
                "❌ Zakas topilmadi."
            );

            return;
        }


        orders[index] = {

            ...orders[index],

            ...orderData

        };


        alert(
            "✅ Zakas muvaffaqiyatli tahrirlandi!"
        );

    }

    else {

        orderData.id =
            Date.now();


        orders.push(
            orderData
        );


        alert(
            "✅ Zakas muvaffaqiyatli saqlandi!"
        );

    }


    saveOrders(
        orders
    );


    resetOrderForm();

    displayOrders();

    updateDashboard();

    checkNotifications();

    showPage(
        "ordersPage"
    );
}


document
    .getElementById("orderForm")
    .addEventListener(
        "submit",
        saveOrderFromForm
    );


/* =========================================
   FORM RESET
========================================= */

function resetOrderForm() {

    document
        .getElementById("orderForm")
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
   ZAKASLARNI KO‘RSATISH
========================================= */

function displayOrders() {

    const container =
        document
        .getElementById(
            "ordersList"
        );


    if (!container) {
        return;
    }


    let orders =
        getOrders();


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
                        order.clientName
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
                        order.clientPhone
                    )
                    .includes(search)

            );

    }


    orders.sort(
        (a, b) =>

            new Date(
                `${b.eventDate}T${b.eventTime}`
            )

            -

            new Date(
                `${a.eventDate}T${a.eventTime}`
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

function createOrderHTML(order) {

    const eventDate =
        new Date(
            order.eventDate
            +
            "T00:00:00"
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

        <div style="
            margin-top:15px;
            display:flex;
            justify-content:flex-end;
            gap:8px;
            flex-wrap:wrap;
        ">

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
                        👤 ${escapeHTML(
                            order.clientName
                        )}
                    </div>

                    <div>
                        📞 ${escapeHTML(
                            order.clientPhone
                        )}
                    </div>

                </div>


                <div class="order-date">

                    📅 ${eventDate}

                    <br>

                    ⏰ ${escapeHTML(
                        order.eventTime
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
                        ${order.screenHeight || 0}m
                        ×
                        ${order.screenWidth || 0}m
                    </strong>

                </div>


                <div class="info">

                    <span>
                        🎭 Sahna
                    </span>

                    <strong>
                        ${order.stageWidth || 0}m
                        ×
                        ${order.stageLength || 0}m
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

                        ${order.sideScreens || 0}
                        dona

                        <br>

                        ${order.sideHeight || 0}m
                        ×
                        ${order.sideWidth || 0}m

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

                        ${Number(
                            order.totalPrice || 0
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

                    <strong class="money">

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

                    <strong class="remaining-money">

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
   ZAKASNI TAHRIRLASH
========================================= */

function editOrder(id) {

    if (
        !currentUser
        ||
        currentUser.role !== "admin"
    ) {

        return;
    }


    const order =
        getOrders()
        .find(
            item =>
                item.id === id
        );


    if (!order) {
        return;
    }


    const fields = [

        "clientName",

        "clientPhone",

        "location",

        "eventDate",

        "eventTime",

        "screenHeight",

        "screenWidth",

        "stageWidth",

        "stageLength",

        "curtain",

        "lights",

        "galava",

        "ledwash",

        "confetti",

        "dim",

        "firework",

        "sideScreens",

        "sideHeight",

        "sideWidth",

        "paid",

        "totalPrice"

    ];


    fields.forEach(
        idName => {

            const el =
                document
                .getElementById(
                    idName
                );


            if (el) {

                el.value =
                    order[idName]
                    ??
                    "";

            }

        }
    );


    document
        .getElementById(
            "editingOrderId"
        )
        .value =
        order.id;


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
   TAHRIRLASHNI BEKOR QILISH
========================================= */

function cancelEditOrder() {

    resetOrderForm();

    showPage(
        "ordersPage"
    );

}


/* =========================================
   ZAKAS O‘CHIRISH
========================================= */

function deleteOrder(id) {

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


    saveOrders(

        getOrders().filter(
            order =>
                order.id !== id
        )

    );


    displayOrders();

    updateDashboard();

    checkNotifications();

}


/* =========================================
   DASHBOARD
========================================= */

function updateDashboard() {

    const orders =
        getOrders();


    const today =
        getToday();


    const todayOrders =
        orders.filter(
            order =>
                order.eventDate === today
        );


    const now =
        new Date();


    const upcoming =
        orders.filter(
            order => {

                const event =
                    new Date(
                        `${order.eventDate}T${order.eventTime}`
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
                    order.totalPrice || 0
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
        .toLocaleString("uz-UZ")
        +
        " so‘m";


    displayTodayOrders();

}


/* =========================================
   BUGUNGI ZAKASLAR
========================================= */

function displayTodayOrders() {

    const container =
        document.getElementById(
            "todayOrdersList"
        );


    if (!container) {
        return;
    }


    const orders =
        getOrders()
        .filter(
            order =>
                order.eventDate ===
                getToday()
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
                    Bugungi kun uchun buyurtma mavjud emas.
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
   OGOHLANTIRISH
========================================= */

function checkNotifications() {

    const container =
        document
        .getElementById(
            "notifications"
        );


    if (!container) {
        return;
    }


    const orders =
        getOrders();


    const now =
        new Date();


    const alerts = [];


    orders.forEach(
        order => {

            const event =
                new Date(
                    `${order.eventDate}T${order.eventTime}`
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
                            order.clientName
                        )}

                        —

                        ${order.eventDate}
                        ${order.eventTime}

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
                order.eventDate ===
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
                            order.clientName
                        )}

                        <br>

                        ⏰
                        ${escapeHTML(
                            order.eventTime
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
        function(event) {

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
                    "❌ Barcha majburiy maydonlarni to‘ldiring!"
                );

                return;
            }


            const users =
                getUsers();


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


            users.push({

                id:
                    Date.now(),

                name,

                username,

                password,

                role

            });


            saveUsers(
                users
            );


            this.reset();


            displayUsers();


            alert(
                "✅ Yangi user muvaffaqiyatli yaratildi!"
            );

        }
    );


/* =========================================
   USERLARNI CHIQARISH
========================================= */

function displayUsers() {

    const container =
        document
        .getElementById(
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
        getUsers();


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
                                    user.role
                                    ===
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
                                id="password-${user.id}"
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
   PAROLNI KO‘RISH
========================================= */

function showUserPassword(id) {

    if (
        !currentUser
        ||
        currentUser.role !== "admin"
    ) {

        return;
    }


    const user =
        getUsers()
        .find(
            item =>
                item.id === id
        );


    const element =
        document
        .getElementById(
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

        element.textContent ===
        "••••••••"

        ?

        user.password

        :

        "••••••••";

}


/* =========================================
   PAROLNI ALMASHTIRISH
========================================= */

function changeUserPassword(id) {

    if (
        !currentUser
        ||
        currentUser.role !== "admin"
    ) {

        return;
    }


    const users =
        getUsers();


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


    user.password =
        cleanPassword;


    saveUsers(
        users
    );


    displayUsers();


    alert(
        "✅ Parol muvaffaqiyatli almashtirildi!"
    );

}


/* =========================================
   LOGINNI O‘ZGARTIRISH
========================================= */

function changeUsername(id) {

    if (
        !currentUser
        ||
        currentUser.role !== "admin"
    ) {

        return;
    }


    const users =
        getUsers();


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


    if (
        !cleanUsername
    ) {

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


    user.username =
        cleanUsername;


    saveUsers(
        users
    );


    if (
        currentUser.id === id
    ) {

        currentUser.username =
            cleanUsername;

    }


    displayUsers();


    alert(
        "✅ Login muvaffaqiyatli o‘zgartirildi!"
    );

}


/* =========================================
   USERNI O‘CHIRISH
========================================= */

function deleteUser(id) {

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
        getUsers();


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


    saveUsers(

        users.filter(
            item =>
                item.id !== id
        )

    );


    displayUsers();


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

initializeUsers();

updateDate();