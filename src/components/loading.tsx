export default function Loading() {
	return (
		<div className='w-full h-screen flex items-center flex-col justify-center'>
			<span className="relative flex h-10 w-10 justify-center items-center m-8">
				<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
				<span className="relative inline-flex rounded-full h-5 w-5 bg-sky-500"></span>
			</span>
			<h2 className='text-2xl font-bold'>Loading, please wait...</h2>
		</div>
	);
};