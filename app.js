const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

let products = JSON.parse(localStorage.getItem('neverout_premium_v1')) || [];

function toggleModal(show) {
    document.getElementById('modal-overlay').style.display = show ? 'flex' : 'none';
}

function calculatePreview() {
    const stock = parseFloat(document.getElementById('p-stock').value);
    const sales = parseFloat(document.getElementById('p-sales').value);
    const lead = parseFloat(document.getElementById('p-lead').value);
    const price = parseFloat(document.getElementById('p-price').value);

    if (!stock || !sales || !price) return;

    const daysLeft = Math.floor(stock / sales);
    const riskDays = lead - daysLeft;
    const loss = riskDays > 0 ? (riskDays * sales * price) : 0;

    const preview = document.getElementById('prediction-preview');
    preview.innerHTML = `
        <strong>Analysis:</strong> Stockouts in ${daysLeft} days.<br>
        <span style="color: ${loss > 0 ? '#ff4d4d' : '#10b981'}">
            ${loss > 0 ? `⚠️ Danger: Projected Loss ₹${loss.toLocaleString()}` : '✅ You are currently in the safety window.'}
        </span>
    `;
    preview.classList.remove('hidden');
    document.getElementById('save-btn').classList.remove('hidden');
}

document.getElementById('product-form').onsubmit = (e) => {
    e.preventDefault();
    const product = {
        id: Date.now(),
        name: document.getElementById('p-name').value,
        stock: parseFloat(document.getElementById('p-stock').value),
        sales: parseFloat(document.getElementById('p-sales').value),
        lead: parseFloat(document.getElementById('p-lead').value),
        price: parseFloat(document.getElementById('p-price').value)
    };
    products.push(product);
    localStorage.setItem('neverout_premium_v1', JSON.stringify(products));
    renderProducts();
    toggleModal(false);
    e.target.reset();
};

function renderProducts() {
    const grid = document.getElementById('product-grid');
    const empty = document.getElementById('empty-state');
    grid.innerHTML = '';
    
    if (products.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    products.forEach(p => {
        const daysLeft = Math.floor(p.stock / p.sales);
        const riskDays = p.lead - daysLeft;
        const potentialLoss = (p.sales * p.price * p.lead); // Total revenue at risk during lead time
        
        let statusClass = 'safe';
        let statusText = '✅ Stock Healthy';
        
        if (daysLeft <= p.lead) {
            statusClass = 'critical';
            statusText = '🚨 Reorder Yesterday';
        } else if (daysLeft <= p.lead + 5) {
            statusClass = 'warning';
            statusText = '⚠️ Reorder Approaching';
        }

        grid.innerHTML += `
            <div class="glass-card">
                <div style="display:flex; justify-content:space-between">
                    <span style="color:var(--text-dim); font-size:0.8rem">SKU: ${p.id.toString().slice(-5)}</span>
                    <button onclick="deleteProduct(${p.id})" style="background:none; border:none; color:grey; cursor:pointer">×</button>
                </div>
                <h3 style="margin: 0.5rem 0 1.5rem">${p.name}</h3>
                <div class="stat-main">${daysLeft} <span class="unit">Days Left</span></div>
                <div class="revenue-loss">Risk: ₹${potentialLoss.toLocaleString()}</div>
                <div class="status-pill ${statusClass}">${statusText}</div>
                <div style="margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-dim); border-top: 1px solid var(--glass-border); padding-top: 1rem;">
                    Reorder by: <strong>Day ${Math.max(0, daysLeft - p.lead)}</strong>
                </div>
            </div>
        `;
    });
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    localStorage.setItem('neverout_premium_v1', JSON.stringify(products));
    renderProducts();
}

function scrollToApp() { document.getElementById('app').scrollIntoView({ behavior: 'smooth' }); }

document.addEventListener('DOMContentLoaded', renderProducts);
