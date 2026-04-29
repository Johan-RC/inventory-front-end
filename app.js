// Usa backend local cuando abres con Live Server y backend de Render cuando despliegas el frontend.
const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080/api"
    : "https://inventory-back-end-976w.onrender.com/api";

// Formularios
const categoryForm = document.getElementById("categoryForm");
const supplierForm = document.getElementById("supplierForm");
const productForm = document.getElementById("productForm");

// Listas y tabla
const categoryList = document.getElementById("categoryList");
const supplierList = document.getElementById("supplierList");
const productTable = document.getElementById("productTable");

// Campos categoría
const categoryId = document.getElementById("categoryId");
const categoryName = document.getElementById("categoryName");
const categoryFormTitle = document.getElementById("categoryFormTitle");
const categorySubmitBtn = document.getElementById("categorySubmitBtn");
const cancelCategoryEditBtn = document.getElementById("cancelCategoryEditBtn");

// Campos proveedor
const supplierId = document.getElementById("supplierId");
const supplierName = document.getElementById("supplierName");
const supplierEmail = document.getElementById("supplierEmail");
const supplierFormTitle = document.getElementById("supplierFormTitle");
const supplierSubmitBtn = document.getElementById("supplierSubmitBtn");
const cancelSupplierEditBtn = document.getElementById("cancelSupplierEditBtn");

// Campos producto
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
    let message = "Error en la petición al backend";

    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // Si el backend no devuelve JSON, dejamos el mensaje por defecto.
    }

    throw new Error(message);
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

// Render categorías
function renderCategories() {
  categoryList.innerHTML = "";
  productCategory.innerHTML = '<option value="">Seleccione categoría</option>';

  if (categories.length === 0) {
    categoryList.innerHTML = `
      <div class="empty-state">
        No hay categorías registradas.
      </div>
    `;
    return;
  }

  categories.forEach((category) => {
    categoryList.innerHTML += `
      <div class="list-group-item" data-id="${category.id}">
        <div>
          <i class="bi bi-tag text-primary me-2"></i>
          <span>${category.name}</span>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-warning" onclick="editCategory(${category.id})">
            <i class="bi bi-pencil"></i>
          </button>

          <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;

    productCategory.innerHTML += `
      <option value="${category.id}">${category.name}</option>
    `;
  });
}

// Render proveedores
function renderSuppliers() {
  supplierList.innerHTML = "";
  productSupplier.innerHTML = '<option value="">Seleccione proveedor</option>';

  if (suppliers.length === 0) {
    supplierList.innerHTML = `
      <div class="empty-state">
        No hay proveedores registrados.
      </div>
    `;
    return;
  }

  suppliers.forEach((supplier) => {
    supplierList.innerHTML += `
      <div class="list-group-item" data-id="${supplier.id}">
        <div>
          <i class="bi bi-building text-success me-2"></i>
          <span>${supplier.name}</span>
          <span class="badge text-bg-light ms-2">${supplier.email}</span>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-warning" onclick="editSupplier(${supplier.id})">
            <i class="bi bi-pencil"></i>
          </button>

          <button class="btn btn-sm btn-danger" onclick="deleteSupplier(${supplier.id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;

    productSupplier.innerHTML += `
      <option value="${supplier.id}">${supplier.name}</option>
    `;
  });
}

// Render productos
function renderProducts() {
  productTable.innerHTML = "";

  if (products.length === 0) {
    productTable.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          No hay productos registrados todavía.
        </td>
      </tr>
    `;
    return;
  }

  products.forEach((product) => {
    productTable.innerHTML += `
      <tr>
        <td>${product.id}</td>
        <td class="fw-semibold">${product.name}</td>
        <td>$${product.price}</td>
        <td>${product.category.name}</td>
        <td>${product.supplier.name}</td>
        <td>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id})">
              <i class="bi bi-pencil"></i>
              Editar
            </button>

            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
              <i class="bi bi-trash"></i>
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  });
}

