export function formatChainError(err) {
  let error = err;
  error = error.toString().replace("Error: ", "");
  try {
    error = JSON.parse(error);
  } catch (err2) {
    err2;
  }

  error.message && (error = error.message);
  error.error && (error = error.error);
  error = error.toString().replace("Error: ", "");
  if (error == "User rejected") {
    error = "WalletConnect user rejected";
  } else if (error == "Connection lost") {
    error = "Kondor transaction rejected";
  }

  error = error.charAt(0).toUpperCase() + error.slice(1);
  return error.toString();
}
