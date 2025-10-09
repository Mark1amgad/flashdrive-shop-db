import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { getProducts } from "@/lib/storage";
import { ProductCard } from "@/components/ProductCard";
import { BuyModal } from "@/components/BuyModal";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">
              Product Management System
            </h1>
            <p className="text-sm text-muted-foreground">
              Informatica Project – Don Bosco Institute
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/login")}
            className="border-primary/30 text-primary hover:bg-primary/10 transition-smooth"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Flash Drive Collection</h2>
          <p className="text-muted-foreground text-lg">
            Premium storage solutions for students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onBuyClick={handleBuyClick} />
          ))}
        </div>
      </main>

      <BuyModal product={selectedProduct} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Shop;
