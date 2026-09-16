const OWNER = {
    name: "Foziljon",
    username: "Foziljon",
    password: "Foziljon2010",
    role: "owner"
};

const DEFAULT_ADMIN = {
    name: "Otabek Raximov",
    username: "Otabek",
    password: "goldshow",
    role: "admin"
};


const $ = id =>
    document.getElementById(id);


const normRole = role => {

    role = String(
        role || "worker"
    ).toLowerCase();

    if (
        role === "user" ||
        role === "ishchi" ||
        role === "worker"
    ) {
        return "worker";
    }

    return role;
};


const esc = value =>
    String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");


const money = value =>
    Number(value || 0)
        .toLocaleString("uz-UZ") +
    " so‘m";


let users =
    JSON.parse(
        localStorage.getItem(
            "goldshow_users"
        ) || "[]"
    ).map(
        user => ({
            ...user,
            role: normRole(user.role)
        })
    );


let orders =
    JSON.parse(
        localStorage.getItem(
            "goldshow_orders"
        ) || "[]"
    ).map(
        order => ({
            ...order
        })
    );


let currentUser = null;


/* =====================================================
   STORAGE
===================================================== */

function saveUsers() {

    localStorage.setItem(
        "goldshow_users",
        JSON.stringify(users)
    );

}


function saveOrders() {

    localStorage.setItem(
        "goldshow_orders",
        JSON.stringify(orders)
    );

}


/* =====================================================
   ENSURE OWNER + ADMIN
===================================================== */

function ensureSystemUsers() {

    const ownerIndex =
        users.findIndex(
            user =>
                String(
                    user.username
                ).toLowerCase() ===
                OWNER.username.toLowerCase()
        );


    if (
        ownerIndex >= 0
    ) {

        users[ownerIndex] = {
            ...users[ownerIndex],
            ...OWNER
        };

    } else {

        users.unshift({
            ...OWNER,
            id: Date.now()
        });

    }


    const adminIndex =
        users.findIndex(
            user =>
                String(
                    user.username
                ).toLowerCase() ===
                DEFAULT_ADMIN.username.toLowerCase()
        );


    if (
        adminIndex < 0
    ) {

        users.push({
            ...DEFAULT_ADMIN,
            id: Date.now() + 1
        });

    }


    users.forEach(
        user => {
            user.role =
                normRole(
                    user.role
                );
        }
    );


    saveUsers();

}


ensureSystemUsers();


/* =====================================================
   ROLE
===================================================== */

function roleText(role) {

    role =
        normRole(role);

    if (
        role === "owner"
    ) {
        return "OWNER";
    }

    if (
        role === "admin"
    ) {
        return "ADMIN";
    }

    return "ISHCHI";
}


function roleIcon(role) {

    role =
        normRole(role);

    if (
        role === "owner"
    ) {
        return "👑";
    }

    if (
        role === "admin"
    ) {
        return "🛡️";
    }

    return "👷";
}


/* =====================================================
   PERMISSIONS
===================================================== */

function hasUserManagement() {

    return [
        "owner",
        "admin"
    ].includes(
        normRole(
            currentUser?.role
        )
    );

}


function canManageTarget(
    target
) {

    const me =
        normRole(
            currentUser?.role
        );

    const targetRole =
        normRole(
            target?.role
        );


    if (
        me === "owner"
    ) {

        return targetRole !== "owner";

    }


    if (
        me === "admin"
    ) {

        return targetRole === "worker";

    }


    return false;

}


/* =====================================================
   LOGIN MESSAGE
===================================================== */

function showMessage(
    text,
    error = true
) {

    const box =
        $("loginMessage");

    if (!box) {
        return;
    }

    box.textContent =
        text;

    box.className =
        "message";

    box.style.color =
        error
            ? "#dc2626"
            : "#15803d";

}


/* =====================================================
   LOGIN
===================================================== */

