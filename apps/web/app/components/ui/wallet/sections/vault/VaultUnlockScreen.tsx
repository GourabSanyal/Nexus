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

type UnlockForm = z.infer<typeof vaultPasswordSchema>;

type VaultUnlockScreenProps = {
  onUnlock: (password: string) => Promise<boolean>;
};

export const VaultUnlockScreen = ({ onUnlock }: VaultUnlockScreenProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<UnlockForm>({
    resolver: zodResolver(vaultPasswordSchema),
    defaultValues: { password: "" },
  });

  const handleSubmit = async ({ password }: UnlockForm) => {
    setIsLoading(true);
    try {
      const ok = await onUnlock(password);
      if (ok) {
        form.reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Unlock wallet</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your vault password to access your wallets on this device.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
      </CardContent>
    </Card>
  );
};
