import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Hook para notificaciones en tiempo real
const useReviewNotifications = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user || session.user.role !== "admin") return;

    // Cargar notificaciones iniciales
    fetchNotifications();

    // Configurar polling cada 30 segundos para simular tiempo real
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications/reviews");
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `/api/admin/notifications/${notificationId}/read`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/admin/notifications/mark-all-read", {
        method: "POST",
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
};

// Componente de panel de notificaciones
const ReviewNotificationsPanel = () => {
  const { data: session } = useSession();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useReviewNotifications();
  const [showPanel, setShowPanel] = useState(false);

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_question":
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />;
      case "new_rating":
        return <StarIcon className="h-5 w-5 text-yellow-500" />;
      case "review_reported":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case "new_question":
        return `Nueva pregunta sobre "${notification.productTitle}"`;
      case "new_rating":
        return `Nueva calificación (${notification.rating}★) para "${notification.productTitle}"`;
      case "review_reported":
        return `Review reportada en "${notification.productTitle}"`;
      default:
        return notification.message || "Nueva notificación";
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora mismo";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return notificationDate.toLocaleDateString("es-ES");
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Notificaciones
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Marcar todas como leídas
                </button>
              )}
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read
                        ? "bg-blue-50 border-l-2 border-l-blue-500"
                        : ""
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification._id);
                      }
                      // Opcional: navegar a la review específica
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            !notification.read
                              ? "font-semibold text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {getNotificationText(notification)}
                        </p>

                        {notification.userName && (
                          <p className="text-xs text-gray-500">
                            Por {notification.userName}
                          </p>
                        )}

                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowPanel(false);
                  // Navegar al panel de reviews
                  window.location.href = "/admin/reviews";
                }}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Ver todas las reviews
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente de toast para notificaciones instantáneas
const ReviewNotificationToast = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user || session.user.role !== "admin") return;

    // Simular notificaciones en tiempo real con polling
    const checkForNewNotifications = async () => {
      try {
        const response = await fetch("/api/admin/notifications/latest");
        const data = await response.json();

        if (data.success && data.hasNew) {
          data.notifications.forEach((notification) => {
            const message = getToastMessage(notification);

            toast.success(message, {
              duration: 5000,
              icon: getToastIcon(notification.type),
              style: {
                background: "#f0f9ff",
                border: "1px solid #0ea5e9",
                color: "#0c4a6e",
              },
              action: {
                label: "Ver",
                onClick: () => (window.location.href = "/admin/reviews"),
              },
            });
          });
        }
      } catch (error) {
        console.error("Error checking for new notifications:", error);
      }
    };

    // Check every 60 seconds
    const interval = setInterval(checkForNewNotifications, 60000);

    return () => clearInterval(interval);
  }, [session]);

  const getToastMessage = (notification) => {
    switch (notification.type) {
      case "new_question":
        return `💬 Nueva pregunta sobre ${notification.productTitle}`;
      case "new_rating":
        return `⭐ Nueva calificación (${notification.rating}★) recibida`;
      case "review_reported":
        return `🚨 Review reportada necesita atención`;
      default:
        return "🔔 Nueva notificación de review";
    }
  };

  const getToastIcon = (type) => {
    switch (type) {
      case "new_question":
        return "💬";
      case "new_rating":
        return "⭐";
      case "review_reported":
        return "🚨";
      default:
        return "🔔";
    }
  };

  return null; // Este componente solo maneja efectos secundarios
};

// Hook personalizado para usar en cualquier componente
const useNewReviewAlert = (productId) => {
  const { data: session } = useSession();
  const [hasNewReviews, setHasNewReviews] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const checkForNewReviews = async () => {
      try {
        const response = await fetch(
          `/api/products/${productId}/reviews/latest`
        );
        const data = await response.json();

        if (data.success && data.hasNew) {
          setHasNewReviews(true);

          // Auto-reset después de 30 segundos
          setTimeout(() => {
            setHasNewReviews(false);
          }, 30000);
        }
      } catch (error) {
        console.error("Error checking for new reviews:", error);
      }
    };

    const interval = setInterval(checkForNewReviews, 30000);

    return () => clearInterval(interval);
  }, [productId]);

  return { hasNewReviews, reset: () => setHasNewReviews(false) };
};

export {
  ReviewNotificationsPanel,
  ReviewNotificationToast,
  useReviewNotifications,
  useNewReviewAlert,
};

export default ReviewNotificationsPanel;
