import {ComponentProps} from "react";
import {LucideIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {Input} from "@/components/ui/input";

interface InputIconProps extends ComponentProps<"input"> {
  Icon: LucideIcon;
  position?: "start" | "end";
  containerProps?: ComponentProps<"div">;
}

function IconInput({Icon, position = "start", containerProps = {}, ...props}: Readonly<InputIconProps>) {
  
  const {className: inputClassName, ...restInputProps} = props;
  const {className: containerClassName, ...restContainerProps} = containerProps;
  const isEnd = position === "end";
  
  return <div {...restContainerProps} className={cn("relative flex items-center", containerClassName)}>
    <Input {...restInputProps} className={cn("peer w-full", isEnd ? "pe-9" : "ps-9", inputClassName)}/>
    <div className={cn("text-muted-foreground/80 pointer-events-none absolute inset-y-0 flex items-center justify-center peer-disabled:opacity-50", isEnd ? "end-0 pe-3" : "start-0 ps-3")}>
      <Icon size={16} aria-hidden="true"/>
    </div>
  </div>
}

export {IconInput}