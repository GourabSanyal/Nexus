import {toast } from 'sonner';
import {NetworkConnectionEnum} from "@repo/store"

export const checkInternet = () => {
  if (!navigator.onLine) {
      toast.warning(NetworkConnectionEnum.NoInternet);
  }

  return true;
};
