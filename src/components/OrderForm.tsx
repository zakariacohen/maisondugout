import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Order, OrderItem } from "@/pages/Index";
import { useProducts } from "@/hooks/useProducts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderFormProps {
  onAddOrder: (order: Order) => void;
  onUpdateOrder?: (order: Order) => void;
  editingOrder?: Order | null;
  onCancelEdit?: () => void;
}

export const OrderForm = ({ onAddOrder, onUpdateOrder, editingOrder, onCancelEdit }: OrderFormProps) => {
  const { data: products, isLoading } = useProducts();
  const [customerName, setCustomerName] = useState(editingOrder?.customerName || "");
  const [phoneNumber, setPhoneNumber] = useState(editingOrder?.phoneNumber || "");
  const [items, setItems] = useState<OrderItem[]>(
    editingOrder?.items || [{ product: "", quantity: 1, unitPrice: 0, total: 0 }]
  );

  // Update form when editingOrder changes
  useEffect(() => {
    if (editingOrder) {
      setCustomerName(editingOrder.customerName);
      setPhoneNumber(editingOrder.phoneNumber);
      setItems(editingOrder.items);
    } else {
      setCustomerName("");
      setPhoneNumber("");
      setItems([{ product: "", quantity: 1, unitPrice: 0, total: 0 }]);
    }
  }, [editingOrder]);

  const addItem = () => {
    setItems([...items, { product: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate total for this item
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        product: product.name,
        unitPrice: product.price,
        total: newItems[index].quantity * product.price,
      };
      setItems(newItems);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim() || !phoneNumber.trim()) {
      toast.error("Veuillez remplir tous les champs client");
      return;
    }

    if (items.some(item => !item.product.trim() || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error("Veuillez remplir tous les produits correctement");
      return;
    }

    const order: Order = {
      id: editingOrder?.id || "",
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      items: items.map(item => ({
        ...item,
        product: item.product.trim(),
      })),
      total: calculateTotal(),
      date: editingOrder?.date || new Date(),
      delivered: editingOrder?.delivered || false,
      deliveryImageUrl: editingOrder?.deliveryImageUrl,
    };

    if (editingOrder && onUpdateOrder) {
      onUpdateOrder(order);
    } else {
      onAddOrder(order);
    }
    
    // Reset form
    setCustomerName("");
    setPhoneNumber("");
    setItems([{ product: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <div>
            <CardTitle className="text-xl font-serif">
              {editingOrder ? "Modifier la Commande" : "Nouvelle Commande"}
            </CardTitle>
            <CardDescription>
              {editingOrder ? "Modifiez les détails de la commande" : "Ajoutez les détails de la commande"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">
                1
              </span>
              Informations Client
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nom du Client</Label>
                <Input
                  id="customerName"
                  placeholder="Ex: Ahmed Alami"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="transition-all focus:shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Numéro de Téléphone</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Ex: 0612345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="transition-all focus:shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">
                  2
                </span>
                Produits
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="hover:bg-primary/5"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <Card key={index} className="border-border/50 bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 sm:col-span-5">
                        <Label className="text-xs">Produit</Label>
                        {isLoading ? (
                          <div className="mt-1 h-9 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        ) : (
                          <Select onValueChange={(value) => selectProduct(index, value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Choisir un produit">
                                {item.product || "Choisir un produit"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {products?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - {product.price.toFixed(2)} Dh
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <Label className="text-xs">Qté</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <Label className="text-xs">Prix</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <Label className="text-xs">Total</Label>
                        <div className="mt-1 h-9 flex items-center font-semibold text-sm text-primary">
                          {item.total.toFixed(2)} Dh
                        </div>
                      </div>
                      <div className="col-span-1 flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">Total Commande:</span>
              <span className="text-2xl font-bold text-primary">{calculateTotal().toFixed(2)} Dh</span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2">
            {editingOrder && onCancelEdit && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancelEdit}
                className="flex-1"
                size="lg"
              >
                Annuler
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {editingOrder ? "Mettre à jour" : "Enregistrer la Commande"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
