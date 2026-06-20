"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vaultPasswordSchema } from "@my-org/zod";
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

type UnlockForm = z.infer<typeof vaultPasswordSchema>;

type VaultUnlockScreenProps = {
  onUnlock: (password: string) => Promise<boolean> | void;
  title?: string;
  description?: string;
  variant?: "card" | "modal";
  isLoading?: boolean;
};

const VaultUnlockForm = ({
  form,
  isLoading,
  onSubmit,
}: {
  form: ReturnType<typeof useForm<UnlockForm>>;
  isLoading: boolean;
  onSubmit: (values: UnlockForm) => void;
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
              <Input type="password" autoComplete="current-password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Unlocking..." : "Unlock"}
      </Button>
    </form>
  </Form>
);

export const VaultUnlockScreen = ({
  onUnlock,
  title = "Unlock wallet",
  description = "Enter your vault password to access your wallets on this device.",
  variant = "card",
  isLoading: externalLoading,
}: VaultUnlockScreenProps) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading ?? internalLoading;

  const form = useForm<UnlockForm>({
    resolver: zodResolver(vaultPasswordSchema),
    defaultValues: { password: "" },
  });

  const handleSubmit = async ({ password }: UnlockForm) => {
    setInternalLoading(true);
    try {
      const result = await onUnlock(password);
      if (result !== false) {
        form.reset();
      }
    } finally {
      setInternalLoading(false);
    }
  };

  if (variant === "modal") {
    return (
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <VaultUnlockForm form={form} isLoading={isLoading} onSubmit={handleSubmit} />
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
        <VaultUnlockForm form={form} isLoading={isLoading} onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  );
};
