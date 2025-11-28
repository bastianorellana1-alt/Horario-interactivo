// Referencias a elementos
const curriculumContainer = document.getElementById("curriculum-container");
const resetBtn = document.getElementById("reset-btn");

let allCourses = [];

// Funciones para manejar localStorage
function loadCompleted() {
    return JSON.parse(localStorage.getItem("completedCourses") || "{}");
}

function saveCompleted(data) {
    localStorage.setItem("completedCourses", JSON.stringify(data));
}

function loadGrades() {
    return JSON.parse(localStorage.getItem("courseGrades") || "{}");
}

function saveGrades(data) {
    localStorage.setItem("courseGrades", JSON.stringify(data));
}

function loadCourseData() {
    return JSON.parse(localStorage.getItem("courseData") || "{}");
}

function saveCourseData(data) {
    localStorage.setItem("courseData", JSON.stringify(data));
}

// Inicializar lista de todos los cursos
function initializeCourses() {
    const courseNames = JSON.parse(localStorage.getItem("courseNames") || "{}");
    allCourses = Array.from(document.querySelectorAll(".course")).map(course => {
        const id = course.dataset.id;
        const h3 = course.querySelector("h3");
        const name = courseNames[id] || (h3 ? h3.textContent : id);
        return { id, name };
    });
}

// Verificar si un curso puede marcarse (prerrequisitos cumplidos)
function canMarkCompleted(course) {
    const prereqStr = course.dataset.prerequisites.trim();
    if (!prereqStr) return true;
    
    const prereqs = prereqStr.split(",").map(p => p.trim()).filter(p => p);
    const completed = loadCompleted();
    
    return prereqs.every(pr => completed[pr]);
}

// Actualizar qué cursos están desbloqueados
function updateLocks() {
    const completed = loadCompleted();
    const courses = document.querySelectorAll(".course");
    
    courses.forEach(course => {
        const prereqStr = course.dataset.prerequisites.trim();
        
        if (!prereqStr) {
            course.classList.add("unlocked");
            return;
        }
        
        const prereqs = prereqStr.split(",").map(p => p.trim()).filter(p => p);
        const unlocked = prereqs.every(pr => completed[pr]);
        
        if (unlocked) {
            course.classList.add("unlocked");
        } else {
            course.classList.remove("unlocked");
        }
    });
}

// Aplicar datos guardados
function applySavedData() {
    const completed = loadCompleted();
    const grades = loadGrades();
    
    // Cargar nombres y prerrequisitos desde el nuevo sistema
    const courseNames = JSON.parse(localStorage.getItem("courseNames") || "{}");
    const coursePrereqs = JSON.parse(localStorage.getItem("coursePrerequisites") || "{}");
    
    const courses = document.querySelectorAll(".course");

    courses.forEach(course => {
        const id = course.dataset.id;
        
        // Aplicar nombre personalizado si existe
        if (courseNames[id]) {
            const h3 = course.querySelector("h3");
            if (h3) h3.textContent = courseNames[id];
        }
        
        // Aplicar prerrequisitos personalizados
        if (coursePrereqs[id]) {
            course.dataset.prerequisites = coursePrereqs[id];
        }
        
        // Aplicar estado de completado
        if (completed[id]) {
            course.classList.add("completed", "strike");
            let gradeSpan = course.querySelector(".course-grade");
            if (!gradeSpan) {
                gradeSpan = document.createElement("span");
                gradeSpan.classList.add("course-grade");
                course.appendChild(gradeSpan);
            }
            gradeSpan.textContent = grades[id] ? `Nota: ${grades[id]}` : "Nota: -";
        } else {
            course.classList.remove("completed", "strike");
            const gradeSpan = course.querySelector(".course-grade");
            if (gradeSpan) gradeSpan.textContent = "";
        }
    });
}

// Guardar cursos completados
function saveCurrentCompleted() {
    const courses = document.querySelectorAll(".course.completed");
    let completed = {};
    courses.forEach(course => {
        completed[course.dataset.id] = true;
    });
    saveCompleted(completed);
}

// Nota: Las funciones de edición ahora están en edit.js con el sistema de modal

// Reiniciar todo
resetBtn.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que quieres reiniciar toda la malla? Se perderán todos los datos guardados.")) {
        localStorage.removeItem("completedCourses");
        localStorage.removeItem("courseGrades");
        localStorage.removeItem("courseData");
        location.reload();
    }
});

// Click en cursos para marcar/destachar
curriculumContainer.addEventListener("click", e => {
    // Si hay un modal abierto, no hacer nada
    const modalOpen = document.querySelector(".edit-modal:not(.hidden)");
    if (modalOpen) return;
    
    // Si estamos en modo edición, no hacer nada (edit.js lo maneja)
    if (document.body.classList.contains("editing")) return;
    
    const course = e.target.closest(".course");
    if (!course) return;

    if (!course.classList.contains("unlocked")) {
        alert("Debes completar los prerrequisitos primero.");
        return;
    }

    if (course.classList.contains("completed")) {
        // Destachar curso
        course.classList.remove("completed", "strike");
        
        const gradeInput = course.querySelector("input");
        if (gradeInput) gradeInput.remove();
        const gradeSpan = course.querySelector(".course-grade");
        if (gradeSpan) gradeSpan.textContent = "";

        const grades = loadGrades();
        delete grades[course.dataset.id];
        saveGrades(grades);

        saveCurrentCompleted();
        updateLocks();
    } else {
        // Marcar como completado
        if (canMarkCompleted(course)) {
            course.classList.add("completed", "strike");
            saveCurrentCompleted();
            updateLocks();

            // Input para nota
            let gradeSpan = course.querySelector(".course-grade");
            if (!gradeSpan) {
                gradeSpan = document.createElement("span");
                gradeSpan.classList.add("course-grade");
                course.appendChild(gradeSpan);
            }
            gradeSpan.textContent = "";

            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Nota (1.0-7.0)";
            input.style.width = "80px";
            input.style.fontSize = "0.85em";
            input.style.textAlign = "center";
            input.style.padding = "4px";
            input.style.border = "1px solid #ccc";
            input.style.borderRadius = "4px";

            gradeSpan.replaceWith(input);
            input.focus();

            function saveInput() {
                let val = input.value.trim();
                
                // Validar nota
                if (val && !isNaN(val)) {
                    val = parseFloat(val);
                    if (val < 1.0) val = 1.0;
                    if (val > 7.0) val = 7.0;
                    val = val.toFixed(1);
                } else {
                    val = "-";
                }
                
                const grades = loadGrades();
                grades[course.dataset.id] = val;
                saveGrades(grades);

                const span = document.createElement("span");
                span.classList.add("course-grade");
                span.textContent = "Nota: " + val;
                input.replaceWith(span);
            }

            input.addEventListener("blur", saveInput);
            input.addEventListener("keydown", ev => {
                if (ev.key === "Enter") input.blur();
                if (ev.key === "Escape") {
                    const span = document.createElement("span");
                    span.classList.add("course-grade");
                    span.textContent = "Nota: -";
                    input.replaceWith(span);
                }
            });
        } else {
            alert("No puedes marcar este curso, faltan prerrequisitos.");
        }
    }
});

// Inicialización
initializeCourses();
applySavedData();
updateLocks();
