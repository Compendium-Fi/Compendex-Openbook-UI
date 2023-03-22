import { Modal } from "@mantine/core";
import { Button, Dropdown, Menu } from "antd";
import { useLayoutEffect, useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import LinkAddress from "./LinkAddress";


const WalletConnect = () => {

  const { connected, publicKey, connect, disconnect, select, wallet, wallets } =
    useWallet();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const publicKeyString = publicKey?.toBase58() || "";


  const menu = (
    <Menu
      style={{
        minWidth: "100%"
      }}
    >
      {connected && <LinkAddress shorten={true} address={publicKeyString} />}
      <Menu.Item
        key="3"
        onClick={() => {
          setIsModalVisible((v) => !v);
        }}


      >
        Change Wallet
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown.Button
        className="widgets__btn   btn-connect "
        style={{ height: "35px" }}
        onClick={
          wallet
            ? connected
              ? disconnect
              : connect
            : () => {
              setIsModalVisible(true);
            }
        }
        overlay={menu}
      >
        {connected ? "Disconnect" : "Connect"}
      </Dropdown.Button>
      <Modal
        centered
        withCloseButton={false}
        title={false}
        opened={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        transitionProps={{ transition: 'fade', duration: 600, timingFunction: 'linear' }}


        styles={{
          content: {
            backgroundColor: "rgb(3, 10, 19)",
            borderStyle: "solid",
            borderWidth: "2px",
            borderColor: "rgb(19, 34, 53)",
            borderRadius: "3px",


            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "20px",
            marginTop: "25px"
          },
          body: { width: "100%" }
        }}
      >
        {wallets.map(({ adapter }, ind) => {
          const onClick = function () {
            select(adapter.name);
            setIsModalVisible(false);
          };

          return (
            <Button
              key={ind.toString()}
              size="large"
              type={adapter.name === wallet?.adapter.name ? "primary" : "ghost"}
              onClick={onClick}
              icon={
                <img
                  alt={`${adapter.name}`}
                  width={20}
                  height={20}
                  src={adapter.icon}
                  style={{ marginRight: 8 }}
                />
              }
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                marginBottom: 8
              }}
            >
              {adapter.name}
            </Button>
          );
        })}
      </Modal>
    </>
  );
}
WalletConnect.ssr = false;
export default WalletConnect; 