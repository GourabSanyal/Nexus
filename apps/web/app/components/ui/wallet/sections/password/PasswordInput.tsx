import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { privateKeyPasswordSchema } from "@my-org/zod/src/password/privateKey";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "../../../form/form";
import { Input } from "../../../input";
import { Button } from "../../../button/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../dialog/dialog";

type PasswordInputProps = {
  onSubmit: (data: { password: string }) => void;
};

const PasswordInput = ({ onSubmit }: PasswordInputProps) => {
  const form = useForm({
    resolver: zodResolver(privateKeyPasswordSchema),
    defaultValues: { password: "" },
  });

  const onPasswordSubmit = ({ password }: { password: string }) => {
    onSubmit({ password });
    form.reset();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          Enter Password
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onPasswordSubmit)}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              className="py-2 px-4 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:bg-destructive/90 transition-colors duration-300"
            >
              Confirm
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default PasswordInput;
