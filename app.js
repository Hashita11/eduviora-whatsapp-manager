// ================================
// EDUVIORA WHATSAPP MANAGER
// STEP 1
// ================================


// DATA

let contacts =
    JSON.parse(localStorage.getItem("eduviora_contacts")) || [];

let templates =
    JSON.parse(localStorage.getItem("eduviora_templates")) || [];

let preparedMessages =
    JSON.parse(localStorage.getItem("eduviora_messages")) || [];


// ================================
// START
// ================================

document.addEventListener("DOMContentLoaded", function () {

    displayContacts();
    displayTemplates();
    displayCampaigns();
    updateDashboard();

    showSection("contacts");

});


// ================================
// SECTION NAVIGATION
// ================================

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


// ================================
// ADD CONTACT
// ================================

function addContact() {

    const name =
        document.getElementById("contactName").value.trim();

    const phone =
        document.getElementById("contactPhone").value.trim();

    const category =
        document.getElementById("contactCategory").value.trim();


    if (!name || !phone) {

        alert("Please enter customer name and mobile number.");

        return;
    }


    const contact = {

        id: Date.now(),

        name: name,

        phone: phone,

        category: category || "Customer"

    };


    contacts.push(contact);


    localStorage.setItem(
        "eduviora_contacts",
        JSON.stringify(contacts)
    );


    document.getElementById("contactName").value = "";

    document.getElementById("contactPhone").value = "";

    document.getElementById("contactCategory").value = "";


    displayContacts();

    displayCampaigns();

    updateDashboard();

}


// ================================
// DISPLAY CONTACTS
// ================================

function displayContacts() {

    const list =
        document.getElementById("contactList");

    const search =
        document.getElementById("searchContact")
        ?.value
        .toLowerCase() || "";


    list.innerHTML = "";


    const filtered =
        contacts.filter(contact =>

            contact.name.toLowerCase().includes(search) ||

            contact.phone.includes(search) ||

            contact.category.toLowerCase().includes(search)

        );


    if (filtered.length === 0) {

        list.innerHTML =
            "<p>No contacts found.</p>";

        return;
    }


    filtered.forEach(contact => {

        const div =
            document.createElement("div");

        div.className = "contact";


        div.innerHTML = `

            <div class="contact-info">

                <strong>
                    ${escapeHTML(contact.name)}
                </strong>

                <small>
                    ${escapeHTML(contact.phone)}
                    •
                    ${escapeHTML(contact.category)}
                </small>

            </div>


            <div>

                <button
                    onclick="openWhatsApp('${contact.phone}', '${contact.name}')"
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


// ================================
// DELETE CONTACT
// ================================

function deleteContact(id) {

    if (!confirm("Delete this contact?")) {
        return;
    }


    contacts =
        contacts.filter(contact => contact.id !== id);


    localStorage.setItem(
        "eduviora_contacts",
        JSON.stringify(contacts)
    );


    displayContacts();

    displayCampaigns();

    updateDashboard();

}


// ================================
// ADD TEMPLATE
// ================================

function addTemplate() {

    const title =
        document.getElementById("templateTitle")
        .value.trim();


    const message =
        document.getElementById("templateMessage")
        .value.trim();


    if (!title || !message) {

        alert("Please enter template name and message.");

        return;
    }


    const template = {

        id: Date.now(),

        title: title,

        message: message

    };


    templates.push(template);


    localStorage.setItem(
        "eduviora_templates",
        JSON.stringify(templates)
    );


    document.getElementById("templateTitle").value = "";

    document.getElementById("templateMessage").value = "";


    displayTemplates();

    updateDashboard();

}


// ================================
// DISPLAY TEMPLATES
// ================================

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

        div.className = "template";


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


// ================================
// DELETE TEMPLATE
// ================================

function deleteTemplate(id) {

    if (!confirm("Delete this template?")) {
        return;
    }


    templates =
        templates.filter(template => template.id !== id);


    localStorage.setItem(
        "eduviora_templates",
        JSON.stringify(templates)
    );


    displayTemplates();

    updateDashboard();

}


// ================================
// CAMPAIGNS
// ================================

function displayCampaigns() {

    const list =
        document.getElementById("campaignList");


    list.innerHTML = "";


    if (contacts.length === 0) {

        list.innerHTML =
            "<p>Add contacts first.</p>";

        return;
    }


    contacts.forEach(contact => {

        const div =
            document.createElement("div");

        div.className = "campaign";


        div.innerHTML = `

            <strong>
                ${escapeHTML(contact.name)}
            </strong>

            <br>

            ${escapeHTML(contact.phone)}

            <br><br>

            <button
                onclick="prepareMessage(${contact.id})"
            >
                Prepare WhatsApp Message
            </button>

        `;


        list.appendChild(div);

    });

}


// ================================
// PREPARE MESSAGE
// ================================

function prepareMessage(contactId) {

    const contact =
        contacts.find(c => c.id === contactId);


    if (!contact) {
        return;
    }


    let message =
        "Hello " + contact.name + ",\n\n";

    message +=
        "EDUVIORA - One Platform. Every Business.\n\n";

    message +=
        "We provide Business Websites, CRM, Billing, ERP and Digital Solutions.\n\n";

    message +=
        "Contact us for more information.\n\n";

    message +=
        "www.eduviora.in";


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


// ================================
// OPEN WHATSAPP
// ================================

function openWhatsApp(phone, name, message) {

    let cleanPhone =
        phone.replace(/\D/g, "");


    // India number handling

    if (cleanPhone.length === 10) {

        cleanPhone =
            "91" + cleanPhone;

    }


    if (!message) {

        message =
            "Hello " + name + ",\n\n";

        message +=
            "This is EDUVIORA.\n\n";

        message +=
            "We provide complete digital solutions for businesses.\n\n";

        message +=
            "Website | CRM | Billing | ERP\n\n";

        message +=
            "www.eduviora.in";

    }


    const url =
        "https://wa.me/" +
        cleanPhone +
        "?text=" +
        encodeURIComponent(message);


    window.open(url, "_blank");

}


// ================================
// DASHBOARD
// ================================

function updateDashboard() {

    document.getElementById("totalContacts")
        .innerText = contacts.length;


    document.getElementById("totalTemplates")
        .innerText = templates.length;


    document.getElementById("totalMessages")
        .innerText = preparedMessages.length;

}


// ================================
// SECURITY
// ================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}
