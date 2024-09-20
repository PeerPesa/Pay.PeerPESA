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
        <div className="px-2 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            {/* Move PeerPesa logo to the left */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <Image
                className="block w-auto h-10 pr-6"
                src="/logo.svg"
                width="26"
                height="26"
                alt="PeerPesa logo"
              />
            </div>

            {/* Connect Wallet button */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pl-2">
              {!hideConnectBtn && (
                <div className="p-1 text-xs">
                  <div className="p-1 text-xs">
                    <ConnectButton
                      showBalance={{
                        smallScreen: true,
                        largeScreen: false,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    </Disclosure>
  );
}
