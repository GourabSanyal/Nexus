export const extractResponseErrorMessage = (responseData: unknown): string | null => {
  if (typeof responseData === "object" && responseData !== null) {
    const apiError = (responseData as { error?: unknown }).error;
    if (typeof apiError === "string" && apiError.trim().length > 0) {
      return apiError;
    }
  }
  return null;
};

export const extractApiErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const maybeResponse = (error as { response?: { data?: { error?: unknown } } })
      .response;
    const apiError = maybeResponse?.data?.error;
    if (typeof apiError === "string" && apiError.trim().length > 0) {
      return apiError;
    }

    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return "Failed to send transaction";
};
