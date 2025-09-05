"use client";

import {Input} from "@/components/ui/input";
import {EyeIcon, EyeOffIcon, LockIcon} from "lucide-react";
import {ComponentProps, useId, useState} from "react";
import {cn} from "@/lib/utils";
import {IconInput} from "@/components/ui/icon-input";

export function PasswordInput({hideIcon = false, ...props}: ComponentProps<"input"> & { hideIcon?: boolean }) {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);
  
  const {className: inputClassName, ...rest} = props;
  
  return (
    <div className="relative">
      {hideIcon ?
        <Input
          id={id}
          className={cn("pe-9", inputClassName)}
          {...rest}
          type="password"
        />
        :
        <IconInput
          id={id}
          Icon={LockIcon}
          className={cn("pe-9", inputClassName)}
          {...rest}
          type={isVisible ? "text" : "password"}
        />
      }
      <button
        className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        onClick={toggleVisibility}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        aria-controls="password"
      >
        {isVisible ? (
          <EyeOffIcon size={16} aria-hidden="true"/>
        ) : (
          <EyeIcon size={16} aria-hidden="true"/>
        )}
      </button>
    </div>
  );
}
