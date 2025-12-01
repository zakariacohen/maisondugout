import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Phone, ShoppingCart, Calendar, CheckCircle2, Clock, MessageCircle, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/pages/Index";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
  onToggleDelivered: (orderId: string, currentStatus: boolean) => void;
  onEditOrder: (order: Order) => void;
  isLoading?: boolean;
  title?: string;
}

export const OrderList = ({ orders, onDeleteOrder, onToggleDelivered, onEditOrder, isLoading, title = "Mes Commandes" }: OrderListProps) => {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
  const isUrgentOrder = (order: Order) => {
    if (order.delivered || !order.deliveryDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deliveryDate = new Date(order.deliveryDate);
    deliveryDate.setHours(0, 0, 0, 0);
    
    return deliveryDate <= today;
  };
  
  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };
  
  const handleDelete = (orderId: string, customerName: string) => {
    onDeleteOrder(orderId);
    toast.success(`Commande de ${customerName} supprimée`);
  };

  const handleShareWhatsApp = (order: Order) => {
    // Format the order details for WhatsApp
    let message = `*Commande - ${order.customerName}*\n\n`;
    message += `📋 *Détails de la commande:*\n\n`;
    
    order.items.forEach((item, index) => {
      message += `${index + 1}. ${item.product}\n`;
      message += `   Qté: ${item.quantity} x ${item.unitPrice.toFixed(2)} Dh\n`;
      message += `   Total: ${item.total.toFixed(2)} Dh\n\n`;
    });
    
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `*TOTAL: ${order.total.toFixed(2)} Dh*\n\n`;
    message += `📞 Merci de nous contacter pour confirmer votre commande!\n`;
    message += `*Maison du Goût*`;

    // Clean phone number and create WhatsApp link
    const phoneNumber = order.phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/212${phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success("Message WhatsApp préparé");
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

  if (isLoading) {
    return (
      <Card className="shadow-lg border-border/50">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement des commandes...</p>
        </CardContent>
      </Card>
    );
  }

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
          {title}
        </h2>
        <Badge variant="secondary" className="px-3 py-1 text-base">
          {orders.length} commande{orders.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {orders.map((order) => {
        const isUrgent = isUrgentOrder(order);
        return (
        <Card 
          key={order.id} 
          className={`shadow-md border-border/50 hover:shadow-lg transition-shadow ${
            isUrgent ? 'border-2 border-destructive bg-destructive/5' : ''
          }`}
        >
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex justify-between items-start">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <CardTitle className="text-xl font-serif">{order.customerName}</CardTitle>
                  {isUrgent && (
                    <Badge 
                      variant="destructive"
                      className="flex items-center gap-1 animate-pulse"
                    >
                      ⚠️ URGENT
                    </Badge>
                  )}
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
                {order.deliveryDate && (
                  <CardDescription className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <Calendar className="w-3.5 h-3.5" />
                    Livraison: {format(order.deliveryDate, "dd MMM yyyy", { locale: fr })}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleShareWhatsApp(order)}
                  className="hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/20"
                  title="Partager sur WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditOrder(order)}
                  className="hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20"
                  title="Modifier"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
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
                          const wasDelivered = order.delivered;
                          onToggleDelivered(order.id, order.delivered);
                          toast.success(wasDelivered 
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
            {(() => {
              const isExpanded = expandedOrders.has(order.id);
              const hasManyItems = order.items.length > 1;
              const visibleItems = !hasManyItems || isExpanded
                ? order.items
                : order.items.slice(0, 1);

              return (
                <div className="space-y-3">
                  {/* Liste des produits visibles */}
                  <div className="space-y-2 mb-2">
                    {visibleItems.map((item, index) => (
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

                  {/* Bouton plus / masquer si plus de 1 produit */}
                  {hasManyItems && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleOrderExpanded(order.id)}
                      className="w-full hover:bg-muted/50 border border-dashed border-border"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Masquer
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          +{order.items.length - 1} autre
                          {order.items.length - 1 > 1 ? 's' : ''} produit
                          {order.items.length - 1 > 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  )}

                  <div className="border-t pt-3 flex justify-between items-center bg-primary/5 rounded-lg p-3">
                    <span className="text-lg font-semibold text-foreground">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      {order.total.toFixed(2)} Dh
                    </span>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
};
