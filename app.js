// ==========================================
// EDUVIORA WHATSAPP MARKETING MANAGER
// STEP 2 - CSV CONTACT IMPORT
// ==========================================


// ==========================================
// LOAD DATA
// ==========================================

let contacts =
    JSON.parse(localStorage.getItem("eduviora_contacts")) || [];

let templates =
    JSON.parse(localStorage.getItem("eduviora_templates")) || [];

let preparedMessages =
    JSON.parse(localStorage.getItem("eduviora_messages")) || [];


// ==========================================
// START
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    displayContacts();

    displayTemplates();

    displayCampaigns();
    displayMessageHistory();

    updateDashboard();

    showSection("contacts");

});


// ==========================================
// SECTION NAVIGATION
// ==========================================

function showSection(sectionName) {

    document.querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove("active");

        });


    const section =
        document.getElementById(sectionName);


    if (section) {

        section.classList.add("active");

    }

}


// ==========================================
// ADD SINGLE CONTACT
// ==========================================

function addContact() {

    const name =
        document.getElementById("contactName")
        .value.trim();


    const phone =
        document.getElementById("contactPhone")
        .value.trim();


    const category =
        document.getElementById("contactCategory")
        .value.trim();


    if (!name || !phone) {

        alert(
            "Please enter customer name and mobile number."
        );

        return;

    }


    const cleanPhone =
        cleanMobile(phone);


    if (!cleanPhone) {

        alert(
            "Please enter a valid mobile number."
        );

        return;

    }


    // DUPLICATE CHECK

    const exists =
        contacts.some(
            contact =>
                cleanMobile(contact.phone) === cleanPhone
        );


    if (exists) {

        alert(
            "This mobile number already exists."
        );

        return;

    }


    const contact = {

        id: Date.now(),

        name: name,

        phone: cleanPhone,

        category:
            category || "Customer"

    };


    contacts.push(contact);


    saveContacts();


    document.getElementById("contactName").value = "";

    document.getElementById("contactPhone").value = "";

    document.getElementById("contactCategory").value = "";


    displayContacts();

    displayCampaigns();

    updateDashboard();


    alert("Contact added successfully.");

}


// ==========================================
// CLEAN MOBILE NUMBER
// ==========================================

function cleanMobile(phone) {

    let number =
        String(phone)
        .replace(/\D/g, "");


    // +91XXXXXXXXXX

    if (number.startsWith("91") && number.length === 12) {

        number = number.substring(2);

    }


    // 10 digit Indian number

    if (number.length === 10) {

        return number;

    }


    return "";

}


// ==========================================
// SAVE CONTACTS
// ==========================================

function saveContacts() {

    localStorage.setItem(
        "eduviora_contacts",
        JSON.stringify(contacts)
    );

}


// ==========================================
// DISPLAY CONTACTS
// ==========================================

function displayContacts() {

    const list =
        document.getElementById("contactList");

    const search =
        document.getElementById("searchContact")
        ?.value
        .toLowerCase()
        .trim() || "";

    const categoryElement =
        document.getElementById("categoryFilter");

    const selectedCategory =
        categoryElement
        ? categoryElement.value
        : "All";

    list.innerHTML = "";

    const filtered =
        contacts.filter(contact => {

            const name =
                (contact.name || "")
                .toLowerCase();

            const phone =
                (contact.phone || "");

            const contactCategory =
                (contact.category || "General");

            const matchesSearch =
                name.includes(search) ||
                phone.includes(search) ||
                contactCategory
                    .toLowerCase()
                    .includes(search);

            const matchesCategory =
                selectedCategory === "All" ||
                contactCategory === selectedCategory;

            return matchesSearch && matchesCategory;

        });


    if (filtered.length === 0) {

        list.innerHTML =
            "<p>No contacts found.</p>";

        return;

    }
// Select All checkbox
const selectAllDiv = document.createElement("div");

selectAllDiv.innerHTML = `
    <label style="display:block; margin:15px 0; font-weight:bold;">
        <input
            type="checkbox"
            id="selectAllCampaigns"
            onchange="toggleAllCampaignContacts(this)"
        >
        ☑️ Select All Contacts
    </label>
`;

list.appendChild(selectAllDiv);

    filtered.forEach(contact => {

        const div =
            document.createElement("div");

        div.className =
            "contact";


        div.innerHTML = `

            <div class="contact-info">

                <strong>
                    ${escapeHTML(contact.name)}
                </strong>

                <small>
                    ${escapeHTML(contact.phone)}
                    •
                    ${escapeHTML(contact.category || "General")}
                </small>

            </div>


            <div>

                <button
                    onclick="openWhatsApp(
                        '${contact.phone}',
                        '${escapeHTML(contact.name)}'
                    )"
                >
                    WhatsApp
                </button>


                <button
                    onclick="deleteContact(${contact.id})"
                >
                    Delete
                </button>

            </div>

        `;


        list.appendChild(div);

    });

}

