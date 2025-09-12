"use client";

import {useEffect, useState} from "react";
import {UseFormReturn} from "react-hook-form";
import {UserDto} from "@/app/(app)/dashboard/users/definitions";
import {FormControl, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Switch} from "@/components/ui/switch";
import {Input} from "@/components/ui/input";


export function EnableChangePassword({form}: Readonly<{ form: UseFormReturn<UserDto> }>) {
  
  const [enabled, setEnabled] = useState(false);
  const [value, setValue] = useState("");
  const {getFieldState} = form;
  
  const fieldState = getFieldState("password");
  
  useEffect(() => {
    form.setValue("password", enabled ? value : undefined);
  }, [form, enabled, value]);
  
  return (
    <div className="lg:col-span-2">
      <FormItem>
        <FormLabel>
          Contraseña
        </FormLabel>
        <div className="flex items-center">
          <div className="flex items-center justify-between mr-4">
            <p className="text-sm text-gray-500">Cambiar Contraseña</p>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
          <FormControl>
            <Input
              autoComplete={enabled ? "new-password" : "off"}
              disabled={!enabled}
              type="password"
              placeholder="Contraseña"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </FormControl>
        </div>
        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
      </FormItem>
    </div>
  );
}
