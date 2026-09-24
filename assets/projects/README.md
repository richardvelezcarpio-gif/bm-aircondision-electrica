# Proyectos y fotografías de BM Air & Electric

## Estado actual

Catálogo real: 101 fotografías, 68 de aire acondicionado y 33 de electricidad; 8 destacadas. Se conservaron todas, sin exclusiones. Hay 60 grupos visuales conservadores (41 AC y 19 eléctricos); no equivalen a 60 trabajos independientes confirmados. Las series se agruparon por coincidencias visibles y las fotos dudosas se conservaron por separado.

El ZIP recibido no incluía manifiesto. El inventario, manifiesto generado, originales intactos y reporte están fuera del website, en ../.bm-projects-qa/real-photos/. Se optimizaron 87 copias web sin recortar; 14 se copiaron intactas. Peso total web: 49.21 MB frente a 122.61 MB originales.

Las dos páginas leen el mismo catálogo `assets/projects/projects-data.js`. No es necesario cambiar HTML, CSS ni duplicar imágenes para español. El catálogo admite cualquier cantidad de proyectos y fotos, incluidos 50, 60, 120 o más. Solo la sección Featured limita su selección a ocho fotografías; el resto permanece accesible en cada trabajo.

## 1. Preparar los archivos

- Aire acondicionado: `assets/projects/air-conditioning/`.
- Electricidad: `assets/projects/electrical/`.
- Puedes crear subcarpetas por trabajo: `air-conditioning/ac-001/` y `electrical/electric-001/`.
- Usa nombres sin espacios ni acentos: `ac-project-01.jpg`, `ac-project-02.webp`, etc.
- Solo agrupa fotos cuando tengas evidencia de que pertenecen al mismo trabajo. Confirma las dudosas con el cliente antes de publicarlas. No deduzcas direcciones, nombres de clientes, ciudades o mejoras específicas sin evidencia.
- Exporta la versión web a unos 1200 px de ancho (1600 px si necesita más detalle), JPEG/WebP de calidad 80–85 como punto de partida. Revisa que etiquetas, cableado y equipos sigan legibles. Evita archivos de varios MB.
- Para lightbox puedes guardar opcionalmente una versión mayor de 1600–2000 px con sufijo `-large`. No es obligatorio. `full` se descarga solo cuando se abre la fotografía.
- Anota el ancho y alto reales de la versión web. Se conservan las proporciones; la vista previa usa recorte y el lightbox muestra la imagen completa.

## 2. Registrar un trabajo

Cada objeto de `projects` representa UN trabajo real. Este ejemplo es una plantilla de documentación: no está publicado y solo debe usarse después de colocar y confirmar las fotos correspondientes.

```js
window.BM_PROJECTS = {
  version: 2,
  projects: [
    {
      id: "ac-001",
      category: "air-conditioning",
      title: {
        en: "Mini-Split Installation",
        es: "Instalación de Mini-Split"
      },
      // Descripción opcional: incluir únicamente detalles confirmados.
      description: {
        en: "Indoor and outdoor units from the same installation.",
        es: "Unidades interior y exterior de la misma instalación."
      },
      cover: "ac-001-01",
      images: [
        {
          id: "ac-001-01",
          src: "assets/projects/air-conditioning/ac-project-01.jpg",
          width: 1200,
          height: 900,
          alt: {
            en: "Indoor mini-split unit installed by BM Air & Electric",
            es: "Unidad interior mini-split instalada por BM Air & Electric"
          },
          featured: true
        },
        {
          id: "ac-001-02",
          src: "assets/projects/air-conditioning/ac-project-02.jpg",
          width: 1200,
          height: 900,
          alt: {
            en: "Outdoor condenser from the same mini-split installation",
            es: "Condensador exterior de la misma instalación mini-split"
          }
        }
      ]
    }
  ]
};
```

`id` debe ser único por proyecto; los IDs de fotos deben ser únicos dentro de ese trabajo. Usa letras minúsculas, números y guiones. `category` solo admite `air-conditioning` o `electrical`. `cover` referencia el `id` de una foto incluida en `images`; no crea otro archivo.

Todos los títulos y textos alternativos requieren `en` y `es`. Describe lo que realmente muestra cada foto. No uses “image1” o nombres de archivo como alt. Usa títulos como “Electrical Panel Upgrade” solo si sabes que realmente fue una actualización, no simplemente por ver un panel.

La propiedad opcional `full` sigue el mismo formato de ruta que `src` y debe apuntar a un archivo existente de la misma categoría. Omítela cuando solo tengas una versión de la foto.

## 3. Agregar muchas fotos

1. Organiza las fotografías por trabajos confirmados.
2. Copia todas las versiones web a la carpeta de su categoría (o subcarpeta del trabajo).
3. Duplica el objeto de foto dentro de `images` para cada archivo, con ID, ruta, dimensiones y alt EN/ES reales.
4. Duplica el objeto de proyecto para cada nuevo trabajo; cambia ID, categoría, título, portada e imágenes.
5. Marca de seis a ocho de las mejores fotos de todo el catálogo con `featured: true`. No es necesario duplicarlas. Si no marcas ninguna, la página selecciona hasta ocho automáticamente, comenzando por las portadas. Si marcas más de ocho, las ocho primeras se destacan y todas las demás siguen en sus respectivos proyectos.
6. Guarda el archivo, ejecuta la validación y recarga el navegador. Una coma separa cada objeto.

Una categoría con datos muestra proyectos y conteos automáticamente; desaparece su estado vacío. Si la otra categoría aún está vacía, conserva un mensaje discreto y un enlace a servicios. Los proyectos con una sola foto no muestran controles innecesarios. Con portada y una foto adicional aparece esa foto debajo; los controles se muestran cuando hay contenido horizontal para recorrer.

## 4. Validar rutas y datos sin npm

Desde la raíz del proyecto:

```sh
node tools/validate-projects.cjs
```

Revisa estructura, IDs, traducciones, dimensiones, portada y existencia de archivos. No modifica el catálogo ni las fotos. La calidad de la clasificación y la veracidad de los textos requieren revisión humana.

## 5. Revisar localmente

```sh
cd /Users/richardvelez/Developer/CONSTRUCTION/bm-electric-website-v4
python3 -m http.server 8000
```

- Inglés: http://localhost:8000/projects.html
- Español: http://localhost:8000/es/projects.html

Revisa 390, 430, 768 px y desktop. Prueba flechas, swipe, contador, lightbox, ESC y cambio de idioma. El lightbox navega dentro del trabajo seleccionado, también desde destacados. Los carruseles son manuales: no hay autoplay ni copias de diapositivas. Las imágenes usan lazy loading y decoding async; las versiones grandes se solicitan al abrir el lightbox.

No ejecutar commit, push ni deploy hasta que el propietario revise el resultado.
