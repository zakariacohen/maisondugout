import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Order } from "@/pages/Index";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderCalendarProps {
  orders: Order[];
  isLoading: boolean;
}

export const OrderCalendar = ({ orders, isLoading }: OrderCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showOrdersDialog, setShowOrdersDialog] = useState(false);
  const [showPendingOrdersDialog, setShowPendingOrdersDialog] = useState(false);

  // Get orders for selected date (delivery date or creation date if no delivery date)
  const getOrdersForDate = (date: Date) => {
    return orders.filter((order) => {
      const orderDate = order.deliveryDate 
        ? new Date(order.deliveryDate) 
        : new Date(order.date);
      return isSameDay(orderDate, date);
    });
  };

  // Calculate total for a date
  const getTotalForDate = (date: Date) => {
    const dateOrders = getOrdersForDate(date);
    return dateOrders.reduce((sum, order) => sum + order.total, 0);
  };

  // Get all dates that have orders (delivery date or creation date)
  const datesWithOrders = orders.map((order) => 
    order.deliveryDate ? new Date(order.deliveryDate) : new Date(order.date)
  );

  // Calculate monthly total for selected date's month
  const getMonthlyTotal = (date: Date) => {
    return orders
      .filter((order) => {
        const orderDate = order.deliveryDate 
          ? new Date(order.deliveryDate) 
          : new Date(order.date);
        return isSameMonth(orderDate, date);
      })
      .reduce((sum, order) => sum + order.total, 0);
  };

  // Calculate monthly stats
  const monthlyTotal = selectedDate ? getMonthlyTotal(selectedDate) : 0;
  const monthlyOrders = selectedDate ? orders.filter((order) => {
    const orderDate = order.deliveryDate 
      ? new Date(order.deliveryDate) 
      : new Date(order.date);
    return isSameMonth(orderDate, selectedDate);
  }) : [];
  const monthlyDelivered = monthlyOrders.filter(o => o.delivered).length;
  const monthlyPending = monthlyOrders.filter(o => !o.delivered).length;

  // Calculate stats for selected date
  const selectedDateOrders = selectedDate ? getOrdersForDate(selectedDate) : [];
  const pendingOrders = selectedDateOrders.filter((o) => !o.delivered);
  const deliveredOrders = selectedDateOrders.filter((o) => o.delivered);
  const dailyTotal = selectedDate ? getTotalForDate(selectedDate) : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Summary */}
      {selectedDate && (
        <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
          <CardHeader>
            <CardTitle className="text-lg font-serif">
              Résumé - {format(selectedDate, "MMMM yyyy", { locale: fr })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-card/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total du mois</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {monthlyTotal.toFixed(2)} DH
                </p>
              </div>
              <div className="text-center p-4 bg-card/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Commandes livrées</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">
                  {monthlyDelivered}
                </p>
              </div>
              <div 
                className="text-center p-4 bg-card/50 rounded-lg cursor-pointer hover:bg-card/80 transition-colors"
                onClick={() => setShowPendingOrdersDialog(true)}
              >
                <p className="text-sm text-muted-foreground mb-1">En attente</p>
                <p className="text-2xl md:text-3xl font-bold text-destructive">
                  {monthlyPending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">Calendrier des Commandes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row gap-6">
          {/* Calendar */}
          <div className="flex-1 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={fr}
              modifiers={{
                hasOrders: datesWithOrders,
              }}
              modifiersStyles={{
                hasOrders: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                  color: "hsl(var(--primary))",
                },
              }}
              className="rounded-md border"
            />
          </div>

          {/* Selected Date Info */}
          <div className="flex-1 space-y-4">
            {selectedDate ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                  </h3>
                  {selectedDateOrders.length === 0 ? (
                    <p className="text-muted-foreground">Aucune commande pour ce jour</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="text-destructive border-destructive">
                          En attente: {pendingOrders.length}
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Livrées: {deliveredOrders.length}
                        </Badge>
                      </div>

                      <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Total du jour</p>
                            <p className="text-3xl font-bold text-primary">
                              {dailyTotal.toFixed(2)} DH
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Button
                        onClick={() => setShowOrdersDialog(true)}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir les commandes
                      </Button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Sélectionnez une date</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily Orders Dialog */}
      <Dialog open={showOrdersDialog} onOpenChange={setShowOrdersDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Commandes du {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: fr })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDateOrders.map((order) => (
              <Card
                key={order.id}
                className={order.delivered ? "border-green-500/50" : "border-destructive/50"}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{order.customerName}</h4>
                      <p className="text-sm text-muted-foreground">{order.phoneNumber}</p>
                    </div>
                    <Badge variant={order.delivered ? "default" : "destructive"}>
                      {order.delivered ? "Livrée" : "En attente"}
                    </Badge>
                  </div>
                  <div className="space-y-1 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm flex justify-between">
                        <span>
                          {item.product} x{item.quantity}
                        </span>
                        <span className="font-medium">{item.total.toFixed(2)} DH</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold text-primary">
                      {order.total.toFixed(2)} DH
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Monthly Pending Orders Dialog */}
      <Dialog open={showPendingOrdersDialog} onOpenChange={setShowPendingOrdersDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Commandes en attente - {selectedDate && format(selectedDate, "MMMM yyyy", { locale: fr })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {monthlyOrders
              .filter(order => !order.delivered)
              .sort((a, b) => {
                const dateA = a.deliveryDate ? new Date(a.deliveryDate) : new Date(a.date);
                const dateB = b.deliveryDate ? new Date(b.deliveryDate) : new Date(b.date);
                return dateA.getTime() - dateB.getTime();
              })
              .map((order) => (
                <Card
                  key={order.id}
                  className="border-destructive/50"
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{order.customerName}</h4>
                        <p className="text-sm text-muted-foreground">{order.phoneNumber}</p>
                        {order.deliveryDate && (
                          <p className="text-xs text-primary mt-1">
                            Livraison: {format(new Date(order.deliveryDate), "d MMMM yyyy", { locale: fr })}
                          </p>
                        )}
                      </div>
                      <Badge variant="destructive">
                        En attente
                      </Badge>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm flex justify-between">
                          <span>
                            {item.product} x{item.quantity}
                          </span>
                          <span className="font-medium">{item.total.toFixed(2)} DH</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold text-primary">
                        {order.total.toFixed(2)} DH
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
