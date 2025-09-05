"use client";

import {useState} from 'react';
import onlyLogo from "@/assets/only_logo.png";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {UserIcon, Mail, Loader2, FileText} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormMessage,} from "@/components/ui/form";
import {AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,} from "@/components/ui/alert-dialog";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {PasswordInput} from "@/components/ui/password-input";
import Link from "next/link";
import Image from "next/image";
import {signupSchema, SignupData, singupDefaultValues} from "@/app/(auth)/sign-up/definitions";
import {MAIN_SERVER_URL} from "@/constants";
import {singup} from "@/app/(auth)/sign-up/actions";
import {setFormErrors} from "@/lib/forms";


export default function Page() {
  
  const form = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: singupDefaultValues,
  });
  
  const loading = form.formState.isSubmitting || form.formState.isSubmitSuccessful;
  const success = form.formState.isSubmitSuccessful && !form.formState.errors.root;
  
  const onSubmit = async (data: SignupData) => {
    const result = await singup(data);
    if (!result.success) {
      setFormErrors(form, result.error);
      throw result.error;
    }
  };
  
  return (
    <>
      <AlertDialog open={success}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-success">
              ¡Registro exitoso!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tu cuenta ha sido creada exitosamente
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Link href="/sign-in">
              <Button>
                Iniciar sesión
              </Button>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Card>
        <CardHeader className="mb-4 text-center">
          <CardTitle className="text-2xl font-bold md:mb-0 mb-4">
            Regístrate
          </CardTitle>
          <CardDescription>
            <div className="md:hidden mb-4">
              <Image src={onlyLogo} alt="Logo" className="w-1/2 mx-auto mb-8"/>
            </div>
            Regístrate para acceder a SONA
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
                    <div className="relative">
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Usuario"
                          className="pl-10"
                          {...field}
                        />
                      </FormControl>
                      <UserIcon
                        className="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"
                      />
                    </div>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({field}) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          disabled={loading}
                          type="email"
                          placeholder="Correo electrónico"
                          className="pl-10"
                          {...field}
                        />
                      </FormControl>
                      <Mail className="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                    </div>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="firstName"
                render={({field}) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Nombre"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({field}) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Apellido"
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
                    <div className="relative">
                      <FormControl>
                        <PasswordInput
                          disabled={loading}
                          placeholder="Contraseña"
                          className="pl-10"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="repeatPassword"
                render={({field}) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <PasswordInput
                          disabled={loading}
                          placeholder="Repetir contraseña"
                          className="pl-10"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              <TermsOfService/>
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
                Registrarse
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <p className="text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/sign-in" className="underline text-primary">
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
}


function TermsOfService() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="text-center text-sm text-gray-600 mt-4">
      Al registrarte, aceptas nuestros
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="text-primary underline ml-1">Términos y Condiciones</button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl h-[85vh] my-5">
          <DialogHeader>
            <DialogTitle>
              <FileText className="inline-block mr-2 h-5 w-5"/> Términos y Condiciones
            </DialogTitle>
          </DialogHeader>
          <div className="h-[75vh] p-2 overflow-hidden ">
            <iframe
              src={`${MAIN_SERVER_URL}/docs/terms.pdf`}
              className="w-full h-full"
              title="Términos y Condiciones"
              style={{
                height: "100vh !important",
                minHeight: "100% !important",
                width: "100%",
              }}
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

