// script.js
/* ============================================
   RAMIMSCARSHOPBD - Complete JavaScript
   ============================================ */

// === PRELOADER ===
window.addEventListener('load', () => {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('hidden');
        }
    }, 1500);
    
    updateNavBalance();
    loadOrders();
    loadTransactions();
    initSlider();
    animateCounters();
});

// === NAVBAR ===
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Hamburger Menu
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Wishlist toggle
    document.querySelectorAll('.car-wishlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.classList.toggle('liked');
            const icon = btn.querySelector('i');
            if (btn.classList.contains('liked')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                showToast('Added to Wishlist', 'Car saved to your wishlist', 'success');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        });
    });

    updateNavBalance();
});

// === HERO SLIDER ===
let currentSlide = 0;
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

// === COUNTER ANIMATION ===
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        if (!target) return;
        
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                counter.textContent = target + '+';
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current) + '+';
            }
        }, 16);
    });
}

// === BALANCE MANAGEMENT ===
function getBalance() {
    return parseFloat(localStorage.getItem('rcsBalance') || '0');
}

function setBalance(amount) {
    localStorage.setItem('rcsBalance', amount.toFixed(2));
    updateNavBalance();
    updateMainBalance();
}

function updateNavBalance() {
    const navBal = document.getElementById('navBalance');
    if (navBal) {
        navBal.textContent = '$' + getBalance().toFixed(2);
    }
}

function updateMainBalance() {
    const mainBal = document.getElementById('mainBalance');
    if (mainBal) {
        mainBal.textContent = '$' + getBalance().toFixed(2);
    }
}

// === SHOP FUNCTIONS ===
function filterCars() {
    const query = document.getElementById('searchCar').value.toLowerCase();
    const cards = document.querySelectorAll('.car-card');
    let found = false;

    cards.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        if (name.includes(query)) {
            card.style.display = 'block';
            found = true;
        } else {
            card.style.display = 'none';
        }
    });

    document.getElementById('noResults').style.display = found ? 'none' : 'block';
}

function filterByCategory(category, btn) {
    // Update active tag
    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const cards = document.querySelectorAll('.car-card');
    let found = false;

    cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
            found = true;
        } else {
            card.style.display = 'none';
        }
    });

    document.getElementById('noResults').style.display = found ? 'none' : 'block';
}

function orderCar(carName, price) {
    // Store selected car and redirect
    localStorage.setItem('selectedCar', carName + ' - $' + price.toLocaleString());
    window.location.href = 'order.html';
}

// === ORDER FUNCTIONS ===
function placeOrder(e) {
    e.preventDefault();

    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const car = document.getElementById('selectedCar').value;
    const notes = document.getElementById('orderNotes') ? document.getElementById('orderNotes').value.trim() : '';

    if (!name || !phone || !address || !car) {
        showToast('Error', 'Please fill in all required fields', 'error');
        return false;
    }

    const order = {
        id: 'ORD-' + Date.now().toString().slice(-6),
        name: name,
        phone: phone,
        address: address,
        car: car,
        notes: notes,
        status: 'Pending',
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        })
    };

    let orders = JSON.parse(localStorage.getItem('rcsOrders') || '[]');
    orders.unshift(order);
    localStorage.setItem('rcsOrders', JSON.stringify(orders));

    // Reset form
    document.getElementById('orderForm').reset();

    showToast('Order Placed! 🎉', `Order ${order.id} has been placed successfully`, 'success');
    loadOrders();

    return false;
}

function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    const orders = JSON.parse(localStorage.getItem('rcsOrders') || '[]');
    const emptyOrders = document.getElementById('emptyOrders');

    if (orders.length === 0) {
        if (emptyOrders) emptyOrders.style.display = 'block';
        return;
    }

    if (emptyOrders) emptyOrders.style.display = 'none';

    // Clear existing order items (but keep empty state)
    const existingItems = ordersList.querySelectorAll('.order-item');
    existingItems.forEach(item => item.remove());

    orders.forEach(order => {
        const item = document.createElement('div');
        item.className = 'order-item';
        item.innerHTML = `
            <div class="order-item-header">
                <span class="order-id">${order.id}</span>
                <span class="order-status pending">${order.status}</span>
            </div>
            <h4>${order.car}</h4>
            <div class="order-meta">
                <span><i class="fas fa-user"></i> ${order.name}</span>
                <span><i class="fas fa-phone"></i> ${order.phone}</span>
                <span><i class="fas fa-calendar"></i> ${order.date}</span>
            </div>
        `;
        ordersList.appendChild(item);
    });

    // Pre-select car if coming from shop
    const selectedCar = localStorage.getItem('selectedCar');
    if (selectedCar) {
        const select = document.getElementById('selectedCar');
        if (select) {
            for (let option of select.options) {
                if (option.value === selectedCar) {
                    option.selected = true;
                    break;
                }
            }
        }
        localStorage.removeItem('selectedCar');
    }
}

