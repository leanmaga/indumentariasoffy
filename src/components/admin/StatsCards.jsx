"use client";

import Link from "next/link";
import PropTypes from "prop-types";
import {
  CubeIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

/**
 * Componente que agrupa las tarjetas de estadísticas.
 * Recibe conteos y valores para productos, pedidos, usuarios y ventas.
 */
export default function StatsCards({
  productsCount,
  ordersCount,
  usersCount,
  totalSales,
  pendingOrders,
}) {
  const stats = [
    {
      label: "Productos",
      value: productsCount,
      icon: CubeIcon,
      href: "/admin/products",
      color: "blue",
    },
    {
      label: "Pedidos",
      value: ordersCount,
      icon: ClipboardDocumentListIcon,
      href: "/admin/orders",
      color: "green",
    },
    {
      label: "Usuarios",
      value: usersCount,
      icon: UsersIcon,
      href: "/admin/users",
      color: "purple",
    },
    {
      label: "Ventas Totales",
      value: `$${totalSales.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      href: "/admin/orders",
      color: "yellow",
      subtitle: `${pendingOrders} pedidos pendientes`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

StatsCards.propTypes = {
  productsCount: PropTypes.number.isRequired,
  ordersCount: PropTypes.number.isRequired,
  usersCount: PropTypes.number.isRequired,
  totalSales: PropTypes.number.isRequired,
  pendingOrders: PropTypes.number.isRequired,
};

/**
 * Tarjeta individual de estadística.
 */
function StatCard({ label, value, icon: Icon, href, color, subtitle }) {
  // Mapear colores para Tailwind
  const colorMap = {
    blue: {
      bg: "bg-blue-100",
      icon: "text-blue-600",
      link: "text-blue-600 hover:text-blue-800",
      subtitle: "text-blue-600",
      hoverBorder: "hover:border-blue-200",
    },
    green: {
      bg: "bg-green-100",
      icon: "text-green-600",
      link: "text-green-600 hover:text-green-800",
      subtitle: "text-green-600",
      hoverBorder: "hover:border-green-200",
    },
    purple: {
      bg: "bg-purple-100",
      icon: "text-purple-600",
      link: "text-purple-600 hover:text-purple-800",
      subtitle: "text-purple-600",
      hoverBorder: "hover:border-purple-200",
    },
    yellow: {
      bg: "bg-yellow-100",
      icon: "text-yellow-600",
      link: "text-yellow-600 hover:text-yellow-800",
      subtitle: "text-yellow-600",
      hoverBorder: "hover:border-yellow-200",
    },
  };

  const styles = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`bg-white rounded-lg p-6 shadow transition-shadow duration-200 border border-gray-100 ${styles.hoverBorder}`}
    >
      <div className="flex items-center">
        <div className={`${styles.bg} p-3 rounded-full`}>
          <Icon className={`h-6 w-6 ${styles.icon}`} />
        </div>
        <div className="ml-4">
          <h2 className="text-gray-500 text-sm">{label}</h2>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>

      <Link
        href={href}
        className={`${styles.link} text-sm font-medium mt-4 inline-block`}
      >
        Ver detalles →
      </Link>

      {subtitle && (
        <div className={`mt-2 text-sm font-medium ${styles.subtitle}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.elementType.isRequired,
  href: PropTypes.string.isRequired,
  color: PropTypes.oneOf(["blue", "green", "purple", "yellow"]).isRequired,
  subtitle: PropTypes.string,
};
