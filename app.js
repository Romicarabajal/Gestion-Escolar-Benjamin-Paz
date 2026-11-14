
// Registro de IA: código elaborado con asistencia de IA para este proyecto.
"use strict";

// Datos locales. No se incluyen registros de ejemplo ni datos reales.
let cursos = [];
let alumnos = [];
let docentes = [];
let asignaciones = [];
const claveAlmacenamiento = "escuela-datos";
const plurales = { curso: "cursos", alumno: "alumnos", docente: "docentes", asignacion: "asignaciones" };
const ediciones = { curso: null, alumno: null, docente: null };
let idCursoEnFicha = null;
let cargaSegura = true;
const elemento = (id) => document.getElementById(id);
const normalizarTexto = (texto) => String(texto).trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
const normalizarBusqueda = (texto) => normalizarTexto(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const generarId = (tipo) => tipo + "-" + Date.now() + "-" + Math.random().toString(36).slice(2);
const nombreTurno = (turno) => ({ manana: "Mañana", tarde: "Tarde", noche: "Noche" })[turno] || turno;
function nombreCurso(id) {
  const curso = cursos.find((curso) => curso.id === id);
  return curso ? curso.anio + " " + curso.division + " · " + nombreTurno(curso.turno) : "Curso no encontrado";
}
function nombreDocente(id) {
  const docente = docentes.find((docente) => docente.id === id);
  return docente ? docente.apellido + ", " + docente.nombre : "Docente no encontrado";
}
function obtenerDatos() { return { cursos, alumnos, docentes, asignaciones }; }
function aplicarDatos(datos) {
  ({ cursos, alumnos, docentes, asignaciones } = datos);
}
function obtenerLista(tipo) { return obtenerDatos()[plurales[tipo]]; }
function cambiarLista(tipo, lista) {
  const datos = obtenerDatos();
  datos[plurales[tipo]] = lista;
  aplicarDatos(datos);
}

// Validaciones compartidas por formularios e importación.
function exigir(condicion, mensaje) { if (!condicion) throw new Error(mensaje); }
function fechaNacimientoValida(texto) {
  if (typeof texto !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [anio, mes, dia] = texto.split("-").map(Number);
  const fecha = new Date(0);
  fecha.setHours(0, 0, 0, 0);
  fecha.setFullYear(anio, mes - 1, dia);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return anio >= 1 && fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 && fecha.getDate() === dia && fecha <= hoy;
}
function validarDatosImportados(datos) {
  const esTexto = (valor) => typeof valor === "string" && valor.trim() !== "";
  exigir(datos && typeof datos === "object" && !Array.isArray(datos), "El archivo debe contener un objeto.");
  Object.values(plurales).forEach((nombre) => {
    exigir(Array.isArray(datos[nombre]), "Falta la lista: " + nombre);
    const identificadores = new Set();
    datos[nombre].forEach((registro) => {
      exigir(registro && typeof registro === "object" && esTexto(registro.id), "Registro inválido en " + nombre);
      exigir(!identificadores.has(registro.id), "Identificador repetido en " + nombre);
      identificadores.add(registro.id);
    });
  });
  const clavesCursos = new Set();
  datos.cursos.forEach((curso) => {
    exigir(Number.isInteger(curso.anio) && curso.anio >= 1 && esTexto(curso.division) &&
      ["manana","tarde","noche"].includes(curso.turno) && typeof curso.especialidad === "string", "Curso inválido.");
    const clave = JSON.stringify([curso.anio, normalizarTexto(curso.division), curso.turno]);
    exigir(!clavesCursos.has(clave), "Ya existe ese año, división y turno.");
    clavesCursos.add(clave);
  });
  ["alumnos","docentes"].forEach((nombre) => {
    const legajos = new Set();
    datos[nombre].forEach((persona) => {
      exigir(esTexto(persona.legajo) && esTexto(persona.nombre) && esTexto(persona.apellido), "Completá legajo, nombre y apellido.");
      const legajo = normalizarTexto(persona.legajo);
      exigir(!legajos.has(legajo), "Legajo repetido en " + nombre);
      legajos.add(legajo);
    });
  });
  const idsCursos = new Set(datos.cursos.map((curso) => curso.id));
  const idsDocentes = new Set(datos.docentes.map((docente) => docente.id));
  datos.alumnos.forEach((alumno) => {
    exigir(fechaNacimientoValida(alumno.fechaNacimiento), "Fecha de nacimiento inválida o futura.");
    exigir(idsCursos.has(alumno.cursoId), "Seleccioná un curso existente para el alumno.");
  });
  const verificador = document.createElement("input");
  verificador.type = "email";
  verificador.required = true;
  datos.docentes.forEach((docente) => {
    exigir(esTexto(docente.email), "Ingresá un email.");
    verificador.value = docente.email;
    exigir(verificador.checkValidity(), "Email con formato inválido.");
  });
  const clavesAsignaciones = new Set();
  datos.asignaciones.forEach((asignacion) => {
    exigir(idsCursos.has(asignacion.cursoId) && idsDocentes.has(asignacion.docenteId), "Seleccioná docente y curso existentes.");
    exigir(esTexto(asignacion.materia), "La materia es obligatoria.");
    exigir(Number.isInteger(asignacion.horasSemanales) && asignacion.horasSemanales >= 1 &&
      asignacion.horasSemanales <= 10, "Las horas deben ser enteras entre 1 y 10.");
    const clave = JSON.stringify([asignacion.docenteId, asignacion.cursoId, normalizarTexto(asignacion.materia)]);
    exigir(!clavesAsignaciones.has(clave), "Ya existe esa combinación de docente, curso y materia.");
    clavesAsignaciones.add(clave);
  });
}

// Ejemplos educativos: todas las personas, legajos y asignaciones son ficticios.
// Los correos usan example.com, un dominio reservado para ejemplos.
function datosEjemploFicticios() {
  return {
    cursos: [
      { id: "curso-demo-1", anio: 6, division: "A", turno: "manana", especialidad: "Informática" },
      { id: "curso-demo-2", anio: 6, division: "B", turno: "tarde", especialidad: "Electromecánica" },
      { id: "curso-demo-3", anio: 5, division: "A", turno: "manana", especialidad: "Informática" }
    ],
    alumnos: [
      { id: "alumno-demo-1", legajo: "FIC-A001", nombre: "Valentina", apellido: "Acosta", fechaNacimiento: "2008-04-12", cursoId: "curso-demo-1" },
      { id: "alumno-demo-2", legajo: "FIC-A002", nombre: "Mateo", apellido: "Benítez", fechaNacimiento: "2008-09-03", cursoId: "curso-demo-1" },
      { id: "alumno-demo-3", legajo: "FIC-A003", nombre: "Sofía", apellido: "Cabrera", fechaNacimiento: "2008-02-20", cursoId: "curso-demo-2" },
      { id: "alumno-demo-4", legajo: "FIC-A004", nombre: "Tomás", apellido: "Duarte", fechaNacimiento: "2009-06-15", cursoId: "curso-demo-3" },
      { id: "alumno-demo-5", legajo: "FIC-A005", nombre: "Emma", apellido: "Álvarez", fechaNacimiento: "2008-11-08", cursoId: "curso-demo-1" },
      { id: "alumno-demo-6", legajo: "FIC-A006", nombre: "Julián", apellido: "Fernández", fechaNacimiento: "2009-03-22", cursoId: "curso-demo-3" }
    ],
    docentes: [
      { id: "docente-demo-1", legajo: "FIC-D001", nombre: "Clara", apellido: "Molina", email: "clara.molina@example.com" },
      { id: "docente-demo-2", legajo: "FIC-D002", nombre: "Bruno", apellido: "Ríos", email: "bruno.rios@example.com" },
      { id: "docente-demo-3", legajo: "FIC-D003", nombre: "Elena", apellido: "Vega", email: "elena.vega@example.com" }
    ],
    asignaciones: [
      { id: "asignacion-demo-1", docenteId: "docente-demo-1", cursoId: "curso-demo-1", materia: "Programación", horasSemanales: 6 },
      { id: "asignacion-demo-2", docenteId: "docente-demo-2", cursoId: "curso-demo-1", materia: "Redes informáticas", horasSemanales: 4 },
      { id: "asignacion-demo-3", docenteId: "docente-demo-3", cursoId: "curso-demo-2", materia: "Sistemas de control", horasSemanales: 5 },
      { id: "asignacion-demo-4", docenteId: "docente-demo-1", cursoId: "curso-demo-3", materia: "Diseño web", horasSemanales: 4 },
      { id: "asignacion-demo-5", docenteId: "docente-demo-2", cursoId: "curso-demo-3", materia: "Hardware", horasSemanales: 3 }
    ]
  };
}

// Guardado conjunto. Una carga inválida nunca se sobrescribe automáticamente.
function guardarDatos() {
  try {
    exigir(cargaSegura, "No se puede guardar hasta importar un archivo válido; los datos guardados no pudieron cargarse.");
    localStorage.setItem(claveAlmacenamiento, JSON.stringify(obtenerDatos()));
    actualizarContadores();
    return true;
  } catch (error) { alert("No se pudieron guardar los datos: " + error.message); return false; }
}
function cargarDatos() {
  try {
    const texto = localStorage.getItem(claveAlmacenamiento);
    // Los ejemplos se cargan una sola vez y nunca reemplazan datos existentes.
    if (texto === null) {
      const ejemplos = datosEjemploFicticios();
      validarDatosImportados(ejemplos);
      aplicarDatos(ejemplos);
      guardarDatos();
    }
    if (texto !== null) {
      const datos = JSON.parse(texto);
      validarDatosImportados(datos);
      aplicarDatos(datos);
    }
  } catch (error) {
    cargaSegura = false;
    alert("No se pudieron cargar los datos. No se modificó el contenido guardado. " + error.message);
  }
}

// Construcción de elementos con textContent para tratar los datos como texto.
function crearElemento(etiqueta, texto, clase) {
  const nodo = document.createElement(etiqueta);
  if (texto !== undefined) nodo.textContent = texto;
  if (clase) nodo.className = clase;
  return nodo;
}
function crearBoton(texto, accion) {
  const boton = crearElemento("button", texto);
  boton.type = "button";
  boton.addEventListener("click", accion);
  return boton;
}
function actualizarContadores() {
  const contenedor = elemento("contadores-inicio");
  contenedor.replaceChildren();
  [["📚","Cursos",cursos],["🎒","Alumnos",alumnos],["👩‍🏫","Docentes",docentes],["📋","Asignaciones",asignaciones]].forEach(([icono,titulo,lista]) => {
    const tarjeta = crearElemento("div", undefined, "tarjeta-contador");
    const dibujo = crearElemento("span", icono, "icono-contador");
    dibujo.setAttribute("aria-hidden", "true");
    tarjeta.append(dibujo, crearElemento("span", lista.length, "numero-contador"), crearElemento("span", titulo));
    contenedor.append(tarjeta);
  });
}
function completarSelector(selector, registros, nombre, textoInicial) {
  const anterior = selector.value;
  selector.replaceChildren(new Option(textoInicial, ""));
  registros.forEach((registro) => selector.add(new Option(nombre(registro.id), registro.id)));
  selector.value = registros.some((registro) => registro.id === anterior) ? anterior : "";
}
function actualizarSelectores() {
  completarSelector(elemento("alumno-cursoId"), cursos, nombreCurso, "Seleccioná un curso");
  completarSelector(elemento("asignacion-cursoId"), cursos, nombreCurso, "Seleccioná un curso");
  completarSelector(elemento("asignacion-docenteId"), docentes, nombreDocente, "Seleccioná un docente");
  completarSelector(elemento("filtro-curso"), cursos, nombreCurso, "Todos los cursos");
}
const compararAlumnos = (primero, segundo) => primero.apellido.localeCompare(segundo.apellido,"es",{sensitivity:"base",numeric:true}) || primero.nombre.localeCompare(segundo.nombre,"es",{sensitivity:"base"});
function listarPersonas(tipo) {
  const lista = elemento("lista-" + plurales[tipo]);
  lista.replaceChildren();
  let registros = obtenerLista(tipo);
  if (tipo === "alumno") {
    const curso = elemento("filtro-curso").value;
    const texto = normalizarBusqueda(elemento("busqueda-alumnos").value);
    registros = alumnos.filter((alumno) => (!curso || alumno.cursoId === curso) &&
      (normalizarBusqueda(alumno.apellido).includes(texto) || normalizarBusqueda(alumno.legajo).includes(texto))).sort(compararAlumnos);
    elemento("resumen-alumnos").textContent = registros.length + " de " + alumnos.length + " alumnos.";
  }
  registros.forEach((persona) => {
    const tarjeta = crearElemento("li");
    tarjeta.append(crearElemento("h3", persona.apellido + ", " + persona.nombre), crearElemento("p", "Legajo: " + persona.legajo));
    if (tipo === "alumno") {
      tarjeta.append(crearElemento("p", "Nacimiento: " + persona.fechaNacimiento.split("-").reverse().join("/")), crearElemento("p", "Curso: " + nombreCurso(persona.cursoId)));
    } else tarjeta.append(crearElemento("p", "Email: " + persona.email));
    tarjeta.append(crearBoton("✏️ Editar", () => editar(tipo,persona.id)), crearBoton("🗑️ Eliminar", () => eliminar(tipo,persona.id)));
    lista.append(tarjeta);
  });
}
function listarCursos() {
  elemento("lista-cursos").replaceChildren();
  cursos.forEach((curso) => {
    const tarjeta = crearElemento("li");
    tarjeta.append(crearElemento("h3", nombreCurso(curso.id)), crearElemento("p",curso.especialidad || "Sin especialidad"),
      crearBoton("📖 Ver ficha", () => mostrarFichaCurso(curso.id)),
      crearBoton("✏️ Editar", () => editar("curso",curso.id)),
      crearBoton("🗑️ Eliminar", () => eliminar("curso",curso.id)));
    tarjeta.addEventListener("click", (evento) => { if (!evento.target.closest("button")) mostrarFichaCurso(curso.id); });
    elemento("lista-cursos").append(tarjeta);
  });
}
function listarAsignaciones() {
  const cuerpo = elemento("lista-asignaciones");
  cuerpo.replaceChildren();
  asignaciones.forEach((asignacion) => {
    const fila = crearElemento("tr");
    [nombreDocente(asignacion.docenteId),nombreCurso(asignacion.cursoId),asignacion.materia,asignacion.horasSemanales].forEach((valor) => fila.append(crearElemento("td",valor)));
    const acciones = crearElemento("td");
    acciones.append(crearBoton("🗑️ Quitar", () => eliminar("asignacion",asignacion.id)));
    fila.append(acciones);
    cuerpo.append(fila);
  });
  if (!asignaciones.length) {
    const fila = crearElemento("tr");
    const celda = crearElemento("td","Todavía no hay asignaciones.");
    celda.colSpan = 5;
    fila.append(celda);
    cuerpo.append(fila);
  }
  prepararTablaMovil(cuerpo.closest("table"));
}

// Etiquetas para leer cada fila como tarjeta en pantallas pequeñas.
function prepararTablaMovil(tabla) {
  const titulos = Array.from(tabla.querySelectorAll("thead th"), (celda) => celda.textContent);
  tabla.querySelectorAll("tbody tr").forEach(function (fila) {
    Array.from(fila.cells).forEach(function (celda, indice) {
      if (celda.colSpan > 1) celda.classList.add("celda-vacia");
      else celda.dataset.etiqueta = titulos[indice] || "";
    });
  });
}
// Comparte una fotografía textual del estado actual del curso.
async function compartirFichaCurso(id) {
  const curso = cursos.find((curso) => curso.id === id);
  if (!curso) return;
  const estudiantes = alumnos.filter((alumno) => alumno.cursoId === id).sort(compararAlumnos);
  const docentesDelCurso = asignaciones.filter((asignacion) => asignacion.cursoId === id);
  const total = docentesDelCurso.reduce((suma, asignacion) => suma + asignacion.horasSemanales, 0);
  const lineas = ["Escuela Secundaria Benjamín Paz", nombreCurso(id), "Especialidad: " + (curso.especialidad || "Sin especialidad"),
    "", "Cantidad de alumnos: " + estudiantes.length, "Alumnos:",
    ...estudiantes.map((alumno) => alumno.apellido + ", " + alumno.nombre + " · Legajo: " + alumno.legajo),
    ...(estudiantes.length ? [] : ["Sin alumnos registrados."]),
    "", "Docentes asignados:",
    ...docentesDelCurso.map((asignacion) => nombreDocente(asignacion.docenteId) + " · " + asignacion.materia + " · " + asignacion.horasSemanales + " h semanales"),
    ...(docentesDelCurso.length ? [] : ["Sin docentes asignados."]),
    "", "Total de horas semanales: " + total];
  const texto = lineas.join("\n");
  if (typeof navigator.share !== "function") {
    // También permite recuperar el texto cuando no existe el menú para compartir.
    window.prompt("Este navegador no permite compartir. Copiá el texto de la ficha:", texto);
    return;
  }
  try {
    await navigator.share({ title: "Ficha de " + nombreCurso(id), text: texto });
  } catch (error) {
    if (error.name !== "AbortError") {
      window.prompt("No se pudo compartir. Podés copiar el texto de la ficha:", texto);
    }
  }
}

// Ficha con alumnos ordenados, asignaciones y suma de horas.
function mostrarFichaCurso(id, enfocar = true) {
  const ficha = elemento("ficha-curso");
  const curso = cursos.find((curso) => curso.id === id);
  ficha.replaceChildren();
  ficha.hidden = !curso;
  idCursoEnFicha = curso ? id : null;
  if (!curso) return;
  const titulo = crearElemento("h3",nombreCurso(id));
  titulo.tabIndex = -1;
  const estudiantes = alumnos.filter((alumno) => alumno.cursoId === id).sort(compararAlumnos);
  const lista = crearElemento("ul");
  estudiantes.forEach((alumno) => lista.append(crearElemento("li",alumno.apellido + ", " + alumno.nombre + " · Legajo: " + alumno.legajo)));
  if (!estudiantes.length) lista.append(crearElemento("li","Este curso todavía no tiene alumnos."));
  const contenedor = crearElemento("div",undefined,"tabla-desplazable");
  contenedor.tabIndex = 0;
  contenedor.setAttribute("role","region");
  contenedor.setAttribute("aria-label","Docentes asignados al curso");
  const tabla = crearElemento("table");
  tabla.append(crearElemento("caption","Docentes asignados"));
  const encabezado = crearElemento("thead");
  const filaTitulo = crearElemento("tr");
  ["Docente","Materia","Horas semanales"].forEach((texto) => {
    const celda = crearElemento("th",texto);
    celda.scope = "col";
    filaTitulo.append(celda);
  });
  encabezado.append(filaTitulo);
  const cuerpo = crearElemento("tbody");
  let total = 0;
  asignaciones.filter((asignacion) => asignacion.cursoId === id).forEach((asignacion) => {
    const fila = crearElemento("tr");
    total += asignacion.horasSemanales;
    [nombreDocente(asignacion.docenteId),asignacion.materia,asignacion.horasSemanales].forEach((valor) => fila.append(crearElemento("td",valor)));
    cuerpo.append(fila);
  });
  if (!cuerpo.children.length) {
    const fila = crearElemento("tr");
    const celda = crearElemento("td","Sin docentes asignados.");
    celda.colSpan = 3;
    fila.append(celda);
    cuerpo.append(fila);
  }
  tabla.append(encabezado,cuerpo);
  prepararTablaMovil(tabla);
  contenedor.append(tabla);
  ficha.append(titulo,crearElemento("p","Cantidad de alumnos: " + estudiantes.length),crearElemento("h4","Alumnos"),lista,contenedor,crearElemento("p","Total de horas semanales: " + total),
    crearBoton("📤 Compartir ficha", () => compartirFichaCurso(id)),
    crearBoton("Cerrar ficha", () => { ficha.hidden = true; idCursoEnFicha = null; }));
  if (enfocar) titulo.focus();
}
function redibujarPantalla() {
  actualizarSelectores();
  actualizarContadores();
  listarCursos();
  listarPersonas("alumno");
  listarPersonas("docente");
  listarAsignaciones();
  if (idCursoEnFicha) mostrarFichaCurso(idCursoEnFicha,false);
}

// Alta, edición y baja. Se conserva el estado anterior si el guardado falla.
function cancelarEdicion(tipo) {
  const formulario = elemento("formulario-" + tipo);
  formulario.reset();
  if (tipo !== "asignacion") ediciones[tipo] = null;
  formulario.querySelector('[type="submit"]').textContent = "Guardar";
  formulario.querySelector(".cancelar").hidden = true;
}
function editar(tipo,id) {
  const registro = obtenerLista(tipo).find((registro) => registro.id === id);
  if (!registro) return;
  ediciones[tipo] = id;
  const formulario = elemento("formulario-" + tipo);
  Object.entries(registro).forEach(([campo,valor]) => {
    const entrada = formulario.elements.namedItem(campo);
    if (entrada) entrada.value = valor;
  });
  formulario.querySelector('[type="submit"]').textContent = "Guardar cambios";
  formulario.querySelector(".cancelar").hidden = false;
  formulario.querySelector("input,select").focus();
}
function eliminar(tipo,id) {
  if (tipo === "curso" && (alumnos.some((alumno) => alumno.cursoId === id) || asignaciones.some((asignacion) => asignacion.cursoId === id))) {
    alert("No se puede eliminar: el curso tiene alumnos o asignaciones."); return;
  }
  if (tipo === "docente" && asignaciones.some((asignacion) => asignacion.docenteId === id)) {
    alert("No se puede eliminar: el docente tiene asignaciones."); return;
  }
  if (!confirm("¿Querés " + (tipo === "asignacion" ? "quitar esta asignación" : "eliminar este registro") + "?")) return;
  const anteriores = obtenerLista(tipo);
  cambiarLista(tipo,anteriores.filter((registro) => registro.id !== id));
  if (!guardarDatos()) { cambiarLista(tipo,anteriores); actualizarContadores(); return; }
  if (ediciones[tipo] === id) cancelarEdicion(tipo);
  redibujarPantalla();
}
// Mensajes propios para explicar qué falta y confirmar el guardado.
function mostrarMensajeFormulario(formulario, texto, tipo) {
  const mensaje = formulario.querySelector(".mensaje-formulario");
  mensaje.textContent = texto;
  mensaje.dataset.tipo = tipo;
  mensaje.hidden = false;
}
function validarCamposFormulario(formulario) {
  const campos = Array.from(formulario.querySelectorAll("input,select"));
  campos.forEach((campo) => campo.removeAttribute("aria-invalid"));
  const incompletos = campos.filter((campo) => campo.required && !campo.value.trim());
  if (incompletos.length) {
    const nombres = incompletos.map((campo) => campo.labels[0].textContent);
    incompletos.forEach((campo) => campo.setAttribute("aria-invalid", "true"));
    mostrarMensajeFormulario(formulario, "Completá los campos obligatorios: " + nombres.join(", ") + ".", "error");
    incompletos[0].focus();
    return false;
  }
  const invalido = campos.find((campo) => !campo.checkValidity());
  if (invalido) {
    invalido.setAttribute("aria-invalid", "true");
    mostrarMensajeFormulario(formulario, invalido.labels[0].textContent + ": " + invalido.validationMessage, "error");
    invalido.focus();
    return false;
  }
  return true;
}
Object.keys(plurales).forEach((tipo) => {
  const formulario = elemento("formulario-" + tipo);
  // Desactivamos el globo nativo: las mismas validaciones se explican en pantalla.
  formulario.noValidate = true;
  const aviso = crearElemento("p", undefined, "mensaje-formulario");
  aviso.setAttribute("role", "status");
  aviso.setAttribute("aria-live", "polite");
  aviso.hidden = true;
  formulario.prepend(aviso);
  const indicacion = crearElemento("p", "Todos los campos son obligatorios." + (tipo === "curso" ? " La especialidad es opcional." : ""));
  if (tipo === "curso") indicacion.textContent = "Año, división y turno son obligatorios. La especialidad es opcional.";
  indicacion.style.gridColumn = "1 / -1";
  formulario.insertBefore(indicacion, aviso);
  formulario.addEventListener("reset", () => {
    aviso.hidden = true;
    formulario.querySelectorAll("[aria-invalid]").forEach((campo) => campo.removeAttribute("aria-invalid"));
  });
  formulario.querySelector(".cancelar").addEventListener("click", () => cancelarEdicion(tipo));
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarCamposFormulario(formulario)) return;
    const estabaEditando = Boolean(ediciones[tipo]);
    const registro = { id: ediciones[tipo] || generarId(tipo) };
    for (const [nombre,valor] of new FormData(formulario)) {
      registro[nombre] = ["anio","horasSemanales"].includes(nombre) ? Number(valor) : String(valor).trim().replace(/\s+/g," ");
    }
    const anteriores = obtenerLista(tipo);
    const nuevaLista = ediciones[tipo] ? anteriores.map((anterior) => anterior.id === ediciones[tipo] ? registro : anterior) : [...anteriores,registro];
    const candidatos = { ...obtenerDatos(), [plurales[tipo]]: nuevaLista };
    try { validarDatosImportados(candidatos); } catch (error) {
      mostrarMensajeFormulario(formulario, error.message, "error");
      return;
    }
    cambiarLista(tipo,nuevaLista);
    if (!guardarDatos()) {
      cambiarLista(tipo,anteriores);
      actualizarContadores();
      mostrarMensajeFormulario(formulario, "No se pudo guardar. Revisá el almacenamiento del navegador e intentá nuevamente.", "error");
      return;
    }
    cancelarEdicion(tipo);
    redibujarPantalla();
    mostrarMensajeFormulario(formulario, estabaEditando ? "Cambios guardados correctamente." : "Registro guardado correctamente.", "exito");
  });
});
elemento("filtros-alumnos").addEventListener("submit",(evento) => evento.preventDefault());
elemento("filtro-curso").addEventListener("change",() => listarPersonas("alumno"));
elemento("busqueda-alumnos").addEventListener("input",() => listarPersonas("alumno"));