// === BILLING FUNCTIONS ===
let selectedPayment = 'bkash';

function selectPayment(method, element) {
    selectedPayment = method;
    
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    element.classList.add('active');

    const paymentNum = document.getElementById('paymentNum');
    const paymentDetailBody = document.getElementById('paymentDetailBody');

    if (method === 'bkash') {
        paymentNum.textContent = '01607643869';
        paymentDetailBody.querySelector('p:first-child').innerHTML = '<strong>bKash - Send Money to:</strong>';
    } else if (method === 'nagad') {
        paymentNum.textContent = '01607643869';
        paymentDetailBody.querySelector('p:first-child').innerHTML = '<strong>Nagad - Send Money to:</strong>';
    } else if (method === 'binance') {
        paymentNum.textContent = 'UID: 76754809';
        paymentDetailBody.querySelector('p:first-child').innerHTML = '<strong>Binance - Transfer to UID:</strong>';
    }
}

function setAmount(amount) {
    document.getElementById('addAmount').value = amount;
}

function copyNumber() {
    const num = document.getElementById('paymentNum').textContent;
    navigator.clipboard.writeText(num.replace('UID: ', '')).then(() => {
        showToast('Copied!', 'Number copied to clipboard', 'success');
    }).catch(() => {
        // Fallback
        const temp = document.createElement('textarea');
        temp.value = num.replace('UID: ', '');
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        showToast('Copied!', 'Number copied to clipboard', 'success');
    });
}

function addBalance() {
    const amountInput = document.getElementById('addAmount');
    const amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
        showToast('Error', 'Please enter a valid amount', 'error');
        return;
    }

    const newBalance = getBalance() + amount;
    setBalance(newBalance);

    // Save transaction
    const transaction = {
        id: 'TXN-' + Date.now().toString().slice(-6),
        method: selectedPayment.toUpperCase(),
        amount: amount,
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    };

    let transactions = JSON.parse(localStorage.getItem('rcsTransactions') || '[]');
    transactions.unshift(transaction);
    localStorage.setItem('rcsTransactions', JSON.stringify(transactions));

    amountInput.value = '';
    
    showToast('Balance Added! 💰', `$${amount.toFixed(2)} has been added via ${selectedPayment}`, 'success');
    loadTransactions();
}

function loadTransactions() {
    const list = document.getElementById('transactionsList');
    if (!list) return;

    const transactions = JSON.parse(localStorage.getItem('rcsTransactions') || '[]');

    if (transactions.length === 0) {
        list.innerHTML = `
            <div class="empty-transactions">
                <i class="fas fa-receipt"></i>
                <h3>No Transactions</h3>
                <p>Your transactions will appear here</p>
            </div>
        `;
        return;
    }

    list.innerHTML = '';
    transactions.forEach(txn => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <div class="transaction-icon">
                <i class="fas fa-arrow-down"></i>
            </div>
            <div class="transaction-info">
                <h4>Balance Added via ${txn.method}</h4>
                <span>${txn.date}</span>
            </div>
            <div class="transaction-amount">+$${txn.amount.toFixed(2)}</div>
        `;
        list.appendChild(item);
    });

    updateMainBalance();
}

// === FAQ ===
function toggleFaq(element) {
    const isActive = element.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
    if (!isActive) {
        element.classList.add('active');
    }
}

// === TOAST NOTIFICATION ===
function showToast(title, message, type = 'success') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'check-circle';
    if (type === 'error') icon = 'times-circle';
    if (type === 'info') icon = 'info-circle';

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}
