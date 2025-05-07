// // src/context/CartContext.js - Crea este archivo

// "use client";

// import { createContext, useContext, useState, useEffect } from "react";
// import { toast } from "react-hot-toast";

// // Crear el contexto
// const CartContext = createContext();

// // Proveedor del contexto
// export function CartProvider({ children }) {
//   // Estado para almacenar los items del carrito
//   const [cartItems, setCartItems] = useState([]);
//   const [cartCount, setCartCount] = useState(0);
//   const [cartTotal, setCartTotal] = useState(0);

//   // Cargar carrito desde localStorage al inicio
//   useEffect(() => {
//     try {
//       const storedCart = localStorage.getItem("cart");
//       if (storedCart) {
//         setCartItems(JSON.parse(storedCart));
//       }
//     } catch (error) {
//       console.error("Error al cargar el carrito:", error);
//     }
//   }, []);

//   // Actualizar localStorage y totales cuando cambia el carrito
//   useEffect(() => {
//     try {
//       localStorage.setItem("cart", JSON.stringify(cartItems));

//       // Calcular totales
//       const itemCount = cartItems.reduce(
//         (total, item) => total + item.quantity,
//         0
//       );

//       const totalPrice = cartItems.reduce(
//         (total, item) => total + item.price * item.quantity,
//         0
//       );

//       setCartCount(itemCount);
//       setCartTotal(totalPrice);
//     } catch (error) {
//       console.error("Error al guardar el carrito:", error);
//     }
//   }, [cartItems]);

//   // Añadir un item al carrito
//   const addToCart = (productToAdd) => {
//     // Verificar si el producto ya está en el carrito
//     const existingItem = cartItems.find(
//       (item) =>
//         item.id === productToAdd.id &&
//         // Si hay variantes, comprobar que sean las mismas
//         (!item.variant ||
//           !productToAdd.variant ||
//           item.variant.variantId === productToAdd.variant.variantId)
//     );

//     if (existingItem) {
//       // Actualizar cantidad si ya existe
//       setCartItems(
//         cartItems.map((item) =>
//           item.id === productToAdd.id &&
//           (!item.variant ||
//             !productToAdd.variant ||
//             item.variant.variantId === productToAdd.variant.variantId)
//             ? { ...item, quantity: item.quantity + productToAdd.quantity }
//             : item
//         )
//       );
//     } else {
//       // Agregar nuevo item
//       setCartItems([...cartItems, productToAdd]);
//     }
//   };

//   // Actualizar cantidad de un item
//   const updateItemQuantity = (itemId, variantId, newQuantity) => {
//     if (newQuantity <= 0) {
//       // Si la cantidad es 0 o menos, remover el item
//       removeItem(itemId, variantId);
//       return;
//     }

//     setCartItems(
//       cartItems.map((item) =>
//         item.id === itemId &&
//         (!item.variant || !variantId || item.variant.variantId === variantId)
//           ? { ...item, quantity: newQuantity }
//           : item
//       )
//     );
//   };

//   // Remover un item del carrito
//   const removeItem = (itemId, variantId) => {
//     setCartItems(
//       cartItems.filter(
//         (item) =>
//           item.id !== itemId ||
//           (item.variant && variantId && item.variant.variantId !== variantId)
//       )
//     );
//     toast.success("Producto eliminado del carrito");
//   };

//   // Vaciar el carrito
//   const clearCart = () => {
//     setCartItems([]);
//     toast.success("Carrito vaciado");
//   };

//   // Valores y funciones que expondrá el contexto
//   const value = {
//     cartItems,
//     cartCount,
//     cartTotal,
//     addToCart,
//     updateItemQuantity,
//     removeItem,
//     clearCart,
//   };

//   return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
// }

// // Hook personalizado para usar el contexto
// export function useCart() {
//   const context = useContext(CartContext);

//   if (!context) {
//     throw new Error("useCart debe usarse dentro de un CartProvider");
//   }

//   return context;
// }
