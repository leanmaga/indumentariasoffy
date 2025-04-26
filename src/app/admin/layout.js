import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export const metadata = {
  title: "Panel de Administración | TiendaOnline",
  description: "Gestiona tu tienda en línea de manera eficiente.",
};

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Verificar que el usuario sea admin
  if (!session || session.user.role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />

        <div className="flex-1 overflow-auto">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
