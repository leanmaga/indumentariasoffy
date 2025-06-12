// // src/app/admin/mercadopago-test/page.js
// "use client";

// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";

// export default function MercadoPagoTestPage() {
//   const [testResult, setTestResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   // Verificar que sea admin
//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/auth/login");
//     } else if (status === "authenticated" && session?.user?.role !== "admin") {
//       router.push("/");
//     }
//   }, [status, session, router]);

//   const runTest = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch("/api/mercadopago/test");
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Error en la verificación");
//       }

//       setTestResult(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const StatusIcon = ({ status }) => {
//     if (status === true) return <span className="text-green-500">✅</span>;
//     if (status === false) return <span className="text-red-500">❌</span>;
//     return <span className="text-yellow-500">⚠️</span>;
//   };

//   const StatusBadge = ({ ready, errors }) => {
//     if (ready) {
//       return (
//         <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
//           ✅ Listo
//         </span>
//       );
//     } else if (errors > 0) {
//       return (
//         <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
//           ❌ Errores
//         </span>
//       );
//     } else {
//       return (
//         <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
//           ⚠️ Incompleto
//         </span>
//       );
//     }
//   };

//   if (status === "loading") {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   if (session?.user?.role !== "admin") {
//     return <div>No autorizado</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4 max-w-4xl">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h1 className="text-2xl font-bold text-gray-900">
//               🧪 Verificación de MercadoPago
//             </h1>
//             <button
//               onClick={runTest}
//               disabled={loading}
//               className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
//                   Verificando...
//                 </>
//               ) : (
//                 "🔍 Verificar Configuración"
//               )}
//             </button>
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//               <h3 className="font-medium text-red-800">
//                 Error en la verificación:
//               </h3>
//               <p className="text-red-700">{error}</p>
//             </div>
//           )}

//           {testResult && (
//             <div className="space-y-6">
//               {/* Resumen general */}
//               <div className="bg-gray-50 rounded-lg p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <h2 className="text-lg font-semibold">Estado General</h2>
//                   <StatusBadge
//                     ready={testResult.status.ready}
//                     errors={testResult.status.errors.length}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <span className="text-gray-600">Puntuación:</span>
//                     <span className="ml-2 font-medium">{testResult.score}</span>
//                   </div>
//                   <div>
//                     <span className="text-gray-600">Entorno:</span>
//                     <span className="ml-2 font-medium capitalize">
//                       {testResult.environment}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Errores críticos */}
//               {testResult.status.errors.length > 0 && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                   <h3 className="font-medium text-red-800 mb-2">
//                     ❌ Errores Críticos:
//                   </h3>
//                   <ul className="list-disc list-inside text-red-700 space-y-1">
//                     {testResult.status.errors.map((error, index) => (
//                       <li key={index}>{error}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {/* Advertencias */}
//               {testResult.status.warnings.length > 0 && (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                   <h3 className="font-medium text-yellow-800 mb-2">
//                     ⚠️ Advertencias:
//                   </h3>
//                   <ul className="list-disc list-inside text-yellow-700 space-y-1">
//                     {testResult.status.warnings.map((warning, index) => (
//                       <li key={index}>{warning}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {/* Variables de entorno */}
//               <div className="bg-white border rounded-lg p-4">
//                 <h3 className="font-medium mb-3">🔧 Variables de Entorno</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                   {Object.entries(testResult.configuration.environment).map(
//                     ([key, value]) => (
//                       <div
//                         key={key}
//                         className="flex items-center justify-between"
//                       >
//                         <span className="text-gray-600 font-mono text-xs">
//                           {key}
//                         </span>
//                         <StatusIcon status={value} />
//                       </div>
//                     )
//                   )}
//                 </div>
//               </div>

