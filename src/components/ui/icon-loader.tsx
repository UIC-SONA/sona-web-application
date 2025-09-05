import {LoaderCircleIcon, LucideIcon, LucideProps} from "lucide-react";
import {cn} from "@/lib/utils";

interface IconLoaderProps extends LucideProps {
  loading: boolean
  icon: LucideIcon
}

export default function IconLoader({
  loading,
  icon: Icon,
  className,
  ...props
}: Readonly<IconLoaderProps>) {
  return loading
    ? <LoaderCircleIcon className={cn("animate-spin", className)}/>
    : <Icon className={className} {...props}/>;
  
}