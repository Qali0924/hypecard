const PRODUCTS = [
    { id: 1, name: "2025 TOPPS CHROME SPONGEBOB HOBBY", price: 199.99, cat: "SPONGEBOB", img: "zdjecia/spongebob.png", desc: "Oficjalna kolekcja na 25-lecie! W środku znajdziesz 5 kart, szansa na unikalne Chrome Autographs." },
    { id: 2, name: "NARUTO NINDO CASE 2025 EDITION", price: 899.00, cat: "ALL", img: "zdjecia/naruto.png", desc: "Cały case (12 boxów) serii Nindo. Gwarantowane karty typu Rare oraz szansa na Gold Etched Naruto." },
    { id: 3, name: "NBA PANINI PRIZM 2025-26 BLASTER", price: 349.50, cat: "NBA", img: "zdjecia/nba.png", desc: "Kultowa seria Prizm. 6 paczek w środku, 4 karty na paczkę. Szukaj Silver Prizms!" },
    { id: 4, name: "POKEMON VMAX CLIMAX BOOSTER BOX", price: 420.00, cat: "POKEMON", img: "zdjecia/pokemony.png", desc: "Japoński hit High Class Pack. Każda paczka zawiera kartę V, VMAX, VSTAR lub Trainer Gallery." },
    { id: 5, name: "2025 TOPPS CHROME FORMULA", price: 1590.00, cat: "F1", img: "zdjecia/F1.png", desc: "Najwyższa jakość kart F1. Box zawiera 18 paczek. Szukaj kart 'Checkered Flag' i autografów kierowców." },
    { id: 6, name: "MATCH ATTAX 2026 MEGA TIN", price: 59.99, cat: "PILKA", img: "zdjecia/ATTAX.png", desc: "Mega puszka Match Attax. 66 kart w środku, w tym 4 ekskluzywne karty Limited Edition." },
    { id: 7, name: "2025 TOPPS CHROME SPONGEBOB 25TH ANNIVERSARY", price: 1999.99, cat: "SPONGEBOB", img: "zdjecia/spongebob1.png", desc: "Limitowany produkt kolekcjonersy. Ilość limitowana oraz bardzo mała. Zawiera ekskluzywne karty seryjne." }
];

let cart = JSON.parse(localStorage.getItem('hype_cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('hype_user')) || null;
let activeCategory = "ALL";
let isRegistering = false;

// INICJALIZACJA STRIPE
const stripe = Stripe('pk_live_51SzNdwRuhbbq1Rr5LsOBgIbYdBhyqzsJoP0vbOWuz5uWEr72Cs8y1sOpXpe50POf2RDh44JY6JLkEvQOfLJYmwh200Kw9mSmXX');

document.addEventListener('DOMContentLoaded', () => {
    applyAdvancedFilters();
    updateUI();
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            activeCategory = link.dataset.cat;
            applyAdvancedFilters();
        }
    });
});

// FILTROWANIE I WYŚWIETLANIE
function applyAdvancedFilters() {
    const query = document.getElementById('filter-search').value.toLowerCase();
    const minP = parseFloat(document.getElementById('price-min').value) || 0;
    const maxP = parseFloat(document.getElementById('price-max').value) || 999999;
    const sort = document.getElementById('sort-select').value;
    const container = document.getElementById('product-container');

    let filtered = PRODUCTS.filter(p => {
        const matchesCat = (activeCategory === "ALL" || p.cat === activeCategory);
        const matchesQuery = p.name.toLowerCase().includes(query);
        const matchesPrice = p.price >= minP && p.price <= maxP;
        return matchesCat && matchesQuery && matchesPrice;
    });

    if(sort === "low") filtered.sort((a,b) => a.price - b.price);
    if(sort === "high") filtered.sort((a,b) => b.price - a.price);

    container.innerHTML = filtered.map(p => `
        <div class="card">
            <img src="${p.img}" onerror="this.src='https://via.placeholder.com/250x300?text=Brak+Zdjęcia'">
            <h3>${p.name}</h3>
            <span class="price">${p.price.toFixed(2)} PLN</span>
            <button class="add-btn" onclick="addToCart(${p.id})">DO KOSZYKA</button>
            <p onclick="showDetails(${p.id})" style="margin-top:10px; cursor:pointer; font-size:11px; text-decoration:underline; font-weight:700;">ZOBACZ SZCZEGÓŁY</p>
        </div>
    `).join('');
    
    document.getElementById('cat-title').innerText = activeCategory === "ALL" ? "Wszystkie produkty" : activeCategory;
}

// SZCZEGÓŁY PRODUKTU
function showDetails(id) {
    const p = PRODUCTS.find(x => x.id === id);
    const content = document.getElementById('desc-content');
    content.innerHTML = `
        <img src="${p.img}" style="width:100%; height:200px; object-fit:contain; margin-bottom:15px;">
        <h2 style="font-weight:900; text-transform:uppercase; margin-bottom:10px;">${p.name}</h2>
        <p style="font-size:14px; color:#444; margin-bottom:20px; line-height:1.5;">${p.desc}</p>
        <div style="background:#f4f4f4; padding:15px; font-size:13px; border-left:4px solid #ffcc00;">
            <strong>SPECYFIKACJA:</strong><br>
            • Stan: Nowy / Oryginalny<br>
            • Kategoria: ${p.cat}<br>
            • Dostępność: Wysyłka 24h
        </div>
    `;
    document.getElementById('desc-modal').style.display = 'block';
}

