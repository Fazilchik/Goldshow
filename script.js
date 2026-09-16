/* =====================================================
   GOLD SHOW
   SCRIPT.JS
===================================================== */


/* =====================================================
   OWNER ACCOUNT
===================================================== */

const OWNER = {
    name: "Foziljon",
    username: "Foziljon",
    password: "Foziljon2010",
    role: "owner"
};


/* =====================================================
   STORAGE
===================================================== */

let users =
    JSON.parse(localStorage.getItem("goldshow_users")) || [];

let orders =
    JSON.parse(localStorage.getItem("goldshow_orders")) || [];


/*
   Agar Foziljon hali users ichida bo'lmasa,
   avtomatik Owner sifatida qo'shiladi.
*/

function createOwner() {

    const ownerExists = users.some(
        user => user.username === OWNER.username
    );

    if (!ownerExists) {

        users.unshift({
            id: Date.now(),
            name: OWNER.name,
            username: OWNER.username,
            password: OWNER.password,
            role: OWNER.role
        });

        saveUsers();
    }
}


createOwner();


/* =====================================================
   ELEMENTS
===================================================== */

const loginPage =
    document.getElementById("loginPage");

const mainPage =
    document.getElementById("mainPage");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const togglePassword =
    document.getElementById("togglePassword");

const eyeOpen =
    document.getElementById("eyeOpen");

const eyeClosed =
    document.getElementById("eyeClosed");


/* =====================================================
   PASSWORD EYE
===================================================== */

togglePassword.addEventListener(
    "click",
    function () {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            eyeOpen.style.display = "none";

            eyeClosed.style.display = "block";

            togglePassword.setAttribute(
                "aria-label",
                "Parolni yashirish"
            );

        } else {

            passwordInput.type = "password";

            eyeOpen.style.display = "block";

            eyeClosed.style.display = "none";

            togglePassword.setAttribute(
                "aria-label",
                "Parolni ko'rsatish"
            );

        }

    }
);


/* =====================================================
   LOGIN
===================================================== */

function login() {

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;


    loginMessage.className =
        "login-message";


    if (!username || !password) {

        loginMessage.textContent =
            "❌ Login va parolni kiriting.";

        loginMessage.classList.add("error");

        return;
    }


    /*
       Avval Ownerni tekshiramiz.
       Bu orqali Foziljon/Foziljon2010
       har doim Owner sifatida ishlaydi.
    */

    if (
        username === OWNER.username &&
        password === OWNER.password
    ) {

        const ownerUser = {
            name: OWNER.name,
            username: OWNER.username,
            role: OWNER.role
        };

        localStorage.setItem(
            "goldshow_current_user",
            JSON.stringify(ownerUser)
        );

        showMainPage(ownerUser);

        return;
    }


    /*
       Keyin boshqa foydalanuvchilarni tekshiramiz.
    */

    const user = users.find(
        item =>
            item.username === username &&
            item.password === password
    );


    if (!user) {

        loginMessage.textContent =
            "❌ Login yoki parol noto‘g‘ri.";

        loginMessage.classList.add("error");

        return;
    }


    localStorage.setItem(
        "goldshow_current_user",
        JSON.stringify({
            name: user.name,
            username: user.username,
            role: user.role
        })
    );


    showMainPage(user);
}


loginButton.addEventListener(
    "click",
    login
);


/* ENTER BILAN KIRISH */

usernameInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            login();
        }

    }
);


passwordInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            login();
        }

    }
);


/* =====================================================
   SHOW MAIN PAGE
===================================================== */

function showMainPage(user) {

    loginPage.classList.add("hidden");

    mainPage.classList.remove("hidden");


    document.getElementById(
        "currentUserName"
    ).textContent = user.name;


    document.getElementById(
        "currentUserRole"
    ).textContent =
        user.role.toUpperCase();


    document.getElementById(
        "userAvatar"
    ).textContent =
        user.name.charAt(0).toUpperCase();


    updateUsersTable();

    updateOrderList();

    updateStats();


    /*
       Owner bo'lmagan userga
       Users menyusini ko'rsatmaymiz.
    */

    const usersMenu =
        document.querySelector(
            '[data-section="usersSection"]'
        );


    if (user.role === "owner") {

        usersMenu.style.display = "flex";

    } else {

        usersMenu.style.display = "none";

    }
}


