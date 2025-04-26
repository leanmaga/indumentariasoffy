import { getAllUsers } from "@/lib/data";
import UserTable from "@/components/admin/UserTable";

export const metadata = {
  title: "Gestión de Usuarios | TiendaOnline",
  description: "Administra los usuarios de tu tienda en línea.",
};

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Gestión de Usuarios</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <UserTable users={users} />
      </div>
    </div>
  );
}
