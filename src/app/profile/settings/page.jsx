// app/profile/settings/page.jsx
"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  // Manejar cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch("/api/users/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al cambiar la contraseña");
      }

      toast.success("Contraseña actualizada correctamente");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.message || "Error al cambiar la contraseña");
    } finally {
      setChangingPassword(false);
    }
  };

  // Manejar eliminación de cuenta
  const handleDeleteAccount = async () => {
    if (deleteConfirmInput !== session?.user?.email) {
      toast.error("El correo electrónico ingresado no coincide");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/users/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la cuenta");
      }

      toast.success("Cuenta eliminada correctamente");

      // Cerrar sesión
      signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo eliminar la cuenta");
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Configuración de la cuenta</h2>

      {/* Cambiar contraseña */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Cambiar contraseña</h3>

        {session?.user?.googleAuth ? (
          <p className="text-gray-500">
            Tu cuenta está vinculada a Google. No es necesario establecer una
            contraseña.
          </p>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña actual
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Nueva contraseña
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {changingPassword ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </form>
        )}
      </div>

      {/* Opciones de notificaciones */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Notificaciones</h3>

        <div className="space-y-4 max-w-md">
          <div className="flex items-center">
            <input
              id="emailNotifications"
              name="emailNotifications"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="emailNotifications"
              className="ml-3 block text-sm text-gray-700"
            >
              Recibir notificaciones por email
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="promotions"
              name="promotions"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="promotions"
              className="ml-3 block text-sm text-gray-700"
            >
              Recibir promociones y ofertas
            </label>
          </div>
        </div>
      </div>

      {/* Eliminar cuenta */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-4 text-red-600">
          Eliminar cuenta
        </h3>

        {!showDeleteConfirm ? (
          <div>
            <p className="text-gray-500 mb-4">
              Esta acción eliminará permanentemente tu cuenta y todos tus datos.
              Esta acción no se puede deshacer.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Eliminar mi cuenta
            </button>
          </div>
        ) : (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="font-medium text-red-600 mb-4">
              ¿Estás seguro de que deseas eliminar tu cuenta?
            </p>
            <p className="text-gray-700 mb-4">
              Por favor, ingresa tu dirección de correo electrónico (
              <span className="font-medium">{session?.user?.email}</span>) para
              confirmar:
            </p>

            <input
              type="email"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder="Ingresa tu email para confirmar"
              className="mb-4 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />

            <div className="flex space-x-4">
              <button
                onClick={handleDeleteAccount}
                disabled={
                  isDeleting || deleteConfirmInput !== session?.user?.email
                }
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? "Eliminando..." : "Confirmar eliminación"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmInput("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
