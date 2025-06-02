// Middleware para logging automático de APIs
// middleware/apiLogger.js
export const apiLogger = (handler) => {
  return async (req, res) => {
    const startTime = Date.now();

    // Ejecutar el handler original
    const result = await handler(req, res);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // En producción, enviar a servicio de monitoreo
    if (process.env.NODE_ENV === "production") {
      // Enviar métricas a DataDog, New Relic, etc.
    }

    return result;
  };
};
