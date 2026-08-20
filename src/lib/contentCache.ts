import { supabase } from "@/lib/supabaseClient";

type CacheEntry<T> = {
  value?: T;
  expiresAt: number;
  pending?: Promise<T>;
};

const cache = new Map<string, CacheEntry<unknown>>();
const CONTENT_TTL = 2 * 60 * 1000;

/**
 * Compartilha uma mesma consulta entre telas abertas na mesma sessão e evita
 * recarregar o mesmo conteúdo ao voltar de um pack para o painel.
 */
async function cachedQuery<T>(key: string, query: () => Promise<T>, ttl = CONTENT_TTL): Promise<T> {
  const now = Date.now();
  const current = cache.get(key) as CacheEntry<T> | undefined;

  if (current?.value !== undefined && current.expiresAt > now) return current.value;
  if (current?.pending) return current.pending;

  const pending = query()
    .then((value) => {
      cache.set(key, { value, expiresAt: Date.now() + ttl });
      return value;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, { expiresAt: now + ttl, pending });
  return pending;
}

export function getVideoNiches() {
  return cachedQuery("video-niches", async () => {
    const { data, error } = await supabase.rpc("get_nichos_videos");
    if (error) throw error;
    return data ?? [];
  });
}

export function getVideoPage(niche: string, start: number, pageSize: number, fields: string) {
  return cachedQuery(`videos:${niche}:${start}:${pageSize}:${fields}`, async () => {
    const { data, error } = await supabase
      .from("videos_achadinhos")
      .select(fields)
      .eq("nicho", niche)
      .order("message_id", { ascending: false })
      .range(start, start + pageSize - 1);
    if (error) throw error;
    return data ?? [];
  });
}

export function getCreativePage(type: "story" | "carousel", start: number, pageSize: number) {
  return cachedQuery(`creatives:${type}:${start}:${pageSize}`, async () => {
    const { data, error } = await supabase
      .from("creative_sets")
      .select("id, type, category, product_url, product_name, r2_folder, is_active, created_at, creative_assets(id, creative_set_id, position, image_url, r2_key, original_filename, created_at)")
      .eq("type", type)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(start, start + pageSize - 1);
    if (error) throw error;
    return data ?? [];
  });
}

