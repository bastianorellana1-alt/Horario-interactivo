// ===== MODO EDICIÓN DE LA MALLA - VERSIÓN MEJORADA =====

const toggleEditBtn = document.getElementById("toggle-edit-btn");
let isEditing = false;
let editModal = null;
let currentEditingCourse = null;

// === Funciones de Almacenamiento ===
function loadCourseNames() {
    return JSON.parse(localStorage.getItem("courseNames") || "{}");
}

function saveCourseNames(data) {
    localStorage.setItem("courseNames", JSON.stringify(data));
}

function loadPrerequisites() {
    return JSON.parse(localStorage.getItem("coursePrerequisites") || "{}");
}

function savePrerequisites(data) {
    localStorage.setItem("coursePrerequisites", JSON.stringify(data));
}

// === Obtener Todos los Cursos ===
function getAllCourses() {
    const courses = [];
    document.querySelectorAll(".course").forEach(course => {
        const id = course.dataset.id;
        const h3 = course.querySelector("h3");
        const names = loadCourseNames();
        const name = names[id] || (h3 ? h3.textContent : id);
        courses.push({ id, name });
    });
    return courses;
}

// === Crear Modal de Edición ===
function createEditModal() {
    if (editModal) return editModal;
    
    const modal = document.createElement("div");
    modal.id = "edit-modal";
    modal.className = "edit-modal hidden";
    modal.innerHTML = `
        <div class="edit-modal-overlay"></div>
        <div class="edit-modal-content">
            <div class="edit-modal-header">
                <h2>✏️ Editar Curso</h2>
                <button id="close-edit-modal" class="close-modal-btn">✕</button>
            </div>
            <div class="edit-modal-body">
                <div class="edit-field">
                    <label for="edit-course-name">Nombre del Curso:</label>
                    <input type="text" id="edit-course-name" placeholder="Ej: Cálculo I, Programación, etc.">
                </div>
                
                <div class="edit-field">
                    <label>Prerrequisitos:</label>
                    <div class="prereq-info">Busca y selecciona los cursos previos necesarios</div>
                    
                    <!-- Buscador -->
                    <input type="text" id="prereq-search" class="prereq-search" placeholder="🔍 Buscar curso...">
                    
                    <!-- Cursos seleccionados (tags) -->
                    <div id="selected-prereqs" class="selected-prereqs"></div>
                    
                    <!-- Lista de cursos disponibles -->
                    <div id="available-courses" class="available-courses"></div>
                </div>
            </div>
            <div class="edit-modal-footer">
                <button id="cancel-edit-btn" class="modal-btn secondary">Cancelar</button>
                <button id="save-edit-btn" class="modal-btn primary">💾 Guardar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners del modal
    const overlay = modal.querySelector(".edit-modal-overlay");
    const closeBtn = modal.querySelector("#close-edit-modal");
    const cancelBtn = modal.querySelector("#cancel-edit-btn");
    const saveBtn = modal.querySelector("#save-edit-btn");
    const searchInput = modal.querySelector("#prereq-search");
    
    overlay.addEventListener("click", closeEditModal);
    closeBtn.addEventListener("click", closeEditModal);
    cancelBtn.addEventListener("click", closeEditModal);
    saveBtn.addEventListener("click", saveEditChanges);
    searchInput.addEventListener("input", filterAvailableCourses);
    
    editModal = modal;
    return modal;
}

// === Abrir Modal para Editar Curso ===
function openEditModal(course) {
    currentEditingCourse = course;
    const modal = createEditModal();
    const id = course.dataset.id;
    const names = loadCourseNames();
    const prereqs = loadPrerequisites();
    
    // Cargar nombre actual
    const h3 = course.querySelector("h3");
    const currentName = names[id] || (h3 ? h3.textContent : "");
    document.getElementById("edit-course-name").value = currentName;
    
    // Cargar prerrequisitos actuales
    const currentPrereqs = (prereqs[id] || course.dataset.prerequisites || "")
        .split(",")
        .map(p => p.trim())
        .filter(p => p);
    
    // Guardar prerrequisitos en el modal para referencia
    modal.dataset.currentCourseId = id;
    modal.dataset.selectedPrereqs = JSON.stringify(currentPrereqs);
    
    // Renderizar prerrequisitos seleccionados y disponibles
    renderSelectedPrereqs(currentPrereqs);
    renderAvailableCourses(id, currentPrereqs);
    
    // Mostrar modal
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);
    document.getElementById("edit-course-name").focus();
}

// === Renderizar Prerrequisitos Seleccionados (Tags) ===
function renderSelectedPrereqs(selectedIds) {
    const container = document.getElementById("selected-prereqs");
    const allCourses = getAllCourses();
    
    if (selectedIds.length === 0) {
        container.innerHTML = '<div class="no-prereqs">Sin prerrequisitos</div>';
        return;
    }
    
    container.innerHTML = selectedIds.map(id => {
        const course = allCourses.find(c => c.id === id);
        const name = course ? course.name : id;
        return `
            <div class="prereq-tag" data-id="${id}">
                <span>${name}</span>
                <button class="remove-prereq" onclick="removePrereq('${id}')">×</button>
            </div>
        `;
    }).join("");
}

// === Renderizar Cursos Disponibles ===
function renderAvailableCourses(currentCourseId, selectedIds = []) {
    const container = document.getElementById("available-courses");
    const allCourses = getAllCourses();
    const searchTerm = document.getElementById("prereq-search").value.toLowerCase();
    
    // Filtrar: no incluir el curso actual ni los ya seleccionados
    const available = allCourses.filter(c => 
        c.id !== currentCourseId && 
        !selectedIds.includes(c.id) &&
        (searchTerm === "" || c.name.toLowerCase().includes(searchTerm) || c.id.toLowerCase().includes(searchTerm))
    );
    
    if (available.length === 0) {
        container.innerHTML = '<div class="no-results">No se encontraron cursos</div>';
        return;
    }
    
    // Agrupar por semestre
    const bySemester = {};
    available.forEach(c => {
        const semesterMatch = c.id.match(/s(\d+)-/);
        const semester = semesterMatch ? parseInt(semesterMatch[1]) : 0;
        if (!bySemester[semester]) bySemester[semester] = [];
        bySemester[semester].push(c);
    });
    
    let html = "";
    Object.keys(bySemester).sort((a, b) => a - b).forEach(sem => {
        if (searchTerm === "") {
            html += `<div class="semester-group-header">Semestre ${romanNumeral(sem)}</div>`;
        }
        
        bySemester[sem].forEach(c => {
            html += `
                <div class="course-item" onclick="addPrereq('${c.id}')">
                    <div class="course-item-name">${c.name}</div>
                    <div class="course-item-id">${c.id}</div>
                </div>
            `;
        });
    });
    
    container.innerHTML = html;
}

// === Añadir Prerrequisito ===
window.addPrereq = function(courseId) {
    const modal = editModal;
    const currentCourseId = modal.dataset.currentCourseId;
    const selectedPrereqs = JSON.parse(modal.dataset.selectedPrereqs || "[]");
    
    if (!selectedPrereqs.includes(courseId)) {
        selectedPrereqs.push(courseId);
        modal.dataset.selectedPrereqs = JSON.stringify(selectedPrereqs);
        
        renderSelectedPrereqs(selectedPrereqs);
        renderAvailableCourses(currentCourseId, selectedPrereqs);
        
        // Limpiar búsqueda
        document.getElementById("prereq-search").value = "";
    }
};

// === Remover Prerrequisito ===
window.removePrereq = function(courseId) {
    const modal = editModal;
    const currentCourseId = modal.dataset.currentCourseId;
    let selectedPrereqs = JSON.parse(modal.dataset.selectedPrereqs || "[]");
    
    selectedPrereqs = selectedPrereqs.filter(id => id !== courseId);
    modal.dataset.selectedPrereqs = JSON.stringify(selectedPrereqs);
    
    renderSelectedPrereqs(selectedPrereqs);
    renderAvailableCourses(currentCourseId, selectedPrereqs);
};

// === Filtrar Cursos Disponibles ===
function filterAvailableCourses() {
    const modal = editModal;
    const currentCourseId = modal.dataset.currentCourseId;
    const selectedPrereqs = JSON.parse(modal.dataset.selectedPrereqs || "[]");
    renderAvailableCourses(currentCourseId, selectedPrereqs);
}

// === Cerrar Modal ===
function closeEditModal() {
    if (editModal) {
        editModal.classList.remove("show");
        setTimeout(() => {
            editModal.classList.add("hidden");
            currentEditingCourse = null;
            // Limpiar el modal
            editModal.dataset.currentCourseId = "";
            editModal.dataset.selectedPrereqs = "[]";
        }, 300);
    }
}

// === Guardar Cambios ===
function saveEditChanges() {
    if (!currentEditingCourse) return;
    
    const id = currentEditingCourse.dataset.id;
    const newName = document.getElementById("edit-course-name").value.trim();
    
    // Guardar nombre
    if (newName) {
        const names = loadCourseNames();
        names[id] = newName;
        saveCourseNames(names);
        
        const h3 = currentEditingCourse.querySelector("h3");
        if (h3) h3.textContent = newName;
    }
    
    // Guardar prerrequisitos desde el dataset del modal
    const selectedPrereqs = JSON.parse(editModal.dataset.selectedPrereqs || "[]");
    
    const prereqs = loadPrerequisites();
    prereqs[id] = selectedPrereqs.join(",");
    savePrerequisites(prereqs);
    currentEditingCourse.dataset.prerequisites = selectedPrereqs.join(",");
    
    // Actualizar locks
    if (typeof updateLocks === "function") {
        updateLocks();
    }
    
    closeEditModal();
}

// === Convertir número a romano ===
function romanNumeral(num) {
    const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    return romans[num - 1] || num;
}

// === Activar Modo Edición ===
function enableEditing() {
    document.querySelectorAll(".course").forEach(course => {
        // Agregar indicador visual
        course.classList.add("editable-mode");
        
        // Click para editar (solo si no está ya asignado)
        if (!course.dataset.editListenerAdded) {
            course.addEventListener("click", handleCourseEdit);
            course.dataset.editListenerAdded = "true";
        }
    });
    
    // Hacer título editable
    const title = document.getElementById("curriculum-title");
    if (title) {
        title.contentEditable = "true";
        title.classList.add("editing-title");
    }
}

// === Desactivar Modo Edición ===
function disableEditing() {
    document.querySelectorAll(".course").forEach(course => {
        course.classList.remove("editable-mode");
        // NO remover event listeners - mantenerlos activos
    });
    
    // Desactivar edición del título
    const title = document.getElementById("curriculum-title");
    if (title) {
        title.contentEditable = "false";
        title.classList.remove("editing-title");
        
        // Guardar título
        const titleText = title.textContent.trim();
        if (titleText) {
            localStorage.setItem("curriculumTitle", titleText);
        }
    }
}

// === Manejar Click en Curso ===
function handleCourseEdit(e) {
    if (!isEditing) return;
    e.stopPropagation();
    openEditModal(this);
}

// === Toggle Modo Edición ===
toggleEditBtn.addEventListener("click", () => {
    isEditing = !isEditing;
    document.body.classList.toggle("editing", isEditing);
    
    if (isEditing) {
        toggleEditBtn.textContent = "✓ Guardar Cambios";
        toggleEditBtn.style.background = "linear-gradient(135deg, #28a745 0%, #20c997 100%)";
        enableEditing();
    } else {
        toggleEditBtn.textContent = "Editar Malla";
        toggleEditBtn.style.background = "";
        disableEditing();
        
        // Recargar datos
        if (typeof applySavedData === "function") {
            applySavedData();
        }
        if (typeof updateLocks === "function") {
            updateLocks();
        }
    }
});

// === Cargar título guardado al inicio ===
document.addEventListener("DOMContentLoaded", () => {
    const savedTitle = localStorage.getItem("curriculumTitle");
    const title = document.getElementById("curriculum-title");
    if (savedTitle && title) {
        title.textContent = savedTitle;
    }
});
