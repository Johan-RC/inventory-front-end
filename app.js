const API_URL = "http://localhost:8080/api";

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
    categoryList.innerHTML += `<li>${category.name}</li>`;

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
    supplierList.innerHTML += `<li>${supplier.name} - ${supplier.email}</li>`;

    productSupplier.innerHTML += `
      <option value="${supplier.id}">${supplier.name}</option>
    `;
  });
}

// Muestra todos los productos existentes
function renderProducts() {
  productTable.innerHTML = "";

  products.forEach((product) => {
    productTable.innerHTML += `
      <tr>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>$${product.price}</td>
        <td>${product.category.name}</td>
        <td>${product.supplier.name}</td>
        <td>
          <div class="actions">
            <button class="warning" onclick="editProduct(${product.id})">Editar</button>
            <button class="danger" onclick="deleteProduct(${product.id})">Eliminar</button>
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

  productFormTitle.textContent = "Actualizar producto";
  productSubmitBtn.textContent = "Actualizar producto";
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
  productFormTitle.textContent = "Crear producto";
  productSubmitBtn.textContent = "Guardar producto";
  cancelEditBtn.classList.add("hidden");
}

cancelEditBtn.addEventListener("click", resetProductForm);
refreshBtn.addEventListener("click", loadData);

loadData();