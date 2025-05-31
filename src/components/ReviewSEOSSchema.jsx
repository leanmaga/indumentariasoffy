import React from "react";
import Head from "next/head";

// Componente para generar Rich Snippets de reviews
const ReviewSEOSchema = ({ product, reviews, ratingStats }) => {
  if (!product || !reviews || reviews.length === 0) return null;

  // Filtrar solo calificaciones para el schema
  const ratingReviews = reviews.filter((review) => review.type === "rating");

  if (ratingReviews.length === 0) return null;

  // Estructura de datos para Google Rich Snippets
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: [product.imageUrl],
    description: product.description || product.title,
    sku: product._id,
    brand: {
      "@type": "Brand",
      name: "IndumentariaSoffy", // Cambiar por tu marca
    },
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/products/${product._id}`,
      priceCurrency: "ARS",
      price: product.promoPrice > 0 ? product.promoPrice : product.salePrice,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 días
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "IndumentariaSoffy",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratingStats.average.toFixed(1),
      reviewCount: ratingStats.total,
      bestRating: "5",
      worstRating: "1",
    },
    review: ratingReviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
        worstRating: "1",
      },
      author: {
        "@type": "Person",
        name: review.user?.name || "Usuario Verificado",
      },
      reviewBody: review.comment,
      datePublished: review.createdAt,
      publisher: {
        "@type": "Organization",
        name: "IndumentariaSoffy",
      },
    })),
  };

  // Schema para preguntas frecuentes (FAQ)
  const questions = reviews.filter(
    (review) => review.type === "question" && review.response
  );
  const faqSchema =
    questions.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: questions.slice(0, 10).map((question) => ({
            "@type": "Question",
            name: question.comment,
            acceptedAnswer: {
              "@type": "Answer",
              text: question.response,
            },
          })),
        }
      : null;

  return (
    <Head>
      {/* Rich Snippets para Producto */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />

      {/* Rich Snippets para FAQ si hay preguntas respondidas */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}

      {/* Meta tags adicionales para SEO */}
      <meta property="product:price:amount" content={product.salePrice} />
      <meta property="product:price:currency" content="ARS" />
      <meta
        property="product:availability"
        content={product.stock > 0 ? "in stock" : "out of stock"}
      />
      <meta property="product:condition" content="new" />
      <meta property="product:retailer_item_id" content={product._id} />

      {/* Open Graph para redes sociales */}
      <meta property="og:type" content="product" />
      <meta
        property="og:title"
        content={`${product.title} - ⭐ ${ratingStats.average.toFixed(1)} (${
          ratingStats.total
        } reviews)`}
      />
      <meta
        property="og:description"
        content={`${product.description} | ${
          ratingStats.total
        } clientes lo califican con ${ratingStats.average.toFixed(
          1
        )} estrellas`}
      />
      <meta property="og:image" content={product.imageUrl} />
      <meta property="og:price:amount" content={product.salePrice} />
      <meta property="og:price:currency" content="ARS" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="product" />
      <meta
        name="twitter:title"
        content={`${product.title} - ⭐ ${ratingStats.average.toFixed(1)}`}
      />
      <meta
        name="twitter:description"
        content={`${
          ratingStats.total
        } clientes califican este producto con ${ratingStats.average.toFixed(
          1
        )} estrellas`}
      />
      <meta name="twitter:image" content={product.imageUrl} />
      <meta name="twitter:label1" content="Precio" />
      <meta name="twitter:data1" content={`$${product.salePrice} ARS`} />
      <meta name="twitter:label2" content="Calificación" />
      <meta
        name="twitter:data2"
        content={`⭐ ${ratingStats.average.toFixed(1)} (${
          ratingStats.total
        } reviews)`}
      />
    </Head>
  );
};

// Componente para breadcrumbs SEO-friendly
const ReviewBreadcrumbs = ({ product, category }) => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: process.env.NEXT_PUBLIC_FRONTEND_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category || "Productos",
        item: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/products?category=${category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/products/${product._id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      {/* Breadcrumbs visibles */}
      <nav className="text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/" className="hover:text-indigo-600">
              Inicio
            </a>
          </li>
          <li>
            <span className="mx-2">/</span>
            <a
              href={`/products?category=${category}`}
              className="hover:text-indigo-600"
            >
              {category || "Productos"}
            </a>
          </li>
          <li>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{product.title}</span>
          </li>
        </ol>
      </nav>
    </>
  );
};

// Hook para generar meta tags dinámicos
const useProductSEO = (product, reviews, ratingStats) => {
  const generateMetaTags = () => {
    if (!product) return {};

    const hasReviews = ratingStats.total > 0;
    const avgRating = ratingStats.average;

    return {
      title: hasReviews
        ? `${product.title} - ⭐ ${avgRating.toFixed(1)} (${
            ratingStats.total
          } opiniones) | IndumentariaSoffy`
        : `${product.title} | IndumentariaSoffy`,

      description: hasReviews
        ? `${product.description || product.title} ✅ ${
            ratingStats.total
          } clientes lo recomiendan con ${avgRating.toFixed(
            1
          )} estrellas. Envío gratis. Compra segura.`
        : `${
            product.description || product.title
          } ✅ Envío gratis. Compra segura. IndumentariaSoffy.`,

      keywords: [
        product.title,
        product.category,
        "opiniones",
        "reviews",
        "calificaciones",
        hasReviews ? `${avgRating.toFixed(1)} estrellas` : "",
        "envío gratis",
        "IndumentariaSoffy",
      ]
        .filter(Boolean)
        .join(", "),

      canonical: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/products/${product._id}`,

      robots: product.stock > 0 ? "index, follow" : "index, nofollow",
    };
  };

  return { generateMetaTags };
};

