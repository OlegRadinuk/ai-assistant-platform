import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d0d",
          borderRadius: 8,
        }}
      >
        {/* Ring / arc — Optisphere brand mark */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="11"
            cy="11"
            r="8"
            stroke="#e82020"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="36 16"
            strokeDashoffset="0"
          />
          <circle cx="11" cy="11" r="3" fill="#e82020" />
        </svg>
      </div>
    ),
    { ...size },
  )
}
