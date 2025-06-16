import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TypingLoader() {
  return (
    <Alert className="bg-gray-700 border-none text-white w-fit">
      <AlertDescription className="flex items-center justify-center gap-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="#fff"
        >
          <circle cx="4" cy="12" r="3">
            <animate
              id="a"
              begin="0;b.end-0.25s"
              attributeName="r"
              dur="0.75s"
              values="3;.2;3"
            />
          </circle>
          <circle cx="12" cy="12" r="3">
            <animate
              begin="a.end-0.6s"
              attributeName="r"
              dur="0.75s"
              values="3;.2;3"
            />
          </circle>
          <circle cx="20" cy="12" r="3">
            <animate
              id="b"
              begin="a.end-0.45s"
              attributeName="r"
              dur="0.75s"
              values="3;.2;3"
            />
          </circle>
        </svg>
        <span>Thinking...</span>
      </AlertDescription>
    </Alert>
  );
}