// Navegación: una sección visible y compatibilidad con Atrás y Adelante.
function mostrarSeccion() {
  const identificador = location.hash.slice(1);
  const activa = ["inicio",...Object.values(plurales)].includes(identificador) ? identificador : "inicio";
  document.querySelectorAll("main > section").forEach((seccion) => { seccion.hidden = seccion.id !== activa; });
  document.querySelectorAll("nav a").forEach((enlace) => {
    if (enlace.hash === "#" + activa) enlace.setAttribute("aria-current","page");
    else enlace.removeAttribute("aria-current");
  });
}
window.addEventListener("hashchange",mostrarSeccion);

// Copias de seguridad: compartir el JSON cuando el dispositivo lo permita.
function descargarDatosJSON(archivo) {
  const direccion = URL.createObjectURL(archivo);
  const enlace = crearElemento("a");
  enlace.href = direccion;
  enlace.download = "escuela.json";
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(direccion), 1000);
}
elemento("boton-exportar").addEventListener("click", async () => {
  if (!cargaSegura) {
    alert("No se exportó: los datos guardados no pudieron cargarse.");
    return;
  }
  const texto = JSON.stringify(obtenerDatos(), null, 2);
  const archivo = new File([texto], "escuela.json", { type: "application/json" });
  let permiteCompartir = false;
  try {
    permiteCompartir = typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [archivo] });
  } catch (error) {
    console.info("Se usará la descarga de archivos:", error);
  }
  if (permiteCompartir) {
    try {
      // Se invoca desde el clic para conservar el permiso de interacción.
      await navigator.share({ files: [archivo], title: "Datos de Gestión Escolar" });
      return;
    } catch (error) {
      // Cancelar el menú de compartir no debe iniciar una descarga inesperada.
      if (error.name === "AbortError") return;
      console.info("No se pudo compartir; se descargará el JSON:", error);
    }
  }
  descargarDatosJSON(archivo);
});
elemento("boton-importar").addEventListener("click",async () => {
  const boton = elemento("boton-importar");
  const entrada = elemento("archivo-importar");
  const archivo = entrada.files[0];
  if (!archivo) { alert("Seleccioná un archivo .json."); return; }
  boton.disabled = true;
  try {
    exigir(archivo.name.toLowerCase().endsWith(".json"),"El archivo debe ser .json.");
    const texto = await archivo.text();
    let datos;
    try { datos = JSON.parse(texto); } catch { throw new Error("El archivo no contiene JSON válido."); }
    validarDatosImportados(datos);
    if (!confirm("Se reemplazarán todos los datos actuales.\nCursos: " + datos.cursos.length + "\nAlumnos: " + datos.alumnos.length + "\nDocentes: " + datos.docentes.length + "\nAsignaciones: " + datos.asignaciones.length + "\n¿Querés continuar?")) return;
    const anteriores = obtenerDatos();
    const seguridadAnterior = cargaSegura;
    aplicarDatos(datos);
    cargaSegura = true;
    if (!guardarDatos()) { aplicarDatos(anteriores); cargaSegura = seguridadAnterior; actualizarContadores(); return; }
    Object.keys(plurales).forEach(cancelarEdicion);
    elemento("filtros-alumnos").reset();
    idCursoEnFicha = null;
    elemento("ficha-curso").hidden = true;
    redibujarPantalla();
    entrada.value = "";
    alert("Datos importados correctamente.");
  } catch (error) { alert("No se pudo importar: " + error.message + "\nLos datos actuales no se modificaron."); }
  finally { boton.disabled = false; }
});

