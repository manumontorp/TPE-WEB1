/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////  Los scripts estan ordenados de la siguiente manera:    ////////////////////////////
//////////////////////////////////////////     1. Partial Render                                   ////////////////////////////
/////////////////////////////////////////      2. Script menu desplegable                         ////////////////////////////
////////////////////////////////////////       3. Script cambiar tema claro/oscuro               ////////////////////////////
///////////////////////////////////////        4. Tabla con REST                                ////////////////////////////
//////////////////////////////////////         5. Script Captcha                               ////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// A traves del evento DOMContentLoaded verificamos
// que se termine de cargar el DOM
// y se procede a ejectuar el script
document.addEventListener("DOMContentLoaded", (event) => {
  // Esta funcion me va a permitir redirigir al usuario al principio de la pagina cuando sea necesario
  function scrollear() {
    window.scrollTo(0, 0);
  }

  //////////////////////////////////////////////////// SECCION PARTIAL RENDER ////////////////////////////////////////////////////

  window["Home"].addEventListener("click", (event) => push(event));
  window["Contacto"].addEventListener("click", (event) => push(event));
  window["Horarios"].addEventListener("click", (event) => push(event));
  window["Compras"].addEventListener("click", (event) => push(event));

  function push(event) {
    let id = event.target.id;
    if (id === undefined || id === "formulario-logeo") {
      id = "Home";
      window.history.pushState({ id }, `${id}`, `/`);
      cargarContenido(id);
    } else {
      selectTab(id);
      cargarContenido(id);
      window.history.pushState({ id }, `${id}`, `/${id}`);
    }
  }

  window.addEventListener("popstate", (event) => {
    let id = event.state.id;
    selectTab(id); //cambiar color anchor del nav
    cargarContenido(id);
  });

  function selectTab(id) {
    document.querySelectorAll(".route").forEach((item) => item.classList.remove("seleccionada"));
    document.querySelectorAll("#" + id).forEach((item) => item.classList.add("seleccionada"));
  }

  //MENSAJES DE CARGA/ERROR
  const mjeDeCarga = '<h1 class="loading">Cargando contenido...</h1>';
  const mjeDeErrorEnProcedimiento =
    '<h1 class="loading">Cargando contenido...</h1>';
  const mjeDeErrorDeConexion =
    '<h1 class="loading">Hubo un error al cargar el contenido, revise su conexión.</h1> ';

  // FUNCION ASYNC PARA CARGAR CONTENIDO DENTRO DEL SITIO
  async function cargarContenido(url) {
    const contenido = document.querySelector("#contenido");
    scrollear();
    contenido.innerHTML = mjeDeCarga;
    try {
      let response = await fetch(`${window.location.origin}/TPE-WEB1/partialRender/${url}.html`);
      if (response.ok) {
        let html = await response.text();
        contenido.innerHTML = html;
      } else {
        contenido.innerHTML = mjeDeErrorEnProcedimiento;
      }
      document.title = `Tienda Tandil | ${url}`; // Actualizar el titulo en pestaña

      // VERIFICAR SI SE PIDIO LA HOJA DE FORMULARIO PARA INCIAR CAPTCHA
      if (url == "Contacto") {
        iniciarCaptcha();
      }
      // VERIFICAR SI SE MUESTRA LA HOJA DE PEDIDOS PARA INCIAR TABLA DINAMICA
      if (url == "Compras") {
        iniciarTablaDinamica();
      }
    } catch (error) {
      contenido.innerHTML = mjeDeErrorDeConexion;
      console.log(error);
    }
  }

  // Cargar contenido cuando se igresa por primera vez
  push(event);

  //////////////////////////////////////////////////// FIN PARTIAL RENDER ////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////// MENU HAMBURGESA DESPLEGABLE ////////////////////////////////////////////////
  let botonMenu = document.querySelector("#botonMenuHamburguesa");
  let botonesNav = document.querySelector(".lista-nav");

  botonMenu.addEventListener("click", function (event) {
    event.preventDefault();
    toggleDisplay();
  });

  function toggleDisplay() {
    botonMenu.classList.toggle("active");
    botonesNav.classList.toggle("active");
  }
  ////////////////////////////////////////////// FIN MENU DESPLEGABLE   ///////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////// TEMA CLARO/OSCURO   /////////////////////////////////////////////////

  // Declaracion de botones
  const oscuro = document.querySelector("#temaOscuro");
  const claro = document.querySelector("#temaClaro");

  // Listeners para cada botón
  claro.addEventListener("click", function (event) {
    event.preventDefault();
    cambiarTema();
  });

  oscuro.addEventListener("click", function (event) {
    event.preventDefault();
    cambiarTema();
  });

  // Función para modificar el botón

  function cambiarBoton() {
    if (claro.style.visibility === "visible") {
      claro.classList.toggle(".on");
      oscuro.classList.toggle("off");
    } else {
      claro.classList.toggle("on");
      oscuro.classList.toggle("off");
    }
  }

  function cambiarTema() {
    let formulario = document.querySelector(".form-container");
    let productos = document.querySelectorAll(".productos");
    let tablaFijaHorarios = document.querySelector(".cuerpo-tabla");
    let containerTablaDinamica = document.querySelector(
      ".container-principal-tabla-dinamica"
    );
    let body = document.querySelector("body");
    body.classList.toggle("dark");
    cambiarBoton();
    if (formulario != null) {
      // en cada if se comprueba si existe el elemento
      formulario.classList.toggle("dark");
    } else if (productos != null) {
      for (let item of productos) {
        item.classList.toggle("dark");
      }
    } else if (tablaFijaHorarios != null) {
      tablaFijaHorarios.classList.toggle("dark");
    } else {
      tablaProductos.classList.toggle("dark");
      containerTablaDinamica.classList.toggle("dark");
    }
  }
  //////////////////////////////////////////////////// FIN MENU HAMBURGESA DESPLEGABLE ////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////// SECCION TABLA DINAMICA CON REST ////////////////////////////////////////////////////

  function iniciarTablaDinamica() {
    const apiUrl = "https://667745f1145714a1bd744c63.mockapi.io/api/pedidos";
    const mostrarError = document.querySelector(
      ".container-principal-tabla-dinamica"
    );
    const tablaProductos = document.querySelector("#cuerpo-tabla-dinamica");
    const formularioProducto = document.querySelector(
      "#formulario-tabla-dinamica-agregar"
    );
    const modoEdicion = document.querySelector(".form-editar-objeto");

    // Función para cargar productos desde la API
    async function cargarProductos() {
      tablaProductos.innerHTML = " ";
      tablaProductos.innerHTML = "<h2>Cargando tabla de compras...</h2>";
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          // limpiar tabla antes de llenarla de nuevo
          tablaProductos.innerHTML = " ";
          // llenar tabla con datos de la API
          data.forEach((producto) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.telefono}</td>
            <td>${producto.email}</td>
            <td>${producto.producto}</td>
            <td>
             <button class="editar-btn" data-id="${producto.id}"><i id="icono-edit" class="fa-solid fa-pen-to-square"></i></button>
             <button class="borrar-btn" data-id="${producto.id}"><i class="fa-solid fa-eraser"></i></button>
            </td>
          `;
            tablaProductos.appendChild(fila);

            //pongo a escuchar los botones a medida que se van creando
            //de tal manera que cada uno quede indentificado a la ID de su fila correspondiente
            const btnEditar = fila.querySelector(".editar-btn");
            btnEditar.addEventListener("click", function (event) {
              event.preventDefault();
              editarFila(producto);
            });

            const btnBorrar = fila.querySelector(".borrar-btn");
            btnBorrar.addEventListener("click", (event) => {
              event.preventDefault();
              borrarFila(producto.id);
            });
          });
        }
      } catch (error) {
        mostrarError.innerHTML =
          "<h2>:(</h2>" +
          "<p>Parece que algo salió mal al cargar tabla de compras</p>";
        console.log(eror);
      }
    }

    // Ejecturar para refrescar productos al cargar la página
    cargarProductos();

    // Listener del formulario Agregar
    formularioProducto.addEventListener("submit", async function (event) {
      event.preventDefault();
      let nombre = document.querySelector("#nombre").value;
      let telefono = Number(document.querySelector("#telefono").value);
      let email = document.querySelector("#email").value;
      let producto = document.querySelector("#producto").value;

      // Declaracion del objeto
      const nuevoProducto = {
        nombre: nombre,
        telefono: telefono,
        email: email,
        producto: producto,
      };

      // POST para agregar producto a la API
      try {
        let res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nuevoProducto),
        });
        if (res.status === 201) {
          // Limpiar formulario después de agregar producto
          formularioProducto.reset();
          // Volver a cargar la tabla con el nuevo producto
          cargarProductos();
        }
      } catch (error) {
        console.error(error);
      }
    });

    // Funcion para editar fila de la tabla
    function editarFila(fila) {
      // Se entra en modo de edicion y se muestra el formulario Editar
      modoEdicion.classList.add("on");
      scrollear();
      let formulario = document.querySelector(".form-editar-objeto");
      formulario.nombre.value = fila.nombre;
      formulario.telefono.value = fila.telefono;
      formulario.email.value = fila.email;
      formulario.producto.value = fila.producto;
      //Envio el from y el ID de la fila como parámetros para procesar la edicion
      procesarEdit(formulario, fila.id);
    }

    function procesarEdit(formulario, id) {
      // listener para el formulario recibido
      formulario.addEventListener("submit", async function (event) {
        event.preventDefault();
        // selecciono el boton submit del formulario Editar
        let btn = document.querySelector("#editar");

        const nombre = document.querySelector("#nuevoNombre").value;
        const telefono = Number(document.querySelector("#nuevoTelefono").value);
        const email = document.querySelector("#nuevoEmail").value;
        const producto = document.querySelector("#nuevoProducto").value;

        const objetoNuevo = {
          nombre: nombre,
          telefono: telefono,
          email: email,
          producto: producto,
        };

        //El boton cambia para mostrar que se esta procesando el nuevo producto
        btn.value = "Espere";

        // PUT para cambiar los datos en el servidor
        try {
          let res = await fetch(`${apiUrl}/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(objetoNuevo),
          });
          if (res.status === 200) {
            // Limpiar formulario después de editar el producto
            formularioProducto.reset();
            // Volver a cargar la tabla con el reemplazo
            btn.value = "Editar";
            formulario.classList.remove("on");
            cargarProductos();
          }
        } catch (error) {
          console.error(error);
        }
      });
    }

    // Funcion para borrar producto
    async function borrarFila(id) {
      // Damos la posibilidad de arrepentimiento
      if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
        // DELETE para eliminar el producto
        try {
          let response = await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
          });
          const data = await response.json();
          // Refrescar la tabla una vez que el producto fue eliminado
          cargarProductos(data);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  //////////////////////////////////////////////////// FIN TABLA DINAMICA ////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////// SECCION CAPTCHA ////////////////////////////////////////////////////
  function iniciarCaptcha() {
    const imagenes = [
      { src: "TPE-WEB1/img/d2ycw.jpg", codigo: "d2ycw" },
      { src: "TPE-WEB1/img/fg8n4.jpg", codigo: "fg8n4" },
      { src: "TPE-WEB1/img/nmw46.jpg", codigo: "nmw46" },
      { src: "TPE-WEB1/img/p2m6n.jpg", codigo: "p2m6n" },
      { src: "TPE-WEB1/img/wf684.jpg", codigo: "wf684" },
    ];

    let indiceActual;

    // Función para mostrar una imagen aleatoria
    function mostrarImagenAleatoria() {
      indiceActual = Math.floor(Math.random() * imagenes.length);
      document.querySelector("#imagen-captcha").src =
        imagenes[indiceActual].src;
      document.querySelector("#input-captcha").value = "";
      document.querySelector("#incorrecto").textContent = "";
      document.querySelector("#correcto").textContent = "";
    }

    // Función para validar el captcha
    function validarCaptcha(e) {
      const captchaInput = document.querySelector("#input-captcha").value;
      const captchaCode = imagenes[indiceActual].codigo;
      const btn = document.querySelector("#enviar");
      btn.removeAttribute("value");
      btn.setAttribute("value", "Validando...");
      setTimeout(() => {
        if (captchaInput === captchaCode) {
          document.querySelector("#correcto").textContent =
            "Formulario validado!";
          document.querySelector("#incorrecto").textContent = " ";
          document.querySelector("#submit-parrafo").innerHTML =
            "Redirigiendo a la página principal...";
          btn.removeAttribute("value");
          btn.setAttribute("value", "Espere...");
          setTimeout(() => {
            push(e);
            scrollear();
          }, 3000);
        } else {
          mostrarImagenAleatoria();
          let btn = document.querySelector("#enviar");
          btn.removeAttribute("value");
          btn.setAttribute("value", "Enviar");
          document.querySelector("#incorrecto").textContent =
            "No existen coincidencias";
        }
      }, 2000);
    }

    // Mostrar una imagen aleatoria al cargar la página
    mostrarImagenAleatoria();

    // Se agrega un nuevo Listener
    // para el evento submit del formulario
    document
      .querySelector("#formulario-logeo")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        validarCaptcha(event);
      });

    document
      .querySelector("#otra-img-captcha")
      .addEventListener("click", (event) => {
        event.preventDefault();
        mostrarImagenAleatoria();
      });
  }
});
