// ===== EDITOR DE DISEÑO VISUAL =====

const designBtn = document.getElementById("design-btn");
const designPanel = document.getElementById("design-panel");
const closeDesignBtn = document.getElementById("close-design-btn");
const saveDesignBtn = document.getElementById("save-design-btn");
const resetDesignBtn = document.getElementById("reset-design-btn");

// Valores por defecto
const defaultDesign = {
    bgColor: "#667eea",
    bgColor2: "#764ba2",
    bgGradient: true,
    bgImage: null,
    bgImageOpacity: 100,
    bgImageSize: "cover",
    titleColor: "#667eea",
    titleSize: "36",
    titleFont: "'Segoe UI', sans-serif",
    headerBg: "#667eea",
    headerText: "#ffffff",
    headerRadius: "12",
    courseBg: "#f8f9fa",
    courseBorder: "#e9ecef",
    courseText: "#495057",
    courseRadius: "12",
    unlockedBorder: "#667eea",
    unlockedBg: "#ffffff",
    completedBg: "#d4edda",
    completedBorder: "#28a745",
    completedText: "#155724"
};

// === Cargar Diseño Guardado ===
function loadDesign() {
    const saved = localStorage.getItem("customDesign");
    return saved ? JSON.parse(saved) : { ...defaultDesign };
}

// === Guardar Diseño ===
function saveDesign(design) {
    localStorage.setItem("customDesign", JSON.stringify(design));
}

// === Aplicar Diseño al DOM ===
function applyDesign(design) {
    const root = document.documentElement;
    const container = document.getElementById('curriculum-container');
    
    // Fondo de página (gradiente o color)
    if (design.bgGradient) {
        root.style.setProperty('--bg-gradient', `linear-gradient(135deg, ${design.bgColor} 0%, ${design.bgColor2} 100%)`);
        document.body.style.background = `linear-gradient(135deg, ${design.bgColor} 0%, ${design.bgColor2} 100%)`;
    } else {
        root.style.setProperty('--bg-gradient', design.bgColor);
        document.body.style.background = design.bgColor;
    }
    
    // Imagen de fondo solo para el contenedor de cursos
    if (design.bgImage && container) {
        const opacity = (design.bgImageOpacity !== undefined ? design.bgImageOpacity : 100) / 100;
        const imageSize = design.bgImageSize || 'cover';
        
        container.style.backgroundImage = `url(${design.bgImage})`;
        container.style.backgroundSize = imageSize;
        container.style.backgroundPosition = 'center';
        container.style.backgroundRepeat = 'no-repeat';
        container.style.position = 'relative';
        
        // Crear overlay si no existe
        let overlay = container.querySelector('.bg-image-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'bg-image-overlay';
            container.insertBefore(overlay, container.firstChild);
        }
        overlay.style.opacity = 1 - opacity;
    } else if (container) {
        container.style.backgroundImage = '';
        const overlay = container.querySelector('.bg-image-overlay');
        if (overlay) overlay.remove();
    }
    
    root.style.setProperty('--bg-color', design.bgColor);
    root.style.setProperty('--bg-color-2', design.bgColor2);
    
    // Título
    root.style.setProperty('--title-color', design.titleColor);
    root.style.setProperty('--title-size', design.titleSize + 'px');
    root.style.setProperty('--title-font', design.titleFont);
    
    // Encabezados de semestre
    root.style.setProperty('--header-bg', design.headerBg);
    root.style.setProperty('--header-text', design.headerText);
    root.style.setProperty('--header-radius', design.headerRadius + 'px');
    
    // Cursos
    root.style.setProperty('--course-bg', design.courseBg);
    root.style.setProperty('--course-border', design.courseBorder);
    root.style.setProperty('--course-text', design.courseText);
    root.style.setProperty('--course-radius', design.courseRadius + 'px');
    
    // Cursos desbloqueados
    root.style.setProperty('--unlocked-border', design.unlockedBorder);
    root.style.setProperty('--unlocked-bg', design.unlockedBg);
    
    // Cursos completados
    root.style.setProperty('--completed-bg', design.completedBg);
    root.style.setProperty('--completed-border', design.completedBorder);
    root.style.setProperty('--completed-text', design.completedText);
}

// === Cargar Valores en el Panel ===
function loadDesignToPanel(design) {
    document.getElementById("bg-color").value = design.bgColor;
    document.getElementById("bg-color-2").value = design.bgColor2;
    document.getElementById("bg-gradient").checked = design.bgGradient;
    
    const bgImageOpacity = design.bgImageOpacity !== undefined ? design.bgImageOpacity : 100;
    const bgImageSize = design.bgImageSize || 'cover';
    
    document.getElementById("bg-image-opacity").value = bgImageOpacity;
    document.getElementById("bg-image-opacity-value").textContent = bgImageOpacity + "%";
    document.getElementById("bg-image-size").value = bgImageSize;
    
    document.getElementById("title-color").value = design.titleColor;
    document.getElementById("title-size").value = design.titleSize;
    document.getElementById("title-size-value").textContent = design.titleSize + "px";
    document.getElementById("title-font").value = design.titleFont;
    
    document.getElementById("header-bg").value = design.headerBg;
    document.getElementById("header-text").value = design.headerText;
    document.getElementById("header-radius").value = design.headerRadius;
    document.getElementById("header-radius-value").textContent = design.headerRadius + "px";
    
    document.getElementById("course-bg").value = design.courseBg;
    document.getElementById("course-border").value = design.courseBorder;
    document.getElementById("course-text").value = design.courseText;
    document.getElementById("course-radius").value = design.courseRadius;
    document.getElementById("course-radius-value").textContent = design.courseRadius + "px";
    
    document.getElementById("unlocked-border").value = design.unlockedBorder;
    document.getElementById("unlocked-bg").value = design.unlockedBg;
    
    document.getElementById("completed-bg").value = design.completedBg;
    document.getElementById("completed-border").value = design.completedBorder;
    document.getElementById("completed-text").value = design.completedText;
}

