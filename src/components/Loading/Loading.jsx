import React from "react";

function Loading() {
  return (
    <div className="flex justify-center items-center w-screen h-screen bg-transparent">
      <svg
        className="w-64 h-auto text-blue-600 animate-bounce-slow"
        viewBox="0 0 48 30"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        >
          {/* Bánh xe trái */}
          <g transform="translate(9.5,19)">
            <circle
              className="animate-bikeTire"
              r="9"
              strokeDasharray="56.549 56.549"
            />
            <g
              className="animate-bikeSpokesSpin"
              strokeDasharray="31.416 31.416"
              strokeDashoffset="-23.562"
            >
              <circle r="5" />
              <circle r="5" transform="rotate(180,0,0)" />
            </g>
          </g>

          {/* Bàn đạp */}
          <g transform="translate(24,19)">
            <g
              className="animate-bikePedalsSpin"
              strokeDasharray="25.133 25.133"
              strokeDashoffset="-21.991"
              transform="rotate(67.5,0,0)"
            >
              <circle r="4" />
              <circle r="4" transform="rotate(180,0,0)" />
            </g>
          </g>

          {/* Bánh xe phải */}
          <g transform="translate(38.5,19)">
            <circle
              className="animate-bikeTire"
              r="9"
              strokeDasharray="56.549 56.549"
            />
            <g
              className="animate-bikeSpokesSpin"
              strokeDasharray="31.416 31.416"
              strokeDashoffset="-23.562"
            >
              <circle r="5" />
              <circle r="5" transform="rotate(180,0,0)" />
            </g>
          </g>

          {/* Thân xe */}
          <polyline
            points="14 3,18 3"
            className="animate-bikeBody"
            strokeDasharray="5 5"
          />
          <polyline
            points="16 3,24 19,9.5 19,18 8,34 7,24 19"
            className="animate-bikeBody"
            strokeDasharray="79 79"
          />
          <path
            d="m30,2h6s1,0,1,1-1,1-1,1"
            className="animate-bikeBody"
            strokeDasharray="10 10"
          />
          <polyline
            points="32.5 2,38.5 19"
            className="animate-bikeBody"
            strokeDasharray="19 19"
          />
        </g>
      </svg>
    </div>
  );
}

export default Loading;
