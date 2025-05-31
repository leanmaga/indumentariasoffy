import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const ReviewAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalReviews: 0,
      averageRating: 0,
      responseRate: 0,
      avgResponseTime: 0,
      topProducts: [],
      recentTrends: {},
    },
    charts: {
      ratingsOverTime: [],
      questionsOverTime: [],
      ratingDistribution: [0, 0, 0, 0, 0],
      responseTimeTrend: [],
    },
    loading: true,
  });

  const [timeRange, setTimeRange] = useState("30d"); // 7d, 30d, 90d, 1y

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setAnalytics((prev) => ({ ...prev, loading: true }));

      const response = await fetch(
        `/api/admin/analytics/reviews?range=${timeRange}`
      );
      const data = await response.json();

      if (data.success) {
        setAnalytics({
          ...data.analytics,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics((prev) => ({ ...prev, loading: false }));
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }) => {
    const isPositive = change > 0;
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
    };

    return (
      <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-2">
                {isPositive ? (
                  <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {change}% vs período anterior
                </span>
              </div>
            )}
          </div>
          <Icon className="h-12 w-12 opacity-50" />
        </div>
      </div>
    );
  };

  const SimpleChart = ({ data, title, color = "#3b82f6" }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <div className="h-48 flex items-center justify-center text-gray-500">
            No hay datos suficientes para mostrar el gráfico
          </div>
        </div>
      );
    }

    const maxValue = Math.max(...data.map((d) => d.value));

    return (
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-48 flex items-end justify-between space-x-1">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color,
                  minHeight: "4px",
                }}
                title={`${item.label}: ${item.value}`}
              />
              <span className="text-xs text-gray-600 mt-2 rotate-45 origin-left">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RatingDistributionChart = ({ distribution }) => {
    const total = distribution.reduce((sum, count) => sum + count, 0);

    return (
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Distribución de Calificaciones
        </h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((stars, index) => {
            const count = distribution[4 - index];
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={stars} className="flex items-center space-x-3">
                <span className="text-sm font-medium w-8">{stars}★</span>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const TopProductsList = ({ products }) => (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Productos Más Comentados</h3>
      {products.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No hay datos disponibles
        </p>
      ) : (
        <div className="space-y-3">
          {products.slice(0, 5).map((product, index) => (
            <div
              key={product._id}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.title}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>★ {product.averageRating.toFixed(1)}</span>
                  <span>{product.totalReviews} reviews</span>
                  <span>{product.totalQuestions} preguntas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (analytics.loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { overview, charts } = analytics;

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics de Reviews
        </h1>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
        >
          <option value="7d">Últimos 7 días</option>
          <option value="30d">Últimos 30 días</option>
          <option value="90d">Últimos 90 días</option>
          <option value="1y">Último año</option>
        </select>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Reviews"
          value={overview.totalReviews?.toLocaleString() || "0"}
          change={overview.recentTrends?.totalReviewsChange}
          icon={ChartBarIcon}
          color="blue"
        />

        <MetricCard
          title="Rating Promedio"
          value={overview.averageRating?.toFixed(1) || "0.0"}
          change={overview.recentTrends?.ratingChange}
          icon={StarIcon}
          color="yellow"
        />

        <MetricCard
          title="Tasa de Respuesta"
          value={`${overview.responseRate?.toFixed(1) || "0"}%`}
          change={overview.recentTrends?.responseRateChange}
          icon={ChatBubbleLeftRightIcon}
          color="green"
        />

        <MetricCard
          title="Tiempo Promedio de Respuesta"
          value={`${overview.avgResponseTime || "0"}h`}
          change={overview.recentTrends?.responseTimeChange}
          icon={ClockIcon}
          color="purple"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          title="Calificaciones por Día"
          data={charts.ratingsOverTime}
          color="#f59e0b"
        />

        <SimpleChart
          title="Preguntas por Día"
          data={charts.questionsOverTime}
          color="#3b82f6"
        />

        <RatingDistributionChart distribution={charts.ratingDistribution} />

        <TopProductsList products={overview.topProducts || []} />
      </div>

      {/* Tabla de tiempo de respuesta si hay datos */}
      {charts.responseTimeTrend && charts.responseTimeTrend.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Tendencia de Tiempo de Respuesta
          </h3>
          <SimpleChart
            title=""
            data={charts.responseTimeTrend}
            color="#8b5cf6"
          />
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Resumen del Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {overview.totalReviews || 0}
            </div>
            <div className="text-sm text-gray-600">Reviews Totales</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-green-600">
              {(
                ((overview.responseRate || 0) * (overview.totalReviews || 0)) /
                100
              ).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Preguntas Respondidas</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-purple-600">
              {overview.topProducts?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Productos con Reviews</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewAnalyticsDashboard;
