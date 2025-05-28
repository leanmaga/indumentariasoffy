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
                    14 de julio 2698, Castelar Sur.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider mb-2 font-drop">
                    Teléfono
                  </h3>
                  <p className="text-gray-600 font-drop">+54 9 11 2690-7696</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider mb-2 font-drop">
                    Email
                  </h3>
                  <p className="text-gray-600 font-drop">
                    Sofiaballesta1424@gmail.com
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider mb-4 font-drop">
                    Síguenos
                  </h3>
                  <div className="flex space-x-6">
                    <a
                      href="https://www.instagram.com/indumentaria_soffy?igsh=ZWNqemd2aGM0cWNq"
                      className="text-black hover:text-gray-600 transition"
                      target="_blank"
                      rel="noopener noreferrer"
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

                    <a
                      href="https://wa.me/5491126907696?text=Hola%20quisiera%20saber%20si"
                      className="text-black hover:text-gray-600 transition"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        fill="currentColor"
                        viewBox="0 0 32 32"
                        className="w-5 h-5"
                      >
                        <path d="M16.013 2.007c-7.73 0-14 6.27-14 14 0 2.469.64 4.88 1.858 6.99L2 30l7.18-1.878c2.038 1.124 4.35 1.712 6.832 1.712h.001c7.729 0 14-6.271 14-14s-6.271-14-14-14zm0 25.5c-2.175 0-4.281-.576-6.132-1.666l-.438-.254-4.263 1.115 1.137-4.146-.285-.424c-1.151-1.71-1.759-3.693-1.759-5.73 0-5.798 4.707-10.505 10.505-10.505s10.505 4.707 10.505 10.505-4.707 10.505-10.505 10.505zm5.85-7.838c-.322-.161-1.91-.94-2.205-1.047-.295-.107-.51-.161-.725.161-.214.322-.832 1.047-1.02 1.262-.187.214-.374.242-.696.08-.322-.161-1.36-.5-2.59-1.596-.957-.854-1.603-1.908-1.79-2.23-.187-.322-.02-.495.14-.656.143-.143.322-.374.482-.561.161-.187.214-.322.322-.536.107-.214.053-.401-.027-.561-.08-.161-.725-1.746-.993-2.404-.262-.632-.53-.545-.725-.545l-.619-.013c-.214 0-.561.08-.856.374-.295.295-1.12 1.095-1.12 2.667 0 1.572 1.142 3.09 1.302 3.304.161.214 2.25 3.43 5.447 4.8.762.329 1.356.526 1.82.672.764.244 1.46.21 2.009.128.613-.092 1.91-.778 2.18-1.526.268-.748.268-1.389.188-1.526-.08-.136-.295-.214-.617-.374z" />
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
                  className="w-full bg-indigo-500 hover:bg-white text-white hover:text-black border-2 border-white hover:border-black py-4 px-8 uppercase text-sm tracking-wider font-medium transition disabled:opacity-50 disabled:cursor-not-allowed font-drop mt-8"
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
