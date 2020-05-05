import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const listProducts = await AsyncStorage.getItem('@GoMarketplace');
      if (listProducts) {
        setProducts(JSON.parse(listProducts));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const arrProduct = products.map(product => {
        if (id === product.id) {
          const updateProduct = {
            ...product,
            quantity: product.quantity + 1,
          };

          return updateProduct;
        }

        return product;
      });

      setProducts(arrProduct);
      await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(arrProduct));
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productIndex = products.find(p => p.id === product.id);

      if (!productIndex) {
        const newProduct = { ...product, quantity: 1 };

        setProducts([...products, newProduct]);
        await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(products));
      } else {
        increment(product.id);
      }
    },
    [increment, products],
  );

  const decrement = useCallback(
    async id => {
      const newProduct = products.map(product => {
        if (product.id === id) {
          const updateProduct = {
            ...product,
            quantity: product.quantity - 1,
          };

          return updateProduct;
        }

        return product;
      });

      const listProducts = newProduct.filter(p => p.quantity > 0);
      setProducts(listProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace',
        JSON.stringify(listProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
