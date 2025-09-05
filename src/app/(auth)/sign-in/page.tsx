"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Loader2, UserIcon} from "lucide-react";
import onlyLogo from "@/assets/only_logo.png";
import {PasswordInput} from "@/components/ui/password-input";
import Link from "next/link";
import Image from "next/image";
import {signIn} from "next-auth/react";
import {setFormRootError} from "@/lib/forms";
import {useRouter} from "next/navigation";
import {LoginData, loginDefaultValues, loginSchema} from "@/app/(auth)/sign-in/definitions";


export default function Page() {
  const router = useRouter();
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValues,
  });
  
  const loading = form.formState.isSubmitting || form.formState.isSubmitSuccessful;
  
  const onSubmit = async (data: LoginData) => {
    const result = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false
    });
    if (result?.error) {
      setFormRootError(form, result.error);
      throw result.error;
    } else {
      router.push("/dashboard");
    }
  }
  
  return (
    <Card>
      <CardHeader className="mb-4 text-center">
        <CardTitle className="text-2xl font-bold md:mb-0 mb-4">
          Iniciar sesión
        </CardTitle>
        <CardDescription>
          <div className="md:hidden mb-4">
            <Image src={onlyLogo} alt="Logo" className="w-1/2 mx-auto mb-8"/>
          </div>
          Inicia sesión con tu cuenta de SONA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-4">
            <FormField
              control={form.control}
              name="username"
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Usuario o correo electrónico"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      disabled={loading}
                      placeholder="Contraseña"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            
            {form.formState.errors.root && (
              <div className="text-red-500 text-sm text-center">
                {form.formState.errors.root.message}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin"/>
              ) : (
                <UserIcon className="h-5 w-5 mr-2"/>
              )}
              Iniciar sesión
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <p className="text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link href="/sign-up" className="underline text-primary">
            Regístrate
          </Link>
        </p>
        <p className="text-center text-xs mt-2">
          <Link href="/privacy-policy" className="text-primary">
            Terminos y condiciones
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}