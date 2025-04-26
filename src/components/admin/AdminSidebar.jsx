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
      title: "Estadísticas",
      icon: <ChartBarIcon className="h-5 w-5" />,
      href: "/admin/stats",
    },
  ];

  // Función para verificar si un enlace está activo
  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  // Función para verificar si un submenú está activo
  const isSubmenuOpen = (item) => {
    return (
      item.submenu &&
      item.submenu.some((subItem) => pathname.startsWith(subItem.href))
    );
  };

  return (
    <aside className="w-full md:w-64 bg-white rounded-lg shadow-md p-6 md:sticky md:top-20 h-fit">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        Administración
      </h2>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href} className="space-y-2">
              <Link
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  isActive(item.href) && !item.submenu
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-indigo-50"
                } transition`}
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
                        className={`flex items-center px-4 py-2 rounded-lg ${
                          pathname === subItem.href
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-600 hover:bg-gray-100"
                        } transition`}
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
