document.addEventListener("DOMContentLoaded", () => {
  const categoryForm = document.getElementById("categoryForm");
  const supplierForm = document.getElementById("supplierForm");
  const productForm = document.getElementById("productForm");

  const categoryName = document.getElementById("categoryName");
  const supplierName = document.getElementById("supplierName");
  const supplierEmail = document.getElementById("supplierEmail");

  const productName = document.getElementById("productName");
  const productPrice = document.getElementById("productPrice");
  const productCategory = document.getElementById("productCategory");
  const productSupplier = document.getElementById("productSupplier");

  function normalizar(texto) {
    return texto.trim().toLowerCase();
  }

  function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function mostrarError(input, mensaje) {
    limpiarError(input);

    input.classList.add("input-error");

    const error = document.createElement("small");
    error.className = "error-message";
    error.textContent = mensaje;

    const contenedor = input.closest(".input-box") || input.parentElement;
    contenedor.appendChild(error);
  }

  function limpiarError(input) {
    input.classList.remove("input-error");

    const contenedor = input.closest(".input-box") || input.parentElement;
    const error = contenedor.querySelector(".error-message");

    if (error) error.remove();
  }

  function limpiarFormulario(form) {
    form.querySelectorAll("input, select").forEach((campo) => {
      limpiarError(campo);
    });
  }

  function obtenerCategoriasActuales() {
    return Array.from(document.querySelectorAll("#categoryList li"))
      .map((li) => li.textContent.trim())
      .filter(Boolean);
  }

  function obtenerCorreosActuales() {
    return Array.from(document.querySelectorAll("#supplierList li"))
      .map((li) => {
        const texto = li.textContent.trim();
        return texto.includes("-") ? texto.split("-").pop().trim() : "";
      })
      .filter(Boolean);
  }

  categoryForm.addEventListener(
    "submit",
    (event) => {
      limpiarFormulario(categoryForm);

      const nombre = categoryName.value.trim();
      const categorias = obtenerCategoriasActuales();

      if (!nombre) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(categoryName, "La categoría es obligatoria.");
        return;
      }

      if (nombre.length < 3) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(categoryName, "La categoría debe tener mínimo 3 caracteres.");
        return;
      }

      const existe = categorias.some(
        (categoria) => normalizar(categoria) === normalizar(nombre)
      );

      if (existe) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(categoryName, "Esta categoría ya existe.");
      }
    },
    true
  );

  supplierForm.addEventListener(
    "submit",
    (event) => {
      limpiarFormulario(supplierForm);

      const nombre = supplierName.value.trim();
      const email = supplierEmail.value.trim();
      const correos = obtenerCorreosActuales();

      if (!nombre) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(supplierName, "El nombre del proveedor es obligatorio.");
        return;
      }

      if (nombre.length < 3) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(supplierName, "El nombre debe tener mínimo 3 caracteres.");
        return;
      }

      if (!email) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(supplierEmail, "El correo es obligatorio.");
        return;
      }

      if (!emailValido(email)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(supplierEmail, "Ingresa un correo válido.");
        return;
      }

      const existe = correos.some(
        (correo) => normalizar(correo) === normalizar(email)
      );

      if (existe) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(supplierEmail, "Este correo ya está registrado.");
      }
    },
    true
  );

  productForm.addEventListener(
    "submit",
    (event) => {
      limpiarFormulario(productForm);

      const nombre = productName.value.trim();
      const precio = Number(productPrice.value);

      if (!nombre) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(productName, "El nombre del producto es obligatorio.");
        return;
      }

      if (nombre.length < 3) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(productName, "El producto debe tener mínimo 3 caracteres.");
        return;
      }

      if (!productPrice.value || Number.isNaN(precio)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(productPrice, "El precio es obligatorio.");
        return;
      }

      if (precio <= 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(productPrice, "El precio debe ser mayor a 0.");
        return;
      }

      if (!productCategory.value) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(productCategory, "Selecciona una categoría.");
        return;
      }

      if (!productSupplier.value) {
        event.preventDefault();
        event.stopImmediatePropagation();
        mostrarError(productSupplier, "Selecciona un proveedor.");
      }
    },
    true
  );

  document.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", () => limpiarError(input));
    input.addEventListener("change", () => limpiarError(input));
  });
});