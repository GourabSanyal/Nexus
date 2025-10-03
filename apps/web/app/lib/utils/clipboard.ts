import { toast } from "sonner";

export const copyToClipboard = (data: string, text: string) => {
  navigator.clipboard.writeText(data);
  toast.success(`Copied ${text}`);
};
