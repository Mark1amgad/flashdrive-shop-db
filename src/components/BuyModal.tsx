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
import { z } from "zod";

const orderSchema = z.object({
  buyerName: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  class: z.string()
    .trim()
    .min(1, 'Class is required')
    .max(20, 'Class name too long')
    .regex(/^[0-9]{1,2}[A-Z]?$/, 'Invalid class format (e.g., 10A, 9)'),
  studentNumber: z.string()
    .trim()
    .regex(/^[0-9]+$/, 'Student number must be numeric')
    .min(1, 'Student number required')
    .max(10, 'Invalid student number')
});

const RATE_LIMIT_KEY = 'last_purchase_time';
const MIN_INTERVAL_MS = 60000; // 1 minute between purchases

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

    // Check rate limit
    const lastPurchase = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastPurchase && Date.now() - parseInt(lastPurchase) < MIN_INTERVAL_MS) {
      toast.error('Please wait before making another purchase', {
        description: 'You can make one purchase per minute'
      });
      return;
    }

    setLoading(true);

    try {
      // Validate input data
      const validation = orderSchema.safeParse({
        buyerName,
        class: studentClass,
        studentNumber
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      // First check if user is authenticated, if not, sign in anonymously
      let { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Create anonymous session for purchase
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) throw authError;
        session = authData.session;
      }

      // Insert order into database with validated data
      const { error } = await supabase
        .from("orders")
        .insert({
          buyer_name: validation.data.buyerName,
          class: validation.data.class,
          number: validation.data.studentNumber,
          product_id: parseInt(product.id),
          user_id: session?.user?.id,
        });

      if (error) throw error;
      
      // Update rate limit timestamp
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      
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
              maxLength={100}
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
              maxLength={20}
              className="bg-muted border-border text-foreground"
              placeholder="Enter your class (e.g., 10A)"
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
              maxLength={10}
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