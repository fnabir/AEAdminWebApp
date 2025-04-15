import React from "react";

type SeparatorProps = {
	orientation?: "horizontal" | "vertical";
	className?: string;
};

const Separator: React.FC<SeparatorProps> = ({ orientation = "horizontal", className }) => {
	return (
		<div className={`${orientation == "horizontal" ? `w-full h-0.5 bg-linear-to-r` : `self-stretch w-0.5 bg-linear-to-b`}  from-transparent to-transparent via-primary rounded-full ${className}`}/>
	)};

export default Separator;