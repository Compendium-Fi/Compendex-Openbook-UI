// import React from "react";
// import { notification } from "antd";
//import Link from "../components/Link";
import { showNotification } from "@mantine/notifications";
//import success from "../../assets/img/notif/success.png";
import React from "react";
import Link from "next/link";

// export function notify({
//   message,
//   description,
//   txid,
//   type = "info",
//   placement = "bottomLeft",
// }: {
//   message: string;
//   description?: string | JSX.Element;
//   txid?: string;
//   type?: string;
//   placement?: string;
// }) {
//   if (txid) {
//     description = (
//       <Link
//         external
//         to={"https://solscan.io/tx/" + txid}
//         style={{ color: "#0000ff" }}
//       >
//         View transaction {txid.slice(0, 8)}...{txid.slice(txid.length - 8)}
//       </Link>
//     );
//   }
//   notification[type]({
//     message: <span style={{ color: "black" }}>{message}</span>,
//     description: (
//       <span style={{ color: "black", opacity: 0.5 }}>{description}</span>
//     ),
//     placement,
//     style: {
//       backgroundColor: "white",
//     },
//   });
// }
const displayConfetty = () => {
  // store.dispatch({
  //   type: "SHOW_CONFETTI",
  // });
  setTimeout(() => {
    // store.dispatch({
    //   type: "HIDE_CONFETTI",
    // });
  }, 5000);
};
const displayColor = (type: string) => {
  switch (type) {
    case "error":
      return "red";
    case "success":
      return "green";
    case "wallet":
      return "orange";

    default:
      return "grape";
  }
};
export function notify({
  message,
  description,
  txid,
  type = "info",
  placement = "bottomLeft",
  wallet = false,
}: {
  message: string;
  description?: string | JSX.Element;
  txid?: string;
  type?: string;
  placement?: string;
  wallet?: boolean;
}) {
  if (txid) {
    if (!wallet) {
      description = (
        <Link

          href={"https://solscan.io/tx/" + txid}
          style={{ color: "#31C440" }}
        >
          {/* View transaction  {txid.slice(0, 8)}...{txid.slice(txid.length - 8)} */}
          View Transaction on SolScan Explorer
        </Link>
      );
    } else {
      displayConfetty();
      description = (
        <Link

          href={"https://solscan.io/account/" + txid}
          style={{ color: "#31C440" }}
        >
          {/* View transaction  {txid.slice(0, 8)}...{txid.slice(txid.length - 8)} */}
          View Connected Wallet On SolScan
        </Link>
      );
    }
  }
  showNotification({
    title: <span>{message}</span>,
    message: <span>{description}</span>,
    color: displayColor(type),

    loading: false,
  });
}
