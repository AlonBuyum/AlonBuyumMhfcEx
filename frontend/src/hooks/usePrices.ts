import { useQuery } from "@tanstack/react-query";
import { fetchPrices } from "../api/dashboard";

export function usePrices() {
  return useQuery({
    queryKey: ["prices"],
    queryFn: fetchPrices,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