// ==========================================
// DELETE CONTACT
// ==========================================

function deleteContact(id) {

    if (!confirm("Delete this contact?")) {

        return;

    }


    contacts =
        contacts.filter(
            contact => contact.id !== id
        );


    saveContacts();


    displayContacts();

    displayCampaigns();

    updateDashboard();

}


// ==========================================
// CSV IMPORT
// ==========================================

function importCSV() {

    const fileInput =
        document.getElementById("csvFile");


    const result =
        document.getElementById("importResult");


    if (!fileInput.files.length) {

        alert(
            "Please select a CSV file first."
        );

        return;

    }


    const file =
        fileInput.files[0];


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            const text =
                event.target.result;


            processCSV(text);

        };


    reader.readAsText(file);

}


// ==========================================
// PROCESS CSV
// ==========================================

function processCSV(text) {

    const result =
        document.getElementById("importResult");


    const lines =
        text
        .split(/\r?\n/)
        .filter(line => line.trim() !== "");


    if (lines.length < 2) {

        result.innerHTML =
            "❌ CSV file has no contact data.";

        return;

    }


    // HEADER

    const header =
        parseCSVLine(lines[0])
        .map(item =>
            item.trim().toLowerCase()
        );


    const nameIndex =
        findColumn(
            header,
            ["name", "customer", "customer name"]
        );


    const phoneIndex =
        findColumn(
            header,
            ["phone", "mobile", "mobile number", "number"]
        );


    const categoryIndex =
        findColumn(
            header,
            ["category", "type", "customer type"]
        );


    if (
        nameIndex === -1 ||
        phoneIndex === -1
    ) {

        result.innerHTML = `
            ❌ Required columns missing.
            <br><br>
            Your CSV must contain:
            <strong>Name</strong> and
            <strong>Phone</strong>.
        `;

        return;

    }


    let added = 0;

    let skipped = 0;


    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        const row =
            parseCSVLine(lines[i]);


        const name =
            (row[nameIndex] || "")
            .trim();


        const phone =
            (row[phoneIndex] || "")
            .trim();


        const category =
            categoryIndex !== -1
                ? (row[categoryIndex] || "").trim()
                : "Customer";


        if (!name || !phone) {

            skipped++;

            continue;

        }


        const cleanPhoneNumber =
            cleanMobile(phone);


        if (!cleanPhoneNumber) {

            skipped++;

            continue;

        }


        // DUPLICATE CHECK

        const exists =
            contacts.some(
                contact =>
                    cleanMobile(contact.phone)
                    === cleanPhoneNumber
            );


        if (exists) {

            skipped++;

            continue;

        }


        contacts.push({

            id: Date.now() + i,

            name: name,

            phone: cleanPhoneNumber,

            category:
                category || "Customer"

        });


        added++;

    }


    saveContacts();


    displayContacts();

    displayCampaigns();

    updateDashboard();


    result.innerHTML = `

        <div class="import-success">

            ✅ Import completed.

            <br><br>

            <strong>${added}</strong>
            contacts added.

            <br>

            <strong>${skipped}</strong>
            contacts skipped.

        </div>

    `;


    fileInput.value = "";

}


// ==========================================
// FIND CSV COLUMN
// ==========================================

function findColumn(
    headers,
    possibleNames
) {

    for (
        let i = 0;
        i < headers.length;
        i++
    ) {

        if (
            possibleNames.includes(
                headers[i]
            )
        ) {

            return i;

        }

    }


    return -1;

}


// ==========================================
// CSV LINE PARSER
// ==========================================

function parseCSVLine(line) {

    const result = [];

    let current = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < line.length;
        i++
    ) {

        const char =
            line[i];


        if (char === '"') {

            insideQuotes =
                !insideQuotes;

        }

        else if (
            char === "," &&
            !insideQuotes
        ) {

            result.push(
                current.trim()
            );

            current = "";

        }

        else {

            current += char;

        }

    }


    result.push(
        current.trim()
    );


    return result.map(
        value =>
            value.replace(/^"|"$/g, "")
    );

}


// ==========================================
// DOWNLOAD SAMPLE CSV
// ==========================================

function downloadSampleCSV() {

    const csv =

`Name,Phone,Category
Ramesh,9876543210,Customer
Suresh,9123456789,Shop
Anil,9988776655,Business
Lakshmi,9000012345,School`;


    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "eduviora-contacts-sample.csv";


    link.click();


    URL.revokeObjectURL(url);

}


// ==========================================
// TEMPLATES
// ==========================================

