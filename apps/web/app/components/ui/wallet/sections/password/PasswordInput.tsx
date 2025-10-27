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

type PasswordInputProps = {
  onSubmit: (data: { password: string }) => void;
};

const PasswordInput = ({ onSubmit }: PasswordInputProps) => {
  const form = useForm({
    resolver: zodResolver(privateKeyPasswordSchema),
    defaultValues: { password: "" },
  });

  const onPasswordSubmit = (data: { password: string }) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onPasswordSubmit)}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter password"
                  {...field}
                />
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
  );
};

export default PasswordInput;
