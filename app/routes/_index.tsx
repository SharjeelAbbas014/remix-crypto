import { json, type V2_MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Fuse from "fuse.js";
import { useState } from "react";

export const meta: V2_MetaFunction = () => [{ title: "Remix Crypto App" }];

type CryptoData = {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
  explorer: string;
};

type FuseResponse = {
  item: CryptoData;
};

const getCryptoData = async () => {
  const apiResponse = await fetch("https://api.coincap.io/v2/assets");
  const apiData = await apiResponse.json();
  return apiData.data;
};

export const loader = async () => {
  const data: CryptoData[] = await getCryptoData();
  return json({ crypto_data: data });
};

export default function Index() {
  const { crypto_data } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedModal, setSelectedModal] = useState<CryptoData | null>(null);

  const fuse = new Fuse(crypto_data, {
    keys: ["id", "symbol", "name"],
  });

  const nomalizeFuseResponse = (fuseResponse: FuseResponse[]) => {
    return fuseResponse.map((crypto) => crypto.item);
  };

  return (
    <main className="flex h-full items-center justify-center">
      <div className="h-[75vh] w-10/12 overflow-scroll rounded-lg bg-slate-800 shadow-xl">
        <input
          type="text"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search here"
          className="input sticky top-0 z-10 w-full bg-cyan-950"
        />

        <table className="table">
          <thead>
            <th>rank</th>
            <th>id</th>
            <th>symbol</th>
            <th>name</th>
          </thead>
          <tbody>
            {(searchQuery
              ? nomalizeFuseResponse(fuse.search(searchQuery))
              : crypto_data
            ).map((crypto) => (
              <tr
                onClick={() => {
                  window.my_modal_1.showModal();
                  setSelectedModal(crypto);
                }}
                className="cursor-pointer"
              >
                <td>{crypto.rank}</td>
                <td>{crypto.id}</td>
                <td>{crypto.symbol}</td>
                <td>{crypto.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog id="my_modal_1" className="modal">
        <form method="dialog" className="modal-box">
          <p className="py-4">{selectedModal?.name}</p>
          <div className="modal-action">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn">Close</button>
          </div>
        </form>
      </dialog>
    </main>
  );
}
