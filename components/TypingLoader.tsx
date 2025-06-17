import React from "react";

const TypingLoader = () => {
  return (
    <div className="flex items-center gap-1.5">
      <div className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
      <div className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"></div>
      <div className="bg-primary h-2 w-2 animate-bounce rounded-full"></div>
    </div>
  );
};

export default TypingLoader;