function closeDescModal() { document.getElementById('desc-modal').style.display = 'none'; }

function clearFilters() {
    document.getElementById('price-min').value = '';
    document.getElementById('price-max').value = '';
    document.getElementById('filter-search').value = '';
    document.getElementById('sort-select').value = 'default';
    applyAdvancedFilters();
}

// LOGIKA KOSZYKA
function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
    renderCart();
}

function addToCart(id) {
    const p = PRODUCTS.find(x => x.id === id);
    cart.push(p);
    localStorage.setItem('hype_cart', JSON.stringify(cart));
    updateUI();
    if(!document.getElementById('cart-sidebar').classList.contains('active')) toggleCart();
}

function renderCart() {
    const cont = document.getElementById('cart-content');
    cont.innerHTML = cart.map((item, i) => `
        <div class="cart-item">
            <img src="${item.img}">
            <div style="flex:1">
                <p style="font-size:11px; font-weight:700">${item.name}</p>
                <strong>${item.price.toFixed(2)} PLN</strong>
            </div>
            <i class="fa-solid fa-trash" onclick="removeCart(${i})" style="cursor:pointer;color:red"></i>
        </div>
    `).join('');
    const total = cart.reduce((s, c) => s + c.price, 0);
    document.getElementById('total-price').innerText = total.toFixed(2) + " PLN";
}

function removeCart(i) {
    cart.splice(i, 1);
    localStorage.setItem('hype_cart', JSON.stringify(cart));
    updateUI(); renderCart();
}

// FINALIZACJA I MODALE
function toggleCheckoutModal() {
    const m = document.getElementById('checkout-modal');
    if (m) {
        m.style.display = (m.style.display === 'block') ? 'none' : 'block';
    }
}

function initiateCheckout() {
    if (cart.length === 0) return alert("Koszyk jest pusty!");
    if (!currentUser) return alert("Zaloguj się, aby złożyć zamówienie!");
    
    // Przygotowanie danych do ukrytych pól formularza
    const productList = cart.map(item => `${item.name} (${item.price} PLN)`).join(", ");
    const totalAmount = document.getElementById('total-price').innerText;

    const dataInput = document.getElementById('cart-data-input');
    const totalInput = document.getElementById('cart-total-input');

    if (dataInput) dataInput.value = productList;
    if (totalInput) totalInput.value = totalAmount;

    toggleCart(); // Zamknij koszyk
    toggleCheckoutModal(); // Otwórz formularz
}

// OBSŁUGA ZAMÓWIENIA (FORMSPREE + STRIPE)
async function handleOrder(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const paymentMethod = form.querySelector('select[name="Metoda_Platnosci"]').value;
    const total = document.getElementById('total-price').innerText;

    // 1. WYSYŁKA DANYCH DO FORMSPREE
    try {
        await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: { 'Accept': 'application/json' }
        });
    } catch (error) {
        console.error("Błąd wysyłki danych:", error);
    }

    // 2. LOGIKA PŁATNOŚCI
    if (paymentMethod === 'BLIK' || paymentMethod === 'Przelew') {
        alert(`Zostaniesz przekierowany do płatności. PROSIMY WPISAĆ KWOTĘ: ${total} w polu ceny.`);
        window.location.href = "https://buy.stripe.com/5kQfZjcsH3QY6gZ3WbeAg00";
    } else {
        alert("Zamówienie za pobraniem przyjęte! Wyślemy paczkę niebawem.");
        cart = [];
        localStorage.setItem('hype_cart', JSON.stringify(cart));
        location.reload(); 
    }
}

// AUTORYZACJA
function updateUI() {
    document.getElementById('cart-count').innerText = cart.length;
    if(currentUser) document.getElementById('welcome-msg').innerText = "Cześć, " + currentUser.email.split('@')[0];
}

function toggleAuthModal() { 
    const m = document.getElementById('auth-modal');
    m.style.display = (m.style.display === 'block') ? 'none' : 'block'; 
}

function toggleRegMode() {
    isRegistering = !isRegistering;
    document.getElementById('auth-header').innerText = isRegistering ? "Rejestracja" : "Logowanie";
    document.getElementById('reg-fields').style.display = isRegistering ? "block" : "none";
}

function submitAuth() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    let users = JSON.parse(localStorage.getItem('hype_users_db')) || [];
    if(!email || !pass) return alert("Wpisz dane!");
    if(isRegistering) {
        users.push({email, pass});
        localStorage.setItem('hype_users_db', JSON.stringify(users));
        alert("Zarejestrowano!"); toggleRegMode();
    } else {
        const u = users.find(x => x.email === email && x.pass === pass);
        if(u) { localStorage.setItem('hype_user', JSON.stringify(u)); location.reload(); }
        else alert("Błędne dane.");
    }
}

window.onclick = function(e) {
    if (e.target.className === 'modal') {
        e.target.style.display = 'none';
    }
}