// Inicio: carga de datos y representación inicial.
cargarDatos();
redibujarPantalla();
mostrarSeccion();




// Aviso de actualización: se muestra solo cuando ya existe una versión activa.
function mostrarAvisoActualizacion() {
  let aviso = document.getElementById("aviso-actualizacion");
  if (!aviso) {
    aviso = document.createElement("p");
    aviso.id = "aviso-actualizacion";
    aviso.setAttribute("role", "status");
    aviso.setAttribute("aria-live", "polite");
    document.querySelector("body > header").prepend(aviso);
  }
  aviso.textContent = "Hay una versión nueva: cerrá y volvé a abrir la app";
  aviso.hidden = false;
  ajustarAlturaEncabezado();
}
function observarActualizaciones(registro) {
  // También detecta una actualización instalada antes de abrir esta pantalla.
  if (registro.waiting && navigator.serviceWorker.controller) {
    mostrarAvisoActualizacion();
  }
  function observarInstalacion(trabajador) {
    if (!trabajador) return;
    function comprobarEstado() {
      if (trabajador.state === "installed" && navigator.serviceWorker.controller) {
        mostrarAvisoActualizacion();
      }
    }
    trabajador.addEventListener("statechange", comprobarEstado);
    comprobarEstado();
  }
  registro.addEventListener("updatefound", function () {
    observarInstalacion(registro.installing);
  });
  observarInstalacion(registro.installing);
}
// Conservamos la misma dirección sw.js en todas las publicaciones.
if ("serviceWorker" in navigator && ["https:", "http:"].includes(location.protocol)) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js")
      .then(function (registro) {
        observarActualizaciones(registro);
        // Consulta si hay cambios al abrir la app; sin conexión se reintentará después.
        return registro.update();
      })
      .catch(function (error) { console.info("No se pudo comprobar la actualización:", error); });
  });
}

