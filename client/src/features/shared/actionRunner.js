// Saving and publishing are separate: a failed request must never publish success.
export function createActionRunner({ onPending, onError }) {
  const pending = new Set();
  return async (key, save, publish) => {
    if (pending.has(key)) return false;
    pending.add(key);
    onPending([...pending]);
    onError("");
    let saved;
    try {
      saved = await save();
    } catch (error) {
      onError(
        error.response?.data?.error ||
          error.message ||
          "Unable to save. Please try again.",
      );
      pending.delete(key);
      onPending([...pending]);
      return false;
    }
    try {
      await publish(saved);
      return true;
    } catch {
      // The database already committed; do not encourage a duplicate submission.
      onError(
        "Saved to the server, but this screen could not update. Refresh before making another change.",
      );
      return false;
    } finally {
      pending.delete(key);
      onPending([...pending]);
    }
  };
}
