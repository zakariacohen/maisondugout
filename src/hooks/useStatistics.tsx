import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductStats {
  product: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
}

export interface CustomerStats {
  customer_name: string;
  phone_number: string;
  order_count: number;
  total_spent: number;
  last_order_date: string;
}

export const useProductStatistics = () => {
  return useQuery({
    queryKey: ["product-statistics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("product, quantity, total");

      if (error) throw error;

      // Aggregate by product
      const productMap = new Map<string, ProductStats>();
      
      data.forEach((item) => {
        const existing = productMap.get(item.product) || {
          product: item.product,
          total_quantity: 0,
          total_revenue: 0,
          order_count: 0,
        };
        
        existing.total_quantity += item.quantity;
        existing.total_revenue += Number(item.total);
        existing.order_count += 1;
        
        productMap.set(item.product, existing);
      });

      const stats = Array.from(productMap.values());
      return stats.sort((a, b) => b.total_quantity - a.total_quantity);
    },
  });
};

export const useCustomerStatistics = () => {
  return useQuery({
    queryKey: ["customer-statistics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("customer_name, phone_number, total, delivery_date")
        .order("customer_name");

      if (error) throw error;

      // Aggregate by customer
      const customerMap = new Map<string, CustomerStats>();
      
      data.forEach((order) => {
        const key = `${order.customer_name}_${order.phone_number}`;
        const existing = customerMap.get(key) || {
          customer_name: order.customer_name,
          phone_number: order.phone_number,
          order_count: 0,
          total_spent: 0,
          last_order_date: order.delivery_date || "",
        };
        
        existing.order_count += 1;
        existing.total_spent += Number(order.total);
        
        // Update last order date if more recent
        if (order.delivery_date && order.delivery_date > existing.last_order_date) {
          existing.last_order_date = order.delivery_date;
        }
        
        customerMap.set(key, existing);
      });

      const stats = Array.from(customerMap.values());
      return stats.sort((a, b) => b.total_spent - a.total_spent);
    },
  });
};
