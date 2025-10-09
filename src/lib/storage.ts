import { Product, Purchase } from "@/types/product";

const PRODUCTS_KEY = "flashdrive_products";
const PURCHASES_KEY = "flashdrive_purchases";

// Initial products
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Kingston Flashdrive 16GB",
    price: 120,
    image: "image1.jpg",
  },
  {
    id: "2",
    name: "Kingston Flashdrive 32GB",
    price: 150,
    image: "image2.jpg",
  },
  {
    id: "3",
    name: "Redragon Flashdrive 32GB",
    price: 135,
    image: "image3.jpg",
  },
];

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (!stored) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
    return initialProducts;
  }
  return JSON.parse(stored);
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getPurchases = (): Purchase[] => {
  const stored = localStorage.getItem(PURCHASES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const savePurchase = (purchase: Purchase): void => {
  const purchases = getPurchases();
  purchases.push(purchase);
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
};

export const exportPurchasesToCSV = (): string => {
  const purchases = getPurchases();
  const headers = ["Buyer Name", "Class", "Student Number", "Product Name", "Price", "Date/Time"];
  const rows = purchases.map((p) => [
    p.buyerName,
    p.class,
    p.studentNumber,
    p.productName,
    `${p.price} EGP`,
    p.date,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  return csv;
};
