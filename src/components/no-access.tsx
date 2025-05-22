import { MdOutlineWarningAmber } from "react-icons/md";
import { Button } from "./ui/button";
import Link from "@/components/link";

export default function NoAccess() {
	return (
		<div className='flex flex-col space-y-3 w-full h-full items-center justify-center'>
			<MdOutlineWarningAmber className="size-12 text-amber-500"/>
			<div className='text-base lg:text-xl font-semibold'>Not authorized to access the page.</div>
      <Link href="/">
        <Button>Go to Home</Button>
        </Link>
		</div>
	);
};