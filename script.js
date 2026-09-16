/* =========================================
   GOLD SHOW - SCRIPT.JS
========================================= */


/* =========================================
   OWNER
========================================= */

const OWNER = {
    username: "Foziljon",
    password: "Foziljon2010",
    role: "owner"
};


/* =========================================
   DEFAULT USERS
========================================= */

let users = JSON.parse(
    localStorage.getItem("goldshow_users")
) || [];


/*
   Owner har doim tizimda mavjud bo‘ladi.
*/

function saveUsers() {

    localStorage.setItem(
        "goldshow_users",
        JSON.stringify(users)
    );

}


/* =========================================
   ORDERS
========================================= */

let orders = JSON.parse(
    localStorage.getItem("goldshow_orders")
) || [];


function saveOrders() {

    localStorage.setItem(
        "goldshow_orders",
        JSON.stringify(orders)
    );

}


/* =========================================
   CURRENT USER
========================================= */

let currentUser = JSON.parse(
    sessionStorage.getItem("goldshow_current_user")
);


/* =========================================
   ELEMENTS
========================================= */

const loginPage =
    document.getElementById("loginPage");

const appPage =
    document.getElementById("appPage");

const loginForm =
    document.getElementById("loginForm");

const loginUsername =
    document.getElementById("loginUsername");

const loginPassword =
    document.getElementById("loginPassword");

const loginMessage =
    document.getElementById("loginMessage");

const showPasswordBtn =
    document.getElementById("showPasswordBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const currentUserName =
    document.getElementById("currentUserName");

const userRoleText =
    document.getElementById("userRoleText");


/* =========================================
   PASSWORD EYE
========================================= */

showPasswordBtn.addEventListener(
    "click",
    function () {

        if (loginPassword.type === "password") {

            loginPassword.type = "text";

            showPasswordBtn.textContent = "🙈";

        } else {

            loginPassword.type = "password";

            showPasswordBtn.textContent = "👁️";

        }

    }
);


/* =========================================
   NEW USER PASSWORD EYE
========================================= */

const newUserEye =
    document.getElementById("newUserEye");

const newUserPassword =
    document.getElementById("newUserPassword");


newUserEye.addEventListener(
    "click",
    function () {

        if (newUserPassword.type === "password") {

            newUserPassword.type = "text";

            newUserEye.textContent = "🙈";

        } else {

            newUserPassword.type = "password";

            newUserEye.textContent = "👁️";

        }

    }
);


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const username =
            loginUsername.value.trim();

        const password =
            loginPassword.value;


        /*
           OWNER LOGIN
        */

        if (
            username === OWNER.username &&
            password === OWNER.password
        ) {

            currentUser = {
                username: OWNER.username,
                role: OWNER.role
            };

            sessionStorage.setItem(
                "goldshow_current_user",
                JSON.stringify(currentUser)
            );

            loginMessage.textContent = "";

            openApplication();

            return;
        }


        /*
           ISHCHI / ADMIN LOGIN
        */

        const foundUser = users.find(
            function (user) {

                return (
                    user.username === username &&
                    user.password === password
                );

            }
        );


        if (foundUser) {

            currentUser = {
                username: foundUser.username,
                role: foundUser.role
            };

            sessionStorage.setItem(
                "goldshow_current_user",
                JSON.stringify(currentUser)
            );

            loginMessage.textContent = "";

            openApplication();

        } else {

            loginMessage.textContent =
                "❌ Login yoki parol noto‘g‘ri.";

        }

    }
);


/* =========================================
   OPEN APPLICATION
========================================= */

function openApplication() {

    loginPage.classList.add("hidden");

    appPage.classList.remove("hidden");

    updateUserInterface();

    renderUsers();

    renderOrders();

    updateDashboard();

}


/* =========================================
   UPDATE USER UI
========================================= */

