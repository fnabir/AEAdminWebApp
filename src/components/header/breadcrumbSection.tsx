import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React, {FC} from "react";
import { BreadcrumbInterface } from "@/lib/interfaces";

const BreadcrumbSection: FC<{ breadcrumb: BreadcrumbInterface[] }> = ({breadcrumb}) => {
	return (
		<Breadcrumb className={"flex-auto"}>
      <BreadcrumbList>
        {breadcrumb.map((crumb, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {index === breadcrumb.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumb.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
	)
}

export default BreadcrumbSection;