// Crear o actualizar categoría
categoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    name: categoryName.value.trim(),
  };

  try {
    if (categoryId.value) {
      await request(`/categories/${categoryId.value}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } else {
      await request("/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    }

    resetCategoryForm();
    await loadData();
  } catch (error) {
    alert(error.message);
  }
});

// Editar categoría
function editCategory(id) {
  const category = categories.find((item) => item.id === id);

  if (!category) {
    return;
  }

  categoryId.value = category.id;
  categoryName.value = category.name;

  categoryFormTitle.innerHTML = `<i class="bi bi-pencil-square me-2"></i>Actualizar categoría`;
  categorySubmitBtn.innerHTML = "Actualizar";
  cancelCategoryEditBtn.classList.remove("hidden");

  categoryName.focus();
}

// Eliminar categoría
async function deleteCategory(id) {
  const category = categories.find((item) => item.id === id);

  const confirmDelete = confirm(
    `¿Seguro que quieres eliminar la categoría "${category?.name}"?\n\nSi tiene productos asociados, el backend puede impedir la eliminación.`
  );

  if (!confirmDelete) {
    return;
  }

  try {
    await request(`/categories/${id}`, {
      method: "DELETE",
    });

    await loadData();
  } catch (error) {
    alert("No se pudo eliminar la categoría. Puede tener productos asociados.");
  }
}

// Limpiar formulario categoría
function resetCategoryForm() {
  categoryForm.reset();
  categoryId.value = "";
  categoryFormTitle.innerHTML = `<i class="bi bi-tags me-2"></i>Categorías`;
  categorySubmitBtn.innerHTML = "Agregar";
  cancelCategoryEditBtn.classList.add("hidden");
}

// Crear o actualizar proveedor
supplierForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    name: supplierName.value.trim(),
    email: supplierEmail.value.trim(),
  };

  try {
    if (supplierId.value) {
      await request(`/suppliers/${supplierId.value}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } else {
      await request("/suppliers", {
        method: "POST",
        body: JSON.stringify(data),
      });
    }

    resetSupplierForm();
    await loadData();
  } catch (error) {
    alert(error.message);
  }
});

// Editar proveedor
function editSupplier(id) {
  const supplier = suppliers.find((item) => item.id === id);

  if (!supplier) {
    return;
  }

  supplierId.value = supplier.id;
  supplierName.value = supplier.name;
  supplierEmail.value = supplier.email;

  supplierFormTitle.innerHTML = `<i class="bi bi-pencil-square me-2"></i>Actualizar proveedor`;
  supplierSubmitBtn.innerHTML = "Actualizar proveedor";
  cancelSupplierEditBtn.classList.remove("hidden");

  supplierName.focus();
}

// Eliminar proveedor
async function deleteSupplier(id) {
  const supplier = suppliers.find((item) => item.id === id);

  const confirmDelete = confirm(
    `¿Seguro que quieres eliminar el proveedor "${supplier?.name}"?\n\nSi tiene productos asociados, el backend puede impedir la eliminación.`
  );

  if (!confirmDelete) {
    return;
  }

  try {
    await request(`/suppliers/${id}`, {
      method: "DELETE",
    });

    await loadData();
  } catch (error) {
    alert("No se pudo eliminar el proveedor. Puede tener productos asociados.");
  }
}

// Limpiar formulario proveedor
function resetSupplierForm() {
  supplierForm.reset();
  supplierId.value = "";
  supplierFormTitle.innerHTML = `<i class="bi bi-truck me-2"></i>Proveedores`;
  supplierSubmitBtn.innerHTML = "Agregar proveedor";
  cancelSupplierEditBtn.classList.add("hidden");
}

// Crear o actualizar producto
productForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    name: productName.value.trim(),
    price: Number(productPrice.value),
    categoryId: Number(productCategory.value),
    supplierId: Number(productSupplier.value),
  };

  try {
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
  } catch (error) {
    alert(error.message);
  }
});

// Editar producto
function editProduct(id) {
  const product = products.find((item) => item.id === id);

  if (!product) {
    return;
  }

  productId.value = product.id;
  productName.value = product.name;
  productPrice.value = product.price;
  productCategory.value = product.category.id;
  productSupplier.value = product.supplier.id;

  productFormTitle.innerHTML = `<i class="bi bi-pencil-square me-2"></i>Actualizar producto`;
  productSubmitBtn.innerHTML = "Actualizar producto";
  cancelEditBtn.classList.remove("hidden");

  productForm.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

// Eliminar producto
async function deleteProduct(id) {
  const product = products.find((item) => item.id === id);

  const confirmDelete = confirm(`¿Seguro que quieres eliminar el producto "${product?.name}"?`);

  if (!confirmDelete) {
    return;
  }

  try {
    await request(`/products/${id}`, {
      method: "DELETE",
    });

    await loadData();
  } catch (error) {
    alert(error.message);
  }
}

// Limpiar formulario producto
function resetProductForm() {
  productForm.reset();
  productId.value = "";
  productFormTitle.innerHTML = `<i class="bi bi-plus-square me-2"></i>Crear producto`;
  productSubmitBtn.innerHTML = "Guardar producto";
  cancelEditBtn.classList.add("hidden");
}

// Botones cancelar y actualizar
cancelCategoryEditBtn.addEventListener("click", resetCategoryForm);
cancelSupplierEditBtn.addEventListener("click", resetSupplierForm);
cancelEditBtn.addEventListener("click", resetProductForm);
refreshBtn.addEventListener("click", loadData);

// Carga inicial
loadData();