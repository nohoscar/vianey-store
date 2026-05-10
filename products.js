/**
 * CARGA DE PRODUCTOS DESDE CSV
 * 
 * Este archivo lee el productos.csv y lo convierte en datos para la página.
 * 
 * PARA ACTUALIZAR PRODUCTOS:
 * 1. Abre productos.csv con Excel
 * 2. Edita lo que necesites (nombre, precio, tallas, stock, etc.)
 * 3. Guarda el archivo
 * 4. El script de auto-sync lo sube a GitHub automáticamente
 * 5. La página se actualiza sola
 * 
 * COLUMNAS DEL CSV:
 * - id: número único del producto
 * - nombre: nombre que se muestra
 * - categoria: mujer, hombre, o ninos
 * - precio: número sin signo de $
 * - imagen: ruta de la foto (img/ropa_X.jpg)
 * - tallas: separadas por coma entre comillas "S,M,L"
 * - stock: cantidad disponible (0 = agotado)
 * - descripcion: texto descriptivo
 */

let PRODUCTOS = [];

// Cargar productos desde CSV
async function cargarProductos() {
    try {
        const response = await fetch('productos.csv');
        const csvText = await response.text();
        PRODUCTOS = parseCSV(csvText);
        // Iniciar la app una vez cargados los productos
        renderProducts();
    } catch (error) {
        console.error('Error cargando productos:', error);
        // Fallback: intentar cargar desde GitHub si estamos en producción
        try {
            const ghResponse = await fetch('productos.csv');
            const ghText = await ghResponse.text();
            PRODUCTOS = parseCSV(ghText);
            renderProducts();
        } catch (e) {
            document.getElementById('products-grid').innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error cargando productos</h3>
                    <p>Intenta recargar la página</p>
                </div>
            `;
        }
    }
}

// Parsear CSV a array de objetos
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const products = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Parsear respetando comillas (para las tallas que tienen comas)
        const values = parseCSVLine(line);
        
        const product = {
            id: parseInt(values[0]),
            nombre: values[1],
            categoria: values[2],
            precio: parseInt(values[3]),
            imagen: values[4],
            tallas: values[5] ? values[5].split(',').map(t => t.trim()) : [],
            stock: parseInt(values[6]) || 0,
            descripcion: values[7] || ''
        };

        products.push(product);
    }

    return products;
}

// Parsear una línea de CSV respetando comillas
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());

    return values;
}
