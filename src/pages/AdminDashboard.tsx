import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product, Purchase } from "@/types/product";
import { getProducts, saveProducts, getPurchases, exportPurchasesToCSV } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { LogOut, Download, Plus, Edit, Trash2, DollarSign, ShoppingBag } from "lucide-react";

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", price: 0, image: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      navigate("/admin/login");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = () => {
    setProducts(getProducts());
    setPurchases(getPurchases());
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const handleExportCSV = () => {
    const csv = exportPurchasesToCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchases_${new Date().toISOString()}.csv`;
    a.click();
    toast.success("CSV exported successfully");
  };

  const handleAddProduct = () => {
    if (!productForm.name || !productForm.price) {
      toast.error("Please fill all fields");
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: productForm.name,
      price: productForm.price,
      image: productForm.image || "placeholder.jpg",
    };

    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    setIsAddingProduct(false);
    setProductForm({ name: "", price: 0, image: "" });
    toast.success("Product added successfully");
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;

    const updatedProducts = products.map((p) =>
      p.id === editingProduct.id ? editingProduct : p
    );
    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    setEditingProduct(null);
    toast.success("Product updated successfully");
  };

  const handleDeleteProduct = (id: string) => {
    const updatedProducts = products.filter((p) => p.id !== id);
    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    toast.success("Product deleted successfully");
  };

  const totalRevenue = purchases.reduce((sum, p) => sum + p.price, 0);
  const productStats = products.map((product) => ({
    name: product.name,
    count: purchases.filter((p) => p.productName === product.name).length,
  }));

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Product & Sales Management</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Sales Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Revenue</p>
                <p className="text-4xl font-bold text-primary">{totalRevenue} EGP</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-full">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Purchases</p>
                <p className="text-4xl font-bold text-secondary">{purchases.length}</p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-full">
                <ShoppingBag className="w-8 h-8 text-secondary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Product Sales Stats */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Sales by Product</h2>
          <div className="space-y-3">
            {productStats.map((stat) => (
              <div key={stat.name} className="flex justify-between items-center">
                <span className="text-foreground">{stat.name}</span>
                <span className="text-primary font-semibold">{stat.count} sales</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Product Management */}
        <Card className="p-6 bg-card border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">Product Management</h2>
            <Button
              onClick={() => setIsAddingProduct(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-background rounded overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-primary font-bold">{product.price} EGP</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProduct(product)}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Purchase History */}
        <Card className="p-6 bg-card border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">Purchase History</h2>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-foreground">Buyer Name</TableHead>
                  <TableHead className="text-foreground">Class</TableHead>
                  <TableHead className="text-foreground">Student Number</TableHead>
                  <TableHead className="text-foreground">Product</TableHead>
                  <TableHead className="text-foreground">Price</TableHead>
                  <TableHead className="text-foreground">Date/Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id} className="border-border hover:bg-muted/50">
                    <TableCell className="text-foreground">{purchase.buyerName}</TableCell>
                    <TableCell className="text-foreground">{purchase.class}</TableCell>
                    <TableCell className="text-foreground">{purchase.studentNumber}</TableCell>
                    <TableCell className="text-foreground">{purchase.productName}</TableCell>
                    <TableCell className="text-primary font-semibold">{purchase.price} EGP</TableCell>
                    <TableCell className="text-muted-foreground">{purchase.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      {/* Add Product Modal */}
      <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-foreground">Product Name</Label>
              <Input
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="bg-muted border-border text-foreground"
                placeholder="e.g., SanDisk Flashdrive 64GB"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Price (EGP)</Label>
              <Input
                type="number"
                value={productForm.price || ""}
                onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                className="bg-muted border-border text-foreground"
                placeholder="e.g., 200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Image filename</Label>
              <Input
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                className="bg-muted border-border text-foreground"
                placeholder="e.g., image4.jpg"
              />
            </div>
            <Button
              onClick={handleAddProduct}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-foreground">Product Name</Label>
                <Input
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="bg-muted border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Price (EGP)</Label>
                <Input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                  }
                  className="bg-muted border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Image filename</Label>
                <Input
                  value={editingProduct.image}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, image: e.target.value })
                  }
                  className="bg-muted border-border text-foreground"
                />
              </div>
              <Button
                onClick={handleEditProduct}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
