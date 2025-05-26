// src/components/admin/AdminSidebar.jsx (Actualizado)
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  CubeIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  PlusCircleIcon,
  ListBulletIcon,
  ChartBarIcon,
  CogIcon, // Icono para configuración
} from "@heroicons/react/24/outline";

const AdminSidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Dashboard",
      icon: <HomeIcon className="h-5 w-5" />,
      href: "/admin",
    },
    {
      title: "Productos",
      icon: <CubeIcon className="h-5 w-5" />,
      href: "/admin/products",
      submenu: [
        {
          title: "Agregar Producto",
          icon: <PlusCircleIcon className="h-5 w-5" />,
          href: "/admin/products/add",
        },
        {
          title: "Lista de Productos",
          icon: <ListBulletIcon className="h-5 w-5" />,
          href: "/admin/products",
        },
      ],
    },
    {
      title: "Pedidos",
      icon: <ShoppingCartIcon className="h-5 w-5" />,
      href: "/admin/orders",
    },
    {
      title: "Usuarios",
      icon: <UserGroupIcon className="h-5 w-5" />,
      href: "/admin/users",
    },
    {
      title: "Configuración",
      icon: <CogIcon className="h-5 w-5" />,
      href: "/admin/settings",
    },
  ];

  // Función para verificar si un enlace está activo
  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-full md:w-64 bg-white border border-gray-200 p-6 md:sticky md:top-20 h-fit">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">
        Administración
      </h2>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href} className="space-y-2">
              <Link
                href={item.href}
                className={`flex items-center px-4 py-2 ${
                  isActive(item.href) && !item.submenu
                    ? "bg-indigo-500 text-white"
                    : "text-gray-800 hover:border-indigo-500 hover:border-l-2 pl-3"
                } transition-all`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.title}</span>
              </Link>

              {/* Submenu items */}
              {item.submenu && (
                <ul className="pl-8 space-y-1 mt-1">
                  {item.submenu.map((subItem) => (
                    <li key={subItem.href}>
                      <Link
                        href={subItem.href}
                        className={`flex items-center px-4 py-2 ${
                          pathname === subItem.href
                            ? "bg-gray-100 text-black"
                            : "text-gray-600 hover:bg-gray-50"
                        } transition-all`}
                      >
                        <span className="mr-3">{subItem.icon}</span>
                        <span>{subItem.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