function login() {

    const username =
        $("username")
            ?.value
            .trim() || "";

    const password =
        $("password")
            ?.value || "";


    if (
        !username ||
        !password
    ) {

        showMessage(
            "❌ Login va parolni kiriting."
        );

        return;
    }


    const found =
        users.find(
            user =>
                String(
                    user.username
                ).toLowerCase() ===
                username.toLowerCase() &&
                String(
                    user.password
                ) === password
        );


    if (!found) {

        showMessage(
            "❌ Login yoki parol noto‘g‘ri."
        );

        return;
    }


    currentUser = {
        ...found,
        role:
            normRole(
                found.role
            )
    };


    localStorage.setItem(
        "goldshow_current_user",
        JSON.stringify(
            currentUser
        )
    );


    openApp();

}


/* =====================================================
   OPEN APP
===================================================== */

function openApp() {

    $("loginPage")
        ?.classList
        .add("hidden");

    $("mainPage")
        ?.classList
        .remove("hidden");


    refreshUI();

    showSection(
        "dashboardSection"
    );

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    currentUser =
        null;

    localStorage.removeItem(
        "goldshow_current_user"
    );


    $("mainPage")
        ?.classList
        .add("hidden");

    $("loginPage")
        ?.classList
        .remove("hidden");


    if (
        $("username")
    ) {
        $("username").value = "";
    }

    if (
        $("password")
    ) {
        $("password").value = "";

        $("password").type =
            "password";
    }


    if (
        $("togglePassword")
    ) {
        $("togglePassword")
            .textContent = "👁️";
    }


    showMessage(
        "",
        false
    );

}


/* =====================================================
   UI
===================================================== */

function refreshUI() {

    if (!currentUser) {
        return;
    }


    const role =
        normRole(
            currentUser.role
        );

    const name =
        currentUser.name ||
        currentUser.username;


    $("currentUserName")
        .textContent =
        name;


    $("currentUserRole")
        .textContent =
        roleText(role);


    $("userAvatar")
        .textContent =
        name
            .charAt(0)
            .toUpperCase();


    const badge =
        $("roleBadge");


    badge.textContent =
        `${roleIcon(role)} ${roleText(role)}`;


    badge.className =
        "role-badge" +
        (
            role === "owner"
                ? " owner"
                : ""
        );


    $("welcomeName")
        .textContent =
        `${name} ${roleIcon(role)}`;


    $("welcomeText")
        .textContent =
        role === "owner"
            ? "Siz Owner sifatida tizimga kirdingiz. Barcha boshqaruv huquqlari sizda."
            : role === "admin"
                ? "Siz Admin sifatida tizimga kirdingiz. Userlar va zakaslarni boshqarishingiz mumkin."
                : "Siz Ishchi sifatida tizimga kirdingiz. Tizimdagi kerakli ma'lumotlardan foydalanishingiz mumkin.";


    $("permissionTitle")
        .textContent =
        `${roleText(role)} huquqlari`;


    $("permissionSubtitle")
        .textContent =
        role === "owner"
            ? "Owner barcha boshqaruv imkoniyatlariga ega."
            : role === "admin"
                ? "Admin yangi user qo‘shishi va ishchilarni boshqarishi mumkin."
                : "Ishchi uchun mavjud tizim imkoniyatlari.";


    const permissions =
        role === "owner"
            ? [
                "👥 Foydalanuvchi qo‘shish",
                "🔑 Login va parolni boshqarish",
                "📋 Zakaslarni boshqarish",
                "🛡️ Owner himoyalangan"
            ]
            : role === "admin"
                ? [
                    "👥 Yangi user qo‘shish",
                    "🛡️ Ishchilarni boshqarish",
                    "📋 Zakaslarni boshqarish",
                    "✏️ Zakaslarni tahrirlash"
                ]
                : [
                    "📋 Zakaslarni ko‘rish",
                    "📅 Tadbir ma'lumotlari",
                    "👤 O‘z ish ma’lumotlari",
                    "🔒 Admin va Owner himoyalangan"
                ];


    $("permissions")
        .innerHTML =
        permissions
            .map(
                text =>
                    `<div>${text}</div>`
            )
            .join("");


    document
        .querySelectorAll(
            ".admin-menu"
        )
        .forEach(
            element =>
                element
                    .classList
                    .toggle(
                        "hidden",
                        !hasUserManagement()
                    )
        );


    $("addUserButton")
        ?.classList
        .toggle(
            "hidden",
            !hasUserManagement()
        );


    $("addOrderButton")
        ?.classList
        .toggle(
            "hidden",
            ![
                "owner",
                "admin"
            ].includes(role)
        );


    $("usersSubtitle")
        .textContent =
        role === "owner"
            ? "Owner foydalanuvchilarni to‘liq boshqaradi."
            : "Admin yangi user qo‘sha oladi; Owner himoyalangan.";


    updateStats();
    updateUsersTable();
    updateOrderList();

}


