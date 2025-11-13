import {toast } from 'sonner';
import {NetworkConnectionEnum} from "@repo/store/src/enums/network"

export const checkInternet = () => {
  if (!navigator.onLine) {
      toast.warning(NetworkConnectionEnum.NoInternet);
  }

  return true;
};
