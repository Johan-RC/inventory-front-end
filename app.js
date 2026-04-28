// Usa backend local cuando abres con Live Server y backend de Render cuando despliegas el frontend.
const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080/api"
    : "https://inventory-back-end-976w.onrender.com/api";

const categoryForm = document.getElementById("categoryForm");
const supplierForm = document.getElementById("supplierForm");
const productForm = document.getElementById("productForm");

const categoryList = document.getElementById("categoryList");
const supplierList = document.getElementById("supplierList");
const productTable = document.getElementById("productTable");

const productId = document.getElementById("productId");
const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productCategory = document.getElementById("productCategory");
const productSupplier = document.getElementById("productSupplier");

const productFormTitle = document.getElementById("productFormTitle");
const productSubmitBtn = document.getElementById("productSubmitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const refreshBtn = document.getElementById("refreshBtn");

let categories = [];
let suppliers = [];
let products = [];

// Función genérica para consumir el backend
async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error("Error en la petición al backend");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Carga todos los datos desde la API
async function loadData() {
  try {
    categories = await request("/categories");
    suppliers = await request("/suppliers");
    products = await request("/products");

    renderCategories();
    renderSuppliers();
    renderProducts();
  } catch (error) {
    alert("No se pudo conectar con el backend. Verifica que Spring Boot esté corriendo.");
  }
}

// Muestra categorías en lista y en el select de productos
function renderCategories() {
  categoryList.innerHTML = "";
  productCategory.innerHTML = '<option value="">Seleccione categoría</option>';

  categories.forEach((category) => {
    categoryList.innerHTML += `<li class="list-group-item"><span><i class="bi bi-tag me-2 text-primary"></i>${category.name}</span></li>`;

    productCategory.innerHTML += `
      <option value="${category.id}">${category.name}</option>
    `;
  });
}

// Muestra proveedores en lista y en el select de productos
function renderSuppliers() {
  supplierList.innerHTML = "";
  productSupplier.innerHTML = '<option value="">Seleccione proveedor</option>';

  suppliers.forEach((supplier) => {
    supplierList.innerHTML += `<li class="list-group-item"><span><i class="bi bi-building me-2 text-success"></i>${supplier.name}</span><span class="badge text-bg-light">${supplier.email}</span></li>`;

    productSupplier.innerHTML += `
      <option value="${supplier.id}">${supplier.name}</option>
    `;
  });
}

// Muestra todos los productos existentes
function renderProducts() {
  productTable.innerHTML = "";

  if (products.length === 0) {
    productTable.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <i class="bi bi-inbox fs-3 d-block mb-2"></i>
          No hay productos registrados todavía.
        </td>
      </tr>
    `;
    return;
  }

  products.forEach((product) => {
    productTable.innerHTML += `
      <tr>
        <td><span class="badge text-bg-secondary">${product.id}</span></td>
        <td class="fw-semibold">${product.name}</td>
        <td>$${product.price}</td>
        <td><span class="badge text-bg-primary">${product.category.name}</span></td>
        <td>${product.supplier.name}</td>
        <td class="text-end">
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-warning" onclick="editProduct(${product.id})">
              <i class="bi bi-pencil-square"></i> Editar
            </button>
            <button class="btn btn-danger" onclick="deleteProduct(${product.id})">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  });
}

// Crear categoría
categoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("categoryName").value;

  await request("/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

  categoryForm.reset();
  await loadData();
});

// Crear proveedor
supplierForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("supplierName").value;
  const email = document.getElementById("supplierEmail").value;

  await request("/suppliers", {
    method: "POST",
    body: JSON.stringify({ name, email }),
  });

  supplierForm.reset();
  await loadData();
});

// Crear o actualizar producto
productForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    name: productName.value,
    price: Number(productPrice.value),
    categoryId: Number(productCategory.value),
    supplierId: Number(productSupplier.value),
  };

  if (productId.value) {
    await request(`/products/${productId.value}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } else {
    await request("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  resetProductForm();
  await loadData();
});

// Carga un producto en el formulario para editar
function editProduct(id) {
  const product = products.find((item) => item.id === id);

  productId.value = product.id;
  productName.value = product.name;
  productPrice.value = product.price;
  productCategory.value = product.category.id;
  productSupplier.value = product.supplier.id;

  productFormTitle.innerHTML = `<i class="bi bi-pencil-square me-2"></i>Actualizar producto`;
  productSubmitBtn.innerHTML = `<i class="bi bi-check-circle me-2"></i>Actualizar producto`;
  cancelEditBtn.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Elimina un producto
async function deleteProduct(id) {
  const confirmDelete = confirm("¿Seguro que quieres eliminar este producto?");

  if (!confirmDelete) {
    return;
  }

  await request(`/products/${id}`, {
    method: "DELETE",
  });

  await loadData();
}

// Limpia el formulario de producto
function resetProductForm() {
  productForm.reset();
  productId.value = "";
  productFormTitle.innerHTML = `<i class="bi bi-bag-plus me-2"></i>Crear producto`;
  productSubmitBtn.innerHTML = `<i class="bi bi-save me-2"></i>Guardar producto`;
  cancelEditBtn.classList.add("hidden");
}

cancelEditBtn.addEventListener("click", resetProductForm);
refreshBtn.addEventListener("click", loadData);

loadData();