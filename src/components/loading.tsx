"use client"

import { useEffect, useState } from "react";

export default function Loading() {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setFadeOut(true), 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
		<div className={`absolute w-full h-screen bg-background inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ease-in-out
                    ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
			<span className="relative flex h-10 w-10 justify-center items-center m-8">
				<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
				<span className="relative inline-flex rounded-full h-5 w-5 bg-sky-500"></span>
			</span>
			<div className="text-2xl font-bold animate-pulse">Loading, please wait...</div>
		</div>
	);
};