import { PAYMENT_ICONS } from "../constants";

export default function PayBadge({ k }) {
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 800,
        color: "#fff",
        background: "#455A64",
        borderRadius: 3,
        padding: "1px 4px",
      }}
    >
      {PAYMENT_ICONS[k]}
    </span>
  );
}
