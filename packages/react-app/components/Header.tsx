import { Disclosure } from "@headlessui/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  const [hideConnectBtn, setHideConnectBtn] = useState(false);
  const { connect } = useConnect();

  useEffect(() => {
    if (window.ethereum && window.ethereum.isMiniPay) {
      setHideConnectBtn(true);
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, []);

  return (
    <Disclosure as="nav" className="bg-white border-b border-gray-300">
      <>
        <div className="max-w-sm px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo on the left */}
            <div className="flex-shrink-0">
              <Image
                className="block w-auto h-10"
                src="/logo.svg"
                width="26"
                height="26"
                alt="PeerPesa logo"
              />
            </div>

            {/* Connect Wallet button on the right */}
            <div className="flex items-center">
              {!hideConnectBtn && (
                <div className="p-1 text-xs">
                  <ConnectButton
                    showBalance={{
                      smallScreen: true,
                      largeScreen: false,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    </Disclosure>
  );
}
