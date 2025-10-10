import { useState } from "react";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    setLoading(true);

    try {
      // First check if user is authenticated, if not, sign in anonymously
      let { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Create anonymous session for purchase
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) throw authError;
        session = authData.session;
      }

      // Insert order into database
      const { error } = await supabase
        .from("orders")
        .insert({
          buyer_name: buyerName,
          class: studentClass,
          number: studentNumber,
          product_id: parseInt(product.id),
        });

      if (error) throw error;
      
      toast.success("Thank you for your purchase!", {
        description: `${product.name} - ${product.price} EGP`,
      });

      // Reset form
      setBuyerName("");
      setStudentClass("");
      setStudentNumber("");
      onClose();
    } catch (error: any) {
      toast.error("Purchase failed: " + error.message);
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan transition-smooth font-semibold"
          >
            {loading ? "Processing..." : "Confirm Purchase"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};