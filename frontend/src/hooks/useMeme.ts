import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMeme } from "../api/dashboard";

export function useMeme() {
  return useQuery({
    queryKey: ["meme"],
    queryFn: fetchMeme,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useRefreshMeme() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["meme"] });
}
