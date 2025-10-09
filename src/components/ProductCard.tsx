import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProductCardProps {
  product: Product;
  onBuyClick: (product: Product) => void;
}

export const ProductCard = ({ product, onBuyClick }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden border-border bg-card hover:border-primary transition-smooth group">
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
        />
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">{product.name}</h3>
          <p className="text-3xl font-bold text-primary">{product.price} EGP</p>
        </div>
        <Button
          onClick={() => onBuyClick(product)}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan transition-smooth font-semibold"
        >
          Buy Now
        </Button>
      </div>
    </Card>
  );
};
