-- Índices para os caminhos mais acessados pela Malu.
-- Mantêm a paginação dos packs rápida quando a base e o número de usuários crescerem.

CREATE INDEX IF NOT EXISTS idx_videos_achadinhos_nicho_message_desc
  ON public.videos_achadinhos (nicho, message_id DESC)
  WHERE link_video IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_creative_sets_active_type_created_desc
  ON public.creative_sets (type, created_at DESC)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_creative_assets_set_position
  ON public.creative_assets (creative_set_id, position);
