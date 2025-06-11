// components/ui/WhatsAppButton.jsx
"use client";

import { useCartStore } from "@/lib/store";
import { FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
// 🆕 IMPORTAR FUNCIONES DE EMAIL
import {
  sendOrderConfirmationToCustomer,
  sendNewOrderNotificationToAdmin,
} from "@/lib/order-emails";

export default function WhatsAppButton({
  userData,
  isDisabled,
  handleBeforeSubmit,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const total = getTotal();

  const handleWhatsAppOrder = async () => {
    // Si hay una función de validación previa, ejecutarla
    if (handleBeforeSubmit && !handleBeforeSubmit()) {
      return;
    }

    if (!session) {
      toast.error("Debes iniciar sesión para realizar un pedido");
      router.push("/auth/login?redirect=/checkout");
      return;
    }

    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    // Verificar que todos los campos requeridos estén completos
    if (
      !userData?.name ||
      !userData?.email ||
      !userData?.phone ||
      !userData?.address ||
      !userData?.city ||
      !userData?.postalCode
    ) {
      toast.error("Por favor completa todos los datos de envío");
      return;
    }

    setIsLoading(true);

    try {
      // Generar un ID único para este pedido
      const orderId = `whatsapp_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;

      // Convertir los ítems del carrito
      const orderItems = items.map((item) => ({
        product: item.id,
        title: item.name || item.title,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.image || "",
        variant: item.variant || "",
      }));

      // Crear objeto de datos de la orden
      const orderData = {
        items: orderItems,
        totalAmount: total,
        paymentMethod: "whatsapp",
        shippingInfo: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          postalCode: userData.postalCode,
        },
        status: "whatsapp_pendiente",
        whatsappOrder: true,
        idempotencyKey: orderId,
      };

      // Guardar en la base de datos
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el pedido");
      }

      const result = await response.json();

      // 🆕 ===== ENVIAR EMAILS AUTOMÁTICAMENTE =====
      console.log("📧 Enviando emails para orden WhatsApp:", result.orderId);

      try {
        // Crear objetos compatibles con las funciones de email
        const orderForEmail = {
          _id: result.orderId,
          items: orderItems,
          totalAmount: total,
          status: "whatsapp_pendiente",
          paymentMethod: "whatsapp",
          shippingInfo: orderData.shippingInfo,
          createdAt: new Date(),
          whatsappOrder: true,
        };

        const userForEmail = {
          _id: session.user?.id || session.user?.email,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        };

        // Enviar email de confirmación al cliente
        const customerEmailResult = await sendOrderConfirmationToCustomer(
          orderForEmail,
          userForEmail
        );

        // Enviar email de notificación al admin
        const adminEmailResult = await sendNewOrderNotificationToAdmin(
          orderForEmail,
          userForEmail
        );

        console.log("✅ Resultados de emails WhatsApp:", {
          customer: customerEmailResult.success,
          admin: adminEmailResult.success,
        });

        // Mostrar notificación de emails enviados
        if (customerEmailResult.success && adminEmailResult.success) {
          toast.success("📧 Emails de confirmación enviados");
        } else if (customerEmailResult.success || adminEmailResult.success) {
          toast("📧 Algunos emails enviados", { icon: "⚠️" });
        }
      } catch (emailError) {
        console.error("❌ Error enviando emails de WhatsApp:", emailError);
        // No mostrar error al usuario, solo log interno
        console.log("🔄 Orden creada correctamente, emails fallaron");
      }
      // ===== FIN ENVÍO EMAILS =====

      // Guardar datos del pedido en localStorage
      localStorage.setItem(
        `whatsapp_order_${orderId}`,
        JSON.stringify({
          items,
          total,
          userData,
          timestamp: new Date().toISOString(),
          dbOrderId: result.orderId,
        })
      );

      // Crear el mensaje de WhatsApp
      const phoneNumber = "5491126907696";

      let message =
        "¡Hola! Quiero hacer un pedido con los siguientes productos:\n\n";

      // Añadir cada producto al mensaje
      items.forEach((item) => {
        message += `• ${item.name || item.title} x ${item.quantity} - $${(
          item.price * item.quantity
        ).toFixed(2)}\n`;
        if (item.variant) message += `  - Talle/Variante: ${item.variant}\n`;
      });

      message += `\n*Total: $${total.toFixed(2)}*`;

      // Añadir información de contacto
      message += "\n\n*Datos de contacto:*";
      message += `\nNombre: ${userData.name}`;
      message += `\nEmail: ${userData.email}`;
      message += `\nTeléfono: ${userData.phone}`;
      message += `\nDirección: ${userData.address}`;
      message += `\nCiudad: ${userData.city}`;
      message += `\nCódigo Postal: ${userData.postalCode}`;

      // Añadir enlace al resumen visual (si tu plataforma lo soporta)
      const orderUrl = `${window.location.origin}/order-summary/${orderId}`;
      message += `\n\n*Ver resumen con imágenes:*\n${orderUrl}`;

      // Añadir número de pedido
      message += `\n\n*Número de pedido:* #${result.orderId.substring(0, 8)}`;
      message +=
        "\n\nPor favor, confirma disponibilidad y costos de envío. ¡Gracias!";

      // Codificar mensaje y crear enlace
      const encodedMessage = encodeURIComponent(message);
      const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      // Limpiar el carrito
      clearCart();

      // Abrir WhatsApp
      window.open(whatsappLink, "_blank");

      // Redirigir a la página de éxito
      router.push(
        `/checkout/success?method=whatsapp&orderId=${result.orderId}`
      );

      toast.success("¡Pedido enviado por WhatsApp con éxito!");
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      toast.error("No se pudo procesar el pedido: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button" // Importante: type="button" para que no envíe el formulario
      onClick={handleWhatsAppOrder}
      className="w-full bg-green-500 text-white py-3 flex items-center justify-center rounded-md hover:bg-green-600 transition-colors"
      disabled={isLoading || isDisabled || items.length === 0}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
          <span>Procesando...</span>
        </>
      ) : (
        <>
          <FaWhatsapp className="h-5 w-5 mr-2" />
          <span>Pedir por WhatsApp - ${total.toFixed(2)}</span>
        </>
      )}
    </button>
  );
}
