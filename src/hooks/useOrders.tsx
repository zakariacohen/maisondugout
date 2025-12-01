import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderItem } from "@/pages/Index";

export const useOrders = () => {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*");

      if (itemsError) throw itemsError;

      const ordersWithItems: Order[] = ordersData.map((order) => ({
        id: order.id,
        customerName: order.customer_name,
        phoneNumber: order.phone_number,
        deliveryAddress: order.delivery_address,
        total: order.total,
        delivered: order.delivered,
        deliveryImageUrl: order.delivery_image_url,
        deliveryDate: order.delivery_date ? new Date(order.delivery_date) : undefined,
        orderSource: order.order_source,
        date: new Date(order.created_at),
        items: itemsData
          .filter((item) => item.order_id === order.id)
          .map((item) => ({
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            total: item.total,
          })),
      }));

      return ordersWithItems;
    },
  });

  const addOrder = useMutation({
    mutationFn: async (order: Omit<Order, "id" | "date">) => {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: order.customerName,
            phone_number: order.phoneNumber,
            delivery_address: order.deliveryAddress,
            total: order.total,
            delivered: order.delivered,
            delivery_date: order.deliveryDate?.toISOString(),
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const itemsToInsert = order.items.map((item) => ({
        order_id: orderData.id,
        product: item.product,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return orderData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const updateOrder = useMutation({
    mutationFn: async ({
      orderId,
      delivered,
      deliveryImageUrl,
      customerName,
      phoneNumber,
      deliveryAddress,
      items,
      total,
      deliveryDate,
    }: {
      orderId: string;
      delivered?: boolean;
      deliveryImageUrl?: string;
      customerName?: string;
      phoneNumber?: string;
      deliveryAddress?: string;
      items?: OrderItem[];
      total?: number;
      deliveryDate?: Date;
    }) => {
      const updateData: any = {};
      if (delivered !== undefined) updateData.delivered = delivered;
      if (deliveryImageUrl !== undefined)
        updateData.delivery_image_url = deliveryImageUrl;
      if (customerName !== undefined) updateData.customer_name = customerName;
      if (phoneNumber !== undefined) updateData.phone_number = phoneNumber;
      if (deliveryAddress !== undefined) updateData.delivery_address = deliveryAddress;
      if (total !== undefined) updateData.total = total;
      if (deliveryDate !== undefined) updateData.delivery_date = deliveryDate?.toISOString();

      const { error: orderError } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (orderError) throw orderError;

      // If items are being updated, delete old items and insert new ones
      if (items !== undefined) {
        const { error: deleteError } = await supabase
          .from("order_items")
          .delete()
          .eq("order_id", orderId);

        if (deleteError) throw deleteError;

        const itemsToInsert = items.map((item) => ({
          order_id: orderId,
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const uploadDeliveryImage = async (file: File, orderId: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${orderId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("delivery-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("delivery-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  return {
    orders: orders || [],
    isLoading,
    addOrder: addOrder.mutateAsync,
    updateOrder: updateOrder.mutateAsync,
    deleteOrder: deleteOrder.mutateAsync,
    uploadDeliveryImage,
  };
};