/* =====================================================
   AUTO LOGIN
===================================================== */

const savedUser =
    JSON.parse(
        localStorage.getItem(
            "goldshow_current_user"
        )
    );


if (savedUser) {

    showMainPage(savedUser);

}


/* =====================================================
   LOGOUT
===================================================== */

document.getElementById(
    "logoutButton"
).addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "goldshow_current_user"
        );

        mainPage.classList.add("hidden");

        loginPage.classList.remove("hidden");

        usernameInput.value = "";

        passwordInput.value = "";

        loginMessage.textContent = "";

    }
);


/* =====================================================
   MENU
===================================================== */

const menuItems =
    document.querySelectorAll(".menu-item");


menuItems.forEach(
    item => {

        item.addEventListener(
            "click",
            function () {

                menuItems.forEach(
                    button =>
                        button.classList.remove("active")
                );


                item.classList.add("active");


                const sectionId =
                    item.getAttribute(
                        "data-section"
                    );


                document.querySelectorAll(
                    ".content-section"
                ).forEach(
                    section => {

                        section.classList.remove(
                            "active-section"
                        );

                    }
                );


                document
                    .getElementById(sectionId)
                    .classList.add(
                        "active-section"
                    );

            }
        );

    }
);


/* =====================================================
   USERS STORAGE
===================================================== */

function saveUsers() {

    localStorage.setItem(
        "goldshow_users",
        JSON.stringify(users)
    );

}


/* =====================================================
   USERS TABLE
===================================================== */