/* =====================================================
   SECTIONS
===================================================== */

function showSection(
    id
) {

    document
        .querySelectorAll(
            ".menu-item"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.section === id
                );

            }
        );


    document
        .querySelectorAll(
            ".content-section"
        )
        .forEach(
            section => {

                section.classList.toggle(
                    "active-section",
                    section.id === id
                );

            }
        );


    if (
        id === "usersSection"
    ) {

        updateUsersTable();

    }


    if (
        id === "ordersSection"
    ) {

        updateOrderList();

    }

}


document
    .querySelectorAll(
        ".menu-item"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () =>
                    showSection(
                        button.dataset.section
                    )
            );

        }
    );


/* =====================================================
   BUTTON EVENTS
===================================================== */

$("loginButton")
    ?.addEventListener(
        "click",
        login
    );


$("username")
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {
                login();
            }

        }
    );


$("password")
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {
                login();
            }

        }
    );


$("logoutButton")
    ?.addEventListener(
        "click",
        logout
    );


$("togglePassword")
    ?.addEventListener(
        "click",
        () => {

            const input =
                $("password");

            const visible =
                input.type === "password";


            input.type =
                visible
                    ? "text"
                    : "password";


            $("togglePassword")
                .textContent =
                visible
                    ? "🙈"
                    : "👁️";

        }
    );


/* =====================================================
   STATS
===================================================== */

function updateStats() {

    $("userCount")
        .textContent =
        users.length;


    $("orderCount")
        .textContent =
        orders.length;

}


/* =====================================================
   USERS TABLE
===================================================== */

