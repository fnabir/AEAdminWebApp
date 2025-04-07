import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {FC} from "react";
import {breadcrumbItem} from "@/lib/types";

const BreadcrumbSection: FC<{ breadcrumb: breadcrumbItem[] }> = ({breadcrumb}) => {
	return (
		<Breadcrumb className={"flex-auto"}>
			<BreadcrumbList>
				{breadcrumb.map((crumb, index) => (
					index != breadcrumb.length - 1 ?
						crumb.text != "/" ?
							<BreadcrumbItem key={index}>
								<BreadcrumbLink href={crumb.link}>{crumb.text}</BreadcrumbLink>
							</BreadcrumbItem>
							:
							<BreadcrumbSeparator key={index}/>
						:
						<BreadcrumbItem key={index}>
							<BreadcrumbPage>{crumb.text}</BreadcrumbPage>
						</BreadcrumbItem>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	)
}

export default BreadcrumbSection;