//               {/* Configuración de emails */}
//               <div className="bg-white border rounded-lg p-4">
//                 <h3 className="font-medium mb-3">📧 Configuración de Emails</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                   {Object.entries(testResult.configuration.email).map(
//                     ([key, value]) => (
//                       <div
//                         key={key}
//                         className="flex items-center justify-between"
//                       >
//                         <span className="text-gray-600 font-mono text-xs">
//                           {key}
//                         </span>
//                         <StatusIcon status={value} />
//                       </div>
//                     )
//                   )}
//                 </div>
//               </div>

//               {/* Estado de MercadoPago */}
//               <div className="bg-white border rounded-lg p-4">
//                 <h3 className="font-medium mb-3">💳 Estado de MercadoPago</h3>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex items-center justify-between">
//                     <span>Configurado</span>
//                     <StatusIcon
//                       status={testResult.configuration.mercadopago.isConfigured}
//                     />
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span>Producción</span>
//                     <StatusIcon
//                       status={testResult.configuration.mercadopago.isProduction}
//                     />
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span>Fuente</span>
//                     <span className="text-gray-600">
//                       {testResult.configuration.mercadopago.source}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* URLs importantes */}
//               <div className="bg-white border rounded-lg p-4">
//                 <h3 className="font-medium mb-3">🔗 URLs Configuradas</h3>
//                 <div className="space-y-2 text-xs">
//                   {Object.entries(testResult.configuration.urls).map(
//                     ([key, url]) => (
//                       <div key={key}>
//                         <span className="text-gray-600 capitalize">{key}:</span>
//                         <span className="ml-2 font-mono text-blue-600">
//                           {url}
//                         </span>
//                       </div>
//                     )
//                   )}
//                 </div>
//               </div>

//               {/* Recomendaciones */}
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <h3 className="font-medium text-blue-800 mb-2">
//                   💡 Recomendaciones:
//                 </h3>
//                 <ul className="list-disc list-inside text-blue-700 space-y-1">
//                   {testResult.recommendations.map((rec, index) => (
//                     <li key={index}>{rec}</li>
//                   ))}
//                 </ul>
//               </div>

//               {/* Instrucciones de prueba */}
//               {testResult.testInstructions && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                   <h3 className="font-medium text-green-800 mb-3">
//                     🧪 Instrucciones de Prueba
//                   </h3>
//                   <div className="space-y-2 text-green-700 text-sm">
//                     <p>
//                       <strong>Paso 1:</strong>{" "}
//                       {testResult.testInstructions.step1}
//                     </p>
//                     <p>
//                       <strong>Paso 2:</strong>{" "}
//                       {testResult.testInstructions.step2}
//                     </p>
//                     <p>
//                       <strong>Paso 3:</strong>{" "}
//                       {testResult.testInstructions.step3}
//                     </p>
//                     <p>
//                       <strong>Paso 4:</strong>{" "}
//                       {testResult.testInstructions.step4}
//                     </p>

//                     <div className="mt-3 p-3 bg-white rounded border">
//                       <h4 className="font-medium text-green-800 mb-2">
//                         Tarjetas de Prueba:
//                       </h4>
//                       <div className="text-xs space-y-1">
//                         <p>
//                           <strong>Visa:</strong>{" "}
//                           {testResult.testInstructions.testCards.visa}
//                         </p>
//                         <p>
//                           <strong>Mastercard:</strong>{" "}
//                           {testResult.testInstructions.testCards.mastercard}
//                         </p>
//                         <p>
//                           <strong>Código de seguridad:</strong>{" "}
//                           {testResult.testInstructions.testCards.securityCode}
//                         </p>
//                         <p>
//                           <strong>Fecha de expiración:</strong>{" "}
//                           {testResult.testInstructions.testCards.expirationDate}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="text-xs text-gray-500 text-center">
//                 Última verificación:{" "}
//                 {new Date(testResult.timestamp).toLocaleString()}
//               </div>
//             </div>
//           )}

//           {!testResult && !loading && (
//             <div className="text-center py-8 text-gray-500">
//               Haz clic en "Verificar Configuración" para comenzar la
//               verificación.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