// Componente de página optimizada para SEO
const SEOOptimizedProductPage = ({
  product,
  reviews,
  ratingStats,
  category,
}) => {
  const { generateMetaTags } = useProductSEO(product, reviews, ratingStats);
  const metaTags = generateMetaTags();

  return (
    <>
      <Head>
        {/* Meta tags básicos */}
        <title>{metaTags.title}</title>
        <meta name="description" content={metaTags.description} />
        <meta name="keywords" content={metaTags.keywords} />
        <link rel="canonical" href={metaTags.canonical} />
        <meta name="robots" content={metaTags.robots} />

        {/* Hreflang para internacionalización (si aplica) */}
        <link rel="alternate" hrefLang="es-AR" href={metaTags.canonical} />
        <link rel="alternate" hrefLang="es" href={metaTags.canonical} />

        {/* Preload de imágenes importantes */}
        <link rel="preload" as="image" href={product.imageUrl} />

        {/* DNS prefetch para mejor rendimiento */}
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
      </Head>

      {/* Schemas estructurados */}
      <ReviewSEOSchema
        product={product}
        reviews={reviews}
        ratingStats={ratingStats}
      />

      {/* Breadcrumbs */}
      <ReviewBreadcrumbs product={product} category={category} />

      {/* Contenido de la página */}
      <div className="product-page">{/* Tu contenido existente aquí */}</div>
    </>
  );
};

// Utilidades para generar sitemaps automáticos
const generateProductSitemap = async () => {
  try {
    const products = await fetch("/api/products?limit=1000").then((res) =>
      res.json()
    );

    const sitemapEntries = products
      .map((product) => {
        const priority =
          product.rating > 4 ? "0.9" : product.rating > 3 ? "0.8" : "0.7";
        const changefreq = product.stock > 0 ? "weekly" : "monthly";

        return `
        <url>
          <loc>${process.env.NEXT_PUBLIC_FRONTEND_URL}/products/${
          product._id
        }</loc>
          <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>
          <changefreq>${changefreq}</changefreq>
          <priority>${priority}</priority>
          <image:image>
            <image:loc>${product.imageUrl}</image:loc>
            <image:title>${product.title}</image:title>
          </image:image>
        </url>
      `;
      })
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
              xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
        ${sitemapEntries}
      </urlset>
    `;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return "";
  }
};

export {
  ReviewSEOSchema,
  ReviewBreadcrumbs,
  useProductSEO,
  SEOOptimizedProductPage,
  generateProductSitemap,
};

export default ReviewSEOSchema;