// === Obtener Valores del Panel ===
function getDesignFromPanel() {
    const currentDesign = loadDesign();
    return {
        bgColor: document.getElementById("bg-color").value,
        bgColor2: document.getElementById("bg-color-2").value,
        bgGradient: document.getElementById("bg-gradient").checked,
        bgImage: currentDesign.bgImage || null,
        bgImageOpacity: parseInt(document.getElementById("bg-image-opacity").value),
        bgImageSize: document.getElementById("bg-image-size").value,
        titleColor: document.getElementById("title-color").value,
        titleSize: document.getElementById("title-size").value,
        titleFont: document.getElementById("title-font").value,
        headerBg: document.getElementById("header-bg").value,
        headerText: document.getElementById("header-text").value,
        headerRadius: document.getElementById("header-radius").value,
        courseBg: document.getElementById("course-bg").value,
        courseBorder: document.getElementById("course-border").value,
        courseText: document.getElementById("course-text").value,
        courseRadius: document.getElementById("course-radius").value,
        unlockedBorder: document.getElementById("unlocked-border").value,
        unlockedBg: document.getElementById("unlocked-bg").value,
        completedBg: document.getElementById("completed-bg").value,
        completedBorder: document.getElementById("completed-border").value,
        completedText: document.getElementById("completed-text").value
    };
}

// === Abrir/Cerrar Panel ===
designBtn.addEventListener("click", () => {
    const isOpen = designPanel.classList.contains("show");
    
    if (isOpen) {
        // Cerrar panel
        designPanel.classList.remove("show");
        setTimeout(() => {
            designPanel.classList.add("hidden");
        }, 300);
    } else {
        // Abrir panel
        designPanel.classList.remove("hidden");
        setTimeout(() => {
            designPanel.classList.add("show");
        }, 10);
        
        const currentDesign = loadDesign();
        loadDesignToPanel(currentDesign);
    }
});

// === Cerrar Panel ===
closeDesignBtn.addEventListener("click", () => {
    designPanel.classList.remove("show");
    setTimeout(() => {
        designPanel.classList.add("hidden");
    }, 300);
});

// === Vista Previa en Tiempo Real ===
const inputs = [
    "bg-color", "bg-color-2", "bg-gradient", "bg-image-opacity", "bg-image-size",
    "title-color", "title-size", "title-font",
    "header-bg", "header-text", "header-radius",
    "course-bg", "course-border", "course-text", "course-radius",
    "unlocked-border", "unlocked-bg",
    "completed-bg", "completed-border", "completed-text"
];

inputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener("input", () => {
            const design = getDesignFromPanel();
            applyDesign(design);
        });
    }
});

// === Actualizar valores de los rangos ===
document.getElementById("title-size").addEventListener("input", (e) => {
    document.getElementById("title-size-value").textContent = e.target.value + "px";
});

document.getElementById("header-radius").addEventListener("input", (e) => {
    document.getElementById("header-radius-value").textContent = e.target.value + "px";
});

document.getElementById("course-radius").addEventListener("input", (e) => {
    document.getElementById("course-radius-value").textContent = e.target.value + "px";
});

document.getElementById("bg-image-opacity").addEventListener("input", (e) => {
    document.getElementById("bg-image-opacity-value").textContent = e.target.value + "%";
});

// === Guardar Diseño ===
saveDesignBtn.addEventListener("click", () => {
    const design = getDesignFromPanel();
    saveDesign(design);
    applyDesign(design);
    
    // Mostrar confirmación
    const originalText = saveDesignBtn.textContent;
    saveDesignBtn.textContent = "✓ Guardado!";
    saveDesignBtn.style.background = "#28a745";
    
    setTimeout(() => {
        saveDesignBtn.textContent = originalText;
        saveDesignBtn.style.background = "";
    }, 2000);
});

// === Restaurar Diseño Original ===
resetDesignBtn.addEventListener("click", () => {
    if (confirm("¿Deseas restaurar el diseño original? Se perderán los cambios actuales.")) {
        loadDesignToPanel(defaultDesign);
        applyDesign(defaultDesign);
        saveDesign(defaultDesign);
    }
});

// === Inicialización ===
document.addEventListener("DOMContentLoaded", () => {
    const savedDesign = loadDesign();
    applyDesign(savedDesign);
    
    // === Manejar Carga de Imagen ===
    const bgImageInput = document.getElementById("bg-image");
    const removeBgImageBtn = document.getElementById("remove-bg-image");
    
    bgImageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const design = getDesignFromPanel();
                design.bgImage = event.target.result;
                saveDesign(design);
                applyDesign(design);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // === Remover Imagen de Fondo ===
    removeBgImageBtn.addEventListener("click", () => {
        const design = getDesignFromPanel();
        design.bgImage = null;
        design.bgImageOpacity = 100;
        design.bgImageSize = 'cover';
        saveDesign(design);
        applyDesign(design);
        bgImageInput.value = "";
        document.getElementById("bg-image-opacity").value = 100;
        document.getElementById("bg-image-opacity-value").textContent = "100%";
        document.getElementById("bg-image-size").value = "cover";
    });
});
