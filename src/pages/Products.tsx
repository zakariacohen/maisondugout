import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
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
  const [editingProduct, setEditingProduct] = useState<{id: string, name: string, price: number} | null>(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });

  const handleAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const { error } = await supabase
      .from("products")
      .insert([
        { name: newProduct.name.trim(), price: parseFloat(newProduct.price) }
      ]);

    if (error) {
      toast.error("Erreur lors de l'ajout du produit");
      return;
    }

    toast.success("Produit ajouté avec succès");
    setNewProduct({ name: "", price: "" });
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
      .update({ name: editingProduct.name.trim(), price: editingProduct.price })
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">
            Gestion des Produits
          </h2>
          <p className="text-sm text-muted-foreground">
            Gérez votre catalogue de pâtisseries
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
          {products.map((product) => (
            <Card key={product.id} className="shadow-md border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-lg font-semibold text-primary mt-2">
                      {product.price.toFixed(2)} Dh
                    </CardDescription>
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
                            Modifiez les détails du produit
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
                            <Label htmlFor="edit-price">Prix (Dh)</Label>
                            <Input
                              id="edit-price"
                              type="number"
                              step="0.01"
                              value={editingProduct?.price || 0}
                              onChange={(e) => setEditingProduct(editingProduct ? {...editingProduct, price: parseFloat(e.target.value)} : null)}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
