import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductStatistics, useCustomerStatistics } from "@/hooks/useStatistics";
import { Loader2, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Statistics = () => {
  const { data: productStats, isLoading: productsLoading } = useProductStatistics();
  const { data: customerStats, isLoading: customersLoading } = useCustomerStatistics();

  if (productsLoading || customersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const topProducts = productStats?.slice(0, 10) || [];
  const topCustomers = customerStats?.slice(0, 10) || [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Statistiques</h1>
      </div>

      {/* Products Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Produits les Plus Vendus
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune donnée de vente disponible
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">Quantité Vendue</TableHead>
                    <TableHead className="text-right">Revenu Total</TableHead>
                    <TableHead className="text-right">Commandes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.product}>
                      <TableCell>
                        <Badge variant={index < 3 ? "default" : "secondary"}>
                          {index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{product.product}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {product.total_quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.total_revenue.toFixed(2)} DH
                      </TableCell>
                      <TableCell className="text-right">
                        {product.order_count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Clients Fidèles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCustomers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune donnée client disponible
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead className="text-right">Commandes</TableHead>
                    <TableHead className="text-right">Total Dépensé</TableHead>
                    <TableHead className="text-right">Moyenne</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((customer, index) => (
                    <TableRow key={`${customer.customer_name}_${customer.phone_number}`}>
                      <TableCell>
                        <Badge variant={index < 3 ? "default" : "secondary"}>
                          {index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {customer.customer_name}
                      </TableCell>
                      <TableCell>{customer.phone_number}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {customer.order_count}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.total_spent.toFixed(2)} DH
                      </TableCell>
                      <TableCell className="text-right">
                        {(customer.total_spent / customer.order_count).toFixed(2)} DH
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