function addTemplate() {

    const title =
        document.getElementById("templateTitle").value.trim();

    const category =
        document.getElementById("templateCategory").value;

    const message =
        document.getElementById("templateMessage").value.trim();

    if (!title || !message) {
        alert("Please enter template name and message.");
        return;
    }

    templates.push({

        id: Date.now(),

        title: title,

        category: category,

        message: message

    });

    localStorage.setItem(
        "eduviora_templates",
        JSON.stringify(templates)
    );

    document.getElementById("templateTitle").value = "";

    document.getElementById("templateMessage").value = "";

    displayTemplates();

    updateDashboard();

    alert("Template saved successfully.");

}


// ==========================================
// DISPLAY TEMPLATES
// ==========================================

function displayTemplates() {

    const list =
        document.getElementById("templateList");


    list.innerHTML = "";


    if (templates.length === 0) {

        list.innerHTML =
            "<p>No templates created yet.</p>";

        return;

    }


    templates.forEach(template => {

        const div =
            document.createElement("div");


        div.className =
            "template";


        div.innerHTML = `

            <h3>
                ${escapeHTML(template.title)}
            </h3>

            <div class="template-message">
                ${escapeHTML(template.message)}
            </div>

            <br>

            <button
                onclick="deleteTemplate(${template.id})"
            >
                Delete
            </button>

        `;


        list.appendChild(div);

    });

}


// ==========================================
// DELETE TEMPLATE
// ==========================================

function deleteTemplate(id) {

    if (!confirm("Delete this template?")) {

        return;

    }


    templates =
        templates.filter(
            template =>
                template.id !== id
        );


    localStorage.setItem(
        "eduviora_templates",
        JSON.stringify(templates)
    );


    displayTemplates();

    updateDashboard();
mi
}


// ==========================================
// CAMPAIGNS
// ==========================================
function displayCampaigns() {

    const list =
        document.getElementById("campaignList");

    if (!list) return;

    list.innerHTML = "";

    const categoryElement =
        document.getElementById("campaignCategory");

    const selectedCategory =
        categoryElement
        ? categoryElement.value
        : "All";


    const filteredContacts =
        contacts.filter(contact => {

            const contactCategory =
    (contact.category || "General").trim().toLowerCase();

const selected =
    selectedCategory.trim().toLowerCase();

return (
    selected === "all" ||
    contactCategory === selected
);


    if (filteredContacts.length === 0) {

        list.innerHTML = `
            <div class="campaign">
                <p>📭 No contacts found in this category.</p>
            </div>
        `;

        return;

    }


    filteredContacts.forEach(contact => {

        let options = `
            <option value="">Select Template</option>
        `;


        templates.forEach(template => {

            options += `
                <option value="${template.id}">
                    ${escapeHTML(template.title)}
                </option>
            `;

        });


        const div =
            document.createElement("div");

        div.className = "campaign";


        div.innerHTML = `

    <label style="display:block; margin-bottom:15px; font-weight:bold;">
        <input
            type="checkbox"
            class="campaign-contact-checkbox"
            value="${contact.id}"
        >
        ☑️ Select Contact
    </label>

    <h3>
        👤 ${escapeHTML(contact.name)}
    </h3>

            <p>
                📱 ${escapeHTML(contact.phone)}
            </p>

            <select id="template-${contact.id}">
                ${options}
            </select>

            <br><br>

            <button
                onclick="prepareTemplateMessage(${contact.id})"
            >
                📲 Prepare WhatsApp Message
            </button>

        `;


        list.appendChild(div);

    });

}
                        
function toggleAllCampaignContacts(selectAllCheckbox) {

    const checkboxes =
        document.querySelectorAll(".campaign-contact-checkbox");

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });

}
    function prepareSelectedCampaignMessages() {

    const selected =
        document.querySelectorAll(
            ".campaign-contact-checkbox:checked"
        );

    if (selected.length === 0) {
        alert("Please select at least one contact.");
        return;
    }

    let preparedCount = 0;

    selected.forEach(checkbox => {

        const contactId = checkbox.value;

        const contact =
            contacts.find(c => c.id == contactId);

        if (!contact) return;

        const select =
            document.getElementById(
                "template-" + contactId
            );

        if (!select || !select.value) {
            return;
        }

        const template =
            templates.find(
                t => t.id == select.value
            );

        if (!template) return;

        let message = template.message;

        message = message.replace(
            /{{name}}/g,
            contact.name || ""
        );

        message = message.replace(
            /{{phone}}/g,
            contact.phone || ""
        );

        message = message.replace(
            /{{category}}/g,
            contact.category || "General"
        );

        preparedMessages.push({

            id: Date.now() + preparedCount,

            contactName: contact.name,

            phone: contact.phone,

            template: template.title,

            message: message,

            date: new Date().toLocaleString()

        });

        preparedCount++;

    });

    localStorage.setItem(
        "eduviora_messages",
        JSON.stringify(preparedMessages)
    );

    updateDashboard();

    if (typeof displayMessageHistory === "function") {
        displayMessageHistory();
    }

    alert(
        preparedCount +
        " message(s) prepared successfully."
    );
}
    