function updateUserInterface() {

    if (!currentUser) {
        return;
    }


    currentUserName.textContent =
        currentUser.username;


    let roleName = "Ishchi";


    if (currentUser.role === "owner") {

        roleName = "OWNER / ADMIN";

    } else if (currentUser.role === "admin") {

        roleName = "ADMIN";

    }


    userRoleText.textContent =
        roleName;


    document.getElementById(
        "profileName"
    ).textContent =
        currentUser.username;


    document.getElementById(
        "profileRole"
    ).textContent =
        roleName;


    /*
       Owner bo‘lmasa
       ishchilar bo‘limini yashiramiz.
    */

    const ownerButtons =
        document.querySelectorAll(".owner-only");


    ownerButtons.forEach(
        function (button) {

            if (
                currentUser.role === "owner" ||
                currentUser.role === "admin"
            ) {

                button.style.display = "block";

            } else {

                button.style.display = "none";

            }

        }
    );

}


/* =========================================
   LOGOUT
========================================= */

logoutBtn.addEventListener(
    "click",
    function () {

        sessionStorage.removeItem(
            "goldshow_current_user"
        );

        currentUser = null;

        appPage.classList.add("hidden");

        loginPage.classList.remove("hidden");

        loginForm.reset();

        loginMessage.textContent = "";

    }
);


/* =========================================
   MENU
========================================= */

const menuButtons =
    document.querySelectorAll(".menu-button");


menuButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const sectionId =
                    button.dataset.section;


                /*
                   Owner-only bo‘limni
                   ishchi ocholmasin.
                */

                if (
                    sectionId === "usersSection" &&
                    currentUser.role !== "owner" &&
                    currentUser.role !== "admin"
                ) {

                    return;

                }


                menuButtons.forEach(
                    function (item) {

                        item.classList.remove("active");

                    }
                );


                button.classList.add("active");


                document.querySelectorAll(
                    ".content-section"
                ).forEach(
                    function (section) {

                        section.classList.remove(
                            "active-section"
                        );

                    }
                );


                document.getElementById(
                    sectionId
                ).classList.add(
                    "active-section"
                );

            }
        );

    }
);


/* =========================================
   USER MODAL
========================================= */

const userModal =
    document.getElementById("userModal");

const addUserBtn =
    document.getElementById("addUserBtn");

const userForm =
    document.getElementById("userForm");


addUserBtn.addEventListener(
    "click",
    function () {

        if (
            currentUser.role !== "owner" &&
            currentUser.role !== "admin"
        ) {
            return;
        }

        userForm.reset();

        userModal.classList.remove("hidden");

    }
);


/* =========================================
   ADD USER
========================================= */

userForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        if (
            currentUser.role !== "owner" &&
            currentUser.role !== "admin"
        ) {

            return;

        }


        const username =
            document.getElementById(
                "newUsername"
            ).value.trim();


        const password =
            document.getElementById(
                "newUserPassword"
            ).value;


        const role =
            document.getElementById(
                "newUserRole"
            ).value;


        if (!username || !password) {

            alert("Login va parolni kiriting.");

            return;

        }


        /*
           OWNER LOGININI
           qayta yaratishga yo‘l qo‘ymaymiz.
        */

        if (
            username.toLowerCase() ===
            OWNER.username.toLowerCase()
        ) {

            alert(
                "Bu login Owner uchun band."
            );

            return;

        }


        /*
           Bir xil login bo‘lmasin.
        */

        const exists =
            users.some(
                function (user) {

                    return (
                        user.username.toLowerCase() ===
                        username.toLowerCase()
                    );

                }
            );


        if (exists) {

            alert(
                "Bu login allaqachon mavjud."
            );

            return;

        }


        users.push({

            id: Date.now(),

            username: username,

            password: password,

            role: role

        });


        saveUsers();

        renderUsers();

        updateDashboard();

        userModal.classList.add("hidden");

        userForm.reset();


        alert(
            "✅ Ishchi muvaffaqiyatli qo‘shildi."
        );

    }
);


/* =========================================
   RENDER USERS
========================================= */

