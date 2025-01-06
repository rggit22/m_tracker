document.addEventListener('DOMContentLoaded', function () {
    const calendar = document.getElementById('calendar');
    const totalConsumption = document.getElementById('total-consumption');
    const totalAmount = document.getElementById('total-amount');
    const priceInput = document.getElementById('price');
    const dialog = document.getElementById('dialog');
    const dialogDate = document.getElementById('dialog-date');
    const quantityInput = document.getElementById('quantity');
    const saveButton = document.getElementById('save-button');
    const closeButton = document.querySelector('.close-button');
    const pwaCta = document.getElementById('pwa-cta');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const monthYearDisplay = document.getElementById('month-year');
    
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedDate = null;

    function renderCalendar(month, year) {
        calendar.innerHTML = '';
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        const daysInMonth = monthEnd.getDate();
        const startDay = monthStart.getDay();

        monthYearDisplay.textContent = `${monthStart.toLocaleString('default', { month: 'long' })} ${year}`;

        for (let i = 0; i < startDay; i++) {
            calendar.innerHTML += '<div class="day empty"></div>';
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.textContent = i;
            dayElement.addEventListener('click', () => openDialog(i));
            const storedQuantity = getQuantity(year, month, i);
            if (storedQuantity > 0) {
                dayElement.classList.add('active');
                dayElement.textContent += ` (${storedQuantity}L)`;
            }
            calendar.appendChild(dayElement);
        }

        updateTotalConsumption();
        updateTotalAmount();
    }

    function openDialog(day) {
        selectedDate = new Date(currentYear, currentMonth, day);
        dialogDate.textContent = selectedDate.toDateString();
        quantityInput.value = getQuantity(currentYear, currentMonth, day);
        dialog.style.display = 'flex';
    }

    function closeDialog() {
        dialog.style.display = 'none';
    }

    function saveQuantity() {
        const quantity = parseFloat(quantityInput.value) || 0;
        setQuantity(currentYear, currentMonth, selectedDate.getDate(), quantity);
        closeDialog();
        renderCalendar(currentMonth, currentYear);
    }

    function getQuantity(year, month, day) {
        const dateKey = `${year}-${month + 1}-${day}`;
        return parseFloat(localStorage.getItem(dateKey)) || 0;
    }

    function setQuantity(year, month, day, quantity) {
        const dateKey = `${year}-${month + 1}-${day}`;
        localStorage.setItem(dateKey, quantity);
    }

    function updateTotalConsumption() {
        let total = 0;
        const days = Array.from(calendar.children);
        days.forEach(day => {
            if (!day.classList.contains('empty') && day.classList.contains('active')) {
                total += parseFloat(day.textContent.split('(')[1]) || 0;
            }
        });
        totalConsumption.textContent = `Total Milk Consumed: ${total} liters`;
    }

    function updateTotalAmount() {
        const pricePerLiter = parseFloat(priceInput.value) || 0;
        let total = 0;
        const days = Array.from(calendar.children);
        days.forEach(day => {
            if (!day.classList.contains('empty') && day.classList.contains('active')) {
                total += parseFloat(day.textContent.split('(')[1]) * pricePerLiter || 0;
            }
        });
        totalAmount.textContent = `Total Amount: ₹${total.toFixed(2)}`;
    }

    priceInput.addEventListener('input', updateTotalAmount);
    saveButton.addEventListener('click', saveQuantity);
    closeButton.addEventListener('click', closeDialog);
    window.addEventListener('click', (e) => {
        if (e.target === dialog) {
            closeDialog();
        }
    });

    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });

    pwaCta.addEventListener('click', () => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            alert('App is already installed as PWA.');
        } else {
            alert('Use the "Add to Home Screen" option in your browser to install this app as PWA.');
        }
    });

    renderCalendar(currentMonth, currentYear);
});
