export default function BrandWordmark({ priority = false }: { priority?: boolean }) {
  return <span className="brand-lockup" aria-hidden="true"><img
    className="brand-wordmark"
    src={import.meta.env.BASE_URL + 'brand/izqor-lockup-3d-v1.webp'}
    alt=""
    width={960}
    height={320}
    loading="eager"
    fetchPriority={priority ? 'high' : 'auto'}
    decoding="async"
    draggable={false}
  /></span>;
}
