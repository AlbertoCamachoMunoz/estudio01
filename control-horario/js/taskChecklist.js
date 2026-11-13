/**
 * Task Checklist & Materials Module
 * Categorized field task management, material consumption tracking, and photo compression.
 */
export class TaskChecklist {
  static DEFAULT_CATEGORIES = [
    {
      category: 'Instalación y Montaje Técnico',
      tasks: [
        'Replanteo y verificación de medidas en obra',
        'Montaje de estructuras, soportes o carpintería',
        'Ajuste, nivelación y sellado de elementos',
        'Pruebas de funcionamiento y puesta en marcha'
      ]
    },
    {
      category: 'Obra Civil, Albañilería y Acabados',
      tasks: [
        'Preparación de superficies y protecciones previas',
        'Ejecución de revestimientos, alicatado o pladur',
        'Aplicación de pintura y remates finales'
      ]
    },
    {
      category: 'Electricidad, Clima y Fontanería',
      tasks: [
        'Tendido de canalizaciones y cableado eléctrico',
        'Instalación de mecanismos, luminarias o cuadros',
        'Comprobación de tomas de agua, desagües y estanqueidad'
      ]
    },
    {
      category: 'Limpieza de Obra y Gestión de Residuos',
      tasks: [
        'Recogida de embalajes, recortes y escombros',
        'Limpieza técnica de la zona de intervención',
        'Traslado de residuos a punto limpio autorizado'
      ]
    },
    {
      category: 'Incidencias y Mantenimiento Correctivo',
      tasks: [
        'Avería o anomalía detectada en instalación existente',
        'Necesidad de material adicional o repuesto específico',
        'Modificación solicitada por el cliente o dirección de obra'
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