function renderUsers() {

    const body =
        document.getElementById(
            "usersTableBody"
        );


    body.innerHTML = "";


    /*
       OWNER
    */

    const ownerRow =
        document.createElement("tr");


    ownerRow.innerHTML = `

        <td>
            <strong>Foziljon</strong>
        </td>

        <td>
            <span>••••••••••••</span>
        </td>

        <td>
            <span class="role-badge">
                OWNER
            </span>
        </td>

        <td>
            <span>
                Asosiy Owner
            </span>
        </td>

    `;


    body.appendChild(ownerRow);


    /*
       ISHCHILAR
    */

    users.forEach(
        function (user) {

            const row =
                document.createElement("tr");


            let roleText =
                user.role === "admin"
                    ? "ADMIN"
                    : "ISHCHI";


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHtml(user.username)}
                    </strong>
                </td>

                <td>
                    <span>
                        ${escapeHtml(user.password)}
                    </span>
                </td>

                <td>
                    <span class="role-badge">
                        ${roleText}
                    </span>
                </td>

                <td>

                    <button
                        class="small-button delete-button"
                        onclick="deleteUser(${user.id})"
                    >
                        🗑 O‘chirish
                    </button>

                </td>

            `;


            body.appendChild(row);

        }
    );

}


/* =========================================
   DELETE USER
========================================= */

function deleteUser(id) {

    if (
        currentUser.role !== "owner" &&
        currentUser.role !== "admin"
    ) {

        return;

    }


    const user =
        users.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!user) {
        return;
    }


    const confirmDelete =
        confirm(
            `"${user.username}" foydalanuvchisini o‘chirasizmi?`
        );


    if (!confirmDelete) {
        return;
    }


    users =
        users.filter(
            function (item) {

                return item.id !== id;

            }
        );


    saveUsers();

    renderUsers();

    updateDashboard();

}


/* =========================================
   ORDER MODAL
========================================= */

const orderModal =
    document.getElementById("orderModal");

const addOrderBtn =
    document.getElementById("addOrderBtn");

const orderForm =
    document.getElementById("orderForm");


addOrderBtn.addEventListener(
    "click",
    function () {

        orderForm.reset();

        document.getElementById(
            "paid"
        ).value = 0;

        document.getElementById(
            "totalAmount"
        ).value = 0;

        orderModal.classList.remove(
            "hidden"
        );

    }
);


/* =========================================
   ADD ORDER
========================================= */

orderForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const order = {

            id: Date.now(),

            clientName:
                getValue("clientName"),

            clientPhone:
                getValue("clientPhone"),

            location:
                getValue("location"),

            eventDate:
                getValue("eventDate"),

            eventTime:
                getValue("eventTime"),

            screenHeight:
                getValue("screenHeight"),

            screenLength:
                getValue("screenLength"),

            stageWidth:
                getValue("stageWidth"),

            stageLength:
                getValue("stageLength"),

            lights:
                getValue("lights"),

            galava:
                getValue("galava"),

            ledWall:
                getValue("ledWall"),

            konfeti:
                getValue("konfeti"),

            dim:
                getValue("dim"),

            fireworks:
                getValue("fireworks"),

            sideScreens:
                getValue("sideScreens"),

            sideScreenSize:
                getValue("sideScreenSize"),

            curtain:
                getValue("curtain"),

            paid:
                Number(
                    document.getElementById(
                        "paid"
                    ).value
                ) || 0,

            totalAmount:
                Number(
                    document.getElementById(
                        "totalAmount"
                    ).value
                ) || 0,

            notes:
                getValue("notes"),

            createdBy:
                currentUser.username,

            createdAt:
                new Date().toISOString()

        };


        orders.push(order);

        saveOrders();

        renderOrders();

        updateDashboard();

        orderModal.classList.add(
            "hidden"
        );

        orderForm.reset();


        alert(
            "✅ Zakas muvaffaqiyatli saqlandi."
        );

    }
);


/* =========================================
   GET VALUE
========================================= */

function getValue(id) {

    return document.getElementById(id).value.trim();

}


/* =========================================
   RENDER ORDERS
========================================= */

function renderOrders() {

    const container =
        document.getElementById(
            "ordersList"
        );


    container.innerHTML = "";


    if (orders.length === 0) {

        container.innerHTML = `

            <div class="empty-message">

                📋 Hozircha zakaslar mavjud emas.

            </div>

        `;

        return;

    }


    /*
       Eng yangi zakas birinchi chiqadi.
    */

    const sortedOrders =
        [...orders].sort(
            function (a, b) {

                return b.id - a.id;

            }
        );


    sortedOrders.forEach(
        function (order) {

            const remaining =
                Math.max(
                    0,
                    Number(order.totalAmount) -
                    Number(order.paid)
                );


            const card =
                document.createElement("div");


            card.className =
                "order-card";


            card.innerHTML = `

                <div class="order-top">

                    <div>

                        <h3>
                            ${escapeHtml(
                                order.clientName
                            )}
                        </h3>

                    </div>

                    <div class="order-date">

                        ${formatDate(
                            order.eventDate
                        )}

                    </div>

                </div>


                <div class="order-info">

                    <div>
                        📍
                        <strong>Joy:</strong>
                        ${escapeHtml(
                            order.location
                        )}
                    </div>

                    <div>
                        📞
                        <strong>Telefon:</strong>
                        ${escapeHtml(
                            order.clientPhone || "-"
                        )}
                    </div>

                    <div>
                        🕐
                        <strong>Vaqt:</strong>
                        ${escapeHtml(
                            order.eventTime || "-"
                        )}
                    </div>

                    <div>
                        🖥
                        <strong>Ekran:</strong>
                        ${escapeHtml(
                            order.screenHeight || "-"
                        )}
                        ×
                        ${escapeHtml(
                            order.screenLength || "-"
                        )}
                    </div>

                    <div>
                        🎭
                        <strong>Stage:</strong>
                        ${escapeHtml(
                            order.stageWidth || "-"
                        )}
                        ×
                        ${escapeHtml(
                            order.stageLength || "-"
                        )}
                    </div>

                    <div>
                        💡
                        <strong>Lights:</strong>
                        ${escapeHtml(
                            order.lights || "0"
                        )}
                    </div>

                    <div>
                        📺
                        <strong>LED Wall:</strong>
                        ${escapeHtml(
                            order.ledWall || "0"
                        )}
                    </div>

                    <div>
                        🎉
                        <strong>Konfeti:</strong>
                        ${escapeHtml(
                            order.konfeti || "0"
                        )}
                    </div>

                    <div>
                        🎆
                        <strong>Foyerverk:</strong>
                        ${escapeHtml(
                            order.fireworks || "0"
                        )}
                    </div>

                    <div>
                        👤
                        <strong>Kiritgan:</strong>
                        ${escapeHtml(
                            order.createdBy
                        )}
                    </div>

                </div>


                <div class="order-money">

                    <div>

                        <span>
                            Umumiy:
                        </span>

                        <strong>
                            ${formatMoney(
                                order.totalAmount
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            To‘langan:
                        </span>

                        <strong>
                            ${formatMoney(
                                order.paid
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Qoldiq:
                        </span>

                        <strong>
                            ${formatMoney(
                                remaining
                            )}
                        </strong>

                    </div>

                </div>


                ${
                    order.notes
                    ? `
                        <div class="order-info"
                             style="margin-top:15px;">

                            <div>
                                📝
                                <strong>
                                    Izoh:
                                </strong>

                                ${escapeHtml(
                                    order.notes
                                )}
                            </div>

                        </div>
                    `
                    : ""
                }


                <div class="order-actions">

                    <button
                        class="small-button delete-button"
                        onclick="deleteOrder(${order.id})"
                    >
                        🗑 O‘chirish
                    </button>

                </div>

            `;


            container.appendChild(card);

        }
    );

}


/* =========================================
   DELETE ORDER
========================================= */

function deleteOrder(id) {

    const order =
        orders.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!order) {
        return;
    }


    /*
       Oddiy ishchi o‘z zakasini o‘chirishga
       ham ruxsat berilgan.
    */

    const confirmation =
        confirm(
            `"${order.clientName}" zakasini o‘chirasizmi?`
        );


    if (!confirmation) {
        return;
    }


    orders =
        orders.filter(
            function (item) {

                return item.id !== id;

            }
        );


    saveOrders();

    renderOrders();

    updateDashboard();

}


/* =========================================
   DASHBOARD
========================================= */

function updateDashboard() {

    document.getElementById(
        "totalOrders"
    ).textContent =
        orders.length;


    document.getElementById(
        "totalUsers"
    ).textContent =
        users.length;


    const total =
        orders.reduce(
            function (sum, order) {

                return (
                    sum +
                    Number(order.totalAmount || 0)
                );

            },
            0
        );


    const paid =
        orders.reduce(
            function (sum, order) {

                return (
                    sum +
                    Number(order.paid || 0)
                );

            },
            0
        );


    const remaining =
        Math.max(
            0,
            total - paid
        );


    document.getElementById(
        "totalMoney"
    ).textContent =
        formatMoney(total);


    document.getElementById(
        "remainingMoney"
    ).textContent =
        formatMoney(remaining);


    renderUpcomingOrders();

}


/* =========================================
   UPCOMING
========================================= */

function renderUpcomingOrders() {

    const container =
        document.getElementById(
            "upcomingOrders"
        );


    if (orders.length === 0) {

        container.innerHTML =
            `
            <div class="empty-message">
                Hozircha zakas yo‘q.
            </div>
            `;

        return;

    }


    const today =
        new Date();


    const upcoming =
        [...orders]
        .filter(
            function (order) {

                if (!order.eventDate) {
                    return false;
                }

                const date =
                    new Date(
                        order.eventDate
                    );

                return date >= today;

            }
        )
        .sort(
            function (a, b) {

                return (
                    new Date(a.eventDate) -
                    new Date(b.eventDate)
                );

            }
        )
        .slice(0, 5);


    if (upcoming.length === 0) {

        container.innerHTML =
            `
            <div class="empty-message">
                Yaqinlashayotgan tadbir yo‘q.
            </div>
            `;

        return;

    }


    container.innerHTML = "";


    upcoming.forEach(
        function (order) {

            const item =
                document.createElement("div");


            item.className =
                "upcoming-item";


            item.innerHTML = `

                <strong>
                    ${escapeHtml(
                        order.clientName
                    )}
                </strong>

                <br>

                <span>
                    📅
                    ${formatDate(
                        order.eventDate
                    )}

                    &nbsp;&nbsp;

                    🕐
                    ${escapeHtml(
                        order.eventTime
                    )}

                    &nbsp;&nbsp;

                    📍
                    ${escapeHtml(
                        order.location
                    )}
                </span>

            `;


            container.appendChild(item);

        }
    );

}


/* =========================================
   MODAL CLOSE
========================================= */

document.querySelectorAll(
    ".close-modal"
).forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const modalId =
                    button.dataset.close;


                document.getElementById(
                    modalId
                ).classList.add(
                    "hidden"
                );

            }
        );

    }
);


/* =========================================
   CLOSE MODAL OUTSIDE
========================================= */

document.querySelectorAll(
    ".modal"
).forEach(
    function (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    modal.classList.add(
                        "hidden"
                    );

                }

            }
        );

    }
);


/* =========================================
   FORMAT MONEY
========================================= */

function formatMoney(number) {

    return (
        Number(number || 0)
        .toLocaleString("uz-UZ") +
        " so‘m"
    );

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const parts =
        dateString.split("-");


    if (parts.length !== 3) {
        return dateString;
    }


    return (
        parts[2] +
        "." +
        parts[1] +
        "." +
        parts[0]
    );

}


/* =========================================
   HTML SECURITY
========================================= */

function escapeHtml(value) {

    if (value === undefined || value === null) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   AUTO LOGIN SESSION
========================================= */

if (currentUser) {

    openApplication();

}


/* =========================================
   CONSOLE
========================================= */

console.log(
    "Goldshow tizimi ishga tushdi."
);

console.log(
    "Owner login: Foziljon"
);

console.log(
    "Owner parol: Foziljon2010"
);