"use client";

import { Input } from "../../../input";

export type SendFieldErrors = {
  recipient?: string;
  amount?: string;
};

type SendModalFormProps = {
  chainLabel: string;
  recipient: string;
  amount: string;
  isAddressValid: boolean;
  isAmountValid: boolean;
  fieldErrors: SendFieldErrors;
  onRecipientChange: (value: string) => void;
  onAmountChange: (value: string) => void;
};

const FieldHint = ({
  valid,
  children,
}: {
  valid: boolean;
  children: React.ReactNode;
}) => (
  <div className={`text-xs ${valid ? "text-green-600" : "text-destructive"}`}>
    {children}
  </div>
);

export const SendModalForm = ({
  chainLabel,
  recipient,
  amount,
  isAddressValid,
  isAmountValid,
  fieldErrors,
  onRecipientChange,
  onAmountChange,
}: SendModalFormProps) => (
  <>
    <RecipientField
      chainLabel={chainLabel}
      recipient={recipient}
      isAddressValid={isAddressValid}
      fieldErrors={fieldErrors}
      onRecipientChange={onRecipientChange}
    />
    <AmountField
      amount={amount}
      isAmountValid={isAmountValid}
      fieldErrors={fieldErrors}
      onAmountChange={onAmountChange}
    />
  </>
);

const RecipientField = ({
  chainLabel,
  recipient,
  isAddressValid,
  fieldErrors,
  onRecipientChange,
}: Pick<
  SendModalFormProps,
  "chainLabel" | "recipient" | "isAddressValid" | "fieldErrors" | "onRecipientChange"
>) => (
  <div className="space-y-1">
    <Input
      placeholder={`Recipient ${chainLabel} address`}
      value={recipient}
      onChange={(e) => onRecipientChange(e.target.value.trim())}
      className={recipientInputClass(recipient, isAddressValid)}
    />
    {recipient ? (
      <FieldHint valid={isAddressValid}>
        {isAddressValid ? "Address looks valid" : fieldErrors.recipient}
      </FieldHint>
    ) : null}
  </div>
);

const AmountField = ({
  amount,
  isAmountValid,
  fieldErrors,
  onAmountChange,
}: Pick<
  SendModalFormProps,
  "amount" | "isAmountValid" | "fieldErrors" | "onAmountChange"
>) => (
  <div className="space-y-1">
    <Input
      type="text"
      inputMode="decimal"
      placeholder="Amount"
      value={amount}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "" || /^\d*(?:\.\d*)?$/.test(v)) {
          onAmountChange(v);
        }
      }}
      onKeyDown={(e) => {
        if (["e", "E", "+", "-"].includes(e.key)) {
          e.preventDefault();
        }
      }}
      className={amountInputClass(amount, isAmountValid)}
    />
    {amount && fieldErrors.amount ? (
      <FieldHint valid={false}>{fieldErrors.amount}</FieldHint>
    ) : null}
  </div>
);

const recipientInputClass = (recipient: string, isAddressValid: boolean) =>
  recipient
    ? isAddressValid
      ? "border-green-600"
      : "border-destructive text-destructive placeholder:text-destructive/70"
    : "";

const amountInputClass = (amount: string, isAmountValid: boolean) =>
  amount
    ? isAmountValid
      ? "border-green-600"
      : "border-destructive text-destructive placeholder:text-destructive/70"
    : "";
