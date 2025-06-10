src / lib / utils.js;

/**
 * Formatea una fecha en formato legible
 * @param {string} dateString - La fecha en formato ISO
 * @returns {string} - Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return "Fecha no disponible";

  try {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "Fecha inválida";
  }
};
