import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Package, Loader2, AlertTriangle, icons, LucideIcon } from "lucide-react";
import { IconSelector } from "@/components/IconSelector";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Products = () => {
  const { data: products, isLoading } = useProducts();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{
    id: string;
    name: string;
    price: number;
    stock: number;
    stock_alert_threshold: number;
    icon: string;
    category: string;
  } | null>(null);
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    price: "", 
    stock: "0", 
    stock_alert_threshold: "10",
    icon: "Package",
    category: "normal"
  });

  // Get low stock products
  const lowStockProducts = products?.filter(p => p.stock <= p.stock_alert_threshold) || [];

  const handleAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const { error } = await supabase
      .from("products")
      .insert([
        { 
          name: newProduct.name.trim(), 
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock) || 0,
          stock_alert_threshold: parseInt(newProduct.stock_alert_threshold) || 10,
          icon: newProduct.icon || "Package",
          category: newProduct.category
        }
      ]);

    if (error) {
      toast.error("Erreur lors de l'ajout du produit");
      return;
    }

    toast.success("Produit ajouté avec succès");
    setNewProduct({ name: "", price: "", stock: "0", stock_alert_threshold: "10", icon: "Package", category: "normal" });
    setIsAddDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !editingProduct.name.trim() || !editingProduct.price) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({ 
        name: editingProduct.name.trim(), 
        price: editingProduct.price,
        stock: editingProduct.stock,
        stock_alert_threshold: editingProduct.stock_alert_threshold,
        icon: editingProduct.icon || "Package",
        category: editingProduct.category
      })
      .eq("id", editingProduct.id);

    if (error) {
      toast.error("Erreur lors de la modification du produit");
      return;
    }

    toast.success("Produit modifié avec succès");
    setEditingProduct(null);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression du produit");
      return;
    }

    toast.success(`Produit "${name}" supprimé`);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold">Alerte Stock Bas!</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              {lowStockProducts.length} produit(s) nécessitent un réapprovisionnement:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {lowStockProducts.map(product => (
                <li key={product.id} className="font-medium">
                  {product.name}: <span className="font-bold">{product.stock}</span> unité(s) 
                  (seuil: {product.stock_alert_threshold})
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">
            Gestion des Produits
          </h2>
          <p className="text-sm text-muted-foreground">
            Gérez votre catalogue et vos stocks de pâtisseries
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Produit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau produit</DialogTitle>
              <DialogDescription>
                Entrez les détails du nouveau produit
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ex: Croissant au beurre"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icône</Label>
                <IconSelector
                  value={newProduct.icon}
                  onSelect={(iconName) => setNewProduct({ ...newProduct, icon: iconName })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prix (Dh)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="Ex: 5.50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Produit Normal</SelectItem>
                    <SelectItem value="ramadan">Produit Ramadan 🌙</SelectItem>
                    <SelectItem value="traiteur">Service Traiteur 🍽️</SelectItem>
                    <SelectItem value="both">Les Deux (Normal + Ramadan) 🌟</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Initial</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  placeholder="Ex: 50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Seuil d'Alerte Stock</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={newProduct.stock_alert_threshold}
                  onChange={(e) => setNewProduct({ ...newProduct, stock_alert_threshold: e.target.value })}
                  placeholder="Ex: 10"
                />
                <p className="text-xs text-muted-foreground">
                  Vous serez alerté quand le stock atteint ce niveau
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddProduct}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!products || products.length === 0 ? (
        <Card className="shadow-lg border-border/50">
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucun produit</h3>
            <p className="text-muted-foreground">
              Commencez par ajouter vos premiers produits
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const isLowStock = product.stock <= product.stock_alert_threshold;
            const isOutOfStock = product.stock === 0;
            
            return (
              <Card 
                key={product.id} 
                className={`shadow-md border-border/50 ${
                  isOutOfStock ? 'border-2 border-destructive' : 
                  isLowStock ? 'border-2 border-yellow-500' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {(() => {
                          const IconComponent = (icons[product.icon as keyof typeof icons] || Package) as LucideIcon;
                          return <IconComponent className="w-5 h-5 text-primary" />;
                        })()}
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {product.category === "ramadan" && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                            🌙 Ramadan
                          </Badge>
                        )}
                        {product.category === "traiteur" && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                            🍽️ Traiteur
                          </Badge>
                        )}
                        {product.category === "both" && (
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                            🌟 Les Deux
                          </Badge>
                        )}
                        {isOutOfStock && (
                          <Badge variant="destructive" className="text-xs">
                            Rupture
                          </Badge>
                        )}
                        {isLowStock && !isOutOfStock && (
                          <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                            Stock Bas
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-lg font-semibold text-primary">
                        {product.price.toFixed(2)} Dh
                      </CardDescription>
                      <div className="mt-3 space-y-1">
                        <p className={`text-sm font-medium ${
                          isOutOfStock ? 'text-destructive' : 
                          isLowStock ? 'text-yellow-600' : 
                          'text-foreground'
                        }`}>
                          Stock: <span className="font-bold">{product.stock}</span> unités
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Seuil d'alerte: {product.stock_alert_threshold}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Dialog open={editingProduct?.id === product.id} onOpenChange={(open) => {
                        if (!open) setEditingProduct(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingProduct(product)}
                            className="hover:bg-primary/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier le produit</DialogTitle>
                            <DialogDescription>
                              Modifiez les détails du produit et son stock
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Nom du produit</Label>
                              <Input
                                id="edit-name"
                                value={editingProduct?.name || ""}
                                onChange={(e) => setEditingProduct(editingProduct ? {...editingProduct, name: e.target.value} : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-icon">Icône</Label>
                              <IconSelector
                                value={editingProduct?.icon || "Package"}
                                onSelect={(iconName) => setEditingProduct(editingProduct ? {...editingProduct, icon: iconName} : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-price">Prix (Dh)</Label>
                              <Input
                                id="edit-price"
                                type="number"
                                step="0.01"
                                value={editingProduct?.price || 0}
                                onChange={(e) => setEditingProduct(editingProduct ? {...editingProduct, price: parseFloat(e.target.value)} : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-category">Catégorie</Label>
                              <Select
                                value={editingProduct?.category || "normal"}
                                onValueChange={(value) => setEditingProduct(editingProduct ? {...editingProduct, category: value} : null)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Produit Normal</SelectItem>
                                  <SelectItem value="ramadan">Produit Ramadan 🌙</SelectItem>
                                  <SelectItem value="traiteur">Service Traiteur 🍽️</SelectItem>
                                  <SelectItem value="both">Les Deux (Normal + Ramadan) 🌟</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-stock">Stock</Label>
                              <Input
                                id="edit-stock"
                                type="number"
                                value={editingProduct?.stock || 0}
                                onChange={(e) => setEditingProduct(editingProduct ? {...editingProduct, stock: parseInt(e.target.value)} : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-threshold">Seuil d'Alerte Stock</Label>
                              <Input
                                id="edit-threshold"
                                type="number"
                                value={editingProduct?.stock_alert_threshold || 10}
                                onChange={(e) => setEditingProduct(editingProduct ? {...editingProduct, stock_alert_threshold: parseInt(e.target.value)} : null)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingProduct(null)}>
                              Annuler
                            </Button>
                            <Button onClick={handleUpdateProduct}>Modifier</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le produit?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer "{product.name}"? 
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;
