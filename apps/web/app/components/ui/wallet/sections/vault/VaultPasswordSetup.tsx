"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vaultPasswordSetupSchema } from "@my-org/zod";
import { z } from "zod";
import { Button } from "../../../button/button";
import { Input } from "../../../input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../form/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../card/card";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../dialog/dialog";

type SetupForm = z.infer<typeof vaultPasswordSetupSchema>;

type VaultPasswordSetupProps = {
  title?: string;
  description?: string;
  onSubmit: (password: string) => void;
  isLoading?: boolean;
  variant?: "card" | "modal";
};

const VaultPasswordSetupForm = ({
  form,
  isLoading,
  onSubmit,
}: {
  form: ReturnType<typeof useForm<SetupForm>>;
  isLoading: boolean;
  onSubmit: (values: SetupForm) => void;
}) => (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" autoComplete="new-password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm password</FormLabel>
            <FormControl>
              <Input type="password" autoComplete="new-password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Securing wallet..." : "Continue"}
      </Button>
    </form>
  </Form>
);

export const VaultPasswordSetup = ({
  title = "Create vault password",
  description = "This password encrypts your seed phrase and private keys on this device. It is never sent to our servers.",
  onSubmit,
  isLoading = false,
  variant = "card",
}: VaultPasswordSetupProps) => {
  const form = useForm<SetupForm>({
    resolver: zodResolver(vaultPasswordSetupSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleSubmit = ({ password }: SetupForm) => {
    onSubmit(password);
    form.reset();
  };

  if (variant === "modal") {
    return (
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <VaultPasswordSetupForm
          form={form}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <VaultPasswordSetupForm
          form={form}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  );
};
