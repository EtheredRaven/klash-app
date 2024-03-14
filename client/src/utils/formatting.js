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

export function shortenAddress(addr) {
  return addr.substr(0, 10) + "..." + addr.slice(-5);
}

export function getAddressLink(addr) {
  return (
    '<a href="https://koiner.app/addresses/' +
    addr +
    '" target="_blank">' +
    shortenAddress(addr) +
    "</a>"
  );
}
