import { memo, useState } from "react";

const fmt = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ImagePlaceholder({ name }) {
  const initials = name
    ? name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")
    : "?";
  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
      gap: 2,
    }}>
      <span style={{
        fontWeight: 800, fontSize: 18, color: "#2E7D32",
        lineHeight: 1,
      }}>
        {initials}
      </span>
    </div>
  );
}

function ProductCard({ item, onAdd }) {
  const [imgError, setImgError] = useState(false);
  const showImage = item.imageUrl && !imgError;

  return (
    <div
      className="rounded-xl flex flex-col cursor-pointer overflow-hidden transition-all"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E0E0E0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(46,125,50,0.15)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)")}
    >
      <div
        style={{ height: 72, overflow: "hidden", flexShrink: 0 }}
      >
        {showImage ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <ImagePlaceholder name={item.name} />
        )}
      </div>

      <div className="px-2 pt-1.5 pb-2 flex flex-col gap-1">
        <p
          className="text-xs font-semibold leading-tight"
          style={{ color: "#424242", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title={item.name}
        >
          {item.name}
        </p>
        {item.desc && (
          <p
            className="text-xs leading-tight"
            style={{ color: "#9E9E9E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 10 }}
            title={item.desc}
          >
            {item.desc}
          </p>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-bold" style={{ color: "#2E7D32" }}>
            {fmt(item.price)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(item); }}
            aria-label={`Adicionar ${item.name}`}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
            style={{ background: "#2E7D32", color: "#FFFFFF", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1B5E20")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2E7D32")}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
