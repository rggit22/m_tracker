document.addEventListener('DOMContentLoaded', function () {
    let deferredPrompt;
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
            const date = new Date(year, month, i);
            const today = new Date();

            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            if (date > today) {
                dayElement.classList.add('future');
                dayElement.style.pointerEvents = 'none';
                dayElement.style.backgroundColor = '#f0f0f0';
            } else {
                dayElement.addEventListener('click', () => openDialog(i));
            }

            const storedQuantity = getQuantity(year, month, i);
            if (storedQuantity > 0) {
                dayElement.classList.add('active');
                dayElement.textContent += ` (${storedQuantity.toFixed(1)}L)`;
            }
            calendar.appendChild(dayElement);
        }

        updateTotalConsumption();
        updateTotalAmount();
    }

    function openDialog(day) {
        selectedDate = new Date(currentYear, currentMonth, day);
        dialogDate.textContent = selectedDate.toDateString();
        quantityInput.value = getQuantity(currentYear, currentMonth, day).toFixed(1);
        dialog.style.display = 'flex';
        quantityInput.focus();
        quantityInput.select();
    }

    function closeDialog() {
        dialog.style.display = 'none';
    }

    function saveQuantity() {
        let quantity = parseFloat(quantityInput.value) || 0;
        quantity = Math.max(0, Math.min(100, quantity));
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
        totalConsumption.textContent = `Total Milk Consumed: ${total.toFixed(1)} liters`;
    }

    function updateTotalAmount() {
        const pricePerLiter = Math.round(parseFloat(priceInput.value)) || 0;
        priceInput.value = pricePerLiter; // Round off price input
        let total = 0;
        const days = Array.from(calendar.children);
        days.forEach(day => {
            if (!day.classList.contains('empty') && day.classList.contains('active')) {
                total += (parseFloat(day.textContent.split('(')[1]) || 0) * pricePerLiter;
            }
        });
        totalAmount.textContent = `Total Amount: ₹${total.toFixed(0)}`;
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

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI to notify the user they can install the PWA
        pwaCta.style.display = 'block';

        pwaCta.addEventListener('click', () => {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the PWA prompt');
                } else {
                    console.log('User dismissed the PWA prompt');
                }
                deferredPrompt = null;
            });
        });
    });

    renderCalendar(currentMonth, currentYear);
});
