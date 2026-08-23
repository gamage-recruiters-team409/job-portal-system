/**
 * Extract a human-readable message from an Axios error.
 * The backend sends { success: false, message } on non-2xx responses.
 */
export function getErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.code === 'ERR_NETWORK') {
    return 'Cannot reach the server. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}
