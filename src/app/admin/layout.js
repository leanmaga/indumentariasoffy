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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <AdminSidebar />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