function updateUsersTable() {

    const table =
        $("usersTable");

    if (!table) {
        return;
    }


    if (
        !hasUserManagement()
    ) {

        table.innerHTML = "";

        return;

    }


    table.innerHTML =
        users
            .map(
                user => {

                    const role =
                        normRole(
                            user.role
                        );


                    const protectedOwner =
                        role === "owner";


                    const manageable =
                        canManageTarget(
                            user
                        );


                    let action =
                        "🔒 Himoyalangan";


                    if (
                        !protectedOwner &&
                        manageable
                    ) {

                        action =
                            `
                            <button
                                class="delete-user"
                                data-id="${Number(user.id)}"
                            >
                                🗑️ O‘chirish
                            </button>
                            `;

                    }


                    return `
                        <tr>

                            <td>
                                <strong>
                                    ${esc(user.name)}
                                </strong>
                            </td>

                            <td>
                                ${esc(user.username)}
                            </td>

                            <td>
                                <span class="user-role">
                                    ${roleText(role)}
                                </span>
                            </td>

                            <td>
                                <span class="status">
                                    ● Aktiv
                                </span>
                            </td>

                            <td>
                                ${action}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");


    table
        .querySelectorAll(
            ".delete-user"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        deleteUser(
                            Number(
                                button.dataset.id
                            )
                        )
                );

            }
        );

}


/* =====================================================
   DELETE USER
===================================================== */

function deleteUser(
    id
) {

    const target =
        users.find(
            user =>
                Number(user.id) ===
                Number(id)
        );


    if (!target) {
        return;
    }


    const role =
        normRole(
            target.role
        );


    if (
        role === "owner"
    ) {

        alert(
            "🔒 Ownerni o‘chirib bo‘lmaydi."
        );

        return;
    }


    if (
        !canManageTarget(
            target
        )
    ) {

        alert(
            "❌ Bu userni o‘chirish huquqi yo‘q."
        );

        return;
    }


    if (
        !confirm(
            `"${target.name}" foydalanuvchisini o‘chirmoqchimisiz?`
        )
    ) {

        return;

    }


    users =
        users.filter(
            user =>
                Number(user.id) !==
                Number(id)
        );


    saveUsers();

    refreshUI();

}


/* =====================================================
   USER MODAL
===================================================== */

$("addUserButton")
    ?.addEventListener(
        "click",
        () => {

            if (
                !hasUserManagement()
            ) {

                alert(
                    "❌ Sizda user qo‘shish huquqi yo‘q."
                );

                return;
            }


            $("userModal")
                ?.classList
                .remove("hidden");


            if (
                $("newUserRole")
            ) {

                $("newUserRole")
                    .value =
                    normRole(
                        currentUser.role
                    ) === "admin"
                        ? "worker"
                        : "admin";

            }

        }
    );


$("closeUserModal")
    ?.addEventListener(
        "click",
        () =>
            $("userModal")
                ?.classList
                .add("hidden")
    );


$("userModal")
    ?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                $("userModal")
            ) {

                $("userModal")
                    .classList
                    .add("hidden");

            }

        }
    );


$("toggleNewPassword")
    ?.addEventListener(
        "click",
        () => {

            const input =
                $("newUserPassword");


            input.type =
                input.type === "password"
                    ? "text"
                    : "password";


            $("toggleNewPassword")
                .textContent =
                input.type === "password"
                    ? "👁️"
                    : "🙈";

        }
    );


/* =====================================================
   CREATE USER
===================================================== */

$("saveUserButton")
    ?.addEventListener(
        "click",
        () => {

            if (
                !hasUserManagement()
            ) {

                alert(
                    "❌ Sizda huquq yo‘q."
                );

                return;
            }


            const name =
                $("newUserName")
                    .value
                    .trim();


            const username =
                $("newUserLogin")
                    .value
                    .trim();


            const password =
                $("newUserPassword")
                    .value;


            const role =
                $("newUserRole")
                    .value;


            const me =
                normRole(
                    currentUser.role
                );


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
                users.some(
                    user =>
                        String(
                            user.username
                        ).toLowerCase() ===
                        username.toLowerCase()
                )
            ) {

                alert(
                    "❌ Bu login allaqachon mavjud."
                );

                return;
            }


            if (
                role === "owner"
            ) {

                alert(
                    "❌ Yangi Owner yaratib bo‘lmaydi."
                );

                return;
            }


            if (
                me === "admin" &&
                role !== "worker"
            ) {

                alert(
                    "❌ Admin faqat Ishchi yaratishi mumkin."
                );

                return;
            }


            users.push({

                id: Date.now(),

                name,

                username,

                password,

                role

            });


            saveUsers();

            refreshUI();


            $("newUserName")
                .value = "";

            $("newUserLogin")
                .value = "";

            $("newUserPassword")
                .value = "";


            $("userModal")
                .classList
                .add("hidden");


            alert(
                `✅ ${
                    role === "admin"
                        ? "Admin"
                        : "Ishchi"
                } muvaffaqiyatli qo‘shildi.`
            );

        }
    );


/* =====================================================
   ORDER MODAL
===================================================== */

$("addOrderButton")
    ?.addEventListener(
        "click",
        () => {

            $("orderModal")
                ?.classList
                .remove("hidden");

        }
    );


$("closeOrderModal")
    ?.addEventListener(
        "click",
        () =>
            $("orderModal")
                ?.classList
                .add("hidden")
    );


$("orderModal")
    ?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                $("orderModal")
            ) {

                $("orderModal")
                    .classList
                    .add("hidden");

            }

        }
    );


/* =====================================================
   SAVE ORDER
===================================================== */

$("saveOrderButton")
    ?.addEventListener(
        "click",
        () => {

            if (
                ![
                    "owner",
                    "admin"
                ].includes(
                    normRole(
                        currentUser?.role
                    )
                )
            ) {

                alert(
                    "❌ Faqat Admin yoki Owner zakas qo‘sha oladi."
                );

                return;
            }


            const clientName =
                $("clientName")
                    .value
                    .trim();


            const clientPhone =
                $("clientPhone")
                    .value
                    .trim();


            const location =
                $("eventLocation")
                    .value
                    .trim();


            const eventDate =
                $("eventDate")
                    .value;


            if (
                !clientName ||
                !clientPhone ||
                !location ||
                !eventDate
            ) {

                alert(
                    "❌ Mijoz, telefon, manzil va tadbir vaqtini kiriting."
                );

                return;
            }


            orders.push({

                id: Date.now(),

                clientName,

                clientPhone,

                location,

                eventDate,

                screenHeight:
                    $("screenHeight").value,

                screenLength:
                    $("screenLength").value,

                stageWidth:
                    $("stageWidth").value,

                stageLength:
                    $("stageLength").value,

                ledCount:
                    $("ledCount").value || 0,

                lightCount:
                    $("lightCount").value || 0,

                confettiCount:
                    $("confettiCount").value || 0,

                galavaCount:
                    $("galavaCount").value || 0,

                totalAmount:
                    $("totalAmount").value || 0,

                paidAmount:
                    $("paidAmount").value || 0

            });


            saveOrders();

            updateStats();

            updateOrderList();


            $("orderModal")
                .classList
                .add("hidden");


            [
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
            ].forEach(
                id => {

                    $(id).value = "";

                }
            );


            [
                "ledCount",
                "lightCount",
                "confettiCount",
                "galavaCount"
            ].forEach(
                id => {

                    $(id).value = 0;

                }
            );


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
        $("ordersList");

    if (!list) {
        return;
    }


    if (
        !orders.length
    ) {

        list.innerHTML = `
            <div class="empty-box">
                <h3>
                    📋 Hozircha zakas yo‘q
                </h3>

                <p>
                    Yangi zakas qo‘shish uchun yuqoridagi tugmani bosing.
                </p>
            </div>
        `;

        return;
    }


    list.innerHTML =
        orders
            .map(
                order => `

                    <div class="order-card">

                        <h3>
                            📋
                            ${esc(
                                order.clientName
                            )}
                        </h3>

                        <div class="order-row">

                            <span>
                                📞 Telefon
                            </span>

                            <span>
                                ${esc(
                                    order.clientPhone
                                )}
                            </span>

                        </div>


                        <div class="order-row">

                            <span>
                                📍 Manzil
                            </span>

                            <span>
                                ${esc(
                                    order.location
                                )}
                            </span>

                        </div>


                        <div class="order-row">

                            <span>
                                🕐 Tadbir
                            </span>

                            <span>
                                ${esc(
                                    new Date(
                                        order.eventDate
                                    ).toLocaleString(
                                        "uz-UZ"
                                    )
                                )}
                            </span>

                        </div>


                        <div class="order-row">

                            <span>
                                📺 LED
                            </span>

                            <span>
                                ${order.ledCount || 0}
                            </span>

                        </div>


                        <div class="order-row">

                            <span>
                                💡 Chiroq
                            </span>

                            <span>
                                ${order.lightCount || 0}
                            </span>

                        </div>


                        <div class="order-row">

                            <span>
                                🎉 Konfeti
                            </span>

                            <span>
                                ${order.confettiCount || 0}
                            </span>

                        </div>


                        <div class="order-row">

                            <span>
                                💰 Jami
                            </span>

                            <span>
                                ${money(
                                    order.totalAmount
                                )}
                            </span>

                        </div>


                        <div class="order-row">

                            <span>
                                💵 To‘langan
                            </span>

                            <span>
                                ${money(
                                    order.paidAmount
                                )}
                            </span>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =====================================================
   AUTO LOGIN
===================================================== */

try {

    const saved =
        JSON.parse(
            localStorage.getItem(
                "goldshow_current_user"
            ) || "null"
        );


    if (
        saved?.username
    ) {

        const real =
            users.find(
                user =>
                    String(
                        user.username
                    ).toLowerCase() ===
                    String(
                        saved.username
                    ).toLowerCase()
            );


        if (real) {

            currentUser = {
                ...real,
                role:
                    normRole(
                        real.role
                    )
            };


            openApp();

        }

    }

} catch {

    localStorage.removeItem(
        "goldshow_current_user"
    );

}


/* =====================================================
   INITIAL
===================================================== */

updateUsersTable();

updateOrderList();

updateStats();