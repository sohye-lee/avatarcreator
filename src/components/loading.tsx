import React from "react";

const Loading = () => {
  return (
    <div className="fixed z-[1000] flex h-screen w-screen items-center justify-center bg-pink-50">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-transparent border-l-blue-400 border-r-pink-400 border-t-purple-400  ">
        {" "}
      </div>
    </div>
  );
};

export default Loading;
