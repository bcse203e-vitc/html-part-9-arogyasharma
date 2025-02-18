document.addEventListener("DOMContentLoaded", () => {
    const bookBtns = document.querySelectorAll(".book-btn");
    const modal = document.getElementById("form-modal");
    const closeBtn = document.querySelector(".close-btn");
    const form = document.getElementById("appointment-form");
    const serviceDropdown = document.getElementById("service");
    const appointmentList = document.getElementById("appointment-list");
    const appointmentTable = document.getElementById("appointment-table");
    const appointmentsHeading = document.getElementById("appointments-heading");

    const confirmationPopup = document.getElementById("confirmation-popup");
    const confirmationMessage = document.getElementById("confirmation-message");
    const closePopupBtn = document.getElementById("close-popup");

    const searchBox = document.getElementById("search-box");
    const filterStatus = document.getElementById("filter-status");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const datetimeInput = document.getElementById("datetime");
    const termsCheckbox = document.getElementById("terms");

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const phoneError = document.getElementById("phone-error");
    const datetimeError = document.getElementById("datetime-error");
    const termsError = document.getElementById("terms-error");

    appointmentTable.style.display = "none";
    appointmentsHeading.style.display = "none";

    function loadAppointments() {
        let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
        let searchQuery = searchBox?.value.toLowerCase() || "";
        let filterValue = filterStatus?.value || "all";

        appointmentList.innerHTML = ""; 

        let filteredAppointments = appointments.filter(appointment =>
            appointment.name.toLowerCase().includes(searchQuery) &&
            (filterValue === "all" || appointment.status === filterValue)
        );

        if (filteredAppointments.length > 0) {
            appointmentTable.style.display = "table";
            appointmentsHeading.style.display = "block";
            filteredAppointments.forEach((appointment, index) => {
                addAppointmentToTable(appointment, index);
            });
        } else {
            appointmentTable.style.display = "none";
            appointmentsHeading.style.display = "none";
        }
    }

    bookBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            serviceDropdown.value = btn.getAttribute("data-service");
            modal.style.display = "flex";
        });
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    function validateName() {
        if (nameInput.value.trim() === "") {
            nameError.textContent = "Name cannot be empty.";
            return false;
        }
        nameError.textContent = "";
        return true;
    }

    function validateEmail() {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value)) {
            emailError.textContent = "Enter a valid email.";
            return false;
        }
        emailError.textContent = "";
        return true;
    }

    function validatePhone() {
        const phonePattern = /^\d{10}$/;
        if (!phonePattern.test(phoneInput.value)) {
            phoneError.textContent = "Enter a valid 10-digit phone number.";
            return false;
        }
        phoneError.textContent = "";
        return true;
    }

    function validateDateTime() {
        const selectedDate = new Date(datetimeInput.value);
        const currentDate = new Date();
        if (selectedDate <= currentDate) {
            datetimeError.textContent = "Select a future date & time.";
            return false;
        }
        datetimeError.textContent = "";
        return true;
    }

    function validateTerms() {
        if (!termsCheckbox.checked) {
            termsError.textContent = "You must agree to the terms.";
            return false;
        }
        termsError.textContent = "";
        return true;
    }

    nameInput.addEventListener("input", validateName);
    emailInput.addEventListener("input", validateEmail);
    phoneInput.addEventListener("input", validatePhone);
    datetimeInput.addEventListener("change", validateDateTime);
    termsCheckbox.addEventListener("change", validateTerms);
    searchBox?.addEventListener("input", loadAppointments);
    filterStatus?.addEventListener("change", loadAppointments);

    function addAppointmentToTable(appointment, index) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${appointment.name}</td>
            <td>${appointment.service}</td>
            <td>${appointment.datetime}</td>
            <td>
                <select class="status-update" data-index="${index}">
                    <option value="Pending" ${appointment.status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="Confirmed" ${appointment.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
                    <option value="Cancelled" ${appointment.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                </select>
            </td>
            <td>
                <button class="reschedule-btn" data-index="${index}">Reschedule</button>
                <button class="cancel-btn" data-index="${index}">Cancel</button>
            </td>
        `;
        appointmentList.appendChild(row);
    }

    function showConfirmationPopup(name, service, datetime) {
        confirmationMessage.textContent = `Thank you, ${name}! Your appointment for ${service} on ${datetime} is confirmed.`;
        confirmationPopup.style.display = "flex";
    }

    function saveAppointment(appointment) {
        let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
        appointments.push(appointment);
        localStorage.setItem("appointments", JSON.stringify(appointments));
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const isValid = validateName() && validateEmail() && validatePhone() && validateDateTime() && validateTerms();

        if (isValid) {
            const newAppointment = {
                name: nameInput.value,
                service: serviceDropdown.value,
                datetime: datetimeInput.value,
                status: "Pending"
            };

            saveAppointment(newAppointment);
            loadAppointments();
            showConfirmationPopup(newAppointment.name, newAppointment.service, newAppointment.datetime);

            modal.style.display = "none";
            form.reset();
        }
    });

    document.addEventListener("click", (e) => {
        let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

        if (e.target.classList.contains("reschedule-btn")) {
            const index = e.target.getAttribute("data-index");
            const newDateTime = prompt("Enter new date & time:");
            if (newDateTime) {
                appointments[index].datetime = newDateTime;
                localStorage.setItem("appointments", JSON.stringify(appointments));
                loadAppointments();
            }
        }

        if (e.target.classList.contains("cancel-btn")) {
            const index = e.target.getAttribute("data-index");
            appointments.splice(index, 1);
            localStorage.setItem("appointments", JSON.stringify(appointments));
            loadAppointments();
        }
    });

    document.addEventListener("change", (e) => {
        if (e.target.classList.contains("status-update")) {
            const index = e.target.getAttribute("data-index");
            let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
            appointments[index].status = e.target.value;
            localStorage.setItem("appointments", JSON.stringify(appointments));
            loadAppointments();
        }
    });

    closePopupBtn.addEventListener("click", () => {
        confirmationPopup.style.display = "none";
    });

    loadAppointments();
});
