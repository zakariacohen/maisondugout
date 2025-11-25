import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Phone, ShoppingCart, Calendar, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/pages/Index";
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

interface OrderListProps {
  orders: Order[];
  onDeleteOrder: (orderId: string) => void;
  onToggleDelivered: (orderId: string) => void;
}

export const OrderList = ({ orders, onDeleteOrder, onToggleDelivered }: OrderListProps) => {
  const handleDelete = (orderId: string, customerName: string) => {
    onDeleteOrder(orderId);
    toast.success(`Commande de ${customerName} supprimée`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-MA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (orders.length === 0) {
    return (
      <Card className="shadow-lg border-border/50">
        <CardContent className="py-12 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Aucune commande</h3>
          <p className="text-muted-foreground">
            Commencez par ajouter une nouvelle commande
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold text-foreground">
          Mes Commandes
        </h2>
        <Badge variant="secondary" className="px-3 py-1 text-base">
          {orders.length} commande{orders.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {orders.map((order) => (
        <Card key={order.id} className="shadow-md border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex justify-between items-start">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-xl font-serif">{order.customerName}</CardTitle>
                  <Badge 
                    variant={order.delivered ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {order.delivered ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Livrée
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        En attente
                      </>
                    )}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Phone className="w-3.5 h-3.5" />
                  {order.phoneNumber}
                </CardDescription>
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(order.date)}
                </CardDescription>
              </div>
              <div className="flex gap-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={order.delivered 
                        ? "hover:bg-muted text-muted-foreground" 
                        : "hover:bg-primary/10 text-primary"
                      }
                      title={order.delivered ? "Marquer comme non livrée" : "Marquer comme livrée"}
                    >
                      {order.delivered ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {order.delivered ? "Marquer comme non livrée?" : "Confirmer la livraison"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {order.delivered 
                          ? `Voulez-vous marquer la commande de ${order.customerName} comme non livrée?`
                          : `Confirmez-vous que la commande de ${order.customerName} a été livrée?`
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          onToggleDelivered(order.id);
                          toast.success(order.delivered 
                            ? `Commande de ${order.customerName} marquée comme non livrée`
                            : `Commande de ${order.customerName} marquée comme livrée`
                          );
                        }}
                        className={order.delivered 
                          ? "bg-muted hover:bg-muted/90" 
                          : "bg-green-600 hover:bg-green-700"
                        }
                      >
                        {order.delivered ? "Marquer non livrée" : "Confirmer la livraison"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                      <AlertDialogTitle>Supprimer la commande?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer la commande de {order.customerName}? 
                        Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(order.id, order.customerName)}
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
          <CardContent className="pt-4">
            <div className="space-y-2 mb-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex-1">
                    <span className="font-medium text-foreground">{item.product}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      x{item.quantity}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {item.unitPrice.toFixed(2)} Dh × {item.quantity}
                    </div>
                    <div className="font-semibold text-foreground">
                      {item.total.toFixed(2)} Dh
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between items-center bg-primary/5 rounded-lg p-3">
              <span className="text-lg font-semibold text-foreground">Total:</span>
              <span className="text-2xl font-bold text-primary">
                {order.total.toFixed(2)} Dh
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
