import { useState } from "react";
import { Product, Purchase } from "@/types/product";
import { savePurchase } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface BuyModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export const BuyModal = ({ product, open, onClose }: BuyModalProps) => {
  const [buyerName, setBuyerName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentNumber, setStudentNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    const purchase: Purchase = {
      id: Date.now().toString(),
      buyerName,
      class: studentClass,
      studentNumber,
      productName: product.name,
      price: product.price,
      date: new Date().toLocaleString(),
    };

    savePurchase(purchase);
    
    toast.success("Thank you for your purchase!", {
      description: `${product.name} - ${product.price} EGP`,
    });

    // Reset form
    setBuyerName("");
    setStudentClass("");
    setStudentNumber("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">Complete Your Purchase</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {product && `${product.name} - ${product.price} EGP`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="buyerName" className="text-foreground">
              Full Name
            </Label>
            <Input
              id="buyerName"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              required
              className="bg-muted border-border text-foreground"
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class" className="text-foreground">
              Class
            </Label>
            <Input
              id="class"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              required
              className="bg-muted border-border text-foreground"
              placeholder="Enter your class"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentNumber" className="text-foreground">
              Student Number in Class
            </Label>
            <Input
              id="studentNumber"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              required
              className="bg-muted border-border text-foreground"
              placeholder="Enter your number"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan transition-smooth font-semibold"
          >
            Confirm Purchase
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
