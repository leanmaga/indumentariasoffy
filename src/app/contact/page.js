"use client";

import { useState } from "react";
import { useForm as useReactHookForm } from "react-hook-form";
import { useForm as useFormspree, ValidationError } from "@formspree/react";

export default function ContactPage() {
  // Reemplaza "xjvdrgba" con tu ID de formulario de Formspree
  const [formspreeState, handleFormspreeSubmit] = useFormspree("xjvdrgba");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useReactHookForm();

  // Mostrar mensaje de éxito cuando el formulario se envía correctamente
  if (formspreeState.succeeded) {
    return (
      <div className="min-h-screen bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <svg
              className="w-16 h-16 text-black mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="text-xl font-medium uppercase tracking-wider mb-2 font-drop">
              Gracias por tu mensaje
            </h2>
            <p className="text-gray-600 mb-8 font-drop">
              Nos pondremos en contacto contigo lo antes posible.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="border border-black text-black px-8 py-3 uppercase text-sm tracking-wider font-medium hover:bg-black hover:text-white transition font-drop"
            >
              Enviar otro mensaje
            </button>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
  };

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-medium uppercase tracking-wider mb-16 text-center font-drop">
          Contacto
        </h1>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-24">
            {/* Información de Contacto */}
            <div>
              <h2 className="text-xl font-medium uppercase tracking-wider mb-8 font-drop">
                Información
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider mb-2 font-drop">
                    Dirección
                  </h3>
                  <p className="text-gray-600 font-drop">
                    Av. Principal 123, Ciudad
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider mb-2 font-drop">
                    Teléfono
                  </h3>
                  <p className="text-gray-600 font-drop">+1 234 567 890</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider mb-2 font-drop">
                    Email
                  </h3>
                  <p className="text-gray-600 font-drop">
                    contacto@tiendaonline.com
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider mb-4 font-drop">
                    Síguenos
                  </h3>
                  <div className="flex space-x-6">
                    <a
                      href="#"
                      className="text-black hover:text-gray-600 transition"
                    >
                      <svg
                        fill="currentColor"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="text-black hover:text-gray-600 transition"
                    >
                      <svg
                        fill="currentColor"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="text-black hover:text-gray-600 transition"
                    >
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          width="20"
                          height="20"
                          x="2"
                          y="2"
                          rx="5"
                          ry="5"
                        />
                        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div>
              <h2 className="text-xl font-medium uppercase tracking-wider mb-8 font-drop">
                Envía un mensaje
              </h2>

              <form onSubmit={handleFormspreeSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium uppercase tracking-wider mb-2 font-drop"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:outline-none focus:border-black transition font-drop"
                    required
                  />
                  <ValidationError
                    prefix="Name"
                    field="name"
                    errors={formspreeState.errors}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium uppercase tracking-wider mb-2 font-drop"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:outline-none focus:border-black transition font-drop"
                    required
                  />
                  <ValidationError
                    prefix="Email"
                    field="email"
                    errors={formspreeState.errors}
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium uppercase tracking-wider mb-2 font-drop"
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:outline-none focus:border-black transition resize-none font-drop"
                    required
                  />
                  <ValidationError
                    prefix="Message"
                    field="message"
                    errors={formspreeState.errors}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black hover:bg-white text-white hover:text-black border-2 border-white hover:border-black py-4 px-8 uppercase text-sm tracking-wider font-medium transition disabled:opacity-50 disabled:cursor-not-allowed font-drop mt-8"
                  disabled={formspreeState.submitting}
                >
                  {formspreeState.submitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    "Enviar mensaje"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
