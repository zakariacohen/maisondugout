import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet, PiggyBank } from "lucide-react";
import { Order } from "./Index";

interface DashboardProps {
  orders: Order[];
  isLoading: boolean;
}

interface MonthlyStats {
  month: string;
  year: number;
  total: number;
  benefice: number;
  capital: number;
  ordersCount: number;
}

const Dashboard = ({ orders, isLoading }: DashboardProps) => {
  const monthlyStats = useMemo(() => {
    // Group orders by month and year
    const stats = new Map<string, MonthlyStats>();
    
    orders
      .filter(order => order.delivered) // Only count delivered orders
      .forEach(order => {
        const date = new Date(order.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!stats.has(monthKey)) {
          const monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
          ];
          
          stats.set(monthKey, {
            month: monthNames[date.getMonth()],
            year: date.getFullYear(),
            total: 0,
            benefice: 0,
            capital: 0,
            ordersCount: 0
          });
        }
        
        const monthStats = stats.get(monthKey)!;
        monthStats.total += order.total;
        monthStats.ordersCount += 1;
      });
    
    // Calculate benefice (2/3) and capital (1/3) for each month
    stats.forEach((monthData) => {
      monthData.benefice = (monthData.total * 2) / 3;
      monthData.capital = monthData.total / 3;
    });
    
    // Convert to array and sort by date (newest first)
    return Array.from(stats.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [orders]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="h-8 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Tableau de Bord</h2>
        <p className="text-muted-foreground">Statistiques financières par mois</p>
      </div>

      {monthlyStats.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucune commande livrée pour le moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {monthlyStats.map((stats) => (
            <Card key={stats.key} className="overflow-hidden border-border/50 hover:border-primary/30 transition-all">
              <CardHeader className="bg-gradient-to-r from-secondary to-background border-b border-border/50">
                <CardTitle className="text-xl font-serif flex items-center justify-between">
                  <span>{stats.month} {stats.year}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {stats.ordersCount} commande{stats.ordersCount > 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                    <div className="p-3 rounded-full bg-primary/10">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Total</p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.total.toFixed(2)} DH
                      </p>
                    </div>
                  </div>

                  {/* Bénéfice (2/3) */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
                    <div className="p-3 rounded-full bg-accent/10">
                      <Wallet className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Bénéfice</p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.benefice.toFixed(2)} DH
                      </p>
                      <p className="text-xs text-muted-foreground">2/3 du total</p>
                    </div>
                  </div>

                  {/* Capital (1/3) */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-secondary to-secondary/50 border border-border">
                    <div className="p-3 rounded-full bg-muted">
                      <PiggyBank className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Capital</p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.capital.toFixed(2)} DH
                      </p>
                      <p className="text-xs text-muted-foreground">1/3 du total</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
