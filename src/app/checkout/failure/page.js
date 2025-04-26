"use client";

import Link from "next/link";
import { XCircleIcon } from "@heroicons/react/24/outline";

export default function CheckoutFailurePage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-6">
            <XCircleIcon className="h-10 w-10 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Error en el Pago
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Hubo un problema al procesar tu pago.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-600 mb-2">
              El cargo no ha sido procesado y no se te ha cobrado.
            </p>
            <p className="text-gray-600">
              Por favor, intenta nuevamente con otro método de pago o contacta a
              tu banco si el problema persiste.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link
              href="/checkout"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Intentar Nuevamente
            </Link>

            <Link
              href="/contact"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Contactar Soporte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
