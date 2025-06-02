"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChatBubbleLeftRightIcon, BellIcon } from "@heroicons/react/24/outline";
import { ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid } from "@heroicons/react/24/solid";

const MessagesNotification = ({ className = "" }) => {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchUnreadCount();

      // Verificar cada 30 segundos si hay nuevos mensajes
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/messages?limit=1");
      const data = await response.json();

      if (data.success) {
        // Considerar "nuevos" los mensajes respondidos en las últimas 24 horas
        const recentlyAnswered = data.messages.filter((message) => {
          if (!message.response || !message.responseDate) return false;

          const responseDate = new Date(message.responseDate);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

          return responseDate > dayAgo;
        });

        setUnreadCount(recentlyAnswered.length);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setLoading(false);
    }
  };

  // No mostrar si no está autenticado
  if (!session?.user) {
    return null;
  }

  return (
    <Link
      href="/messages"
      className={`relative inline-flex items-center p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
      title="Mis mensajes"
    >
      {unreadCount > 0 ? (
        <ChatBubbleLeftRightIconSolid className="h-6 w-6" />
      ) : (
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      )}

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
};

// Componente para mostrar en el header/navbar principal
const MessagesNavItem = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ pending: 0, answered: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/messages?limit=1");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Link
      href="/messages"
      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition-colors"
    >
      <div className="relative">
        <ChatBubbleLeftRightIcon className="h-5 w-5" />
        {stats.pending > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {stats.pending}
          </span>
        )}
      </div>
      <span className="hidden md:block">Mensajes</span>

      {stats.pending > 0 && (
        <span className="hidden md:block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
          {stats.pending} pendientes
        </span>
      )}
    </Link>
  );
};

// Toast notification para nuevas respuestas
const NewResponseToast = () => {
  const { data: session } = useSession();
  const [showToast, setShowToast] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());

  useEffect(() => {
    if (!session?.user) return;

    const checkForNewResponses = async () => {
      try {
        const response = await fetch("/api/users/messages?limit=5");
        const data = await response.json();

        if (data.success) {
          // Verificar si hay respuestas más recientes que la última verificación
          const newResponses = data.messages.filter((message) => {
            if (!message.response || !message.responseDate) return false;

            const responseDate = new Date(message.responseDate);
            return responseDate.getTime() > lastCheckTime;
          });

          if (newResponses.length > 0) {
            setShowToast(true);
            setLastCheckTime(Date.now());
          }
        }
      } catch (error) {
        console.error("Error checking for new responses:", error);
      }
    };

    // Verificar cada 2 minutos
    const interval = setInterval(checkForNewResponses, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session, lastCheckTime]);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium">¡Nueva respuesta!</p>
          <p className="text-sm text-green-100">
            El vendedor respondió tu pregunta
          </p>
        </div>
        <button
          onClick={() => setShowToast(false)}
          className="text-green-100 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="mt-3 flex space-x-2">
        <Link
          href="/messages"
          onClick={() => setShowToast(false)}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Ver mensaje
        </Link>
        <button
          onClick={() => setShowToast(false)}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

// Hook para usar en otros componentes
export const useMessagesCount = () => {
  const { data: session } = useSession();
  const [counts, setCounts] = useState({ total: 0, pending: 0, answered: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCounts = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const response = await fetch("/api/users/messages?limit=1");
      const data = await response.json();

      if (data.success) {
        setCounts(data.stats);
      }
    } catch (error) {
      console.error("Error fetching message counts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [session]);

  return { counts, loading, refetch: fetchCounts };
};

export { MessagesNavItem, NewResponseToast, useMessagesCount };
export default MessagesNotification;