function prepareTemplateMessage(contactId) {

    const contact = contacts.find(c => c.id == contactId);

    if (!contact) {
        alert("Contact not found");
        return;
    }

    const select =
        document.getElementById("template-" + contactId);

    if (!select || !select.value) {
        alert("Please select a template");
        return;
    }

    const template =
        templates.find(t => t.id == select.value);

    if (!template) {
        alert("Template not found");
        return;
    }

    let message = template.message;

    message = message.replaceAll(
        "{{name}}",
        contact.name
    );

    message = message.replaceAll(
        "{{phone}}",
        contact.phone
    );

    message = message.replaceAll(
        "{{category}}",
        contact.category || ""
    );
    preparedMessages.push({

    id: Date.now(),

    contactName: contact.name,

    phone: contact.phone,

    template: template.title,

    message: message,

    date: new Date().toLocaleString()

});

localStorage.setItem(
    "eduviora_messages",
    JSON.stringify(preparedMessages)
);

updateDashboard();

    openWhatsApp(
        contact.phone,
        contact.name,
        message
    );
}
// display message history
function displayMessageHistory() {

    const list =
        document.getElementById("messageHistory");

    if (!list) return;

    list.innerHTML = "";

    if (preparedMessages.length === 0) {

        list.innerHTML = `
            <div class="campaign">
                <p>📭 No prepared messages yet.</p>
            </div>
        `;

        return;
    }

    preparedMessages
        .slice()
        .reverse()
        .forEach(item => {

            const div =
                document.createElement("div");

            div.className = "campaign";

            div.innerHTML = `

        <input
    type="checkbox"
    class="campaign-contact-checkbox"
    value="${contact.id}"
>
<h3>
                    👤 ${escapeHTML(item.contactName)}
                </h3>

                <p>
                    📱 ${escapeHTML(item.phone)}
                </p>

                <p>
                    📝 Template:
                    <strong>
                        ${escapeHTML(item.template)}
                    </strong>
                </p>

                <p>
                    🕒 ${escapeHTML(item.date)}
                </p>

                <div class="template-message">
                    ${escapeHTML(item.message)}
                </div>

            `;

            list.appendChild(div);

        });

}
// ==========================================
// PREPARE MESSAGE
// ==========================================

function prepareMessage(contactId) {

    const contact =
        contacts.find(
            c => c.id === contactId
        );


    if (!contact) {

        return;

    }


    let message =

`నమస్కారం ${contact.name} గారు,

EDUVIORA మీ వ్యాపారానికి సంపూర్ణ Digital Solutions అందిస్తోంది.

🌐 Business Website
📊 CRM
🧾 Billing
🏫 ERP
📱 WhatsApp Solutions

మీ వ్యాపారాన్ని Digital‌గా మార్చుకోవడానికి మమ్మల్ని సంప్రదించండి.

📞 9492770766
📞 9059988802

🌐 www.eduviora.in`;


    preparedMessages.push({

        id: Date.now(),

        contactId: contactId,

        message: message

    });


    localStorage.setItem(
        "eduviora_messages",
        JSON.stringify(preparedMessages)
    );


    openWhatsApp(
        contact.phone,
        contact.name,
        message
    );


    updateDashboard();

}


// ==========================================
// OPEN WHATSAPP
// ==========================================

function openWhatsApp(
    phone,
    name,
    message
) {

    let cleanPhone =
        cleanMobile(phone);


    if (!cleanPhone) {

        alert(
            "Invalid mobile number."
        );

        return;

    }


    if (!message) {

        message =

`నమస్కారం ${name} గారు,

EDUVIORA మీ వ్యాపారానికి సంపూర్ణ Digital Solutions అందిస్తోంది.

Website | CRM | Billing | ERP

📞 9492770766
📞 9059988802

🌐 www.eduviora.in`;

    }


    const url =

        "https://wa.me/91" +

        cleanPhone +

        "?text=" +

        encodeURIComponent(message);


    window.open(
        url,
        "_blank"
    );

}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

    document.getElementById(
        "totalContacts"
    ).innerText =
        contacts.length;


    document.getElementById(
        "totalTemplates"
    ).innerText =
        templates.length;


    document.getElementById(
        "totalMessages"
    ).innerText =
        preparedMessages.length;

}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

    return String(value)

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
