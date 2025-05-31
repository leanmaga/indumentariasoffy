import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BellIcon,
  RefreshIcon,
} from "@heroicons/react/24/outline";

const ReviewMonitoringDashboard = () => {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState({
    realTime: {
      activeUsers: 0,
      reviewsLastHour: 0,
      questionsLastHour: 0,
      avgResponseTime: 0,
      systemHealth: "healthy",
    },
    performance: {
      apiLatency: 0,
      cacheHitRate: 0,
      errorRate: 0,
      throughput: 0,
    },
    alerts: [],
    trends: {
      reviewGrowth: 0,
      engagementRate: 0,
      moderationLoad: 0,
    },
    loading: true,
  });

  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchMetrics, 30000); // 30 segundos
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/admin/monitoring/reviews");
      const data = await response.json();

      if (data.success) {
        setMetrics({
          ...data.metrics,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching monitoring metrics:", error);
      setMetrics((prev) => ({ ...prev, loading: false }));
    }
  };

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    status = "normal",
    description,
  }) => {
    const getStatusColor = () => {
      switch (status) {
        case "good":
          return "text-green-600 bg-green-50 border-green-200";
        case "warning":
          return "text-yellow-600 bg-yellow-50 border-yellow-200";
        case "critical":
          return "text-red-600 bg-red-50 border-red-200";
        default:
          return "text-blue-600 bg-blue-50 border-blue-200";
      }
    };

    const getTrendIcon = () => {
      if (change > 0)
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      if (change < 0)
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      return null;
    };

    return (
      <div className={`border rounded-lg p-6 ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <Icon className="h-8 w-8 opacity-60" />
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {change > 0 ? "+" : ""}
                {change}%
              </span>
            </div>
          )}
        </div>

        <div className="mb-2">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-75">{title}</div>
        </div>

        {description && <div className="text-xs opacity-60">{description}</div>}
      </div>
    );
  };

  const AlertItem = ({ alert }) => {
    const getAlertIcon = () => {
      switch (alert.severity) {
        case "critical":
          return <XCircleIcon className="h-5 w-5 text-red-500" />;
        case "warning":
          return (
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
          );
        default:
          return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      }
    };

    return (
      <div className="flex items-start space-x-3 p-3 border-l-4 border-gray-200 hover:bg-gray-50">
        {getAlertIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{alert.message}</p>
          <p className="text-xs text-gray-500">{alert.timestamp}</p>
        </div>
        {alert.action && (
          <button className="text-sm text-indigo-600 hover:text-indigo-800">
            {alert.action}
          </button>
        )}
      </div>
    );
  };

  const RealTimeChart = ({ data, title, color = "#3b82f6" }) => {
    return (
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-32 flex items-end justify-between space-x-1">
          {data.map((point, index) => (
            <div
              key={index}
              className="flex-1 bg-blue-200 rounded-t transition-all duration-300"
              style={{
                height: `${Math.max((point / Math.max(...data)) * 100, 5)}%`,
                backgroundColor: color,
                opacity: 0.7 + (index / data.length) * 0.3,
              }}
              title={`${point} en ${index * 5}min`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>-30min</span>
          <span>-15min</span>
          <span>Ahora</span>
        </div>
      </div>
    );
  };

  const SystemHealthIndicator = ({ health }) => {
    const getHealthStatus = () => {
      switch (health) {
        case "healthy":
          return {
            color: "bg-green-500",
            text: "Sistema Saludable",
            icon: CheckCircleIcon,
          };
        case "degraded":
          return {
            color: "bg-yellow-500",
            text: "Rendimiento Degradado",
            icon: ExclamationTriangleIcon,
          };
        case "critical":
          return {
            color: "bg-red-500",
            text: "Sistema Crítico",
            icon: XCircleIcon,
          };
        default:
          return {
            color: "bg-gray-500",
            text: "Estado Desconocido",
            icon: ClockIcon,
          };
      }
    };

    const status = getHealthStatus();
    const Icon = status.icon;

    return (
      <div className="flex items-center space-x-3 p-4 bg-white border rounded-lg">
        <div
          className={`w-3 h-3 rounded-full ${status.color} animate-pulse`}
        ></div>
        <Icon className="h-5 w-5 text-gray-600" />
        <span className="font-medium">{status.text}</span>
        <span className="text-sm text-gray-500">
          Actualizado hace {Math.floor(Math.random() * 30)} segundos
        </span>
      </div>
    );
  };

  if (!session?.user || session.user.role !== "admin") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Acceso denegado. Solo administradores pueden ver el monitoreo.
        </p>
      </div>
    );
  }

  if (metrics.loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Datos simulados para los gráficos (en producción vendrían de la API)
  const realtimeData = Array(12)
    .fill(0)
    .map(() => Math.floor(Math.random() * 50));
  const performanceData = Array(12)
    .fill(0)
    .map(() => Math.floor(Math.random() * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Monitoreo en Tiempo Real - Reviews
          </h1>
          <p className="text-gray-600">
            Estado del sistema y métricas de rendimiento
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Auto-refresh</span>
          </label>

          <button
            onClick={fetchMetrics}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            title="Actualizar ahora"
          >
            <RefreshIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Estado del Sistema */}
      <SystemHealthIndicator health={metrics.realTime.systemHealth} />

      {/* Métricas en Tiempo Real */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Métricas en Tiempo Real
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Usuarios Activos"
            value={metrics.realTime.activeUsers}
            change={5.2}
            icon={ChartBarIcon}
            status="good"
            description="Usuarios interactuando ahora"
          />

          <MetricCard
            title="Reviews (Última Hora)"
            value={metrics.realTime.reviewsLastHour}
            change={-2.1}
            icon={BellIcon}
            status="normal"
            description="Calificaciones recibidas"
          />

          <MetricCard
            title="Preguntas (Última Hora)"
            value={metrics.realTime.questionsLastHour}
            change={8.5}
            icon={ExclamationTriangleIcon}
            status="warning"
            description="Preguntas pendientes"
          />

          <MetricCard
            title="Tiempo Respuesta Promedio"
            value={`${metrics.realTime.avgResponseTime}h`}
            change={-12.3}
            icon={ClockIcon}
            status="good"
            description="Tiempo hasta respuesta"
          />
        </div>
      </div>

      {/* Métricas de Performance */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Performance del Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Latencia API"
            value={`${metrics.performance.apiLatency}ms`}
            change={-5.1}
            icon={ChartBarIcon}
            status={metrics.performance.apiLatency > 500 ? "warning" : "good"}
            description="Tiempo respuesta promedio"
          />

          <MetricCard
            title="Cache Hit Rate"
            value={`${metrics.performance.cacheHitRate}%`}
            change={3.2}
            icon={CheckCircleIcon}
            status={metrics.performance.cacheHitRate > 80 ? "good" : "warning"}
            description="Eficiencia del cache"
          />

          <MetricCard
            title="Error Rate"
            value={`${metrics.performance.errorRate}%`}
            change={1.1}
            icon={XCircleIcon}
            status={metrics.performance.errorRate > 5 ? "critical" : "good"}
            description="Errores por minuto"
          />

          <MetricCard
            title="Throughput"
            value={`${metrics.performance.throughput}/min`}
            change={7.8}
            icon={ArrowTrendingUpIcon}
            status="good"
            description="Requests procesados"
          />
        </div>
      </div>

      {/* Gráficos en Tiempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealTimeChart
          data={realtimeData}
          title="Actividad de Reviews (Últimos 60min)"
          color="#3b82f6"
        />

        <RealTimeChart
          data={performanceData}
          title="Performance API (Últimos 60min)"
          color="#10b981"
        />
      </div>

      {/* Alertas y Notificaciones */}
      <div className="bg-white border rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Alertas Recientes
            </h3>
            <span className="text-sm text-gray-500">
              {metrics.alerts.length} alertas
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {metrics.alerts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500 mb-3" />
              <p>No hay alertas activas</p>
              <p className="text-sm">
                El sistema está funcionando correctamente
              </p>
            </div>
          ) : (
            metrics.alerts.map((alert, index) => (
              <AlertItem key={index} alert={alert} />
            ))
          )}
        </div>
      </div>

      {/* Métricas de Tendencias */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tendencias (7 días)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              +{metrics.trends.reviewGrowth}%
            </div>
            <div className="text-sm text-gray-600">Crecimiento de Reviews</div>
            <div className="text-xs text-gray-500 mt-1">
              vs. semana anterior
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {metrics.trends.engagementRate}%
            </div>
            <div className="text-sm text-gray-600">Tasa de Engagement</div>
            <div className="text-xs text-gray-500 mt-1">
              usuarios que interactúan
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {metrics.trends.moderationLoad}
            </div>
            <div className="text-sm text-gray-600">Carga de Moderación</div>
            <div className="text-xs text-gray-500 mt-1">items pendientes</div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-gray-50 border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-white border rounded-lg hover:border-indigo-300 transition-colors">
            <div className="text-center">
              <BellIcon className="h-8 w-8 mx-auto text-indigo-600 mb-2" />
              <div className="font-medium">Ver Preguntas Pendientes</div>
              <div className="text-sm text-gray-500">
                {metrics.trends.moderationLoad} sin responder
              </div>
            </div>
          </button>

          <button className="p-4 bg-white border rounded-lg hover:border-green-300 transition-colors">
            <div className="text-center">
              <ChartBarIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="font-medium">Analytics Completo</div>
              <div className="text-sm text-gray-500">
                Ver dashboard detallado
              </div>
            </div>
          </button>

          <button className="p-4 bg-white border rounded-lg hover:border-red-300 transition-colors">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <div className="font-medium">Reviews Reportadas</div>
              <div className="text-sm text-gray-500">Revisar contenido</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewMonitoringDashboard;
