import Link from "next/link";
import {
  ShoppingBagIcon,
  TruckIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import FeaturedProducts from "@/components/product/FeaturedProducts";
import Image from "next/image";
import { ButtonContact, ButtonProducts, CTAButton } from "@/components/ui";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen w-full bg-black text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Imagen de fondo */}
          <Image
            src="/images/sexitive1.webp"
            alt="Hero background"
            width={1000}
            height={1000}
            className="object-cover opacity-50"
            priority
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-5xl">
            {/* Texto principal */}
            <h1 className="font-drop font-black uppercase leading-none mb-8">
              <span className="block text-[12vw] xl:text-[10vw] tracking-tighter">
                PRODUCTOS
              </span>
              <span className="block text-[12vw] xl:text-[10vw] tracking-tighter">
                AL MEJOR PRECIO
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-xl md:text-2xl font-medium mb-8 tracking-wider uppercase">
              Calidad garantizada.
            </p>

            {/* CTA Button */}
            <CTAButton />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-sora-bold uppercase text-3xl font-bold text-center mb-12 text-gray-800">
            Categorías Destacadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-indigo-50 rounded-lg p-6 text-center hover:shadow-lg transition">
              <div className="bg-indigo-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-indigo-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Ropa</h3>
              <p className="text-gray-600">
                Lo último en moda para todas las edades.
              </p>
              <Link
                href="/products?category=ropa"
                className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Ver productos
              </Link>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 text-center hover:shadow-lg transition">
              <div className="bg-purple-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-purple-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Electrónica
              </h3>
              <p className="text-gray-600">Tecnología de última generación.</p>
              <Link
                href="/products?category=electronica"
                className="mt-4 inline-block text-purple-600 hover:text-purple-800 font-medium"
              >
                Ver productos
              </Link>
            </div>

            <div className="bg-pink-50 rounded-lg p-6 text-center hover:shadow-lg transition">
              <div className="bg-pink-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-pink-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Hogar
              </h3>
              <p className="text-gray-600">
                Todo para hacer tu hogar más cómodo.
              </p>
              <Link
                href="/products?category=hogar"
                className="mt-4 inline-block text-pink-600 hover:text-pink-800 font-medium"
              >
                Ver productos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-sora-bold uppercase text-3xl font-bold text-center mb-12 text-gray-800">
            Productos Destacados
          </h2>
          <FeaturedProducts />
          <div className="text-center mt-10">
            <ButtonProducts />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-sora-bold uppercase text-3xl font-bold text-center mb-12 text-gray-800">
            ¿Por qué comprar con nosotros?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-black p-4 rounded-full mb-4">
                <ShoppingBagIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-sora-regular uppercase text-xl font-semibold mb-2">
                Gran variedad de productos
              </h3>
              <p className="text-gray-600">
                Encuentra todo lo que necesitas en un solo lugar, con la mejor
                calidad.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-black p-4 rounded-full mb-4">
                <TruckIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-sora-regular uppercase text-xl font-semibold mb-2">
                Coordinación de envíos
              </h3>
              <p className="text-gray-600">
                Enviamos tu pedido a donde estés. Coordinamos contigo el mejor
                método.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-black p-4 rounded-full mb-4">
                <CreditCardIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-sora-regular uppercase text-xl font-semibold mb-2">
                Pagos seguros
              </h3>
              <p className="text-gray-600">
                Utiliza nuestra pasarela de pago con MercadoPago para una compra
                segura.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Tienes preguntas?</h2>
          <p className="text-xl mb-8">
            Estamos aquí para ayudarte con cualquier duda o sugerencia.
          </p>
          <ButtonContact />
        </div>
      </section>
    </>
  );
}
