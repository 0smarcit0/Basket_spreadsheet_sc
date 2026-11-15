const DIRECTORY_NAME = 'HIST_PLANILLAS';

/**
 * Obtiene o crea el directorio de trabajo HIST_PLANILLAS.
 * @returns {Promise<FileSystemDirectoryHandle>}
 */
async function getHistPlanillasDirectory() {
  const rootDir = await navigator.storage.getDirectory();
  return await rootDir.getDirectoryHandle(DIRECTORY_NAME, { create: true });
}

/**
 * 1) Lista todos los archivos TXT dentro del directorio HIST_PLANILLAS.
 * @returns {Promise<string[]>} Arreglo con los nombres de los archivos.
 */
export async function listarArchivosPlanillas() {
  const dirHandle = await getHistPlanillasDirectory();
  const archivos = [];

  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === 'file' && name.toLowerCase().endsWith('.txt')) {
      archivos.push(name);
    }
  }

  return archivos;
}

/**
 * 2) Lee un archivo seleccionado por su nombre y convierte su contenido JSON a objeto.
 * @param {string} fileName - Nombre del archivo (ej. "planilla_01.txt").
 * @returns {Promise<any>} Objeto JSON parseado.
 */
export async function leerArchivoComoJSON(fileName) {
  const dirHandle = await getHistPlanillasDirectory();
  
  try {
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: false });
    const file = await fileHandle.getFile();
    const textContent = await file.text();
    
    return JSON.parse(textContent);
  } catch (error) {
    console.error(`Error al leer o parsear el archivo ${fileName}:`, error);
    throw error;
  }
}

/**
 * 3) Genera o sobrescribe un archivo TXT con un título y un contenido (texto o JSON).
 * @param {string} fileName - Nombre del archivo a crear (ej. "reporte_01.txt").
 * @param {string|object} contenido - Contenido en texto plano o estructura/objeto que se guardará como JSON o texto.
 * @returns {Promise<string>} Nombre final del archivo guardado.
 */
export async function crearArchivoPlanilla(fileName, contenido) {
  const dirHandle = await getHistPlanillasDirectory();
  
  // Asegurar extensión .txt
  const safeName = fileName.toLowerCase().endsWith('.txt') ? fileName : `${fileName}.txt`;
  
  const fileHandle = await dirHandle.getFileHandle(safeName, { create: true });
  const writableStream = await fileHandle.createWritable();

  // Formatear el contenido de forma limpia (si es un objeto, lo serializamos ordenadamente)
  const cuerpoTexto = typeof contenido === 'object' 
    ? JSON.stringify(contenido, null, 2) 
    : contenido;

  

  await writableStream.write(cuerpoTexto);
  await writableStream.close();

  return safeName;
}

export async function eliminarArchivoPlanilla(fileName) {
  const dirHandle = await getHistPlanillasDirectory();
  await dirHandle.removeEntry(fileName);
}
