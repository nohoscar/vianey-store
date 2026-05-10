// ==========================================
// VIANEY STORE - App Logic
// ==========================================

// Configuración - CAMBIA TU NÚMERO AQUÍ
const WHATSAPP_NUMBER = '529993953602'; // Tu número con código de México
const PRODUCTS_PER_PAGE = 12;

let currentFilter = 'todos';
let currentSearch = '';
let visibleProducts = PRODUCTS_PER_PAGE;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos(); // Carga desde CSV
    setupEventListeners();
    updateWhatsAppLinks();
});

// Configurar eventos
function setupEventListeners() {
    // Filtros de categoría (tabs)
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            visibleProducts = PRODUCTS_PER_PAGE;
            renderProducts();
        });
    });

    // Categorías cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const filter = card.dataset.filter;
            currentFilter = filter;
            document.querySelectorAll('.filter-tab').forEach(t => {
                t.classList.remove('active');
                if (t.dataset.filter === filter) t.classList.add('active');
            });
            visibleProducts = PRODUCTS_PER_PAGE;
            renderProducts();
            document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Búsqueda
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        visibleProducts = PRODUCTS_PER_PAGE;
        renderProducts();
    });

    // Toggle búsqueda
    document.getElementById('search-toggle').addEventListener('click', () => {
        const searchBar = document.getElementById('search-bar');
        searchBar.classList.toggle('active');
        if (searchBar.classList.contains('active')) {
            searchInput.focus();
        }
    });

    document.getElementById('search-close').addEventListener('click', () => {
        document.getElementById('search-bar').classList.remove('active');
        searchInput.value = '';
        currentSearch = '';
        renderProducts();
    });

    // Ordenar
    document.getElementById('sort-select').addEventListener('change', () => {
        renderProducts();
    });

    // Cargar más
    document.getElementById('load-more-btn').addEventListener('click', () => {
        visibleProducts += PRODUCTS_PER_PAGE;
        renderProducts();
    });

    // Modal
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('product-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('main-nav').classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('main-nav').classList.remove('active');
        });
    });
}

// Obtener productos filtrados
function getFilteredProducts() {
    let filtered = [...PRODUCTOS];

    if (currentFilter !== 'todos') {
        filtered = filtered.filter(p => p.categoria === currentFilter);
    }

    if (currentSearch) {
        filtered = filtered.filter(p =>
            p.nombre.toLowerCase().includes(currentSearch) ||
            p.descripcion.toLowerCase().includes(currentSearch) ||
            p.categoria.toLowerCase().includes(currentSearch)
        );
    }

    const sortValue = document.getElementById('sort-select').value;
    switch (sortValue) {
        case 'precio-asc':
            filtered.sort((a, b) => a.precio - b.precio);
            break;
        case 'precio-desc':
            filtered.sort((a, b) => b.precio - a.precio);
            break;
        case 'nombre':
            filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
    }

    return filtered;
}

// Renderizar productos
function renderProducts() {
    const grid = document.getElementById('products-grid');
    const filtered = getFilteredProducts();
    const toShow = filtered.slice(0, visibleProducts);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No encontramos productos</h3>
                <p>Intenta con otra búsqueda o categoría</p>
            </div>
        `;
        document.getElementById('load-more-container').style.display = 'none';
        return;
    }

    grid.innerHTML = toShow.map((product, index) => {
        // Determinar etiqueta de stock
        let stockLabel = '';
        if (product.stock === 0) {
            stockLabel = '<span class="stock-badge stock-out">Agotado</span>';
        } else if (product.stock <= 3) {
            stockLabel = `<span class="stock-badge stock-low">Quedan ${product.stock}</span>`;
        }

        const isOutOfStock = product.stock === 0;

        return `
        <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" onclick="openModal(${product.id})" style="animation-delay: ${index * 0.05}s">
            <div class="product-image-wrapper">
                <img src="${product.imagen}" alt="${product.nombre}" loading="lazy">
                <span class="product-badge badge-${product.categoria}">${getCategoryLabel(product.categoria)}</span>
                ${stockLabel}
                ${!isOutOfStock ? `
                <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, me interesa: ' + product.nombre + ' ($' + product.precio + ')')}" 
                   class="product-quick-action" 
                   target="_blank"
                   onclick="event.stopPropagation()"
                   aria-label="Pedir por WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </a>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.nombre}</h3>
                <p class="product-category-label">${getCategoryLabel(product.categoria)}</p>
                <div class="product-bottom">
                    <span class="product-price">$${product.precio.toLocaleString()}</span>
                    <div class="product-sizes">
                        ${product.tallas.slice(0, 3).map(t => `<span class="size-tag">${t}</span>`).join('')}
                        ${product.tallas.length > 3 ? `<span class="size-tag">+${product.tallas.length - 3}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `}).join('');

    // Mostrar/ocultar botón "cargar más"
    const loadMoreContainer = document.getElementById('load-more-container');
    if (visibleProducts >= filtered.length) {
        loadMoreContainer.style.display = 'none';
    } else {
        loadMoreContainer.style.display = 'block';
    }
}

// Etiqueta de categoría
function getCategoryLabel(cat) {
    const labels = { 'mujer': 'Mujer', 'hombre': 'Hombre', 'ninos': 'Niños' };
    return labels[cat] || cat;
}

// Abrir modal
function openModal(productId) {
    const product = PRODUCTOS.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('modal-img').src = product.imagen;
    document.getElementById('modal-img').alt = product.nombre;
    document.getElementById('modal-name').textContent = product.nombre;
    document.getElementById('modal-price').textContent = `$${product.precio.toLocaleString()}`;
    document.getElementById('modal-description').textContent = product.descripcion;

    const badge = document.getElementById('modal-badge');
    badge.textContent = getCategoryLabel(product.categoria);
    badge.className = `modal-badge badge-${product.categoria}`;

    const sizesContainer = document.getElementById('modal-sizes');
    sizesContainer.innerHTML = product.tallas.map(t =>
        `<button class="size-btn" onclick="selectSize(this)">${t}</button>`
    ).join('');

    // WhatsApp link en modal
    const whatsappLink = document.getElementById('modal-whatsapp');
    if (product.stock === 0) {
        whatsappLink.style.display = 'none';
    } else {
        whatsappLink.style.display = 'inline-flex';
        whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, me interesa: ' + product.nombre + ' - $' + product.precio + '. ¿Está disponible?')}`;
    }

    document.getElementById('product-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
function closeModal() {
    document.getElementById('product-modal').classList.remove('active');
    document.body.style.overflow = '';
}

// Seleccionar talla
function selectSize(btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    const product = document.getElementById('modal-name').textContent;
    const price = document.getElementById('modal-price').textContent;
    const size = btn.textContent;
    const whatsappLink = document.getElementById('modal-whatsapp');
    whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, me interesa: ' + product + ' - ' + price + ', Talla: ' + size + '. ¿Está disponible?')}`;
}

// Actualizar todos los links de WhatsApp con el número configurado
function updateWhatsAppLinks() {
    document.querySelectorAll('a[href*="wa.me/TUNUMERO"]').forEach(link => {
        link.href = link.href.replace('TUNUMERO', WHATSAPP_NUMBER);
    });
}