// Aviso de conexión: no cambia el guardado local ni envía los datos.
const avisoConexion = document.createElement("p");
avisoConexion.id = "aviso-conexion";
avisoConexion.setAttribute("role", "status");
avisoConexion.setAttribute("aria-live", "polite");
avisoConexion.hidden = true;
const encabezadoAplicacion = document.querySelector("body > header");
encabezadoAplicacion.prepend(avisoConexion);
function ajustarAlturaEncabezado() {
  document.documentElement.style.setProperty("--altura-encabezado", encabezadoAplicacion.getBoundingClientRect().height + "px");
}
function actualizarAvisoConexion() {
  const sinConexion = !navigator.onLine;
  avisoConexion.textContent = sinConexion
    ? "Sin conexión: tus datos se siguen guardando en este celular"
    : "";
  avisoConexion.hidden = !sinConexion;
  ajustarAlturaEncabezado();
}
window.addEventListener("online", actualizarAvisoConexion);
window.addEventListener("offline", actualizarAvisoConexion);
window.addEventListener("resize", ajustarAlturaEncabezado);
if (typeof ResizeObserver !== "undefined") {
  const observadorEncabezado = new ResizeObserver(ajustarAlturaEncabezado);
  observadorEncabezado.observe(encabezadoAplicacion);
}
actualizarAvisoConexion();
