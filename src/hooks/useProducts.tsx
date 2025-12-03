import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  stock_alert_threshold: number;
  icon: string;
  category: string;
}

export const useProducts = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("price");

      if (error) throw error;
      return data as Product[];
    },
  });

  const addProduct = useMutation({
    mutationFn: async (product: { name: string; price: number; category?: string }) => {
      const { data, error } = await supabase
        .from("products")
        .insert([{
          name: product.name,
          price: product.price,
          category: product.category || 'normal',
          stock: 0,
          stock_alert_threshold: 10,
          icon: 'Package',
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    ...query,
    addProduct: addProduct.mutateAsync,
  };
};
