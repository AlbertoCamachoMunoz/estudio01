/**
 * Task Checklist & Materials Module
 * Categorized field task management, material consumption tracking, and photo compression.
 */
export class TaskChecklist {
  static DEFAULT_CATEGORIES = [
    {
      category: '🌿 Jardinería y Zonas Verdes',
      tasks: [
        'Segado y perfilado de césped',
        'Poda de setos y arbustos ornamentales',
        'Poda en altura y saneamiento de palmeras',
        'Desbroce y escarda de malas hierbas',
        'Abonado y nutrición vegetal'
      ]
    },
    {
      category: '💦 Riego y Fontanería',
      tasks: [
        'Revisión y programación de centralitas de riego',
        'Comprobación de electroválvulas y arquetas',
        'Sustitución o ajuste de difusores y aspersores',
        'Detección y reparación de fugas en tuberías'
      ]
    },
    {
      category: '🏊‍♂️ Piscinas e Instalaciones de Agua',
      tasks: [
        'Análisis químico de cloro y pH',
        'Limpieza de fondo, superficie y cestillos de skimmers',
        'Lavado y enjuague de filtro de arena/vidrio',
        'Revisión de bomba depuradora y cuadro eléctrico'
      ]
    },
    {
      category: '🧹 Limpieza y Gestión de Residuos',
      tasks: [
        'Soplado y limpieza de viales y accesos peatonales',
        'Recogida y carga de restos de poda en remolque',
        'Transporte de residuos a punto limpio / planta de compostaje'
      ]
    },
    {
      category: '⚠️ Incidencias y Mantenimiento Correctivo',
      tasks: [
        'Avería eléctrica / fallo de iluminación detectado',
        'Plaga detectada (picudo rojo, procesionaria, pulgón)',
        'Mobiliario exterior o vallado deteriorado'
      ]
    }
  ];

  /**
   * Initializes tasks for a draft: if empty, populates default preset tasks
   */
  static ensureTasks(existingTasks) {
    if (existingTasks && existingTasks.length > 0) {
      return existingTasks;
    }
    const list = [];
    let counter = 1;
    this.DEFAULT_CATEGORIES.forEach((cat) => {
      cat.tasks.forEach((t) => {
        list.push({
          id: 'task_' + counter++,
          category: cat.category,
          text: t,
          completed: false
        });
      });
    });
    return list;
  }

  /**
   * Compresses an image file in-browser using HTML5 Canvas
   * Max 800px width/height, 0.70 JPEG quality
   * @param {File} file
   * @returns {Promise<string>} Base64 data URL
   */
  static async compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to compressed jpeg
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.72);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