function updateUsersTable() {

    const table =
        document.getElementById(
            "usersTable"
        );


    table.innerHTML = "";


    users.forEach(
        user => {

            const row =
                document.createElement("tr");


            let roleName =
                "Ishchi";


            if (user.role === "owner") {
                roleName = "OWNER";
            }

            if (user.role === "admin") {
                roleName = "ADMIN";
            }


            const deleteButton =
                user.role === "owner"
                    ? `<span>🔒</span>`
                    : `
                        <button
                            class="delete-user"
                            data-id="${user.id}"
                        >
                            🗑️
                        </button>
                    `;


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHtml(user.name)}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(user.username)}
                </td>

                <td>
                    <span class="user-role">
                        ${roleName}
                    </span>
                </td>

                <td>
                    <span class="status">
                        ● Aktiv
                    </span>
                </td>

                <td>
                    ${deleteButton}
                </td>

            `;


            table.appendChild(row);

        }
    );


    document.querySelectorAll(
        ".delete-user"
    ).forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        Number(
                            this.dataset.id
                        );


                    deleteUser(id);

                }
            );

        }
    );
}


/* =====================================================
   DELETE USER
===================================================== */

function deleteUser(id) {

    const user =
        users.find(
            item => item.id === id
        );


    if (!user) {
        return;
    }


    if (user.role === "owner") {

        alert(
            "Ownerni o‘chirib bo‘lmaydi."
        );

        return;
    }


    const confirmDelete =
        confirm(
            `"${user.name}" foydalanuvchisini o‘chirishni xohlaysizmi?`
        );


    if (!confirmDelete) {
        return;
    }


    users =
        users.filter(
            item => item.id !== id
        );


    saveUsers();

    updateUsersTable();

    updateStats();

}


/* =====================================================
   ADD USER MODAL
===================================================== */

const userModal =
    document.getElementById(
        "userModal"
    );


document.getElementById(
    "addUserButton"
).addEventListener(
    "click",
    function () {

        userModal.classList.remove(
            "hidden"
        );

    }
);


document.getElementById(
    "closeUserModal"
).addEventListener(
    "click",
    function () {

        userModal.classList.add(
            "hidden"
        );

    }
);


/* =====================================================
   NEW PASSWORD EYE
===================================================== */

document.getElementById(
    "toggleNewPassword"
).addEventListener(
    "click",
    function () {

        const input =
            document.getElementById(
                "newUserPassword"
            );


        if (input.type === "password") {

            input.type = "text";

            this.textContent = "🙈";

        } else {

            input.type = "password";

            this.textContent = "👁️";

        }

    }
);


/* =====================================================
   SAVE USER
===================================================== */

document.getElementById(
    "saveUserButton"
).addEventListener(
    "click",
    function () {

        const name =
            document.getElementById(
                "newUserName"
            ).value.trim();


        const username =
            document.getElementById(
                "newUserLogin"
            ).value.trim();


        const password =
            document.getElementById(
                "newUserPassword"
            ).value;


        const role =
            document.getElementById(
                "newUserRole"
            ).value;


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


        /*
           Login takrorlanmasligi
        */

        const exists =
            users.some(
                user =>
                    user.username.toLowerCase() ===
                    username.toLowerCase()
            );


        if (exists) {

            alert(
                "Bu login allaqachon mavjud."
            );

            return;
        }


        users.push({

            id: Date.now(),

            name: name,

            username: username,

            password: password,

            role: role

        });


        saveUsers();

        updateUsersTable();

        updateStats();


        /*
           Formani tozalash
        */

        document.getElementById(
            "newUserName"
        ).value = "";


        document.getElementById(
            "newUserLogin"
        ).value = "";


        document.getElementById(
            "newUserPassword"
        ).value = "";


        document.getElementById(
            "newUserRole"
        ).value = "worker";


        userModal.classList.add(
            "hidden"
        );


        alert(
            "✅ Foydalanuvchi muvaffaqiyatli qo‘shildi."
        );

    }
);


/* =====================================================
   ORDER STORAGE
===================================================== */

function saveOrders() {

    localStorage.setItem(
        "goldshow_orders",
        JSON.stringify(orders)
    );

}


/* =====================================================
   ADD ORDER MODAL
===================================================== */

const orderModal =
    document.getElementById(
        "orderModal"
    );


document.getElementById(
    "addOrderButton"
).addEventListener(
    "click",
    function () {

        orderModal.classList.remove(
            "hidden"
        );

    }
);


document.getElementById(
    "closeOrderModal"
).addEventListener(
    "click",
    function () {

        orderModal.classList.add(
            "hidden"
        );

    }
);


/* =====================================================
   SAVE ORDER
===================================================== */

document.getElementById(
    "saveOrderButton"
).addEventListener(
    "click",
    function () {

        const clientName =
            document.getElementById(
                "clientName"
            ).value.trim();


        const clientPhone =
            document.getElementById(
                "clientPhone"
            ).value.trim();


        const location =
            document.getElementById(
                "eventLocation"
            ).value.trim();


        const eventDate =
            document.getElementById(
                "eventDate"
            ).value;


        if (
            !clientName ||
            !location ||
            !eventDate
        ) {

            alert(
                "Mijoz, manzil va tadbir vaqtini kiriting."
            );

            return;
        }


        const order = {

            id: Date.now(),

            clientName:
                clientName,

            clientPhone:
                clientPhone,

            location:
                location,

            eventDate:
                eventDate,

            screenHeight:
                document.getElementById(
                    "screenHeight"
                ).value,

            screenLength:
                document.getElementById(
                    "screenLength"
                ).value,

            stageWidth:
                document.getElementById(
                    "stageWidth"
                ).value,

            stageLength:
                document.getElementById(
                    "stageLength"
                ).value,

            ledCount:
                document.getElementById(
                    "ledCount"
                ).value,

            lightCount:
                document.getElementById(
                    "lightCount"
                ).value,

            confettiCount:
                document.getElementById(
                    "confettiCount"
                ).value,

            galavaCount:
                document.getElementById(
                    "galavaCount"
                ).value,

            totalAmount:
                document.getElementById(
                    "totalAmount"
                ).value,

            paidAmount:
                document.getElementById(
                    "paidAmount"
                ).value

        };


        orders.push(order);

        saveOrders();

        updateOrderList();

        updateStats();


        orderModal.classList.add(
            "hidden"
        );


        clearOrderForm();


        alert(
            "✅ Zakas muvaffaqiyatli saqlandi."
        );

    }
);


/* =====================================================
   ORDER LIST
===================================================== */

function updateOrderList() {

    const list =
        document.getElementById(
            "ordersList"
        );


    if (orders.length === 0) {

        list.innerHTML = `

            <div class="empty-box">

                📋

                <h3>
                    Hozircha zakas yo‘q
                </h3>

                <p>
                    Yangi zakas qo‘shish uchun
                    yuqoridagi tugmani bosing.
                </p>

            </div>

        `;

        return;
    }


    list.innerHTML = "";


    orders.forEach(
        order => {

            const date =
                new Date(
                    order.eventDate
                );


            const formattedDate =
                date.toLocaleString(
                    "uz-UZ"
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "order-card";


            card.innerHTML = `

                <h3>
                    📋 ${escapeHtml(order.clientName)}
                </h3>

                <div class="order-row">
                    <span>📞 Telefon</span>
                    <span>
                        ${escapeHtml(order.clientPhone || "-")}
                    </span>
                </div>

                <div class="order-row">
                    <span>📍 Manzil</span>
                    <span>
                        ${escapeHtml(order.location)}
                    </span>
                </div>

                <div class="order-row">
                    <span>🕐 Tadbir</span>
                    <span>
                        ${formattedDate}
                    </span>
                </div>

                <div class="order-row">
                    <span>📺 LED</span>
                    <span>
                        ${order.ledCount || 0}
                    </span>
                </div>

                <div class="order-row">
                    <span>💡 Chiroq</span>
                    <span>
                        ${order.lightCount || 0}
                    </span>
                </div>

                <div class="order-row">
                    <span>🎉 Konfeti</span>
                    <span>
                        ${order.confettiCount || 0}
                    </span>
                </div>

                <div class="order-row">
                    <span>💰 Jami</span>
                    <span>
                        ${formatMoney(order.totalAmount)}
                    </span>
                </div>

                <div class="order-row">
                    <span>💵 To‘langan</span>
                    <span>
                        ${formatMoney(order.paidAmount)}
                    </span>
                </div>

            `;


            list.appendChild(card);

        }
    );

}


/* =====================================================
   STATS
===================================================== */

function updateStats() {

    document.getElementById(
        "userCount"
    ).textContent =
        users.length;


    document.getElementById(
        "orderCount"
    ).textContent =
        orders.length;

}


/* =====================================================
   CLEAR ORDER FORM
===================================================== */

function clearOrderForm() {

    const ids = [

        "clientName",
        "clientPhone",
        "eventLocation",
        "eventDate",
        "screenHeight",
        "screenLength",
        "stageWidth",
        "stageLength",
        "totalAmount",
        "paidAmount"

    ];


    ids.forEach(
        id => {

            document.getElementById(
                id
            ).value = "";

        }
    );


    document.getElementById(
        "ledCount"
    ).value = 0;


    document.getElementById(
        "lightCount"
    ).value = 0;


    document.getElementById(
        "confettiCount"
    ).value = 0;


    document.getElementById(
        "galavaCount"
    ).value = 0;

}


/* =====================================================
   MONEY FORMAT
===================================================== */

function formatMoney(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "0 so‘m";

    }


    const number =
        Number(value);


    if (Number.isNaN(number)) {

        return "0 so‘m";

    }


    return (
        number.toLocaleString("uz-UZ") +
        " so‘m"
    );

}


/* =====================================================
   SECURITY
===================================================== */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =====================================================
   CLOSE MODALS BY CLICKING OUTSIDE
===================================================== */

userModal.addEventListener(
    "click",
    function (event) {

        if (event.target === userModal) {

            userModal.classList.add(
                "hidden"
            );

        }

    }
);


orderModal.addEventListener(
    "click",
    function (event) {

        if (event.target === orderModal) {

            orderModal.classList.add(
                "hidden"
            );

        }

    }
);


/* =====================================================
   INITIAL UPDATE
===================================================== */

updateUsersTable();

updateOrderList();

updateStats();