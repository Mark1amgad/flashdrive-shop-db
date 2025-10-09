export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface Purchase {
  id: string;
  buyerName: string;
  class: string;
  studentNumber: string;
  productName: string;
  price: number;
  date: string;
}
